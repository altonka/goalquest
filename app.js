// ─── Router ───────────────────────────────────────────────────────────────────
const App = (() => {
  let currentPage = 'home';
  let notification = null;
  let notifTimeout = null;

  function navigate(page) {
    currentPage = page;
    render();
  }

  function showNotif(msg, type = 'success') {
    notification = { msg, type };
    if (notifTimeout) clearTimeout(notifTimeout);
    notifTimeout = setTimeout(() => { notification = null; render(); }, 3000);
    render();
  }

  // ─── Pages ───────────────────────────────────────────────────────────────

  function renderHome() {
    const s = State.get();
    const hasGoal = s.goals.length > 0;

    return `
      <div class="page home-page">
        <header class="hero">
          <div class="hero-inner">
            <h1>Goal<span class="accent">Quest</span></h1>
            <p class="tagline">Turn ambition into daily action.</p>
            ${hasGoal ? `
              <div class="hero-actions">
                <button class="btn btn-primary" onclick="App.nav('dashboard')">Go to Dashboard</button>
                <button class="btn btn-ghost" onclick="App.nav('new-goal')">New Goal</button>
              </div>
            ` : `
              <button class="btn btn-primary btn-lg" onclick="App.nav('new-goal')">Start Your Quest →</button>
            `}
          </div>
        </header>

        ${hasGoal ? renderUserStats(s) : ''}

        <div class="features">
          <div class="feature-card">
            <span class="feat-icon">🎯</span>
            <h3>Smart Breakdown</h3>
            <p>Goals → Milestones → Daily Tasks automatically</p>
          </div>
          <div class="feature-card">
            <span class="feat-icon">📅</span>
            <h3>Timeline Engine</h3>
            <p>Deadlines calculated from your availability</p>
          </div>
          <div class="feature-card">
            <span class="feat-icon">🎮</span>
            <h3>Gamification</h3>
            <p>XP, levels, streaks, badges — stay motivated</p>
          </div>
        </div>
      </div>
    `;
  }

  function renderUserStats(s) {
    const u = s.user;
    const li = Gamification.getLevelInfo(u.xp);
    return `
      <div class="stats-bar">
        <div class="stat"><span class="stat-val">Lv.${u.level}</span><span class="stat-label">${li.current.title}</span></div>
        <div class="stat"><span class="stat-val">${u.xp} XP</span><span class="stat-label">Total</span></div>
        <div class="stat"><span class="stat-val">🔥 ${u.streak}</span><span class="stat-label">Streak</span></div>
        <div class="stat"><span class="stat-val">${(u.badges||[]).length}</span><span class="stat-label">Badges</span></div>
        <div class="stat xp-progress-wrap">
          <div class="xp-bar-outer"><div class="xp-bar-inner" style="width:${li.progress}%"></div></div>
          <span class="stat-label">${li.next ? `${li.progress}% to Lv.${li.next.level}` : 'MAX'}</span>
        </div>
      </div>
    `;
  }

  // ─── Clarification / Goal Input ──────────────────────────────────────────

  let clarStep = 0;
  let clarData = {};

  const CLАР_QUESTIONS = [
    { key: 'goalText', label: 'What is your goal?', placeholder: 'e.g. Become an MBB consultant', type: 'text', required: true },
    { key: 'deadline', label: 'By when? (target date)', placeholder: 'YYYY-MM-DD', type: 'date', required: false },
    { key: 'hoursPerWeek', label: 'Hours per week you can commit?', placeholder: 'e.g. 10', type: 'number', required: true },
    { key: 'currentLevel', label: 'Your starting point?', placeholder: 'e.g. No experience, or 1 year in finance', type: 'text', required: false },
    { key: 'successCriteria', label: 'How will you know you succeeded?', placeholder: 'e.g. Receive an offer from MBB firm', type: 'text', required: false },
    { key: 'priority', label: 'Priority level (1–10)', placeholder: '7', type: 'number', required: false },
  ];

  function renderNewGoal() {
    const q = CLАР_QUESTIONS[clarStep];
    const progress = Math.round(((clarStep) / CLАР_QUESTIONS.length) * 100);

    return `
      <div class="page clар-page">
        <div class="clар-container">
          <div class="clар-header">
            <button class="btn-back" onclick="App.nav('home')">← Back</button>
            <h2>Define Your Quest</h2>
            <div class="clар-progress">
              <div class="clар-bar" style="width:${progress}%"></div>
            </div>
            <p class="step-counter">Step ${clarStep + 1} of ${CLАР_QUESTIONS.length}</p>
          </div>

          <div class="question-card">
            <label class="q-label">${q.label}</label>
            <input
              id="clар-input"
              class="q-input"
              type="${q.type}"
              placeholder="${q.placeholder}"
              value="${clarData[q.key] || ''}"
              autofocus
              onkeydown="if(event.key==='Enter') App.clarNext()"
            />
            <div class="q-actions">
              ${clarStep > 0 ? `<button class="btn btn-ghost" onclick="App.clarBack()">Back</button>` : ''}
              <button class="btn btn-primary" onclick="App.clarNext()">
                ${clarStep < CLАР_QUESTIONS.length - 1 ? 'Next →' : 'Generate Plan 🚀'}
              </button>
              ${!q.required ? `<button class="btn btn-ghost" onclick="App.clarSkip()">Skip</button>` : ''}
            </div>
          </div>

          <div class="clар-preview">
            ${Object.entries(clarData).map(([k, v]) =>
              `<span class="preview-tag"><b>${k}:</b> ${v}</span>`
            ).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────

  function renderDashboard() {
    const s = State.get();
    if (!s.goals.length) {
      return `<div class="page"><div class="empty-state"><h2>No goals yet.</h2><button class="btn btn-primary" onclick="App.nav('new-goal')">Create Goal</button></div></div>`;
    }

    const goal = s.goals.find(g => g.id === s.currentGoalId) || s.goals[0];
    const milestones = s.milestones.filter(m => m.goalId === goal.id);
    const tasks = s.tasks.filter(t => t.goalId === goal.id);
    const upcoming = Decompose.getUpcomingTasks(tasks);
    const overdue = Decompose.getOverdueTasks(tasks);
    const goalProgress = Gamification.getGoalProgress(goal.id, tasks);
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.deadline === today && t.status !== 'done');

    return `
      <div class="page dashboard-page">
        <nav class="dash-nav">
          <button class="btn-back" onclick="App.nav('home')">← Home</button>
          <h2 class="goal-title">${goal.title}</h2>
          <button class="btn btn-sm" onclick="App.nav('badges')">🏆 Badges</button>
        </nav>

        ${renderUserStats(s)}

        <!-- Goal Progress -->
        <section class="section">
          <div class="goal-progress-card">
            <div class="gp-header">
              <span>Goal Progress</span>
              <span class="gp-pct">${goalProgress}%</span>
            </div>
            <div class="big-bar-outer"><div class="big-bar-inner" style="width:${goalProgress}%"></div></div>
            <div class="gp-meta">
              <span>Due: ${goal.deadline}</span>
              <span>${tasks.filter(t=>t.status==='done').length}/${tasks.length} tasks</span>
            </div>
          </div>
        </section>

        <!-- Today's Tasks -->
        ${todayTasks.length ? `
        <section class="section">
          <h3 class="section-title">⚡ Today's Tasks</h3>
          <div class="task-list">
            ${todayTasks.map(t => renderTaskItem(t, true)).join('')}
          </div>
        </section>
        ` : `<section class="section"><div class="done-today">✅ All done for today!</div></section>`}

        <!-- Overdue -->
        ${overdue.length ? `
        <section class="section">
          <h3 class="section-title warn">⚠️ Overdue (${overdue.length})</h3>
          <div class="task-list">
            ${overdue.slice(0,5).map(t => renderTaskItem(t, false)).join('')}
          </div>
        </section>
        ` : ''}

        <!-- Milestones -->
        <section class="section">
          <h3 class="section-title">🗺️ Milestones</h3>
          <div class="milestones">
            ${milestones.map(m => {
              const mp = Gamification.getMilestoneProgress(m.id, tasks);
              const mTasks = tasks.filter(t => t.milestoneId === m.id);
              return `
                <div class="milestone-card ${mp >= 100 ? 'done' : ''}">
                  <div class="ms-header">
                    <span class="ms-title">${mp >= 100 ? '✅ ' : ''}${m.title}</span>
                    <span class="ms-pct">${mp}%</span>
                  </div>
                  <p class="ms-desc">${m.desc}</p>
                  <div class="ms-bar-outer"><div class="ms-bar-inner" style="width:${mp}%"></div></div>
                  <div class="ms-meta">
                    <span>Due: ${m.deadline}</span>
                    <span>${mTasks.filter(t=>t.status==='done').length}/${mTasks.length} tasks</span>
                  </div>
                  <button class="btn btn-sm" onclick="App.nav('milestone-${m.id}')">View Tasks</button>
                </div>
              `;
            }).join('')}
          </div>
        </section>

        <!-- Upcoming -->
        <section class="section">
          <h3 class="section-title">📅 Next 7 Days</h3>
          <div class="task-list">
            ${upcoming.slice(0,10).map(t => renderTaskItem(t, false)).join('')}
            ${!upcoming.length ? '<p class="empty-msg">No tasks in next 7 days.</p>' : ''}
          </div>
        </section>
      </div>
    `;
  }

  function renderTaskItem(task, highlight) {
    return `
      <div class="task-item ${highlight ? 'highlight' : ''} ${task.status === 'done' ? 'done' : ''}">
        <button class="task-check ${task.status === 'done' ? 'checked' : ''}"
          onclick="App.toggleTask('${task.id}')">
          ${task.status === 'done' ? '✓' : ''}
        </button>
        <div class="task-body">
          <span class="task-title">${task.title}</span>
          <span class="task-meta">Due: ${task.deadline} · ~${task.estimatedMinutes}min · +${task.xpReward}XP</span>
        </div>
      </div>
    `;
  }

  // ─── Milestone Detail ────────────────────────────────────────────────────

  function renderMilestone(milestoneId) {
    const s = State.get();
    const m = s.milestones.find(m => m.id === milestoneId);
    if (!m) return renderDashboard();
    const tasks = s.tasks.filter(t => t.milestoneId === milestoneId);
    const progress = Gamification.getMilestoneProgress(milestoneId, tasks);

    return `
      <div class="page milestone-page">
        <nav class="dash-nav">
          <button class="btn-back" onclick="App.nav('dashboard')">← Dashboard</button>
          <h2>${m.title}</h2>
        </nav>
        <div class="ms-detail-header">
          <p>${m.desc}</p>
          <div class="ms-bar-outer"><div class="ms-bar-inner" style="width:${progress}%"></div></div>
          <p>${progress}% complete · Due ${m.deadline}</p>
        </div>
        <section class="section">
          <h3 class="section-title">Tasks</h3>
          <div class="task-list">
            ${tasks.map(t => renderTaskItem(t, t.deadline === new Date().toISOString().split('T')[0])).join('')}
          </div>
        </section>
      </div>
    `;
  }

  // ─── Badges ──────────────────────────────────────────────────────────────

  function renderBadges() {
    const s = State.get();
    const earned = s.user.badges || [];

    return `
      <div class="page badges-page">
        <nav class="dash-nav">
          <button class="btn-back" onclick="App.nav('dashboard')">← Back</button>
          <h2>🏆 Badges</h2>
        </nav>
        <div class="badges-grid">
          ${Gamification.BADGES.map(b => `
            <div class="badge-card ${earned.includes(b.id) ? 'earned' : 'locked'}">
              <span class="badge-icon">${b.icon}</span>
              <span class="badge-title">${b.title}</span>
              <span class="badge-desc">${b.desc}</span>
              ${earned.includes(b.id) ? '<span class="earned-label">Earned!</span>' : '<span class="locked-label">🔒 Locked</span>'}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ─── Generating Page ─────────────────────────────────────────────────────

  function renderGenerating() {
    return `
      <div class="page generating-page">
        <div class="gen-inner">
          <div class="spinner"></div>
          <h2>Building your Quest...</h2>
          <p>Analyzing goal · Generating milestones · Scheduling tasks</p>
        </div>
      </div>
    `;
  }

  // ─── Main Render ─────────────────────────────────────────────────────────

  function render() {
    const app = document.getElementById('app');
    let html = '';

    if (currentPage === 'home') html = renderHome();
    else if (currentPage === 'new-goal') html = renderNewGoal();
    else if (currentPage === 'dashboard') html = renderDashboard();
    else if (currentPage === 'badges') html = renderBadges();
    else if (currentPage === 'generating') html = renderGenerating();
    else if (currentPage.startsWith('milestone-')) {
      html = renderMilestone(currentPage.replace('milestone-', ''));
    } else html = renderHome();

    app.innerHTML = html + renderNotif();
  }

  function renderNotif() {
    if (!notification) return '';
    return `<div class="notif notif-${notification.type}">${notification.msg}</div>`;
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  function clarNext() {
    const q = CLАР_QUESTIONS[clarStep];
    const input = document.getElementById('clар-input');
    const val = input ? input.value.trim() : '';

    if (q.required && !val) {
      input.classList.add('error');
      return;
    }
    if (val) clarData[q.key] = val;

    if (clarStep < CLАР_QUESTIONS.length - 1) {
      clarStep++;
      render();
      setTimeout(() => document.getElementById('clар-input')?.focus(), 50);
    } else {
      generatePlan();
    }
  }

  function clarBack() {
    if (clarStep > 0) { clarStep--; render(); }
  }

  function clarSkip() {
    if (clarStep < CLАР_QUESTIONS.length - 1) {
      clarStep++;
      render();
    } else {
      generatePlan();
    }
  }

  function generatePlan() {
    currentPage = 'generating';
    render();

    setTimeout(() => {
      const { goal, milestones, tasks } = Decompose.buildPlan(clarData);

      State.set(s => ({
        ...s,
        goals: [...s.goals, goal],
        milestones: [...s.milestones, ...milestones],
        tasks: [...s.tasks, ...tasks],
        currentGoalId: goal.id,
      }));

      clarStep = 0;
      clarData = {};
      currentPage = 'dashboard';
      showNotif('🚀 Quest created! ' + milestones.length + ' milestones, ' + tasks.length + ' tasks generated.');
    }, 1200);
  }

  function toggleTask(taskId) {
    const s = State.get();
    const task = s.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const updatedTasks = s.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);

    let updatedUser = s.user;
    let msg = '';

    if (newStatus === 'done') {
      const { user, leveledUp, newBadges, levelInfo } = Gamification.completeTask(
        s.user, task, updatedTasks, s.milestones
      );
      updatedUser = user;

      if (leveledUp) msg = `🎉 Level Up! You're now ${levelInfo.current.title} (Lv.${levelInfo.current.level})`;
      else if (newBadges.length) msg = `🏆 Badge earned: ${newBadges[0].icon} ${newBadges[0].title}`;
      else msg = `+${task.xpReward} XP!`;
    }

    // Update milestone progress
    const updatedMilestones = s.milestones.map(m => ({
      ...m,
      progress: Gamification.getMilestoneProgress(m.id, updatedTasks),
    }));

    State.set({ tasks: updatedTasks, user: updatedUser, milestones: updatedMilestones });
    if (msg) showNotif(msg);
    else render();
  }

  function nav(page) {
    navigate(page);
  }

  // Init
  render();

  return { nav, clarNext, clarBack, clarSkip, toggleTask };
})();
