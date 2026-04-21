// Escape user/AI content before inserting into innerHTML
function h(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
  // completedSteps removed — now persisted in State.stepProgress

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
      { id: 'home',    icon: 'home', label: 'Today' },
      { id: 'map',     icon: 'map',  label: 'Map' },
      { id: 'profile', icon: 'user', label: 'Profile' },
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
            <div class="feature-card"><span class="feat-icon">🎯</span><h3>Smart Breakdown</h3><p>Goals → Milestones → Daily tasks</p></div>
            <div class="feature-card"><span class="feat-icon">🗺️</span><h3>Progress Map</h3><p>Visual Duolingo-style journey</p></div>
            <div class="feature-card"><span class="feat-icon">⚡</span><h3>Momentum XP</h3><p>Streaks multiply your rewards</p></div>
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
          <div class="quest-label">Active Quest</div>
          <div class="quest-title">${h(goal.title)}</div>
        </div>

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
    return `
      <div class="reflection-overlay" onclick="App.closeReflection(event)">
        <div class="reflection-sheet">
          <p class="reflection-q">How was that task?</p>
          <div class="reflection-btns">
            <button class="ref-btn ref-hard"  onclick="App.submitReflection('${taskId}','hard')">😅 Too Hard</button>
            <button class="ref-btn ref-right" onclick="App.submitReflection('${taskId}','right')">👌 Just Right</button>
            <button class="ref-btn ref-easy"  onclick="App.submitReflection('${taskId}','easy')">⚡ Too Easy</button>
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
    currentPage = 'home';
    render();
  }

  function renderFocusMode() {
    const s = State.get();
    const task = s.tasks.find(t => t.id === focusTaskId);
    if (!task) { exitFocus(); return ''; }

    const steps = task.steps || [];
    const doneSteps = new Set(State.get().stepProgress?.[task.id] || []);
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
          <div class="level-num">${u.level}</div>
          <div class="level-title">${li.current.title}</div>
          <div class="level-xp-bar"><div class="level-xp-fill" style="width:${li.progress}%"></div></div>
          <div class="level-xp-text">${u.xp} XP · ${li.next ? `${li.progress}% to ${li.next.title}` : 'Max Level'}</div>
        </div>

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
    render();
    Decompose.buildPlanAI(clarData).then((plan) => {
      draftPlan = plan;
      currentPage = 'plan-preview';
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
  }

  function optimizePlan(modifier) {
    draftOptimizing = true;
    render();
    Decompose.buildPlanAI({ ...clarData, modifier }).then((plan) => {
      draftPlan = plan;
      draftOptimizing = false;
      currentPage = 'plan-preview';
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
      currentPage = 'home';
    }

    const updatedTasks = s.tasks.map(t => t.id === taskId ? { ...t, status: 'done', completedAt: new Date().toISOString() } : t);
    const result = Gamification.completeTask(s.user, task, updatedTasks, s.milestones);
    let { user, xpEarned, multiplier, leveledUp, newBadges, levelInfo, isPerfectDay, perfectDayBonus } = result;

    const updatedMilestones = s.milestones.map(m => ({
      ...m, progress: Gamification.getMilestoneProgress(m.id, updatedTasks),
    }));

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

    // XP animation
    showXPAnim(xpEarned, multiplier, task.isBoss, clientY);

    // Perfect day
    if (isPerfectDay) setTimeout(showPerfectDayBanner, 400);

    // Notification
    if (leveledUp) showNotif(`🎉 Level Up → ${levelInfo.current.title} (Lv.${levelInfo.current.level})`);
    else if (newBadges.length) showNotif(`🏆 ${newBadges[0].icon} ${newBadges[0].title} earned!`);
    else render();

    // Re-render modal if open
    if (activeModal) setTimeout(() => render(), 500);

    // Show difficulty reflection after XP animation
    setTimeout(() => { showReflection = taskId; render(); }, 1400);
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
          if (!parsed.goals || !parsed.tasks) throw new Error('Invalid format');
          State.set(parsed);
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
      { id: 'home',    icon: 'home', label: 'Today' },
      { id: 'map',     icon: 'map',  label: 'Map' },
      { id: 'profile', icon: 'user', label: 'Profile' },
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
        <div class="gen-inner">
          <div class="spinner"></div>
          <h2>Building your Quest...</h2>
          <p>AI is crafting your personalized plan · This takes a few seconds</p>
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

    return `
      <div class="preview-page">
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
            <div class="preview-milestone" style="border-left:3px solid ${m.color};">
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
          <div style="background:var(--warning-l,#fff8e1);border:1px solid var(--warning,#f6c90e);border-radius:8px;padding:10px 14px;margin-bottom:12px;font-size:0.8rem;color:#7a5f00;">
            ⚠️ Some tasks are longer than your ~${dailyMins}-min daily budget. You can click <strong>🎯 Shorter Tasks</strong> below to split them, or pace them across 2 days.
          </div>` : ''}
          ${sampleTasks.map(t => {
            const dc = t.difficulty === 'easy' ? 'var(--success)' : t.difficulty === 'stretch' ? 'var(--danger)' : 'var(--accent)';
            const db = t.difficulty === 'easy' ? 'var(--success-l)' : t.difficulty === 'stretch' ? 'var(--danger-l)' : 'var(--accent-l)';
            return `
              <div class="preview-task-card">
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
              <a class="preview-resource" href="${h(r.url || '#')}" target="_blank" rel="noopener noreferrer">
                🔗 ${h(r.label)}
              </a>`).join('')}
          </div>
        </div>` : ''}

        <div class="preview-section">
          <div class="preview-section-label">OPTIMIZE PLAN</div>
          <p class="preview-optimize-hint">Not happy with the draft? Adjust before you commit.</p>
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
      if      (currentPage === 'home')    pageHtml = renderHome();
      else if (currentPage === 'map')     pageHtml = renderMap();
      else if (currentPage === 'profile') pageHtml = renderProfile();
      else pageHtml = renderHome();

      app.innerHTML = `
        <div class="app-shell">
          ${renderSidebar(s.user)}
          <div class="main-content">${pageHtml}</div>
        </div>
      ` + renderNotif();
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
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

    // Keyboard shortcuts
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
  };
})();
