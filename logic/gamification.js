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

  // Prestige titles — shown after prestige reset at Level 8
  const PRESTIGE_TITLES = ['Ascended', 'Ethereal', 'Cosmic', 'Transcendent', 'Immortal'];

  // Seasonal quests — one per month, keyed by month number (1-12)
  const SEASONAL_QUESTS = {
    1:  { id: 'sq_jan', icon: '❄️',  title: 'New Year Sprinter',  desc: 'Complete 20 tasks in January',          goal: 20, type: 'tasks' },
    2:  { id: 'sq_feb', icon: '💖',  title: 'Heart of Progress',  desc: 'Complete 5 tasks on 5 different days',  goal: 5,  type: 'active_days' },
    3:  { id: 'sq_mar', icon: '🌱',  title: 'Spring Momentum',    desc: 'Build a 7-day streak this month',       goal: 7,  type: 'streak' },
    4:  { id: 'sq_apr', icon: '🌸',  title: 'Bloom Week',         desc: 'Complete 3 perfect days in April',      goal: 3,  type: 'perfect_days' },
    5:  { id: 'sq_may', icon: '🔥',  title: 'May Force',          desc: 'Complete 30 tasks in May',              goal: 30, type: 'tasks' },
    6:  { id: 'sq_jun', icon: '☀️',  title: 'Summer Surge',       desc: 'Build a 14-day streak this month',      goal: 14, type: 'streak' },
    7:  { id: 'sq_jul', icon: '⚡',  title: 'Lightning Month',    desc: 'Complete 35 tasks in July',             goal: 35, type: 'tasks' },
    8:  { id: 'sq_aug', icon: '🏖️',  title: 'August Grind',       desc: '5 perfect days in August',             goal: 5,  type: 'perfect_days' },
    9:  { id: 'sq_sep', icon: '📚',  title: 'Back to Mastery',    desc: 'Complete 25 tasks in September',        goal: 25, type: 'tasks' },
    10: { id: 'sq_oct', icon: '🎃',  title: 'October Challenge',  desc: 'Complete a 10-day streak this month',   goal: 10, type: 'streak' },
    11: { id: 'sq_nov', icon: '🦃',  title: 'Gratitude Grind',    desc: 'Complete 25 tasks in November',         goal: 25, type: 'tasks' },
    12: { id: 'sq_dec', icon: '🎄',  title: 'Year-End Closer',    desc: 'Complete 5 perfect days in December',   goal: 5,  type: 'perfect_days' },
  };

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

    // Check seasonal badge
    const { user: afterSeasonal, earned: seasonalEarned, quest: seasonalQuest } = checkSeasonalBadge(updated, updatedTasks);
    if (seasonalEarned) updated = afterSeasonal;

    return { user: updated, xpEarned, multiplier, leveledUp, newBadges, levelInfo, isPerfectDay, perfectDayBonus, seasonalEarned, seasonalQuest };
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

  // ─── Prestige System ─────────────────────────────────────────────────────────
  function canPrestige(user) {
    return user.level >= 8 && user.xp >= 8000;
  }

  function getPrestigeTitle(user) {
    const p = (user.prestigeLevel || 0);
    if (!p) return null;
    return PRESTIGE_TITLES[Math.min(p - 1, PRESTIGE_TITLES.length - 1)];
  }

  function prestige(user) {
    if (!canPrestige(user)) return user;
    return {
      ...user,
      xp: 0,
      level: 1,
      prestigeLevel: (user.prestigeLevel || 0) + 1,
      // Badges and streak preserved
    };
  }

  // ─── Seasonal Quests ──────────────────────────────────────────────────────────
  function getSeasonalQuest() {
    const month = new Date().getMonth() + 1;
    return SEASONAL_QUESTS[month] || null;
  }

  function getSeasonalQuestProgress(user, tasks) {
    const quest = getSeasonalQuest();
    if (!quest) return null;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    let current = 0;
    if (quest.type === 'tasks') {
      current = tasks.filter(t => t.status === 'done' && t.completedAt && t.completedAt.slice(0,10) >= monthStart && t.completedAt.slice(0,10) <= monthEnd).length;
    } else if (quest.type === 'active_days') {
      const history = user.activeHistory || [];
      current = history.filter(d => d >= monthStart && d <= monthEnd).length;
    } else if (quest.type === 'streak') {
      current = Math.min(user.streak || 0, quest.goal);
    } else if (quest.type === 'perfect_days') {
      current = Math.min(user.perfectDays || 0, quest.goal);
    }

    const pct = Math.min(100, Math.round((current / quest.goal) * 100));
    const earned = user.seasonalBadges && user.seasonalBadges.includes(quest.id);
    return { quest, current, pct, earned };
  }

  function checkSeasonalBadge(user, tasks) {
    const prog = getSeasonalQuestProgress(user, tasks);
    if (!prog || prog.earned || prog.pct < 100) return { user, earned: false };
    const updated = { ...user, seasonalBadges: [...(user.seasonalBadges || []), prog.quest.id] };
    return { user: updated, earned: true, quest: prog.quest };
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
    canPrestige, getPrestigeTitle, prestige,
    getSeasonalQuest, getSeasonalQuestProgress,
    BADGES, LEVELS, PRESTIGE_TITLES, SEASONAL_QUESTS,
  };
})();
