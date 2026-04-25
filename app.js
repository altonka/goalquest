function h(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function safeUrl(u) {
  if (!u) return '#';
  try {
    const p = new URL(u);
    return (p.protocol === 'https:' || p.protocol === 'http:') ? u : '#';
  } catch { return '#'; }
}

const App = (() => {
  let currentPage = 'home';
  let notification = null;
  let notifTimer = null;
  let activeModal = null;        // node id shown in map modal
  let expandedTaskId = null;     // task id shown expanded on home
  let rescheduledCount = 0;
  let draftPlan = null;
  let draftOptimizing = false;
  let comebackMode = false;      // user returned after missing days
  let showReflection = null;     // taskId awaiting difficulty feedback
  let showWhyReminder = false;   // show "why you started" today
  let obstacleTaskId = null;     // task id for "I'm Stuck" bottom sheet
  let showCalibration = false;   // 7-day calibration check modal

  // ── Plan Chat State ───────────────────────────────────────────────────────
  let planChatHistory = [];       // { role, content }[]
  let planChatPending = null;     // { changes[], newPlan } — waiting for apply/discard

  // ── Calendar State ────────────────────────────────────────────────────────
  let calWeekOffset = 0;          // 0 = current week, ±N = weeks forward/back
  let calAddModal = null;         // { date, startHour } — add-event modal open

  // ── Focus Mode State ──────────────────────────────────────────────────────
  let focusTaskId = null;
  let focusTimerInterval = null;
  let focusRunning = false;
  let focusDuration = 25;        // minutes (25 or 50)
  let focusSecondsLeft = 25 * 60;

  // ── Navigation ───────────────────────────────────────────────────────────

  function nav(page) {
    currentPage = page;
    activeModal = null;
    // Reset calendar add modal when leaving calendar
    if (page !== 'calendar') calAddModal = null;
    // Reset plan chat state when leaving plan-preview
    if (page !== 'plan-preview') { planChatHistory = []; planChatPending = null; }
    render();
    window.scrollTo(0, 0);
  }

  function showNotif(msg, type = 'success') {
    notification = { msg, type };
    if (notifTimer) clearTimeout(notifTimer);
    notifTimer = setTimeout(() => { notification = null; render(); }, 2800);
    render();
  }

  // ── XP Animation ─────────────────────────────────────────────────────────

  function showXPAnim(xp, multiplier, isBoss, clientY) {
    const el = document.createElement('div');
    el.className = 'xp-popup' + (isBoss ? ' boss-pop' : '');
    const multStr = multiplier > 1 ? `<span class="mult-badge">×${multiplier}</span>` : '';
    el.innerHTML = `+${xp} XP${multStr}`;
    el.style.setProperty('--pop-y', `${clientY ? clientY - 30 : 180}px`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  function showPerfectDayBanner() {
    const el = document.createElement('div');
    el.className = 'perfect-day-banner';
    el.textContent = '🌟 Perfect Day! +100 Bonus XP';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  // ── Sidebar ───────────────────────────────────────────────────────────────

  function renderSidebar(user) {
    const li = Gamification.getLevelInfo(user.xp);
    const items = [
      { id: 'home',     icon: 'home',           label: 'Today' },
      { id: 'map',      icon: 'map',            label: 'Map' },
      { id: 'calendar', icon: 'calendar',       label: 'Calendar' },
      { id: 'review',   icon: 'calendar-check', label: 'Review' },
      { id: 'profile',  icon: 'user',           label: 'Profile' },
    ];
    return `
      <aside class="sidebar" role="navigation" aria-label="Main navigation">
        <div class="sidebar-logo"><span class="sidebar-logo-dot"></span>Goal<span>Quest</span></div>
        <nav class="sidebar-nav">
          ${items.map(it => `
            <button class="sidebar-item ${currentPage === it.id ? 'active' : ''}"
              onclick="App.nav('${it.id}')" aria-current="${currentPage === it.id ? 'page' : 'false'}">
              <span class="sidebar-item-icon"><i data-lucide="${it.icon}"></i></span>
              ${it.label}
            </button>
          `).join('')}
        </nav>
        <div class="sidebar-user">
          <div class="sidebar-level">Lv.${user.level} · ${h(li.current.title)}</div>
          <div class="sidebar-xp-bar">
            <div class="sidebar-xp-fill" style="width:${li.progress}%"></div>
          </div>
          <div class="sidebar-streak">🔥 ${user.streak}-day streak</div>
        </div>
      </aside>
    `;
  }

  // ── Stats Strip ───────────────────────────────────────────────────────────

  function renderStatsStrip(user) {
    const li = Gamification.getLevelInfo(user.xp);
    const mult = Gamification.getMomentumMultiplier(user.streak);
    const multLabel = Gamification.getMomentumLabel(mult);
    const multClass = mult <= 1 ? 'mult-1' : '';
    return `
      <div class="stats-strip">
        <div class="strip-stat">
          <span class="strip-val">🔥 ${user.streak}</span>
          <span class="strip-label">Streak</span>
        </div>
        <div class="strip-divider"></div>
        <div class="strip-stat">
          <span class="strip-val">Lv.${user.level}</span>
          <span class="strip-label">${li.current.title}</span>
        </div>
        <div class="strip-divider"></div>
        <div class="strip-xp">
          <div class="strip-xp-bar">
            <div class="strip-xp-fill" style="width:${li.progress}%"></div>
          </div>
          <span class="strip-xp-label">${user.xp} XP ${li.next ? `· ${li.progress}% to Lv.${li.next.level}` : '· MAX'}</span>
        </div>
        <div class="strip-divider"></div>
        <div class="momentum-badge ${multClass}">${multLabel}</div>
      </div>
    `;
  }

  // ── Comeback Screen ───────────────────────────────────────────────────────

  function renderComeback(goal, tasks, daysAway) {
    const s = State.get();
    const easiest = tasks.filter(t => t.status !== 'done' && t.difficulty === 'easy')[0]
      || tasks.find(t => t.status !== 'done');
    return `
      <div class="page comeback-page">
        <div class="comeback-card">
          <div class="comeback-icon">👋</div>
          <h2 class="comeback-title">You're back.</h2>
          <p class="comeback-sub">You were away for <strong>${daysAway} day${daysAway > 1 ? 's' : ''}</strong>.</p>
          ${s.user.streak > 0 ? `<p class="comeback-streak">Your 🔥 ${s.user.streak}-day streak broke.</p>` : ''}
          <p class="comeback-why">But your goal didn't change.</p>
          <div class="comeback-goal-box">"${goal.title}"</div>
          <p class="comeback-cta">One task. Restart your streak.</p>
        </div>
        ${easiest ? renderTaskCard(easiest, s.user) : ''}
        <button class="comeback-skip" onclick="App.dismissComeback()">
          Skip → See all tasks
        </button>
      </div>
      ${renderBottomNav()}
    `;
  }

  function dismissComeback() {
    comebackMode = false;
    render();
  }

  // ── Home Page ─────────────────────────────────────────────────────────────

  function renderHome() {
    const s = State.get();

    if (!s.goals.length) {
      return `
        <div class="page">
          <div class="hero">
            <h1>Goal<span class="accent">Quest</span></h1>
            <p class="tagline">Turn ambition into daily action.</p>
            <button class="btn btn-primary btn-lg" onclick="App.nav('new-goal')">Start Your Quest →</button>
          </div>
          <div class="features">
            <div class="feature-card">
              <span class="feat-icon"><i data-lucide="target"></i></span>
              <h3>Smart Breakdown</h3><p>Goals → Milestones → Daily tasks</p>
            </div>
            <div class="feature-card">
              <span class="feat-icon"><i data-lucide="map"></i></span>
              <h3>Progress Map</h3><p>Visual journey with unlockable stages</p>
            </div>
            <div class="feature-card">
              <span class="feat-icon"><i data-lucide="zap"></i></span>
              <h3>Momentum XP</h3><p>Streaks multiply your rewards</p>
            </div>
          </div>
          ${renderBottomNav()}
        </div>
      `;
    }

    const goal = s.goals.find(g => g.id === s.currentGoalId) || s.goals[0];
    const allTasks = s.tasks.filter(t => t.goalId === goal.id);

    // Comeback check
    if (comebackMode) return renderComeback(goal, allTasks, Gamification.daysSinceActive(s.user));

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const adaptiveMode = Decompose.getAdaptiveMode(s.user);
    const dailyTasks = Decompose.selectDailyTasks(allTasks, goal.hoursPerWeek);
    const doneTasks = dailyTasks.filter(t => t.status === 'done');
    const todoTasks = dailyTasks.filter(t => t.status !== 'done');
    const todayPct = dailyTasks.length ? Math.round((doneTasks.length / dailyTasks.length) * 100) : 0;
    const goalPct = Gamification.getGoalProgress(goal.id, allTasks);
    const identity = Gamification.getGoalIdentity(goal.title);
    const quickWin = todoTasks.find(t => t.difficulty === 'easy' && t.estimatedMinutes <= 25);
    const mainTasks = todoTasks.filter(t => t !== quickWin);

    return `
      <div class="page">
        <div class="quest-header">
          <div class="home-greeting">${greeting}</div>
          <div class="quest-header-row">
            <div>
              <div class="quest-label">Active Quest</div>
              <div class="quest-title">${h(goal.title)}</div>
            </div>
            ${s.goals.length < 3 ? `<button class="btn-add-goal" onclick="App.nav('new-goal')" title="Add another goal">＋</button>` : ''}
          </div>
        </div>

        ${s.goals.length > 1 ? `
        <div class="goal-switcher">
          ${s.goals.map(g => `
            <button class="goal-switch-btn ${g.id === goal.id ? 'active' : ''}"
              onclick="App.switchGoal('${g.id}')">
              <span class="gsb-dot ${g.id === goal.id ? 'active' : ''}"></span>
              ${h(g.title.length > 28 ? g.title.slice(0,28) + '…' : g.title)}
            </button>`).join('')}
          ${s.goals.length < 3 ? `<button class="goal-switch-add" onclick="App.nav('new-goal')">+ New</button>` : ''}
        </div>` : ''}

        ${renderStatsStrip(s.user)}

        <!-- Identity statement -->
        ${s.user.totalTasksDone > 0 ? `
        <div class="identity-bar">
          <span class="identity-icon">🧠</span>
          <span>You've completed <strong>${s.user.totalTasksDone}</strong> tasks. You're becoming <strong>${identity}</strong>.</span>
        </div>
        ` : ''}

        <!-- Why reminder -->
        ${showWhyReminder && goal.successCriteria ? `
        <div class="why-reminder">
          <div class="why-label">💭 Remember why you started</div>
          <div class="why-text">${h(goal.successCriteria)}</div>
          <button class="why-dismiss" onclick="App.dismissWhy()">Got it ✓</button>
        </div>
        ` : ''}

        ${rescheduledCount > 0 ? `<div class="reschedule-notice">📅 ${rescheduledCount} overdue task${rescheduledCount > 1 ? 's' : ''} rescheduled — spread across next ${Math.ceil(rescheduledCount/2)} day${rescheduledCount > 2 ? 's' : ''}</div>` : ''}
        ${adaptiveMode === 'reduced' ? `<div class="reschedule-notice" style="border-color:var(--accent2);color:var(--accent2);">💡 Lighter load today — 1 task done = win</div>` : ''}

        <!-- Goal bar -->
        <div class="goal-progress-strip" style="margin-bottom:16px;">
          <div class="gp-row"><span class="gp-title">Overall Progress</span><span class="gp-pct">${goalPct}%</span></div>
          <div class="gp-bar"><div class="gp-fill" style="width:${goalPct}%"></div></div>
        </div>

        <!-- Quick Win -->
        ${quickWin && todoTasks.length > 1 ? `
        <div class="quick-win-section">
          <div class="qw-header">
            <span class="qw-badge">⚡ QUICK WIN</span>
            <span class="qw-sub">${quickWin.estimatedMinutes} min · zero excuses</span>
          </div>
          ${renderTaskCard(quickWin, s.user)}
        </div>
        ` : ''}

        <!-- Today header -->
        <div class="today-header">
          <span class="today-title">Today's Quest</span>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">
            <span class="today-count">${doneTasks.length}/${dailyTasks.length} done</span>
            ${todoTasks.length ? `<span style="font-size:0.72rem;color:var(--muted);">~${todoTasks.reduce((s,t)=>s+(t.estimatedMinutes||0),0)} min left</span>` : ''}
          </div>
        </div>
        ${dailyTasks.length ? `
        <div class="perfect-progress">
          <span class="pp-label">🌟 Perfect Day</span>
          <div class="pp-bar-outer"><div class="pp-bar-inner" style="width:${todayPct}%"></div></div>
          <span class="pp-pct">${todayPct}%</span>
        </div>
        ` : ''}

        <!-- Main tasks -->
        ${mainTasks.length
          ? mainTasks.map(t => renderTaskCard(t, s.user)).join('')
          : todoTasks.length === 0
            ? `<div class="all-done-card"><h3>🎉 All Done!</h3><p>Quest complete for today.<br>Streak alive — see you tomorrow!</p></div>`
            : ''
        }

        <!-- Done tasks -->
        ${doneTasks.length ? `<div style="margin-top:8px;">${doneTasks.map(t => renderTaskCard(t, s.user)).join('')}</div>` : ''}
      </div>
      ${showReflection ? renderReflectionModal(showReflection) : ''}
      ${renderBottomNav()}
    `;
  }

  // ── Reflection Modal ──────────────────────────────────────────────────────

  function renderReflectionModal(taskId) {
    const s = State.get();
    const task = s.tasks.find(t => t.id === taskId);
    return `
      <div class="reflection-overlay" onclick="App.closeReflection(event)">
        <div class="reflection-sheet">
          <p class="reflection-q">How was that task?</p>
          <div class="reflection-btns">
            <button class="ref-btn ref-hard"  onclick="App.submitReflection('${taskId}','hard')">😅 Too Hard</button>
            <button class="ref-btn ref-right" onclick="App.submitReflection('${taskId}','right')">👌 Just Right</button>
            <button class="ref-btn ref-easy"  onclick="App.submitReflection('${taskId}','easy')">⚡ Too Easy</button>
          </div>
          <div class="journal-field">
            <textarea id="journal-input-${taskId}" class="journal-input"
              rows="2" placeholder="Optional: note what you learned or what to remember next time…"></textarea>
          </div>
          <button class="reflection-skip" onclick="App.closeReflection()">Skip</button>
        </div>
      </div>
    `;
  }

  function closeReflection(e) {
    if (e && e.target !== e.currentTarget) return;
    showReflection = null;
    render();
  }

  function submitReflection(taskId, rating) {
    // Save journal entry if text was entered
    const textarea = document.getElementById(`journal-input-${taskId}`);
    const journalText = textarea ? textarea.value.trim() : '';
    if (journalText) {
      const s = State.get();
      const task = s.tasks.find(t => t.id === taskId);
      const entry = {
        id: `j-${Date.now()}`,
        taskId,
        taskTitle: task ? task.title : '',
        text: journalText,
        date: new Date().toISOString(),
        rating,
      };
      State.set(st => ({ ...st, journal: [...(st.journal || []), entry] }));
    }

    showReflection = null;
    State.set(s => {
      const tf = { ...(s.user.taskFeedback || {}), [taskId]: rating };
      const recentRatings = Object.values(tf).slice(-5);
      const hardCount = recentRatings.filter(r => r === 'hard').length;
      return {
        ...s,
        user: {
          ...s.user,
          taskFeedback: tf,
          consecutiveHard: rating === 'hard' ? (s.user.consecutiveHard || 0) + 1 : 0,
          consecutiveEasy: rating === 'easy' ? (s.user.consecutiveEasy || 0) + 1 : 0,
          totalTasksSkipped: hardCount >= 3
            ? (s.user.totalTasksSkipped || 0) + 1
            : s.user.totalTasksSkipped || 0,
        },
      };
    });
    const msgs = { hard: '💡 Got it — easier tasks coming up', right: '🎯 Perfect calibration', easy: '🚀 Leveling up your tasks' };
    showNotif(msgs[rating] || '');
  }

  function dismissWhy() { showWhyReminder = false; render(); }

  // ─── TASK CARD — collapsed + expanded ──────────────────────────────────────

  function renderTaskCard(task, user) {
    const s = user ? { user } : State.get();
    const u = s.user || s;
    const mult = Gamification.getMomentumMultiplier(u.streak || 0);
    const effectiveXP = Math.round(task.xpReward * mult);
    const isDone = task.status === 'done';
    const isExpanded = expandedTaskId === task.id;

    if (isDone) {
      return `
        <div class="task-card done" id="tc-${task.id}">
          <div class="tc-done-check">✓</div>
          <div class="task-body">
            <div class="task-title" style="text-decoration:line-through;opacity:0.6;">${task.title}</div>
          </div>
          <span class="meta-pill xp" style="flex-shrink:0;">+${effectiveXP} XP</span>
        </div>`;
    }

    if (!isExpanded) {
      // ── COLLAPSED — whole card is tappable ──
      const todayStr = new Date().toISOString().split('T')[0];
      const tomorrowStr = Decompose.addDays(todayStr, 1);
      const deadlineLabel = !task.deadline ? ''
        : task.deadline === todayStr ? '<span class="meta-pill due-today">due today</span>'
        : task.deadline === tomorrowStr ? '<span class="meta-pill due-soon">due tomorrow</span>'
        : '';
      return `
        <div class="task-card ${task.isBoss ? 'boss' : 'normal'}" id="tc-${task.id}"
          onclick="App.expandTask('${task.id}')" style="cursor:pointer;">
          <div class="tc-collapsed">
            <div class="tc-top-row">
              <span class="tc-diff-badge diff-${task.difficulty}">${task.difficulty}</span>
              <span class="tc-title-collapsed">${h(task.title)}</span>
              ${task.isBoss ? '<span class="meta-pill boss-xp">⚔️ Boss</span>' : ''}
            </div>
            <div class="tc-bottom-row">
              <span class="meta-pill time">⏱ ${task.estimatedMinutes}min</span>
              <span class="meta-pill ${task.isBoss ? 'boss-xp' : 'xp'}">+${effectiveXP} XP${mult > 1 ? ` ×${mult}` : ''}</span>
              ${deadlineLabel}
              <span class="btn-start">▶ Start Task</span>
            </div>
          </div>
        </div>`;
    }

    // ── EXPANDED ──
    const steps = task.steps || [];
    const doneSteps = new Set(State.get().stepProgress?.[task.id] || []);

    return `
      <div class="task-card ${task.isBoss ? 'boss' : 'normal'} expanded" id="tc-${task.id}">

        <!-- Header -->
        <div class="tc-exp-header">
          <div>
            <span class="tc-diff-badge diff-${task.difficulty}">${task.difficulty}</span>
            <div class="tc-exp-title">${h(task.title)}</div>
            <div class="tc-exp-meta">⏱ ${task.estimatedMinutes} min · +${effectiveXP} XP${mult > 1 ? ` ×${mult}` : ''}</div>
          </div>
          <button class="tc-collapse-btn" onclick="App.collapseTask()">✕</button>
        </div>

        <!-- Start trigger -->
        <div class="tc-start-trigger">
          <span class="tc-trigger-label">👉 Start with</span>
          <span class="tc-trigger-text">${h(task.startTrigger || 'Open your materials and begin immediately')}</span>
        </div>

        <!-- Steps -->
        ${steps.length ? `
        <div class="tc-steps">
          <div class="tc-section-label">Steps</div>
          ${steps.map((step, i) => `
            <label class="tc-step ${doneSteps.has(i) ? 'checked' : ''}" onclick="App.toggleStep('${task.id}', ${i})">
              <span class="tc-step-check">${doneSteps.has(i) ? '✓' : ''}</span>
              <span class="tc-step-text">${h(step)}</span>
            </label>
          `).join('')}
        </div>
        ` : ''}

        <!-- Done when -->
        <div class="tc-done-when">
          <span class="tc-done-label">✅ Done when</span>
          <span class="tc-done-text">${h(task.completionCondition || 'Task is fully completed')}</span>
        </div>

        <!-- Focus tip -->
        ${task.focusTip ? `
        <div class="tc-focus-tip">
          <span class="tc-focus-icon">⏱</span>
          <span>${h(task.focusTip)}</span>
        </div>
        ` : ''}

        <!-- Resources -->
        ${task.resources && task.resources.length ? `
        <div class="tc-resources">
          <div class="tc-section-label">🔗 Resources</div>
          ${task.resources.map(r => `
            <a class="tc-resource ${r.primary ? 'primary' : ''}" href="${h(r.url || '#')}" target="_blank" rel="noopener noreferrer">
              ${r.primary ? '★ ' : ''}${h(r.label)}
            </a>
          `).join('')}
        </div>
        ` : ''}

        <!-- Community -->
        ${task.community ? `
        <div class="tc-community">
          <span class="tc-community-icon">💬</span>
          <span>${h(task.community)}</span>
        </div>
        ` : ''}

        <!-- Actions -->
        <div class="tc-actions">
          <button class="btn btn-ghost" onclick="App.startFocus('${task.id}')">⏱ Focus</button>
          <button class="btn btn-ghost btn-stuck" onclick="App.openObstacle('${task.id}')">🚧 Stuck</button>
          <button class="btn btn-primary ${task.isBoss ? 'boss-complete-btn' : ''}"
            onclick="App.completeTask('${task.id}', event)">
            ${task.isBoss ? '⚔️ Complete Boss' : '✓ Mark Complete'}
          </button>
        </div>
      </div>`;
  }

  // ── Focus Mode ────────────────────────────────────────────────────────────

  function formatTimer(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function startFocus(taskId) {
    focusTaskId = taskId;
    focusDuration = 25;
    focusSecondsLeft = 25 * 60;
    focusRunning = false;
    if (focusTimerInterval) { clearInterval(focusTimerInterval); focusTimerInterval = null; }
    if (typeof Space !== 'undefined') Space.setFocusMode(true);
    currentPage = 'focus';
    render();
    window.scrollTo(0, 0);
  }

  function toggleFocusTimer() {
    if (focusRunning) {
      clearInterval(focusTimerInterval);
      focusTimerInterval = null;
      focusRunning = false;
      render();
    } else {
      if (focusSecondsLeft <= 0) return;
      focusRunning = true;
      focusTimerInterval = setInterval(() => {
        focusSecondsLeft--;
        // Update timer display directly for performance
        const disp = document.querySelector('.focus-timer-display');
        if (disp) {
          disp.textContent = formatTimer(focusSecondsLeft);
          disp.className = 'focus-timer-display' + (focusSecondsLeft <= 0 ? ' done' : focusSecondsLeft <= 60 ? ' warning' : '');
        }
        if (focusSecondsLeft <= 0) {
          clearInterval(focusTimerInterval);
          focusTimerInterval = null;
          focusRunning = false;
          render();
        }
      }, 1000);
      render();
    }
  }

  function setFocusDuration(mins) {
    focusDuration = mins;
    focusSecondsLeft = mins * 60;
    focusRunning = false;
    if (focusTimerInterval) { clearInterval(focusTimerInterval); focusTimerInterval = null; }
    render();
  }

  function resetFocusTimer() {
    focusSecondsLeft = focusDuration * 60;
    focusRunning = false;
    if (focusTimerInterval) { clearInterval(focusTimerInterval); focusTimerInterval = null; }
    render();
  }

  function exitFocus() {
    if (focusTimerInterval) { clearInterval(focusTimerInterval); focusTimerInterval = null; }
    focusRunning = false;
    focusTaskId = null;
    if (typeof Space !== 'undefined') Space.setFocusMode(false);
    currentPage = 'home';
    render();
  }

  function renderFocusMode() {
    const s = State.get();
    const task = s.tasks.find(t => t.id === focusTaskId);
    if (!task) { exitFocus(); return ''; }

    const steps = task.steps || [];
    const doneSteps = new Set(s.stepProgress?.[task.id] || []);
    const doneCount = steps.filter((_, i) => doneSteps.has(i)).length;
    const timerDone = focusSecondsLeft <= 0;
    const timerClass = timerDone ? 'done' : (focusSecondsLeft <= 60 && focusRunning ? 'warning' : '');
    const startedTimer = focusSecondsLeft < focusDuration * 60;

    return `
      <div class="focus-page">
        <div class="focus-header">
          <button class="focus-exit" onclick="App.exitFocus()">← Exit</button>
          ${steps.length ? `<span class="focus-progress-text">${doneCount}/${steps.length} steps</span>` : ''}
        </div>

        <div class="focus-body">
          <div class="focus-task-title">${h(task.title)}</div>

          <!-- Timer -->
          <div class="focus-timer-block">
            <div class="timer-duration-toggle">
              <button class="timer-dur-btn ${focusDuration === 25 ? 'active' : ''}" onclick="App.setFocusDuration(25)">25 min</button>
              <button class="timer-dur-btn ${focusDuration === 50 ? 'active' : ''}" onclick="App.setFocusDuration(50)">50 min</button>
            </div>
            <div class="focus-timer-display ${timerClass}">${formatTimer(focusSecondsLeft)}</div>
            <div class="focus-timer-controls">
              <button class="focus-timer-btn ${focusRunning ? 'btn-timer-pause' : 'btn-timer-start'}"
                onclick="App.toggleFocusTimer()">
                ${timerDone ? '✓ Done!' : focusRunning ? '⏸ Pause' : startedTimer ? '▶ Resume' : '▶ Start'}
              </button>
              ${startedTimer && !timerDone ? `<button class="btn-timer-reset" onclick="App.resetFocusTimer()">↺ Reset</button>` : ''}
            </div>
            ${timerDone ? `<div class="focus-timer-done-msg">Session complete! ✓</div>` : ''}
          </div>

          <!-- Start trigger -->
          ${task.startTrigger ? `
          <div class="focus-trigger">
            <span class="focus-trigger-label">👉 Start with</span>
            ${h(task.startTrigger)}
          </div>
          ` : ''}

          <!-- Steps -->
          ${steps.length ? `
          <div>
            <div class="focus-section-label">Steps</div>
            <div class="focus-steps">
              ${steps.map((step, i) => `
                <div class="focus-step ${doneSteps.has(i) ? 'checked' : ''}" onclick="App.toggleStep('${task.id}', ${i})">
                  <span class="focus-step-check">${doneSteps.has(i) ? '✓' : ''}</span>
                  <span class="focus-step-text">${h(step)}</span>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>

        <div class="focus-footer">
          <button class="focus-complete-btn ${task.isBoss ? 'boss-btn' : ''}"
            onclick="App.completeTask('${task.id}', event)">
            ${task.isBoss ? '⚔️ Complete Boss' : '✓ Mark Complete'}
          </button>
          <div class="focus-keyboard-hint">Space to pause · Esc to exit</div>
        </div>
      </div>
    `;
  }

  // ── Progress Map ──────────────────────────────────────────────────────────

  function renderMap() {
    const s = State.get();
    if (!s.goals.length) {
      return `<div class="page"><div class="empty-state"><h2>No goal yet.</h2><button class="btn btn-primary" onclick="App.nav('new-goal')">Create Goal</button></div>${renderBottomNav()}</div>`;
    }
    const goal = s.goals.find(g => g.id === s.currentGoalId) || s.goals[0];
    const tasks = s.tasks.filter(t => t.goalId === goal.id);
    const milestones = s.milestones.filter(m => m.goalId === goal.id);
    const rawNodes = s.nodes.filter(n => n.goalId === goal.id);
    const nodes = Decompose.computeNodeStates(rawNodes, tasks);
    const goalPct = Gamification.getGoalProgress(goal.id, tasks);

    const POSITIONS = ['pos-left', 'pos-center', 'pos-right'];

    let nodeGlobalIdx = 0;
    const worldsHtml = milestones.map((ms, mi) => {
      const msNodes = nodes.filter(n => n.milestoneId === ms.id);
      const msPct = Gamification.getMilestoneProgress(ms.id, tasks);
      const nodesHtml = msNodes.map((node) => {
        const pos = POSITIONS[nodeGlobalIdx % 3];
        nodeGlobalIdx++;
        return renderMapNode(node, pos);
      }).join('');

      return `
        <div class="map-world">
          <div class="world-banner" style="--ms-color:${ms.color}">
            <div class="world-banner-dot" style="background:${ms.color}"></div>
            <span style="color:${ms.color}">World ${mi+1}: ${h(ms.title)}</span>
            <span class="world-progress-text" style="color:${ms.color}">${msPct}%</span>
          </div>
          ${nodesHtml}
        </div>
      `;
    }).join('');

    return `
      <div class="page">
        <div class="map-page-header">
          <h2>🗺️ Progress Map</h2>
        </div>
        <div class="goal-progress-strip">
          <div class="gp-row">
            <span class="gp-title">${goal.title}</span>
            <span class="gp-pct">${goalPct}%</span>
          </div>
          <div class="gp-bar"><div class="gp-fill" style="width:${goalPct}%"></div></div>
        </div>
        <div class="map-path-container" id="map-path">
          ${worldsHtml}
        </div>
        ${activeModal ? renderNodeModal(nodes.find(n => n.id === activeModal), tasks, s.user) : ''}
      </div>
      ${renderBottomNav()}
    `;
  }

  function renderMapNode(node, pos) {
    const stateClass = node.state;
    const isBoss = node.isBoss;
    const icon = stateClass === 'complete' ? '✓'
      : stateClass === 'locked' ? '<i data-lucide="lock"></i>'
      : isBoss ? '⚔️'
      : node.globalIndex + 1;

    return `
      <div class="map-node-row ${pos}">
        <div class="map-node ${stateClass} ${isBoss ? 'boss' : ''}"
          onclick="${stateClass !== 'locked' ? `App.openNode('${node.id}')` : ''}"
          data-node-id="${node.id}">
          <div class="node-circle" style="${stateClass !== 'locked' && stateClass !== 'complete' && !isBoss ? `border-color:${node.color};` : ''}">
            ${stateClass === 'partial' ? `<div class="node-partial-ring"></div>` : ''}
            ${icon}
          </div>
          <div class="node-label">${h(node.title.replace('⚔️ ', ''))}</div>
        </div>
      </div>
    `;
  }

  function renderNodeModal(node, tasks, user) {
    if (!node) return '';
    const nodeTasks = tasks.filter(t => node.taskIds.includes(t.id));
    return `
      <div class="node-modal-overlay" onclick="App.closeModal(event)">
        <div class="node-modal">
          <div class="node-modal-header">
            <div>
              <div class="node-modal-title">${h(node.title)}</div>
              <div style="font-size:0.75rem;color:var(--muted);margin-top:3px;">${nodeTasks.filter(t=>t.status==='done').length}/${nodeTasks.length} complete</div>
            </div>
            <button class="node-modal-close" onclick="App.closeModal()">×</button>
          </div>
          ${nodeTasks.map(t => renderTaskCard(t, user)).join('')}
        </div>
      </div>
    `;
  }

  function openNode(nodeId) {
    activeModal = nodeId;
    render();
  }

  function closeModal(e) {
    if (e && e.target !== e.currentTarget) return;
    activeModal = null;
    render();
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  function renderProfile() {
    const s = State.get();
    const u = s.user;
    const li = Gamification.getLevelInfo(u.xp);
    const earned = u.badges || [];
    const freezes = u.streakFreezes || 0;

    return `
      <div class="page profile-page">
        <h2>👤 Profile</h2>

        <div class="profile-level-card">
          ${u.prestigeLevel ? `<div class="prestige-badge">✦ Prestige ${u.prestigeLevel} · ${Gamification.getPrestigeTitle(u)}</div>` : ''}
          <div class="level-num">${u.level}</div>
          <div class="level-title">${li.current.title}</div>
          <div class="level-xp-bar"><div class="level-xp-fill" style="width:${li.progress}%"></div></div>
          <div class="level-xp-text">${u.xp} XP · ${li.next ? `${li.progress}% to ${li.next.title}` : 'Max Level — Prestige available!'}</div>
        </div>
        ${Gamification.canPrestige(u) ? `
          <div class="prestige-cta">
            <div class="prestige-cta-text">You've reached <strong>Master</strong> — Prestige to reset XP, keep your badges, and earn a new title.</div>
            <button class="btn btn-prestige" onclick="App.performPrestige()">✦ Prestige Now</button>
          </div>` : ''}
        ${(() => {
          const sqProg = Gamification.getSeasonalQuestProgress(u, s.tasks);
          if (!sqProg) return '';
          return `
            <div class="seasonal-quest-card ${sqProg.earned ? 'earned' : ''}">
              <div class="sq-header">
                <span class="sq-icon">${sqProg.quest.icon}</span>
                <div>
                  <div class="sq-title">${sqProg.quest.title}</div>
                  <div class="sq-desc">${sqProg.quest.desc}</div>
                </div>
                ${sqProg.earned ? '<span class="sq-done">✓ Earned</span>' : ''}
              </div>
              <div class="sq-progress-bar">
                <div class="sq-progress-fill" style="width:${sqProg.pct}%"></div>
              </div>
              <div class="sq-progress-label">${sqProg.current} / ${sqProg.quest.goal} · ${sqProg.pct}%</div>
            </div>`;
        })()}

        <div class="profile-stats-grid">
          <div class="profile-stat-card"><div class="ps-val">🔥 ${u.streak}</div><div class="ps-label">Day Streak</div></div>
          <div class="profile-stat-card"><div class="ps-val">${u.totalTasksDone || 0}</div><div class="ps-label">Tasks Done</div></div>
          <div class="profile-stat-card"><div class="ps-val">${u.perfectDays || 0}</div><div class="ps-label">Perfect Days</div></div>
          <div class="profile-stat-card"><div class="ps-val">${Gamification.getMomentumLabel(Gamification.getMomentumMultiplier(u.streak))}</div><div class="ps-label">Momentum</div></div>
        </div>

        <div class="freeze-bar">
          <div>
            <div class="freeze-label">🧊 Streak Freezes</div>
            <div style="font-size:0.72rem;color:var(--muted);">Resets weekly · Use to skip a day</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
            <div class="freeze-tokens">
              ${[0,1].map(i => `<span class="freeze-token ${i >= freezes ? 'empty' : ''}">🧊</span>`).join('')}
            </div>
            ${freezes > 0 ? `<button class="btn-sm" onclick="App.useFreeze()">Use Freeze</button>` : '<span style="font-size:0.72rem;color:var(--muted);">None left</span>'}
          </div>
        </div>

        <div class="badges-section">
          <h3>🏆 Badges (${earned.length}/${Gamification.BADGES.length})</h3>
          <div class="badges-grid">
            ${Gamification.BADGES.map(b => `
              <div class="badge-card ${earned.includes(b.id) ? 'earned' : 'locked'}">
                <span class="badge-icon-lg">${b.icon}</span>
                <div class="badge-name">${b.title}</div>
                <div class="badge-desc-sm">${b.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Streak Calendar -->
        <div class="streak-cal-section">
          <h3>📅 Last 28 Days</h3>
          <div class="streak-calendar">
            ${Gamification.buildStreakCalendar(u).map(d => `
              <div class="cal-day ${d.active ? 'active' : ''} ${d.isToday ? 'today' : ''}"
                   title="${d.date}">
                <span class="cal-num">${d.day}</span>
              </div>
            `).join('')}
          </div>
          <div class="cal-legend">
            <span><span class="cal-dot active"></span> Active</span>
            <span><span class="cal-dot"></span> Missed</span>
          </div>
        </div>

        <!-- Execution Journal -->
        ${(() => {
          const entries = (s.journal || []).slice().reverse().slice(0, 20);
          if (!entries.length) return '';
          return `
            <div class="journal-section">
              <h3>📓 Execution Journal (${(s.journal || []).length})</h3>
              <div class="journal-entries">
                ${entries.map(e => `
                  <div class="journal-entry">
                    <div class="journal-entry-header">
                      <span class="journal-entry-task">${h(e.taskTitle || '')}</span>
                      <span class="journal-entry-date">${e.date ? e.date.slice(0,10) : ''}</span>
                    </div>
                    <div class="journal-entry-text">${h(e.text)}</div>
                  </div>`).join('')}
              </div>
            </div>`;
        })()}

        <div class="data-zone">
          <h4>💾 Data</h4>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-ghost" onclick="App.exportData()">Export Backup</button>
            <button class="btn btn-ghost" onclick="App.importData()">Import Backup</button>
          </div>
        </div>

        <div class="danger-zone">
          <h4>⚠️ Danger Zone</h4>
          <button class="btn-danger" onclick="App.resetAll()">Reset All Data</button>
        </div>
      </div>
      ${renderBottomNav()}
    `;
  }

  // ── Weekly Review Page ───────────────────────────────────────────────────

  let reviewDeferTaskId = null;   // task id currently being deferred in review
  let reviewEditTaskId  = null;   // task id being edited in review

  function renderReview() {
    const s = State.get();
    if (!s.goals.length) {
      return `<div class="page"><div class="empty-state"><h2>No goal yet.</h2><button class="btn btn-primary" onclick="App.nav('new-goal')">Create Goal</button></div>${renderBottomNav()}</div>`;
    }
    const goal = s.goals.find(g => g.id === s.currentGoalId) || s.goals[0];
    const allTasks = s.tasks.filter(t => t.goalId === goal.id);

    // Week window
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = Decompose.addDays(today, -7);
    const weekAhead = Decompose.addDays(today, 7);

    const doneThisWeek = allTasks.filter(t => t.status === 'done' && t.completedAt && t.completedAt.slice(0,10) >= weekAgo);
    const upcoming = allTasks.filter(t => t.status !== 'done' && t.deadline && t.deadline <= weekAhead).sort((a,b) => (a.deadline||'').localeCompare(b.deadline||''));
    const overdue  = allTasks.filter(t => t.status !== 'done' && t.deadline && t.deadline < today);
    const totalGoal = allTasks.length;
    const totalDone = allTasks.filter(t => t.status === 'done').length;
    const pct = totalGoal ? Math.round((totalDone / totalGoal) * 100) : 0;

    return `
      <div class="page review-page">
        <div class="review-header">
          <h2 class="review-title">📋 Weekly Review</h2>
          <div class="review-goal-name">${h(goal.title)}</div>
        </div>

        <!-- Overall progress bar -->
        <div class="review-section">
          <div class="review-section-label">OVERALL PROGRESS</div>
          <div class="review-progress-wrap">
            <div class="review-progress-bar">
              <div class="review-progress-fill" style="width:${pct}%"></div>
            </div>
            <span class="review-progress-pct">${pct}%</span>
          </div>
          <div class="review-progress-sub">${totalDone} of ${totalGoal} tasks complete</div>
        </div>

        <!-- Done this week -->
        <div class="review-section">
          <div class="review-section-label">COMPLETED THIS WEEK (${doneThisWeek.length})</div>
          ${doneThisWeek.length === 0
            ? '<div class="review-empty">No tasks completed this week yet.</div>'
            : doneThisWeek.map(t => `
                <div class="review-task-row done-row">
                  <span class="review-check">✓</span>
                  <span class="review-task-title">${h(t.title)}</span>
                  <span class="review-task-date">${t.completedAt ? t.completedAt.slice(0,10) : ''}</span>
                </div>`).join('')}
        </div>

        <!-- Overdue -->
        ${overdue.length ? `
        <div class="review-section">
          <div class="review-section-label review-label-warn">⚠️ OVERDUE (${overdue.length})</div>
          ${overdue.map(t => `
            <div class="review-task-row overdue-row" id="rtr-${t.id}">
              <span class="review-diff diff-${t.difficulty}">${t.difficulty}</span>
              <span class="review-task-title">${h(t.title)}</span>
              <div class="review-task-actions">
                <button class="review-action-btn" onclick="App.reviewDefer('${t.id}', 3)" title="Defer 3 days">+3d</button>
                <button class="review-action-btn review-action-swap" onclick="App.reviewSwapDifficulty('${t.id}')" title="Make easier">↓ easy</button>
              </div>
            </div>`).join('')}
        </div>` : ''}

        <!-- Upcoming next 7 days -->
        <div class="review-section">
          <div class="review-section-label">NEXT 7 DAYS (${upcoming.length})</div>
          ${upcoming.length === 0
            ? '<div class="review-empty">No tasks due this week — you might be ahead!</div>'
            : upcoming.map(t => `
                <div class="review-task-row upcoming-row" id="rtr-${t.id}">
                  <span class="review-diff diff-${t.difficulty}">${t.difficulty}</span>
                  <span class="review-task-title">${h(t.title)}</span>
                  <div class="review-task-meta">
                    <span class="review-deadline ${t.deadline === today ? 'due-today' : ''}">${t.deadline === today ? 'today' : t.deadline}</span>
                    <div class="review-task-actions">
                      <button class="review-action-btn" onclick="App.reviewDefer('${t.id}', 2)" title="Defer 2 days">+2d</button>
                      <button class="review-action-btn review-action-done" onclick="App.completeTask('${t.id}', event)" title="Mark done">✓</button>
                    </div>
                  </div>
                </div>`).join('')}
        </div>

        <!-- Reflection note -->
        <div class="review-section">
          <div class="review-section-label">WEEKLY REFLECTION</div>
          <textarea class="review-reflect-input" rows="3" placeholder="What worked this week? What will you do differently?"
            onchange="App.saveWeeklyReflection(this.value)"
          >${h(s.user.weeklyReflection || '')}</textarea>
        </div>

        <div style="height:32px;"></div>
        ${renderBottomNav()}
      </div>
    `;
  }

  function reviewDefer(taskId, days) {
    const s = State.get();
    const task = s.tasks.find(t => t.id === taskId);
    if (!task) return;
    const base = task.deadline || new Date().toISOString().split('T')[0];
    const newDeadline = Decompose.addDays(base, days);
    State.set(st => ({
      ...st,
      tasks: st.tasks.map(t => t.id === taskId ? { ...t, deadline: newDeadline } : t),
    }));
    showNotif(`Task deferred by ${days} days.`, 'success');
    render();
  }

  function reviewSwapDifficulty(taskId) {
    State.set(st => ({
      ...st,
      tasks: st.tasks.map(t => t.id === taskId
        ? { ...t, difficulty: 'easy', estimatedMinutes: Math.max(15, Math.round((t.estimatedMinutes || 30) * 0.6)), xpReward: Math.max(40, Math.round((t.xpReward || 60) * 0.75)) }
        : t),
    }));
    showNotif('Task simplified — easier difficulty applied.', 'success');
    render();
  }

  function saveWeeklyReflection(text) {
    State.set(st => ({ ...st, user: { ...st.user, weeklyReflection: text } }));
  }

  // ── Goal Creation Flow ────────────────────────────────────────────────────

  let clarStep = 0;
  let clarData = {};

  const QUESTIONS = [
    { key: 'goalText',       label: 'What is your goal?',                      placeholder: 'e.g. Become an MBB consultant', type: 'text',   required: true },
    { key: 'deadline',       label: 'By when? (target date)',                   placeholder: 'YYYY-MM-DD',                    type: 'date',   required: false },
    { key: 'hoursPerWeek',   label: 'Hours per week you can commit?',           placeholder: 'e.g. 10',                       type: 'number', required: true },
    { key: 'currentLevel',   label: 'Your starting point?',                     placeholder: 'e.g. No experience',            type: 'text',   required: false },
    { key: 'successCriteria',label: 'How will you know you succeeded?',         placeholder: 'e.g. Receive an MBB offer',     type: 'text',   required: false },
    { key: 'priority',       label: 'Priority level (1–10)',                    placeholder: '7',                             type: 'number', required: false },
  ];

  function renderNewGoal() {
    const q = QUESTIONS[clarStep];
    const pct = Math.round((clarStep / QUESTIONS.length) * 100);
    return `
      <div class="clar-page">
        <div class="clar-container">
          <div class="clar-header">
            <button class="btn-back" onclick="App.nav('home')">← Back</button>
            <h2 style="margin-top:8px;">Define Your Quest</h2>
            <div class="clar-progress"><div class="clar-bar" style="width:${pct}%"></div></div>
            <div class="step-counter">Step ${clarStep + 1} of ${QUESTIONS.length}</div>
          </div>
          <div class="question-card">
            <label class="q-label">${q.label}</label>
            <input id="clar-input" class="q-input" type="${q.type}"
              placeholder="${q.placeholder}" value="${clarData[q.key] || ''}"
              autofocus onkeydown="if(event.key==='Enter') App.clarNext()"/>
            <div class="q-actions">
              ${clarStep > 0 ? `<button class="btn btn-ghost" onclick="App.clarBack()">← Back</button>` : ''}
              <button class="btn btn-primary" onclick="App.clarNext()">
                ${clarStep < QUESTIONS.length - 1 ? 'Next →' : '🚀 Generate Plan'}
              </button>
              ${!q.required ? `<button class="btn btn-ghost" onclick="App.clarSkip()">Skip</button>` : ''}
            </div>
          </div>
          <div class="clar-preview">
            ${Object.entries(clarData).map(([k,v]) => `<span class="preview-tag"><b>${h(k)}:</b> ${h(v)}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function clarNext() {
    const q = QUESTIONS[clarStep];
    const input = document.getElementById('clar-input');
    const val = input ? input.value.trim() : '';
    if (q.required && !val) { if (input) input.classList.add('error'); return; }
    if (val) clarData[q.key] = val;
    clarStep < QUESTIONS.length - 1 ? (clarStep++, render(), setTimeout(() => document.getElementById('clar-input')?.focus(), 50)) : generatePlan();
  }
  function clarBack() { if (clarStep > 0) { clarStep--; render(); } }
  function clarSkip() { clarStep < QUESTIONS.length - 1 ? (clarStep++, render()) : generatePlan(); }

  function generatePlan() {
    currentPage = 'generating';
    planChatHistory = [];
    planChatPending = null;
    render();
    Decompose.buildPlanAI(clarData).then((plan) => {
      draftPlan = plan;
      currentPage = 'plan-preview';
      render();
    }).catch(() => {
      currentPage = 'new-goal';
      showNotif('Plan generation failed — try again', 'error');
      render();
    });
  }

  function backToQuestions() {
    clarStep = 0;
    currentPage = 'new-goal';
    render();
  }

  function approvePlan() {
    if (!draftPlan) return;
    const { goal, milestones, tasks, nodes } = draftPlan;
    State.set(s => ({
      ...s,
      goals: [...s.goals, goal],
      milestones: [...s.milestones, ...milestones],
      tasks: [...s.tasks, ...tasks],
      nodes: [...(s.nodes || []), ...nodes],
      currentGoalId: goal.id,
    }));
    clarStep = 0; clarData = {};
    draftPlan = null;
    currentPage = 'home';
    showNotif(`🚀 Quest approved! ${milestones.length} worlds, ${tasks.length} tasks ready.`);
    // Request notification permission on first goal approval
    requestNotifPermission();
  }

  function optimizePlan(modifier) {
    planChatHistory = [];
    planChatPending = null;
    draftOptimizing = true;
    render();
    Decompose.buildPlanAI({ ...clarData, modifier }).then((plan) => {
      draftPlan = plan;
      draftOptimizing = false;
      currentPage = 'plan-preview';
      render();
    }).catch(() => {
      draftOptimizing = false;
      showNotif('Optimization failed — try again', 'error');
      render();
    });
  }

  // ── Task Expansion ───────────────────────────────────────────────────────

  function expandTask(taskId) {
    expandedTaskId = taskId;
    render();
    setTimeout(() => {
      const el = document.getElementById(`tc-${taskId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function collapseTask() {
    const scrollY = window.scrollY;
    expandedTaskId = null;
    render();
    window.scrollTo(0, scrollY);
  }

  function toggleStep(taskId, stepIndex) {
    const current = new Set(State.get().stepProgress?.[taskId] || []);
    current.has(stepIndex) ? current.delete(stepIndex) : current.add(stepIndex);
    State.set(st => ({ ...st, stepProgress: { ...st.stepProgress, [taskId]: [...current] } }));
    render();
  }

  // ── Obstacle Mode ("I'm Stuck") ───────────────────────────────────────────

  function openObstacle(taskId) {
    obstacleTaskId = taskId;
    render();
  }

  function closeObstacle() {
    obstacleTaskId = null;
    render();
  }

  function obstacleNotEnoughTime(taskId) {
    // Split task into a smaller version: halve estimatedMinutes, mark as partial, reschedule remainder
    const s = State.get();
    const task = s.tasks.find(t => t.id === taskId);
    if (!task) { closeObstacle(); return; }
    // Defer to tomorrow and cut time estimate in half to feel less daunting
    const tomorrow = Decompose.addDays(new Date().toISOString().split('T')[0], 1);
    State.set(st => ({
      ...st,
      tasks: st.tasks.map(t => t.id === taskId
        ? { ...t, deadline: tomorrow, estimatedMinutes: Math.max(15, Math.round(t.estimatedMinutes / 2)), obstacleNote: 'Shortened — pick up where you left off' }
        : t)
    }));
    obstacleTaskId = null;
    showNotif('Task shortened & moved to tomorrow — small wins count!', 'success');
    render();
  }

  function obstacleDontUnderstand(taskId) {
    // Swap this task for an "easy" task from the same milestone, if one exists
    const s = State.get();
    const task = s.tasks.find(t => t.id === taskId);
    if (!task) { closeObstacle(); return; }
    const easyAlternative = s.tasks.find(t =>
      t.id !== taskId && t.milestoneId === task.milestoneId &&
      t.difficulty === 'easy' && t.status !== 'done'
    );
    obstacleTaskId = null;
    if (easyAlternative) {
      expandedTaskId = easyAlternative.id;
      showNotif(`Switched to an easier task: "${easyAlternative.title}"`, 'success');
    } else {
      // No easy swap — surface the startTrigger prominently
      expandedTaskId = taskId;
      showNotif('Tip: Re-read the "Start with" step — that first physical action is the unlock.', 'success');
    }
    render();
  }

  function obstacleNotFeeling(taskId) {
    // Defer 2 days, add a small activation task (5-min version)
    const s = State.get();
    const task = s.tasks.find(t => t.id === taskId);
    if (!task) { closeObstacle(); return; }
    const twoDays = Decompose.addDays(new Date().toISOString().split('T')[0], 2);
    State.set(st => ({
      ...st,
      tasks: st.tasks.map(t => t.id === taskId
        ? { ...t, deadline: twoDays, obstacleNote: 'Deferred — motivation check in 2 days' }
        : t)
    }));
    obstacleTaskId = null;
    showNotif('No pressure — task moved to in 2 days. Rest is part of the process.', 'success');
    render();
  }

  function obstacleNeedResources(taskId) {
    // Close sheet, collapse to expanded view so resources are visible
    obstacleTaskId = null;
    expandedTaskId = taskId;
    showNotif('Check the Resources section below for helpful links.', 'success');
    render();
    setTimeout(() => {
      const el = document.querySelector('.tc-resources');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  function renderObstacleSheet() {
    if (!obstacleTaskId) return '';
    const s = State.get();
    const task = s.tasks.find(t => t.id === obstacleTaskId);
    if (!task) return '';
    return `
      <div class="obstacle-overlay" onclick="App.closeObstacle()">
        <div class="obstacle-sheet" onclick="event.stopPropagation()">
          <div class="obstacle-header">
            <div class="obstacle-title">🚧 What's blocking you?</div>
            <button class="obstacle-close" onclick="App.closeObstacle()">✕</button>
          </div>
          <div class="obstacle-task-name">"${h(task.title)}"</div>
          <div class="obstacle-options">
            <button class="obstacle-option" onclick="App.obstacleNotEnoughTime('${task.id}')">
              <span class="obstacle-option-icon">⏱</span>
              <div class="obstacle-option-body">
                <div class="obstacle-option-title">Not enough time right now</div>
                <div class="obstacle-option-hint">Shorten it &amp; move to tomorrow</div>
              </div>
            </button>
            <button class="obstacle-option" onclick="App.obstacleDontUnderstand('${task.id}')">
              <span class="obstacle-option-icon">🤔</span>
              <div class="obstacle-option-body">
                <div class="obstacle-option-title">I don't understand what to do</div>
                <div class="obstacle-option-hint">Swap for an easier task or revisit the start trigger</div>
              </div>
            </button>
            <button class="obstacle-option" onclick="App.obstacleNotFeeling('${task.id}')">
              <span class="obstacle-option-icon">😮‍💨</span>
              <div class="obstacle-option-body">
                <div class="obstacle-option-title">Not feeling motivated today</div>
                <div class="obstacle-option-hint">Defer 2 days — rest is real progress</div>
              </div>
            </button>
            <button class="obstacle-option" onclick="App.obstacleNeedResources('${task.id}')">
              <span class="obstacle-option-icon">🔗</span>
              <div class="obstacle-option-body">
                <div class="obstacle-option-title">I need a resource or example</div>
                <div class="obstacle-option-hint">Jump to resources &amp; community links</div>
              </div>
            </button>
          </div>
        </div>
      </div>`;
  }

  // ── 7-Day Calibration Modal ──────────────────────────────────────────────

  function dismissCalibration() {
    showCalibration = false;
    const today = new Date().toISOString().split('T')[0];
    State.set(st => ({ ...st, user: { ...st.user, lastCalibrationDate: today } }));
    render();
  }

  function calibrateReducePace() {
    // Defer all pending tasks by 2 days and mark calibration done
    const today = new Date().toISOString().split('T')[0];
    State.set(st => ({
      ...st,
      tasks: st.tasks.map(t =>
        t.status !== 'done'
          ? { ...t, deadline: Decompose.addDays(t.deadline || today, 2) }
          : t
      ),
      user: { ...st.user, lastCalibrationDate: today, calibrationChoice: 'reduced' },
    }));
    showCalibration = false;
    showNotif('Plan relaxed — tasks spread out by 2 days.', 'success');
    render();
  }

  function calibrateKeepPace() {
    dismissCalibration();
    showNotif("Locked in. Keep the momentum.", 'success');
  }

  function calibrateIncreasePace() {
    // Pull all pending tasks 1 day earlier (min: today)
    const today = new Date().toISOString().split('T')[0];
    State.set(st => ({
      ...st,
      tasks: st.tasks.map(t => {
        if (t.status === 'done') return t;
        const earlier = Decompose.addDays(t.deadline || today, -1);
        return { ...t, deadline: earlier < today ? today : earlier };
      }),
      user: { ...st.user, lastCalibrationDate: today, calibrationChoice: 'boosted' },
    }));
    showCalibration = false;
    showNotif('Pace increased — tasks pulled forward!', 'success');
    render();
  }

  function renderCalibrationModal() {
    if (!showCalibration) return '';
    const s = State.get();
    const goal = s.goals.find(g => g.id === s.currentGoalId) || s.goals[0];
    if (!goal) return '';

    // Compute 7-day stats
    const cutoff = Decompose.addDays(new Date().toISOString().split('T')[0], -7);
    const goalTasks = s.tasks.filter(t => t.goalId === goal.id);
    const dueLast7 = goalTasks.filter(t => t.deadline && t.deadline >= cutoff);
    const doneLast7 = dueLast7.filter(t => t.status === 'done');
    const rate = dueLast7.length ? Math.round((doneLast7.length / dueLast7.length) * 100) : 0;

    const rateLabel = rate >= 75 ? '🔥 Strong start!' : rate >= 40 ? '👍 Decent progress' : '😅 Rough week';
    const suggestion = rate >= 75
      ? 'Crushing it — consider raising the bar.'
      : rate < 40
      ? 'Plan may be too dense. Breathing room helps.'
      : 'Pace looks about right. Keep going.';

    return `
      <div class="calibration-overlay" onclick="App.dismissCalibration()">
        <div class="calibration-modal" onclick="event.stopPropagation()">
          <div class="cal-header">
            <div class="cal-title">📊 7-Day Check-In</div>
            <button class="obstacle-close" onclick="App.dismissCalibration()">✕</button>
          </div>
          <div class="cal-goal-name">"${h(goal.title)}"</div>

          <div class="cal-stats">
            <div class="cal-stat">
              <div class="cal-stat-num">${doneLast7.length}<span class="cal-stat-den">/${dueLast7.length}</span></div>
              <div class="cal-stat-label">tasks done</div>
            </div>
            <div class="cal-stat">
              <div class="cal-stat-num">${rate}<span class="cal-stat-den">%</span></div>
              <div class="cal-stat-label">completion</div>
            </div>
            <div class="cal-stat">
              <div class="cal-stat-num">${s.user.streak || 0}</div>
              <div class="cal-stat-label">day streak</div>
            </div>
          </div>

          <div class="cal-verdict">${rateLabel} — ${suggestion}</div>

          <div class="cal-actions">
            <button class="cal-btn cal-btn-reduce" onclick="App.calibrateReducePace()">
              <span>🐢</span>
              <div><div class="cal-btn-title">Ease up</div><div class="cal-btn-hint">Spread tasks out</div></div>
            </button>
            <button class="cal-btn cal-btn-keep" onclick="App.calibrateKeepPace()">
              <span>✅</span>
              <div><div class="cal-btn-title">Keep pace</div><div class="cal-btn-hint">Plan is working</div></div>
            </button>
            <button class="cal-btn cal-btn-boost" onclick="App.calibrateIncreasePace()">
              <span>🚀</span>
              <div><div class="cal-btn-title">Speed up</div><div class="cal-btn-hint">Pull tasks forward</div></div>
            </button>
          </div>
        </div>
      </div>`;
  }

  // ── Task Completion ───────────────────────────────────────────────────────

  function completeTask(taskId, event) {
    const s = State.get();
    const task = s.tasks.find(t => t.id === taskId);
    if (!task || task.status === 'done') return;

    const clientY = event ? event.clientY : 180;

    // Exit focus mode if completing the focused task
    if (focusTaskId === taskId) {
      if (focusTimerInterval) { clearInterval(focusTimerInterval); focusTimerInterval = null; }
      focusRunning = false;
      focusTaskId = null;
      if (typeof Space !== 'undefined') Space.setFocusMode(false);
      currentPage = 'home';
    }

    const updatedTasks = s.tasks.map(t => t.id === taskId ? { ...t, status: 'done', completedAt: new Date().toISOString() } : t);
    const result = Gamification.completeTask(s.user, task, updatedTasks, s.milestones);
    let { user, xpEarned, multiplier, leveledUp, newBadges, levelInfo, isPerfectDay, perfectDayBonus, seasonalEarned, seasonalQuest } = result;

    const updatedMilestones = s.milestones.map(m => ({
      ...m, progress: Gamification.getMilestoneProgress(m.id, updatedTasks),
    }));

    // Detect newly-completed milestones for certificate
    const justCompletedMilestone = updatedMilestones.find(m =>
      m.progress === 100 && !(s.milestones.find(om => om.id === m.id) || {}).completedAt
    );
    if (justCompletedMilestone) {
      State.set(st => ({
        ...st,
        milestones: st.milestones.map(m =>
          m.id === justCompletedMilestone.id && !m.completedAt
            ? { ...m, completedAt: new Date().toISOString() }
            : m
        ),
      }));
      setTimeout(() => showCertificate('milestone', justCompletedMilestone), 1800);
    }

    // Detect goal completion
    const goalDone = updatedTasks.filter(t => t.goalId === (s.goals.find(g => g.id === s.currentGoalId) || s.goals[0])?.id).every(t => t.status === 'done');
    const currentGoal = s.goals.find(g => g.id === s.currentGoalId) || s.goals[0];
    if (goalDone && currentGoal && !currentGoal.completedAt) {
      State.set(st => ({
        ...st,
        goals: st.goals.map(g => g.id === currentGoal.id ? { ...g, completedAt: new Date().toISOString() } : g),
      }));
      setTimeout(() => showCertificate('goal', currentGoal), 2400);
    }

    // Track active history for streak calendar
    const today = new Date().toISOString().split('T')[0];
    const activeHistory = [...new Set([...(user.activeHistory || []), today])];
    user = { ...user, activeHistory };

    // If this was a comeback task, reset comeback mode
    if (comebackMode) { comebackMode = false; }

    State.set(st => ({ ...st, tasks: updatedTasks, user, milestones: updatedMilestones, stepProgress: { ...st.stepProgress, [taskId]: [] } }));

    // Collapse
    expandedTaskId = null;

    // Flash the card
    const card = document.getElementById(`tc-${taskId}`);
    if (card) card.classList.add('flash-complete');

    // Space burst + update progress
    if (typeof Space !== 'undefined') {
      Space.burst(event ? event.clientX : null, event ? event.clientY : null);
      const newGoalPct = Gamification.getGoalProgress(State.get().currentGoalId, updatedTasks);
      Space.setProgress(newGoalPct);
    }

    // XP animation
    showXPAnim(xpEarned, multiplier, task.isBoss, clientY);

    // Perfect day
    if (isPerfectDay) setTimeout(showPerfectDayBanner, 400);

    // Notification
    if (leveledUp) showNotif(`🎉 Level Up → ${levelInfo.current.title} (Lv.${levelInfo.current.level})`);
    else if (seasonalEarned && seasonalQuest) showNotif(`${seasonalQuest.icon} Seasonal Quest Complete: ${seasonalQuest.title}!`);
    else if (newBadges.length) showNotif(`🏆 ${newBadges[0].icon} ${newBadges[0].title} earned!`);
    else render();

    // Re-render modal if open
    if (activeModal) setTimeout(() => render(), 500);

    // Show difficulty reflection after XP animation
    setTimeout(() => { showReflection = taskId; render(); }, 1400);
  }

  // ── Achievement Certificate ───────────────────────────────────────────────

  let certificateData = null;   // { type: 'milestone'|'goal', item, date }

  function showCertificate(type, item) {
    certificateData = { type, item, date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) };
    render();
  }

  function dismissCertificate() {
    certificateData = null;
    render();
  }

  function downloadCertificate() {
    if (!certificateData) return;
    const canvas = document.getElementById('cert-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `goalquest-certificate-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function renderCertificateCanvas(type, item, date) {
    // Drawn into a hidden canvas, returned as data URL
    const w = 800, h = 520;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, w, h);

    // Border glow
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#818cf8');
    grad.addColorStop(0.5, '#6ee7b7');
    grad.addColorStop(1, '#fbbf24');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    // Inner border
    ctx.strokeStyle = 'rgba(129,140,248,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(18, 18, w - 36, h - 36);

    // Logo text
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillStyle = '#818cf8';
    ctx.textAlign = 'center';
    ctx.fillText('GoalQuest', w / 2, 70);

    // Title
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(type === 'goal' ? 'Quest Complete!' : 'Milestone Achieved!', w / 2, 160);

    // Subtitle
    ctx.font = '18px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(type === 'goal' ? 'You successfully completed your goal:' : 'You reached a major milestone:', w / 2, 210);

    // Item name — wrap if long
    const name = (item.title || '').slice(0, 80);
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(name, w / 2, 270);

    // Divider
    ctx.strokeStyle = 'rgba(129,140,248,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(120, 310); ctx.lineTo(w - 120, 310);
    ctx.stroke();

    // Date
    ctx.font = '15px Inter, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(date, w / 2, 345);

    // Stars decoration
    ctx.font = '28px serif';
    ctx.fillText('★  ★  ★', w / 2, 410);

    // Footer
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('altonka.github.io/goalquest', w / 2, 475);

    return canvas.toDataURL('image/png');
  }

  function renderCertificateModal() {
    if (!certificateData) return '';
    const { type, item, date } = certificateData;
    const dataUrl = renderCertificateCanvas(type, item, date);
    const emoji = type === 'goal' ? '🏆' : '🎖️';
    const headline = type === 'goal' ? 'Quest Complete!' : 'Milestone Achieved!';

    return `
      <div class="cert-overlay" onclick="App.dismissCertificate()">
        <div class="cert-modal" onclick="event.stopPropagation()">
          <div class="cert-emoji">${emoji}</div>
          <div class="cert-headline">${headline}</div>
          <div class="cert-name">${h(item.title || '')}</div>
          <div class="cert-date">${date}</div>
          <canvas id="cert-canvas" width="800" height="520" style="display:none;"></canvas>
          <img class="cert-preview" src="${dataUrl}" alt="Certificate preview">
          <div class="cert-actions">
            <button class="btn btn-ghost" onclick="App.dismissCertificate()">Close</button>
            <button class="btn btn-primary" onclick="App.downloadCertificate()">⬇ Download PNG</button>
          </div>
        </div>
      </div>`;
  }

  // ── Data Export / Import ──────────────────────────────────────────────────

  function exportData() {
    const data = JSON.stringify(State.get(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goalquest-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (!Array.isArray(parsed.goals) || !Array.isArray(parsed.tasks)) throw new Error('Invalid format');
          State.set(s => ({
            ...s,
            goals:         parsed.goals,
            milestones:    Array.isArray(parsed.milestones)  ? parsed.milestones  : [],
            tasks:         parsed.tasks,
            nodes:         Array.isArray(parsed.nodes)       ? parsed.nodes       : [],
            stepProgress:  parsed.stepProgress && typeof parsed.stepProgress === 'object' ? parsed.stepProgress : {},
            currentGoalId: parsed.currentGoalId ?? null,
            user:          parsed.user && typeof parsed.user === 'object' ? { ...s.user, ...parsed.user } : s.user,
          }));
          showNotif('✓ Data imported successfully');
          render();
        } catch {
          showNotif('Failed to import — invalid file', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // ── Streak Freeze ─────────────────────────────────────────────────────────

  function useFreeze() {
    const s = State.get();
    const { user, used } = Gamification.useStreakFreeze(s.user);
    if (!used) { showNotif('No freezes left', 'error'); return; }
    State.set({ user });
    showNotif('🧊 Streak freeze used — streak protected!');
  }

  function switchGoal(goalId) {
    State.set(st => ({ ...st, currentGoalId: goalId }));
    expandedTaskId = null;
    render();
  }

  function performPrestige() {
    const s = State.get();
    if (!Gamification.canPrestige(s.user)) return;
    if (!confirm('Prestige resets your XP and level to 1 but keeps all badges and your streak. Continue?')) return;
    const newUser = Gamification.prestige(s.user);
    State.set(st => ({ ...st, user: newUser }));
    const title = Gamification.getPrestigeTitle(newUser);
    showNotif(`✦ Prestige ${newUser.prestigeLevel}! You are now: ${title}`);
    render();
  }

  // ── PWA Notifications ────────────────────────────────────────────────────

  function requestNotifPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') scheduleReminder();
      });
    } else if (Notification.permission === 'granted') {
      scheduleReminder();
    }
  }

  function scheduleReminder() {
    // Fire a local notification at 9 AM tomorrow if the user hasn't opened the app
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date();
    const next9am = new Date(now);
    next9am.setDate(now.getDate() + 1);
    next9am.setHours(9, 0, 0, 0);
    const delay = next9am.getTime() - now.getTime();
    setTimeout(() => {
      const s = State.get();
      const today = new Date().toISOString().split('T')[0];
      if (s.user && s.user.lastActive === today) return; // Already active today
      const goal = s.goals.find(g => g.id === s.currentGoalId) || s.goals[0];
      if (!goal) return;
      new Notification('GoalQuest — Daily Check-in', {
        body: `Your quest awaits: "${goal.title}". Let's keep the streak alive!`,
        icon: '/goalquest/icons/icon-192.png',
        badge: '/goalquest/icons/icon-192.png',
        tag: 'goalquest-daily',
      });
      scheduleReminder(); // Reschedule for the next day
    }, delay);
  }

  // ── Adaptive Reschedule ───────────────────────────────────────────────────

  function autoReschedule() {
    const s = State.get();
    const overdue = Decompose.getOverdueTasks(s.tasks);
    if (!overdue.length) return;
    const rescheduled = Decompose.rescheduleTasks(s.tasks);
    State.set({ tasks: rescheduled });
    rescheduledCount = overdue.length;
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  function resetAll() {
    if (!confirm('Reset all data? This cannot be undone.')) return;
    State.reset();
    rescheduledCount = 0;
    nav('home');
  }

  // ── Bottom Nav ────────────────────────────────────────────────────────────

  function renderBottomNav() {
    const items = [
      { id: 'home',     icon: 'home',           label: 'Today' },
      { id: 'map',      icon: 'map',            label: 'Map' },
      { id: 'calendar', icon: 'calendar',       label: 'Calendar' },
      { id: 'review',   icon: 'calendar-check', label: 'Review' },
      { id: 'profile',  icon: 'user',           label: 'Profile' },
    ];
    return `
      <nav class="bottom-nav">
        ${items.map(it => `
          <button class="nav-item ${currentPage === it.id ? 'active' : ''}" onclick="App.nav('${it.id}')">
            <span class="nav-item-icon"><i data-lucide="${it.icon}"></i></span>
            <span class="nav-item-label">${it.label}</span>
          </button>
        `).join('')}
      </nav>
    `;
  }

  // ── Generating ────────────────────────────────────────────────────────────

  function renderGenerating() {
    return `
      <div class="generating-page">
        <div class="gen-skeleton-wrap">
          <div class="gen-status">
            <div class="spinner"></div>
            <span>Building your Quest…</span>
          </div>
          <div class="skel-plan">
            <div class="skel-section">
              <div class="skel-bar skel-label"></div>
              <div class="skel-card">
                <div class="skel-bar skel-title"></div>
                <div class="skel-bar skel-meta"></div>
                <div class="skel-bar skel-meta skel-short"></div>
              </div>
            </div>
            <div class="skel-section">
              <div class="skel-bar skel-label"></div>
              ${[1,2,3,4].map(() => `
                <div class="skel-ms-row">
                  <div class="skel-ms-dot"></div>
                  <div style="flex:1">
                    <div class="skel-bar skel-ms-title"></div>
                    <div class="skel-bar skel-ms-desc"></div>
                  </div>
                </div>`).join('')}
            </div>
            <div class="skel-section">
              <div class="skel-bar skel-label"></div>
              ${[1,2].map(() => `
                <div class="skel-task-row">
                  <div class="skel-bar skel-task-title"></div>
                  <div class="skel-bar skel-task-meta"></div>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ── Plan Preview ──────────────────────────────────────────────────────────

  function fmtDate(str) {
    if (!str) return '';
    const d = new Date(str + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function fmtDateShort(str) {
    if (!str) return '';
    const d = new Date(str + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function renderPlanPreview() {
    if (!draftPlan) { currentPage = 'home'; return renderHome(); }
    if (draftOptimizing) {
      return `
        <div class="generating-page">
          <div class="gen-inner">
            <div class="spinner"></div>
            <h2>Optimizing your plan...</h2>
            <p>Adjusting milestones and tasks · Almost done</p>
          </div>
        </div>`;
    }

    const { goal, milestones, tasks } = draftPlan;
    const sampleTasks = tasks.filter(t => t.milestoneId === milestones[0]?.id).slice(0, 6);
    const dailyMins = Math.round((goal.hoursPerWeek * 60) / 7);
    const weeksCount = Math.max(1, Math.round(
      (new Date(goal.deadline + 'T00:00:00') - new Date(goal.startDate + 'T00:00:00'))
      / (7 * 24 * 60 * 60 * 1000)
    ));
    const m0Tasks = tasks.filter(t => t.milestoneId === milestones[0]?.id).slice(0, 2);
    const keyResources = m0Tasks.flatMap(t => t.resources || []).filter(r => r.primary).slice(0, 4);

    const OPTIMIZE_OPTIONS = [
      { label: '😌 Make Easier',      modifier: 'make this plan easier with simpler tasks and reduced intensity' },
      { label: '🔥 More Intensive',   modifier: 'make this plan more intensive with harder tasks and higher standards' },
      { label: '⚡ Shorten Timeline', modifier: 'compress the milestones for faster completion while keeping quality' },
      { label: '🏋️ More Practice',    modifier: 'replace theory tasks with more hands-on practice and exercises' },
      { label: '📺 Video Resources',  modifier: 'replace reading resources with video tutorials and YouTube-based learning' },
      { label: '🎯 Shorter Tasks',    modifier: 'break all tasks into shorter sessions under 30 minutes each' },
    ];

    const planLeft = `
      <div class="preview-page preview-left-pane">
        <div class="preview-header">
          <button class="btn-back" onclick="App.backToQuestions()">← Edit</button>
          <div class="preview-header-title">Your Quest Plan</div>
          <button class="btn btn-primary" onclick="App.approvePlan()">Approve →</button>
        </div>

        ${draftPlan._usedFallback ? `
        <div class="fallback-notice">
          <span>⚠️ AI unavailable — using a general template.</span>
          <button onclick="App.generatePlan()">Retry with AI</button>
        </div>` : ''}

        <div class="preview-section">
          <div class="preview-section-label">YOUR GOAL</div>
          <div class="preview-goal-card">
            <div class="preview-goal-title">${h(goal.title)}</div>
            <div class="preview-goal-meta">
              <span>📅 ${fmtDate(goal.deadline)}</span>
              <span>⏱ ${goal.hoursPerWeek} hrs/week</span>
              <span>📆 ${weeksCount} weeks</span>
            </div>
            ${goal.successCriteria && goal.successCriteria !== `Successfully achieve: ${goal.title}` ? `
            <div class="preview-success">
              <span>🎯</span>
              <span>${goal.successCriteria}</span>
            </div>` : ''}
          </div>
        </div>

        <div class="preview-section">
          <div class="preview-section-label">MILESTONE ROADMAP</div>
          ${milestones.map((m, i) => `
            <div class="preview-milestone ${planChatPending ? 'pcp-hl-ms' : ''}" style="border-left:3px solid ${m.color};">
              <div class="pm-top">
                <span class="pm-world" style="color:${m.color};">World ${i + 1}</span>
                <span class="pm-title">${h(m.title)}</span>
                <span class="pm-date">${fmtDateShort(m.deadline)}</span>
              </div>
              <div class="pm-desc">${h(m.desc)}</div>
            </div>
          `).join('')}
        </div>

        <div class="preview-section">
          <div class="preview-section-label">WEEKLY WORKLOAD</div>
          <div class="preview-workload">
            <div class="pw-stat">
              <span class="pw-val">${goal.hoursPerWeek}h</span>
              <span class="pw-label">per week</span>
            </div>
            <div class="pw-divider"></div>
            <div class="pw-stat">
              <span class="pw-val">~${dailyMins}m</span>
              <span class="pw-label">per day</span>
            </div>
            <div class="pw-divider"></div>
            <div class="pw-stat">
              <span class="pw-val">${weeksCount}</span>
              <span class="pw-label">weeks</span>
            </div>
            <div class="pw-divider"></div>
            <div class="pw-stat">
              <span class="pw-val">${tasks.length}</span>
              <span class="pw-label">tasks total</span>
            </div>
          </div>
        </div>

        <div class="preview-section">
          <div class="preview-section-label">MILESTONE 1 — PREVIEW TASKS (${sampleTasks.length} of ${tasks.filter(t=>t.milestoneId===milestones[0]?.id).length})</div>
          ${sampleTasks.some(t => t.estimatedMinutes > dailyMins * 1.5) ? `
          <div style="background:rgba(251,191,36,0.1);border:1px solid var(--accent);border-radius:8px;padding:10px 14px;margin-bottom:12px;font-size:0.8rem;color:var(--accent);">
            ⚠️ Some tasks are longer than your ~${dailyMins}-min daily budget. Use the chat → "Shorten all tasks to 30 minutes".
          </div>` : ''}
          ${sampleTasks.map(t => {
            const dc = t.difficulty === 'easy' ? 'var(--success)' : t.difficulty === 'stretch' ? 'var(--danger)' : 'var(--accent)';
            const db = t.difficulty === 'easy' ? 'var(--success-l)' : t.difficulty === 'stretch' ? 'var(--danger-l)' : 'var(--accent-l)';
            return `
              <div class="preview-task-card ${planChatPending ? 'pcp-hl-task' : ''}">
                <div class="ptc-top">
                  <span class="ptc-diff" style="background:${db};color:${dc};">${t.difficulty}</span>
                  <span class="ptc-title">${h(t.title)}</span>
                  <span class="ptc-time">⏱ ${t.estimatedMinutes}m</span>
                </div>
                ${t.startTrigger ? `<div class="ptc-trigger">👉 ${h(t.startTrigger)}</div>` : ''}
                ${t.steps && t.steps.length ? `
                  <ul class="ptc-steps">
                    ${t.steps.slice(0, 3).map(s => `<li>${h(s)}</li>`).join('')}
                  </ul>` : ''}
                ${t.completionCondition ? `<div class="ptc-done">✅ ${h(t.completionCondition)}</div>` : ''}
              </div>`;
          }).join('')}
        </div>

        ${keyResources.length ? `
        <div class="preview-section">
          <div class="preview-section-label">KEY RESOURCES</div>
          <div class="preview-resources">
            ${keyResources.map(r => `
              <a class="preview-resource" href="${safeUrl(r.url)}" target="_blank" rel="noopener noreferrer">
                🔗 ${h(r.label)}
              </a>`).join('')}
          </div>
        </div>` : ''}

        <div class="preview-section">
          <div class="preview-section-label">ONE-CLICK OPTIMIZE</div>
          <p class="preview-optimize-hint">Quick presets — or use the chat panel to describe exactly what you want.</p>
          <div class="preview-optimize-grid">
            ${OPTIMIZE_OPTIONS.map(o => `
              <button class="opt-btn" onclick="App.optimizePlan('${o.modifier}')">${o.label}</button>
            `).join('')}
          </div>
        </div>

        <div class="preview-cta">
          <button class="btn btn-ghost" onclick="App.backToQuestions()">← Edit Answers</button>
          <button class="btn btn-primary btn-lg" onclick="App.approvePlan()">✓ Approve & Start Quest</button>
        </div>

        <div style="height:32px;"></div>
      </div>
    `;

    return `
      <div class="preview-split">
        ${planLeft}
        <div class="preview-right">
          ${renderPlanChatPanel()}
        </div>
      </div>
    `;
  }

  // ── Plan Chat Panel ───────────────────────────────────────────────────────

  function renderPlanChatPanel() {
    const SUGGESTIONS = [
      'Make week 1 easier',
      'Reduce tasks in milestone 2',
      'Add practice tasks',
      'Replace resources with YouTube videos',
      'Move milestone 2 back 1 week',
      'Shorten all tasks to 30 minutes',
    ];

    const msgs = planChatHistory.length === 0 ? `
      <div class="pcp-empty">
        <div class="pcp-empty-icon">✨</div>
        <div class="pcp-empty-text">Chat to refine your plan before approving it</div>
        <div class="pcp-suggestions">
          ${SUGGESTIONS.map(s => `
            <button class="pcp-suggest" onclick="App.sendPlanChat(${JSON.stringify(s)})">${h(s)}</button>
          `).join('')}
        </div>
      </div>
    ` : planChatHistory.map(msg => `
      <div class="pcp-msg pcp-msg-${h(msg.role)}">
        ${msg.role === 'assistant' ? '<div class="pcp-msg-icon">✨</div>' : ''}
        <div class="pcp-msg-bubble">${h(msg.content).replace(/\n/g, '<br>')}</div>
      </div>
    `).join('');

    const pendingCard = planChatPending ? `
      <div class="pcp-preview-card">
        <div class="pcp-preview-title">Proposed Changes</div>
        ${planChatPending.descs.map(d => `
          <div class="pcp-change-row">
            <span class="pcp-change-dot"></span>
            <span>${h(d)}</span>
          </div>
        `).join('')}
        <div class="pcp-preview-actions">
          <button class="btn btn-ghost pcp-btn" onclick="App.discardPlanChanges()">✕ Discard</button>
          <button class="btn btn-primary pcp-btn" onclick="App.applyPlanChanges()">✓ Apply</button>
        </div>
      </div>
    ` : '';

    return `
      <div class="plan-chat-panel">
        <div class="pcp-header">
          <span class="pcp-title">Plan Editor</span>
          <span class="pcp-sub">Describe what to change — AI will preview it first</span>
        </div>
        <div class="pcp-messages" id="pcp-msgs">
          ${msgs}
          ${pendingCard}
        </div>
        <div class="pcp-input-row">
          <input type="text" id="pcp-input" class="pcp-input"
            placeholder="e.g. Make milestone 1 easier…"
            onkeydown="if(event.key==='Enter'){event.preventDefault();App.sendPlanChat(this.value)}">
          <button class="pcp-send" onclick="App.sendPlanChat(document.getElementById('pcp-input').value)">
            <i data-lucide="send"></i>
          </button>
        </div>
      </div>
    `;
  }

  function sendPlanChat(text) {
    text = (text || '').trim();
    if (!text || !draftPlan) return;
    const inp = document.getElementById('pcp-input');
    if (inp) inp.value = '';

    planChatHistory.push({ role: 'user', content: text });
    planChatPending = null; // clear any previous pending

    const changes = PlanChat.parseCommand(text, draftPlan);
    const response = PlanChat.generateResponse(text, changes, draftPlan);
    planChatHistory.push({ role: 'assistant', content: response });

    if (changes.length > 0) {
      planChatPending = {
        changes,
        descs: PlanChat.describeChanges(changes, draftPlan),
        newPlan: PlanChat.applyChanges(draftPlan, changes),
      };
    }

    render();
    requestAnimationFrame(() => {
      const el = document.getElementById('pcp-msgs');
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  function applyPlanChanges() {
    if (!planChatPending) return;
    draftPlan = planChatPending.newPlan;
    planChatHistory.push({ role: 'system', content: '✓ Changes applied.' });
    planChatPending = null;
    showNotif('Plan updated!');
    render();
    requestAnimationFrame(() => {
      const el = document.getElementById('pcp-msgs');
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  function discardPlanChanges() {
    planChatHistory.push({ role: 'system', content: '✕ Changes discarded.' });
    planChatPending = null;
    render();
  }

  // ── Calendar Page ─────────────────────────────────────────────────────────

  function renderCalendar() {
    const s = State.get();
    const goal = s.goals.find(g => g.id === s.currentGoalId) || s.goals[0];
    if (!goal) return renderHome();

    const todayDate = new Date();
    const baseDate = new Date(todayDate);
    baseDate.setDate(baseDate.getDate() + calWeekOffset * 7);

    const weekStart = CalendarHelper.getWeekStart(baseDate);
    const weekDates = CalendarHelper.getWeekDates(weekStart);
    const todayStr = todayDate.toISOString().split('T')[0];

    const goalTasks = s.tasks.filter(t => t.goalId === goal.id);
    const activeTasks = goalTasks.filter(t => t.status !== 'done');
    const taskSlots = CalendarHelper.getTaskSlots(activeTasks, s.taskSchedules || {}, weekDates);
    const userEvents = (s.calendarEvents || []).filter(ev => weekDates.includes(ev.date));
    const conflicts = CalendarHelper.findConflicts(taskSlots, userEvents);
    const conflictTaskIds = new Set(conflicts.map(c => c.slotTaskId));

    const START_H = 7, END_H = 22, TOTAL_H = END_H - START_H;
    const HOUR_PX = 56;
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    function fmtHour(h) {
      if (h === 12) return '12 PM';
      return h > 12 ? `${h - 12} PM` : `${h} AM`;
    }
    function fmtWeekRange() {
      const end = new Date(weekStart); end.setDate(end.getDate() + 6);
      return `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTHS[end.getMonth()]} ${end.getDate()}`;
    }

    const dayColumns = weekDates.map((date, di) => {
      const isToday = date === todayStr;
      const daySlots = taskSlots.filter(sl => sl.date === date);
      const dayEvents = userEvents.filter(ev => ev.date === date);
      const d = new Date(date + 'T00:00:00');
      const hasConflict = daySlots.some(sl => conflictTaskIds.has(sl.taskId));

      const taskBlocks = daySlots.map(sl => {
        const task = s.tasks.find(t => t.id === sl.taskId);
        if (!task) return '';
        const top = (sl.startHour - START_H) * HOUR_PX;
        const heightPx = Math.max(24, (sl.endHour - sl.startHour) * HOUR_PX - 4);
        const isConflict = conflictTaskIds.has(sl.taskId);
        return `
          <div class="cal-event cal-ai-task ${isConflict ? 'cal-conflict' : ''}"
               style="top:${top}px;height:${heightPx}px"
               onclick="event.stopPropagation();App.calTaskClick('${h(task.id)}')">
            <div class="cal-event-title">${h(task.title)}</div>
            <div class="cal-event-meta">${task.estimatedMinutes}m · ${task.difficulty}</div>
            ${isConflict ? '<div class="cal-conflict-mark">⚠</div>' : ''}
          </div>`;
      }).join('');

      const eventBlocks = dayEvents.map(ev => {
        const top = (ev.startHour - START_H) * HOUR_PX;
        const heightPx = Math.max(24, (ev.endHour - ev.startHour) * HOUR_PX - 4);
        return `
          <div class="cal-event cal-user-event"
               style="top:${top}px;height:${heightPx}px"
               onclick="event.stopPropagation();App.calEventClick('${h(ev.id)}')">
            <div class="cal-event-title">${h(ev.title)}</div>
            <button class="cal-event-del" onclick="event.stopPropagation();App.calDeleteEvent('${h(ev.id)}')">×</button>
          </div>`;
      }).join('');

      return `
        <div class="cal-day-col ${isToday ? 'cal-today-col' : ''} ${hasConflict ? 'cal-conflict-col' : ''}">
          <div class="cal-day-header ${isToday ? 'cal-today-header' : ''}">
            <span class="cal-day-name">${DAYS[di]}</span>
            <span class="cal-day-num ${isToday ? 'cal-today-num' : ''}">${d.getDate()}</span>
          </div>
          <div class="cal-day-body" style="height:${TOTAL_H * HOUR_PX}px;position:relative;"
               onclick="App.calClickSlot('${date}', event, ${HOUR_PX}, ${START_H})">
            ${Array.from({ length: TOTAL_H }, (_, i) => `
              <div class="cal-hour-line" style="top:${i * HOUR_PX}px"></div>`).join('')}
            ${taskBlocks}
            ${eventBlocks}
          </div>
        </div>`;
    }).join('');

    const timeAxis = `
      <div class="cal-time-col">
        <div class="cal-time-header"></div>
        ${Array.from({ length: TOTAL_H }, (_, i) => `
          <div class="cal-time-slot" style="height:${HOUR_PX}px">${fmtHour(START_H + i)}</div>`).join('')}
      </div>`;

    return `
      <div class="page calendar-page">
        <div class="cal-header">
          <div class="cal-title-row">
            <h2 class="cal-title">Calendar</h2>
            <div class="cal-nav">
              <button class="cal-nav-btn" onclick="App.calNavWeek(-1)"><i data-lucide="chevron-left"></i></button>
              <span class="cal-week-label">${fmtWeekRange()}</span>
              <button class="cal-nav-btn" onclick="App.calNavWeek(1)"><i data-lucide="chevron-right"></i></button>
              <button class="cal-nav-btn cal-today-btn ${calWeekOffset === 0 ? 'active' : ''}"
                      onclick="App.calNavToday()">Today</button>
            </div>
          </div>
          <div class="cal-legend">
            <span class="cal-legend-item cal-legend-ai"><span class="cal-legend-dot"></span>AI Task</span>
            <span class="cal-legend-item cal-legend-user"><span class="cal-legend-dot"></span>Your Event</span>
            <span class="cal-legend-item cal-legend-hint">Click any slot to add an event</span>
          </div>
          ${conflicts.length ? `
          <div class="cal-conflict-notice">
            ⚠️ ${conflicts.length} overlap${conflicts.length > 1 ? 's' : ''} detected —
            <button class="cal-conflict-resolve" onclick="App.calResolveConflicts()">Review</button>
          </div>` : ''}
        </div>

        <div class="cal-grid-outer">
          ${timeAxis}
          <div class="cal-days-grid">${dayColumns}</div>
          ${taskSlots.length === 0 && userEvents.length === 0 ? `
          <div class="cal-empty-week">
            <span>No tasks or events this week — click any slot to add one</span>
          </div>` : ''}
        </div>

        ${calAddModal ? renderCalAddModal() : ''}
        ${renderBottomNav()}
      </div>
    `;
  }

  function renderCalAddModal() {
    const { date, startHour } = calAddModal;
    const d = new Date(date + 'T00:00:00');
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const endHour = Math.min(22, startHour + 1);

    function hrOpts(selected, from, to) {
      return Array.from({ length: to - from }, (_, i) => {
        const hr = from + i;
        const lbl = hr === 12 ? '12:00 PM' : hr > 12 ? `${hr - 12}:00 PM` : `${hr}:00 AM`;
        return `<option value="${hr}" ${hr === selected ? 'selected' : ''}>${lbl}</option>`;
      }).join('');
    }

    return `
      <div class="cal-modal-overlay" onclick="App.calCloseModal()">
        <div class="cal-modal" onclick="event.stopPropagation()">
          <div class="cal-modal-title">Add Event</div>
          <div class="cal-modal-date">${dayLabel}</div>
          <input id="cal-ev-title" class="cal-modal-input" type="text"
                 placeholder="e.g. Gym, Dinner, Study" autofocus
                 onkeydown="if(event.key==='Enter')App.calAddEvent()">
          <div class="cal-modal-time-row">
            <div class="cal-modal-time-field">
              <label>Start</label>
              <select id="cal-ev-start" class="cal-modal-select">${hrOpts(startHour, 7, 22)}</select>
            </div>
            <div class="cal-modal-time-field">
              <label>End</label>
              <select id="cal-ev-end" class="cal-modal-select">${hrOpts(endHour, 8, 23)}</select>
            </div>
          </div>
          <div class="cal-modal-actions">
            <button class="btn btn-ghost" onclick="App.calCloseModal()">Cancel</button>
            <button class="btn btn-primary" onclick="App.calAddEvent()">Add Event</button>
          </div>
        </div>
      </div>
    `;
  }

  // Calendar action handlers

  function calNavWeek(dir) { calWeekOffset += dir; calAddModal = null; render(); }
  function calNavToday()   { calWeekOffset = 0; render(); }

  function calClickSlot(date, event, hourPx, startH) {
    const body = event.currentTarget;
    const rect = body.getBoundingClientRect();
    const relY = event.clientY - rect.top;
    const clickedH = startH + Math.floor(relY / hourPx);
    calAddModal = { date, startHour: Math.max(7, Math.min(21, clickedH)) };
    render();
  }

  function calCloseModal() { calAddModal = null; render(); }

  function calAddEvent() {
    const title = (document.getElementById('cal-ev-title')?.value || '').trim();
    if (!title) { showNotif('Enter an event name', 'error'); return; }
    const startHour = parseInt(document.getElementById('cal-ev-start')?.value ?? calAddModal.startHour);
    const endHour   = parseInt(document.getElementById('cal-ev-end')?.value   ?? startHour + 1);
    if (endHour <= startHour) { showNotif('End must be after start', 'error'); return; }

    const ev = {
      id: 'ev_' + Date.now(),
      type: 'USER_EVENT',
      title,
      date: calAddModal.date,
      startHour,
      endHour,
      isCompleted: false,
      isPinned: false,
    };

    // Conflict check
    const s = State.get();
    const baseDate = new Date();
    baseDate.setDate(new Date().getDate() + calWeekOffset * 7);
    const weekDates = CalendarHelper.getWeekDates(CalendarHelper.getWeekStart(baseDate));
    const goalTasks = s.tasks.filter(t => t.goalId === s.currentGoalId && t.status !== 'done');
    const slots = CalendarHelper.getTaskSlots(goalTasks, s.taskSchedules || {}, weekDates);
    const clashes = CalendarHelper.findConflicts(slots, [ev]);
    if (clashes.length) {
      const clashTask = s.tasks.find(t => t.id === clashes[0].slotTaskId);
      const ok = confirm(`This overlaps with your task "${clashTask?.title || 'a scheduled task'}". Add anyway?`);
      if (!ok) return;
    }

    State.set(st => ({ ...st, calendarEvents: [...(st.calendarEvents || []), ev] }));
    calAddModal = null;
    showNotif(`✓ "${title}" added`);
    render();
  }

  function calEventClick(evId) {
    const ev = (State.get().calendarEvents || []).find(e => e.id === evId);
    if (!ev) return;
    if (confirm(`Delete "${ev.title}"?`)) calDeleteEvent(evId);
  }

  function calDeleteEvent(evId) {
    State.set(st => ({ ...st, calendarEvents: (st.calendarEvents || []).filter(e => e.id !== evId) }));
    showNotif('Event removed');
    render();
  }

  function calTaskClick(taskId) {
    const s = State.get();
    const task = s.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.status === 'done') { showNotif('Already completed ✓'); return; }
    if (confirm(`Mark "${task.title}" as complete?`)) completeTask(taskId, null);
  }

  function calResolveConflicts() {
    showNotif('Drag tasks in the calendar, or reschedule via Today page', 'error');
  }

  // ── Notification ──────────────────────────────────────────────────────────

  function renderNotif() {
    if (!notification) return '';
    return `<div class="notif notif-${notification.type}">${notification.msg}</div>`;
  }

  // ── Main Render ───────────────────────────────────────────────────────────

  function render() {
    const app = document.getElementById('app');
    const s = State.get();

    if (currentPage === 'focus') {
      app.innerHTML = renderFocusMode() + renderNotif();
    } else if (currentPage === 'new-goal') {
      app.innerHTML = renderNewGoal() + renderNotif();
    } else if (currentPage === 'generating') {
      app.innerHTML = renderGenerating() + renderNotif();
    } else if (currentPage === 'plan-preview') {
      app.innerHTML = renderPlanPreview() + renderNotif();
    } else {
      let pageHtml = '';
      if      (currentPage === 'home')     pageHtml = renderHome();
      else if (currentPage === 'map')      pageHtml = renderMap();
      else if (currentPage === 'calendar') pageHtml = renderCalendar();
      else if (currentPage === 'profile')  pageHtml = renderProfile();
      else if (currentPage === 'review')   pageHtml = renderReview();
      else pageHtml = renderHome();

      app.innerHTML = `
        <div class="app-shell">
          ${renderSidebar(s.user)}
          <div class="main-content">${pageHtml}</div>
        </div>
      ` + renderObstacleSheet() + renderCalibrationModal() + renderCertificateModal() + renderNotif();
    }

    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [document.getElementById('app')] });
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    const s = State.get();

    // Refresh weekly freezes
    const refreshed = Gamification.refreshWeeklyFreezes(s.user);
    if (refreshed !== s.user) State.set({ user: refreshed });

    // Auto-reschedule overdue
    autoReschedule();

    // Comeback detection: away 2+ days → show comeback screen (once per calendar day)
    if (s.goals.length) {
      const daysAway = Gamification.daysSinceActive(s.user);
      const today = new Date().toISOString().split('T')[0];
      if (daysAway >= 2 && s.user.lastComebackDate !== today) {
        comebackMode = true;
        State.set(st => ({ ...st, user: { ...st.user, comebackCount: (st.user.comebackCount || 0) + 1, lastComebackDate: today } }));
      }
    }

    // Why reminder: show every 3rd task or on return
    const totalDone = s.user.totalTasksDone || 0;
    if (totalDone > 0 && totalDone % 3 === 0) showWhyReminder = true;
    if (comebackMode) showWhyReminder = true;

    // 7-day calibration: fire once after first 7 days of earliest goal
    if (s.goals.length && !s.user.lastCalibrationDate) {
      const today = new Date().toISOString().split('T')[0];
      const earliest = s.goals.reduce((min, g) => (!min || g.createdAt < min) ? g.createdAt : min, null);
      if (earliest) {
        const daysSinceStart = Math.floor((Date.now() - new Date(earliest)) / 86400000);
        if (daysSinceStart >= 7) showCalibration = true;
      }
    }

    // Keyboard shortcuts (guarded — init() called once but defensive)
    if (!init._keyBound) {
      init._keyBound = true;
      document.addEventListener('keydown', (e) => {
        if (currentPage === 'focus') {
          if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            toggleFocusTimer();
          } else if (e.code === 'Escape') {
            exitFocus();
          }
        }
      });
    }

    // Resume daily reminder if permission already granted
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      scheduleReminder();
    }

    // Init Space background
    if (typeof Space !== 'undefined') {
      Space.init();
      const s0 = State.get();
      const allTasks = s0.tasks || [];
      const goalPct = allTasks.length
        ? Gamification.getGoalProgress(s0.currentGoalId, allTasks)
        : 0;
      Space.setProgress(goalPct);
    }

    render();
  }

  init();

  return {
    nav, clarNext, clarBack, clarSkip,
    generatePlan, approvePlan, optimizePlan, backToQuestions,
    completeTask, expandTask, collapseTask, toggleStep,
    openNode, closeModal,
    useFreeze, resetAll,
    exportData, importData,
    dismissComeback, dismissWhy,
    submitReflection, closeReflection,
    startFocus, exitFocus, toggleFocusTimer, resetFocusTimer, setFocusDuration,
    openObstacle, closeObstacle,
    obstacleNotEnoughTime, obstacleDontUnderstand, obstacleNotFeeling, obstacleNeedResources,
    dismissCalibration, calibrateReducePace, calibrateKeepPace, calibrateIncreasePace,
    reviewDefer, reviewSwapDifficulty, saveWeeklyReflection,
    performPrestige, switchGoal,
    showCertificate, dismissCertificate, downloadCertificate,
    // Plan Chat
    sendPlanChat, applyPlanChanges, discardPlanChanges,
    // Calendar
    calNavWeek, calNavToday, calClickSlot, calCloseModal,
    calAddEvent, calEventClick, calDeleteEvent, calTaskClick, calResolveConflicts,
  };
})();
