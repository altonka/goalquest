const App = (() => {
  let currentPage = 'home';
  let notification = null;
  let notifTimer = null;
  let activeModal = null;   // node id currently shown in modal
  let rescheduledCount = 0;

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
    el.style.left = '50%';
    el.style.top = (clientY ? clientY - 30 : 180) + 'px';
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
    const tasks = s.tasks.filter(t => t.goalId === goal.id);
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.deadline === today);
    const todayDone = todayTasks.filter(t => t.status === 'done').length;
    const todayTodo = todayTasks.filter(t => t.status !== 'done');
    const todayPct = todayTasks.length ? Math.round((todayDone / todayTasks.length) * 100) : 0;
    const goalPct = Gamification.getGoalProgress(goal.id, tasks);

    return `
      <div class="page">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-top:6px;">
          <h2 style="font-size:1rem;font-weight:800;">Goal<span class="accent">Quest</span></h2>
          <span style="font-size:0.78rem;color:var(--muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${goal.title}</span>
        </div>

        ${renderStatsStrip(s.user)}

        ${rescheduledCount > 0 ? `<div class="reschedule-notice">📅 ${rescheduledCount} overdue task${rescheduledCount > 1 ? 's' : ''} rescheduled to today</div>` : ''}

        <!-- Goal bar -->
        <div class="goal-progress-strip" style="margin-bottom:16px;">
          <div class="gp-row">
            <span class="gp-title">Overall Progress</span>
            <span class="gp-pct">${goalPct}%</span>
          </div>
          <div class="gp-bar"><div class="gp-fill" style="width:${goalPct}%"></div></div>
        </div>

        <!-- Today header + perfect day bar -->
        <div class="today-header">
          <span class="today-title">⚡ Today's Quest</span>
          <span class="today-count">${todayDone}/${todayTasks.length} done</span>
        </div>
        ${todayTasks.length ? `
        <div class="perfect-progress">
          <span class="pp-label">🌟 Perfect Day</span>
          <div class="pp-bar-outer"><div class="pp-bar-inner" style="width:${todayPct}%"></div></div>
          <span class="pp-pct">${todayPct}%</span>
        </div>
        ` : ''}

        <!-- Task list -->
        ${todayTodo.length ? todayTodo.map(t => renderTaskCard(t, s.user)).join('') : `
          <div class="all-done-card">
            <h3>🎉 All Done!</h3>
            <p>You've completed all tasks for today.<br>Keep your streak alive tomorrow!</p>
          </div>
        `}

        <!-- Upcoming if nothing today -->
        ${!todayTasks.length ? renderUpcoming(tasks) : ''}
      </div>
      ${renderBottomNav()}
    `;
  }

  function renderUpcoming(tasks) {
    const upcoming = Decompose.getUpcomingTasks(tasks, 7);
    if (!upcoming.length) return '';
    return `
      <div style="margin-top:20px;">
        <p class="section-title">Next 7 Days</p>
        ${upcoming.slice(0, 6).map(t => renderTaskCard(t)).join('')}
      </div>
    `;
  }

  function renderTaskCard(task) {
    const s = State.get();
    const mult = Gamification.getMomentumMultiplier(s.user.streak);
    const effectiveXP = Math.round(task.xpReward * mult);
    const isBoss = task.isBoss;
    const isDone = task.status === 'done';
    return `
      <div class="task-card ${isBoss ? 'boss' : 'normal'} ${isDone ? 'done' : ''}" id="tc-${task.id}">
        <button class="task-check-btn ${isDone ? 'checked' : ''} ${isBoss ? 'boss-btn' : ''}"
          onclick="App.completeTask('${task.id}', event)">
          ${isDone ? '✓' : isBoss ? '⚔️' : ''}
        </button>
        <div class="task-body">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">
            <span class="meta-pill time">⏱ ${task.estimatedMinutes}min</span>
            <span class="meta-pill ${isBoss ? 'boss-xp' : 'xp'}">+${effectiveXP} XP${mult > 1 ? ` ×${mult}` : ''}</span>
            ${isBoss ? '<span class="meta-pill boss-xp">⚔️ Boss</span>' : ''}
          </div>
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
          <div class="world-banner" style="background:${ms.color}22;border:1px solid ${ms.color}44;">
            <div class="world-banner-dot" style="background:${ms.color}"></div>
            <span style="color:${ms.color}">World ${mi+1}: ${ms.title}</span>
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
      : stateClass === 'locked' ? '🔒'
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
          <div class="node-label">${node.title.replace('⚔️ ', '')}</div>
        </div>
      </div>
    `;
  }

  function renderNodeModal(node, tasks, user) {
    if (!node) return '';
    const nodeTasks = tasks.filter(t => node.taskIds.includes(t.id));
    const mult = Gamification.getMomentumMultiplier(user.streak);
    return `
      <div class="node-modal-overlay" onclick="App.closeModal(event)">
        <div class="node-modal">
          <div class="node-modal-header">
            <div>
              <div class="node-modal-title">${node.title}</div>
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
            ${Object.entries(clarData).map(([k,v]) => `<span class="preview-tag"><b>${k}:</b> ${v}</span>`).join('')}
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
    setTimeout(() => {
      const { goal, milestones, tasks, nodes } = Decompose.buildPlan(clarData);
      State.set(s => ({
        ...s,
        goals: [...s.goals, goal],
        milestones: [...s.milestones, ...milestones],
        tasks: [...s.tasks, ...tasks],
        nodes: [...(s.nodes || []), ...nodes],
        currentGoalId: goal.id,
      }));
      clarStep = 0; clarData = {};
      currentPage = 'home';
      showNotif(`🚀 ${milestones.length} worlds, ${nodes.length} nodes, ${tasks.length} tasks created!`);
    }, 1200);
  }

  // ── Task Completion ───────────────────────────────────────────────────────

  function completeTask(taskId, event) {
    const s = State.get();
    const task = s.tasks.find(t => t.id === taskId);
    if (!task || task.status === 'done') return;

    const clientY = event ? event.clientY : 180;

    const updatedTasks = s.tasks.map(t => t.id === taskId ? { ...t, status: 'done' } : t);
    const { user, xpEarned, multiplier, leveledUp, newBadges, levelInfo, isPerfectDay, perfectDayBonus } = Gamification.completeTask(s.user, task, updatedTasks, s.milestones);

    const updatedMilestones = s.milestones.map(m => ({
      ...m, progress: Gamification.getMilestoneProgress(m.id, updatedTasks),
    }));

    State.set({ tasks: updatedTasks, user, milestones: updatedMilestones });

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
      { id: 'home',    icon: '🏠', label: 'Today' },
      { id: 'map',     icon: '🗺️', label: 'Map' },
      { id: 'profile', icon: '👤', label: 'Profile' },
    ];
    return `
      <nav class="bottom-nav">
        ${items.map(it => `
          <button class="nav-item ${currentPage === it.id ? 'active' : ''}" onclick="App.nav('${it.id}')">
            <span class="nav-item-icon">${it.icon}</span>
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
          <p>Mapping milestones · Clustering nodes · Scheduling tasks</p>
        </div>
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
    let html = '';
    if      (currentPage === 'home')       html = renderHome();
    else if (currentPage === 'map')        html = renderMap();
    else if (currentPage === 'profile')    html = renderProfile();
    else if (currentPage === 'new-goal')   html = renderNewGoal();
    else if (currentPage === 'generating') html = renderGenerating();
    else html = renderHome();
    app.innerHTML = html + renderNotif();
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    // Refresh weekly freezes
    const s = State.get();
    const refreshed = Gamification.refreshWeeklyFreezes(s.user);
    if (refreshed !== s.user) State.set({ user: refreshed });

    // Auto-reschedule overdue
    autoReschedule();
    render();
  }

  init();

  return { nav, clarNext, clarBack, clarSkip, completeTask, openNode, closeModal, useFreeze, resetAll };
})();
