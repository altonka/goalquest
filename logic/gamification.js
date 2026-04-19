const Gamification = (() => {

  const LEVELS = [
    { level: 1,  title: 'Novice',    xpNeeded: 0 },
    { level: 2,  title: 'Seeker',    xpNeeded: 200 },
    { level: 3,  title: 'Builder',   xpNeeded: 500 },
    { level: 4,  title: 'Achiever',  xpNeeded: 1000 },
    { level: 5,  title: 'Warrior',   xpNeeded: 2000 },
    { level: 6,  title: 'Champion',  xpNeeded: 3500 },
    { level: 7,  title: 'Legend',    xpNeeded: 5500 },
    { level: 8,  title: 'Master',    xpNeeded: 8000 },
  ];

  const BADGES = [
    { id: 'first_task',   icon: '⚡', title: 'First Strike',      desc: 'Complete your first task',   condition: (u, tasks) => tasks.filter(t => t.status === 'done').length >= 1 },
    { id: 'streak_3',     icon: '🔥', title: '3-Day Streak',      desc: '3 days in a row',             condition: (u) => u.streak >= 3 },
    { id: 'streak_7',     icon: '🏆', title: 'Week Warrior',      desc: '7-day streak',                condition: (u) => u.streak >= 7 },
    { id: 'streak_30',    icon: '💎', title: 'Iron Will',         desc: '30-day streak',               condition: (u) => u.streak >= 30 },
    { id: 'perfect_day',  icon: '🌟', title: 'Perfect Day',       desc: 'Complete all tasks in a day', condition: (u) => u.perfectDays >= 1 },
    { id: 'perfect_3',    icon: '✨', title: 'Triple Perfect',    desc: '3 perfect days',              condition: (u) => u.perfectDays >= 3 },
    { id: 'momentum',     icon: '⚡', title: 'Momentum',          desc: 'Reach 1.5× multiplier',       condition: (u) => u.streak >= 7 },
    { id: 'boss_kill',    icon: '⚔️', title: 'Boss Slayer',       desc: 'Complete a boss challenge',   condition: (u, tasks) => tasks.some(t => t.isBoss && t.status === 'done') },
    { id: 'first_ms',     icon: '🎯', title: 'Milestone Crusher', desc: 'Complete first milestone',    condition: (u, tasks, milestones) => milestones.some(m => getMilestoneProgress(m.id, tasks) >= 100) },
    { id: 'tasks_10',     icon: '🚀', title: 'Momentum',          desc: 'Complete 10 tasks',           condition: (u) => u.totalTasksDone >= 10 },
    { id: 'tasks_50',     icon: '🤖', title: 'Machine',           desc: 'Complete 50 tasks',           condition: (u) => u.totalTasksDone >= 50 },
    { id: 'level_5',      icon: '⭐', title: 'Rising Star',       desc: 'Reach level 5',              condition: (u) => u.level >= 5 },
  ];

  function getLevelInfo(xp) {
    let current = LEVELS[0], next = LEVELS[1];
    for (let i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].xpNeeded) { current = LEVELS[i]; next = LEVELS[i + 1] || null; }
    }
    const progress = next
      ? Math.round(((xp - current.xpNeeded) / (next.xpNeeded - current.xpNeeded)) * 100)
      : 100;
    return { current, next, progress };
  }

  function getMomentumMultiplier(streak) {
    if (streak >= 30) return 2.0;
    if (streak >= 14) return 1.75;
    if (streak >= 7)  return 1.5;
    if (streak >= 3)  return 1.25;
    return 1.0;
  }

  function getMomentumLabel(mult) {
    if (mult >= 2.0)  return '🔥 2× MAX';
    if (mult >= 1.75) return '⚡ 1.75×';
    if (mult >= 1.5)  return '⚡ 1.5×';
    if (mult >= 1.25) return '⚡ 1.25×';
    return '1×';
  }

  function checkPerfectDay(tasks) {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.deadline === today);
    return todayTasks.length > 0 && todayTasks.every(t => t.status === 'done');
  }

  function updateStreak(user) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (user.lastActive === today) return user;
    if (user.lastActive === yesterday) return { ...user, streak: user.streak + 1, lastActive: today };
    return { ...user, streak: 1, lastActive: today };
  }

  function refreshWeeklyFreezes(user) {
    const today = new Date().toISOString().split('T')[0];
    const last = user.lastFreezeReset;
    if (!last) return { ...user, streakFreezes: 2, lastFreezeReset: today };
    const days = Math.round((new Date(today) - new Date(last)) / 86400000);
    if (days >= 7) return { ...user, streakFreezes: 2, lastFreezeReset: today };
    return user;
  }

  function useStreakFreeze(user) {
    if ((user.streakFreezes || 0) <= 0) return { user, used: false };
    return {
      user: { ...user, streakFreezes: user.streakFreezes - 1, lastActive: new Date().toISOString().split('T')[0] },
      used: true,
    };
  }

  function checkBadges(user, tasks, milestones) {
    const earned = [...(user.badges || [])];
    const newBadges = [];
    BADGES.forEach(b => {
      if (!earned.includes(b.id) && b.condition(user, tasks, milestones)) {
        earned.push(b.id);
        newBadges.push(b);
      }
    });
    return { badges: earned, newBadges };
  }

  function completeTask(user, task, tasks, milestones) {
    const multiplier = getMomentumMultiplier(user.streak);
    const xpEarned = Math.round((task.xpReward || 50) * multiplier);

    let updated = { ...user, xp: user.xp + xpEarned, totalTasksDone: (user.totalTasksDone || 0) + 1 };
    updated = updateStreak(updated);

    const levelInfo = getLevelInfo(updated.xp);
    const leveledUp = levelInfo.current.level > user.level;
    if (leveledUp) updated.level = levelInfo.current.level;

    // Check perfect day (pass updated tasks list including just-completed task)
    const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, status: 'done' } : t);
    const isPerfectDay = checkPerfectDay(updatedTasks);
    let perfectDayBonus = 0;
    if (isPerfectDay) {
      perfectDayBonus = 100;
      updated.xp += perfectDayBonus;
      updated.perfectDays = (updated.perfectDays || 0) + 1;
    }

    const { badges, newBadges } = checkBadges(updated, updatedTasks, milestones);
    updated.badges = badges;

    return { user: updated, xpEarned, multiplier, leveledUp, newBadges, levelInfo, isPerfectDay, perfectDayBonus };
  }

  function getMilestoneProgress(milestoneId, tasks) {
    const mTasks = tasks.filter(t => t.milestoneId === milestoneId);
    if (!mTasks.length) return 0;
    return Math.round((mTasks.filter(t => t.status === 'done').length / mTasks.length) * 100);
  }

  function getGoalProgress(goalId, tasks) {
    const gTasks = tasks.filter(t => t.goalId === goalId);
    if (!gTasks.length) return 0;
    return Math.round((gTasks.filter(t => t.status === 'done').length / gTasks.length) * 100);
  }

  // ─── Streak Calendar — last 28 days ─────────────────────────────────────────
  function buildStreakCalendar(user) {
    const today = new Date();
    const history = new Set(user.activeHistory || []);
    const days = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const isToday = i === 0;
      const isFuture = i < 0;
      days.push({
        date: str,
        label: d.toLocaleDateString('en', { weekday: 'short' })[0],
        day: d.getDate(),
        active: history.has(str),
        isToday,
        isFuture,
      });
    }
    return days;
  }

  // ─── Goal-based identity ─────────────────────────────────────────────────────
  function getGoalIdentity(goalTitle) {
    const g = (goalTitle || '').toLowerCase();
    if (/consult|mbb|mckinsey|bain|bcg/.test(g)) return 'a consultant';
    if (/fit|gym|weight|muscle|run/.test(g)) return 'an athlete';
    if (/startup|founder|product|saas/.test(g)) return 'a founder';
    if (/learn|study|language|code|program/.test(g)) return 'a learner';
    return 'your best self';
  }

  // ─── Days since last active ──────────────────────────────────────────────────
  function daysSinceActive(user) {
    if (!user.lastActive) return 0;
    const today = new Date().toISOString().split('T')[0];
    return Math.round((new Date(today) - new Date(user.lastActive)) / 86400000);
  }

  return {
    getLevelInfo, getMomentumMultiplier, getMomentumLabel,
    completeTask, getMilestoneProgress, getGoalProgress,
    refreshWeeklyFreezes, useStreakFreeze, checkPerfectDay,
    buildStreakCalendar, getGoalIdentity, daysSinceActive,
    BADGES, LEVELS,
  };
})();
