const Gamification = (() => {

  const LEVELS = [
    { level: 1, title: 'Novice', xpNeeded: 0 },
    { level: 2, title: 'Seeker', xpNeeded: 200 },
    { level: 3, title: 'Builder', xpNeeded: 500 },
    { level: 4, title: 'Achiever', xpNeeded: 1000 },
    { level: 5, title: 'Warrior', xpNeeded: 2000 },
    { level: 6, title: 'Champion', xpNeeded: 3500 },
    { level: 7, title: 'Legend', xpNeeded: 5500 },
    { level: 8, title: 'Master', xpNeeded: 8000 },
  ];

  const BADGES = [
    { id: 'first_task', title: 'First Strike', desc: 'Complete your first task', icon: '⚡', condition: (u, tasks) => tasks.filter(t => t.status === 'done').length >= 1 },
    { id: 'streak_3', title: '3-Day Streak', desc: '3 days in a row', icon: '🔥', condition: (u) => u.streak >= 3 },
    { id: 'streak_7', title: 'Week Warrior', desc: '7-day streak', icon: '🏆', condition: (u) => u.streak >= 7 },
    { id: 'streak_30', title: 'Iron Will', desc: '30-day streak', icon: '💎', condition: (u) => u.streak >= 30 },
    { id: 'first_milestone', title: 'Milestone Crusher', desc: 'Complete first milestone', icon: '🎯', condition: (u, tasks, milestones) => milestones.some(m => m.progress >= 100) },
    { id: 'level_5', title: 'Rising Star', desc: 'Reach level 5', icon: '⭐', condition: (u) => u.level >= 5 },
    { id: 'tasks_10', title: 'Momentum', desc: 'Complete 10 tasks', icon: '🚀', condition: (u, tasks) => tasks.filter(t => t.status === 'done').length >= 10 },
    { id: 'tasks_50', title: 'Machine', desc: 'Complete 50 tasks', icon: '🤖', condition: (u, tasks) => tasks.filter(t => t.status === 'done').length >= 50 },
  ];

  function getLevelInfo(xp) {
    let current = LEVELS[0];
    let next = LEVELS[1];
    for (let i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].xpNeeded) {
        current = LEVELS[i];
        next = LEVELS[i + 1] || null;
      }
    }
    const progress = next
      ? Math.round(((xp - current.xpNeeded) / (next.xpNeeded - current.xpNeeded)) * 100)
      : 100;
    return { current, next, progress };
  }

  function updateStreak(user) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (user.lastActive === today) return user; // already counted today
    if (user.lastActive === yesterday) {
      return { ...user, streak: user.streak + 1, lastActive: today };
    }
    return { ...user, streak: 1, lastActive: today }; // reset
  }

  function checkBadges(user, tasks, milestones) {
    const earned = [...(user.badges || [])];
    const newBadges = [];

    BADGES.forEach(badge => {
      if (!earned.includes(badge.id) && badge.condition(user, tasks, milestones)) {
        earned.push(badge.id);
        newBadges.push(badge);
      }
    });

    return { badges: earned, newBadges };
  }

  function completeTask(user, task, tasks, milestones) {
    let updated = { ...user, xp: user.xp + (task.xpReward || 50) };
    updated = updateStreak(updated);

    const levelInfo = getLevelInfo(updated.xp);
    const leveledUp = levelInfo.current.level > user.level;
    if (leveledUp) updated.level = levelInfo.current.level;

    const { badges, newBadges } = checkBadges(updated, tasks, milestones);
    updated.badges = badges;

    return { user: updated, leveledUp, newBadges, levelInfo };
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

  return { getLevelInfo, completeTask, getMilestoneProgress, getGoalProgress, BADGES, LEVELS, checkBadges };
})();
