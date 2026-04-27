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

  // ─── Character Classes ────────────────────────────────────────────────────────
  const CLASSES = {
    strategist: {
      id: 'strategist',
      label: 'Strategist',
      icon: '◈',
      color: '#818cf8',
      desc: 'Business, consulting, leadership, product',
      statFocus: 'consistency',
      passive: 'Milestone completions grant +15% XP',
      bonusType: 'milestone',
      bonusMult: 1.15,
    },
    scholar: {
      id: 'scholar',
      label: 'Scholar',
      icon: '◆',
      color: '#a78bfa',
      desc: 'Learning, research, coding, certifications',
      statFocus: 'focus',
      passive: 'Focus session completions grant +20% XP',
      bonusType: 'focus',
      bonusMult: 1.20,
    },
    founder: {
      id: 'founder',
      label: 'Founder',
      icon: '⬡',
      color: '#fbbf24',
      desc: 'Startup, entrepreneurship, side projects',
      statFocus: 'discipline',
      passive: 'Streak freezes reset every 5 days instead of 7',
      bonusType: 'streak',
      bonusMult: 1.0,
    },
    athlete: {
      id: 'athlete',
      label: 'Athlete',
      icon: '◉',
      color: '#34d399',
      desc: 'Fitness, sport, health, nutrition',
      statFocus: 'discipline',
      passive: 'Recurring actions grant +10% XP',
      bonusType: 'recurring',
      bonusMult: 1.10,
    },
    creator: {
      id: 'creator',
      label: 'Creator',
      icon: '✦',
      color: '#f472b6',
      desc: 'Design, writing, music, content, art',
      statFocus: 'focus',
      passive: 'Boss actions grant double XP',
      bonusType: 'boss',
      bonusMult: 2.0,
    },
  };

  // ─── Gear System ──────────────────────────────────────────────────────────────
  const GEAR = {
    sigils: [
      { id: 'iron',    icon: '◈', label: 'Iron Sigil',       desc: 'Complete your first chapter',    badge: 'first_ms'   },
      { id: 'flame',   icon: '⚡', label: 'Streak Blade',     desc: 'Reach a 7-day streak',            badge: 'streak_7'   },
      { id: 'diamond', icon: '💎', label: 'Iron Will',        desc: 'Reach a 30-day streak',           badge: 'streak_30'  },
      { id: 'star',    icon: '⭐', label: 'Rising Star',      desc: 'Reach Level 5',                  badge: 'level_5'    },
      { id: 'machine', icon: '⚙', label: 'Machine Sigil',    desc: 'Complete 50 actions',             badge: 'tasks_50'   },
    ],
    armors: [
      { id: 'default',  label: 'Default',   price: 0,   cssVar: '#1e2235' },
      { id: 'frost',    label: 'Frost',     price: 200, cssVar: '#0f2744' },
      { id: 'ember',    label: 'Ember',     price: 300, cssVar: '#2a1606' },
      { id: 'obsidian', label: 'Obsidian',  price: 500, cssVar: '#0a0a0f' },
      { id: 'aurora',   label: 'Aurora',    price: 800, cssVar: '#0d1f1a' },
    ],
    emblems: [
      { id: 'blade',    icon: '🗡',  label: 'Streak Blade',   desc: '7-day streak',     badge: 'streak_7'   },
      { id: 'trophy',   icon: '🏆',  label: 'Week Warrior',   desc: '7-day streak',     badge: 'streak_7'   },
      { id: 'crusher',  icon: '🎯',  label: 'Chapter Crusher',desc: 'Complete a chapter',badge: 'first_ms'   },
      { id: 'machine',  icon: '🤖',  label: 'Machine',        desc: '50 actions done',  badge: 'tasks_50'   },
      { id: 'star',     icon: '⭐',  label: 'Rising Star',    desc: 'Reach Level 5',   badge: 'level_5'    },
      { id: 'boss',     icon: '⚔️',  label: 'Boss Slayer',   desc: 'Defeat a boss',    badge: 'boss_kill'  },
    ],
  };

  // ─── Coin Awards ─────────────────────────────────────────────────────────────
  const COINS = {
    action:         10,
    chapter:        150,
    campaign:       500,
    perfectDay:     75,
    weeklyChallenge:200,
    boss:           50,   // bonus on top of base
  };

  // ─── Weekly Challenge Templates ───────────────────────────────────────────────
  const WEEKLY_CHALLENGE_TYPES = [
    { type: 'volume',    desc: 'Complete 15 actions this week',         goal: 15,  rewardXP: 300, rewardCoins: 200 },
    { type: 'streak',    desc: "Keep your streak alive all 7 days",     goal: 7,   rewardXP: 400, rewardCoins: 250 },
    { type: 'focus',     desc: 'Use Focus Mode for 3 sessions',         goal: 3,   rewardXP: 250, rewardCoins: 150 },
    { type: 'morning',   desc: 'Complete 2 actions before 10am, 3 days',goal: 3,   rewardXP: 350, rewardCoins: 200 },
    { type: 'chapter',   desc: 'Advance a chapter by at least 25%',     goal: 25,  rewardXP: 500, rewardCoins: 300 },
    { type: 'boss',      desc: 'Complete 2 boss-level actions',         goal: 2,   rewardXP: 450, rewardCoins: 275 },
  ];

  // Seasonal quests — one per month, keyed by month number (1-12)
  const SEASONAL_QUESTS = {
    1:  { id: 'sq_jan', icon: '❄️',  title: 'New Year Sprinter',  desc: 'Complete 20 actions in January',         goal: 20, type: 'tasks' },
    2:  { id: 'sq_feb', icon: '💖',  title: 'Heart of Progress',  desc: 'Complete actions on 5 different days',   goal: 5,  type: 'active_days' },
    3:  { id: 'sq_mar', icon: '🌱',  title: 'Spring Momentum',    desc: 'Build a 7-day streak this month',        goal: 7,  type: 'streak' },
    4:  { id: 'sq_apr', icon: '🌸',  title: 'Bloom Week',         desc: 'Complete 3 perfect days in April',       goal: 3,  type: 'perfect_days' },
    5:  { id: 'sq_may', icon: '🔥',  title: 'May Force',          desc: 'Complete 30 actions in May',             goal: 30, type: 'tasks' },
    6:  { id: 'sq_jun', icon: '☀️',  title: 'Summer Surge',       desc: 'Build a 14-day streak this month',       goal: 14, type: 'streak' },
    7:  { id: 'sq_jul', icon: '⚡',  title: 'Lightning Month',    desc: 'Complete 35 actions in July',            goal: 35, type: 'tasks' },
    8:  { id: 'sq_aug', icon: '🏖️',  title: 'August Grind',       desc: '5 perfect days in August',              goal: 5,  type: 'perfect_days' },
    9:  { id: 'sq_sep', icon: '📚',  title: 'Back to Mastery',    desc: 'Complete 25 actions in September',       goal: 25, type: 'tasks' },
    10: { id: 'sq_oct', icon: '🎃',  title: 'October Challenge',  desc: 'Complete a 10-day streak this month',    goal: 10, type: 'streak' },
    11: { id: 'sq_nov', icon: '🦃',  title: 'Gratitude Grind',    desc: 'Complete 25 actions in November',        goal: 25, type: 'tasks' },
    12: { id: 'sq_dec', icon: '🎄',  title: 'Year-End Closer',    desc: 'Complete 5 perfect days in December',    goal: 5,  type: 'perfect_days' },
  };

  const BADGES = [
    { id: 'first_task',   icon: '⚡', title: 'First Strike',      desc: 'Complete your first action',  condition: (u, tasks) => tasks.filter(t => t.status === 'done').length >= 1 },
    { id: 'streak_3',     icon: '🔥', title: '3-Day Streak',      desc: '3 days in a row',             condition: (u) => u.streak >= 3 },
    { id: 'streak_7',     icon: '🏆', title: 'Week Warrior',      desc: '7-day streak',                condition: (u) => u.streak >= 7 },
    { id: 'streak_30',    icon: '💎', title: 'Iron Will',         desc: '30-day streak',               condition: (u) => u.streak >= 30 },
    { id: 'perfect_day',  icon: '🌟', title: 'Perfect Day',       desc: 'Complete all actions today',  condition: (u) => u.perfectDays >= 1 },
    { id: 'perfect_3',    icon: '✨', title: 'Triple Perfect',    desc: '3 perfect days',              condition: (u) => u.perfectDays >= 3 },
    { id: 'momentum',     icon: '⚡', title: 'Momentum',          desc: 'Reach 1.5× multiplier',       condition: (u) => u.streak >= 7 },
    { id: 'boss_kill',    icon: '⚔️', title: 'Boss Slayer',       desc: 'Complete a boss action',      condition: (u, tasks) => tasks.some(t => t.isBoss && t.status === 'done') },
    { id: 'first_ms',     icon: '🎯', title: 'Chapter Crusher',   desc: 'Complete first chapter',      condition: (u, tasks, milestones) => milestones.some(m => getMilestoneProgress(m.id, tasks) >= 100) },
    { id: 'tasks_10',     icon: '🚀', title: 'Momentum',          desc: 'Complete 10 actions',         condition: (u) => u.totalTasksDone >= 10 },
    { id: 'tasks_50',     icon: '🤖', title: 'Machine',           desc: 'Complete 50 actions',         condition: (u) => u.totalTasksDone >= 50 },
    { id: 'level_5',      icon: '⭐', title: 'Rising Star',       desc: 'Reach Level 5',               condition: (u) => u.level >= 5 },
  ];

  // ─── Level + XP ──────────────────────────────────────────────────────────────

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

  // Returns the full rank title: "Level 5 Strategist" style
  function getRankTitle(user) {
    const li = getLevelInfo(user.xp);
    const cls = user.class ? CLASSES[user.class] : null;
    if (!cls || li.current.level < 3) return li.current.title;
    return `${li.current.title} ${cls.label}`;
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

  // ─── Class XP Bonus ──────────────────────────────────────────────────────────
  // Returns a multiplier to apply on top of base XP for class-specific contexts
  function getClassBonus(userClass, task, context) {
    if (!userClass) return 1.0;
    const cls = CLASSES[userClass];
    if (!cls) return 1.0;
    if (cls.bonusType === 'boss'      && task.isBoss)        return cls.bonusMult;
    if (cls.bonusType === 'recurring' && task.recurrence)    return cls.bonusMult;
    if (cls.bonusType === 'focus'     && context === 'focus') return cls.bonusMult;
    return 1.0;
  }

  // ─── Stats Computation ───────────────────────────────────────────────────────
  // All three stats are derived from actual behavior (0–100)
  function computeStats(user, tasks, taskSchedules) {
    const doneTasks = tasks.filter(t => t.status === 'done');

    // Focus: % of done tasks that used the focus timer (has actualMinutes > 0)
    const focusTasks = doneTasks.filter(t => t.actualMinutes && t.actualMinutes > 0);
    const focus = doneTasks.length > 0
      ? Math.round((focusTasks.length / doneTasks.length) * 100)
      : 40; // default starting value

    // Discipline: % of last 30 days with at least one completion
    const history = new Set(user.activeHistory || []);
    const today = new Date();
    let activeDays = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (history.has(d.toISOString().split('T')[0])) activeDays++;
    }
    const discipline = Math.round((activeDays / 30) * 100);

    // Consistency: % of scheduled tasks completed on their scheduled day
    const schedules = taskSchedules || {};
    const scheduledDone = doneTasks.filter(t => schedules[t.id]);
    const onTimeDone = scheduledDone.filter(t => {
      const sched = schedules[t.id];
      return t.completedAt && t.completedAt.slice(0, 10) === sched.date;
    });
    const consistency = scheduledDone.length > 0
      ? Math.round((onTimeDone.length / scheduledDone.length) * 100)
      : Math.min(90, Math.max(20, (user.totalTasksDone || 0) * 4));

    return {
      focus:       Math.min(100, Math.max(0, focus)),
      discipline:  Math.min(100, Math.max(0, discipline)),
      consistency: Math.min(100, Math.max(0, consistency)),
    };
  }

  // ─── Weekly Challenges ────────────────────────────────────────────────────────
  function _getMondayStr() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  }

  function generateWeeklyChallenge() {
    const weekOf = _getMondayStr();
    // Rotate challenge type by week number so it changes weekly
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const template = WEEKLY_CHALLENGE_TYPES[weekNum % WEEKLY_CHALLENGE_TYPES.length];
    return { ...template, weekOf, current: 0, completed: false };
  }

  function getWeeklyChallengeProgress(challenge, user, tasks) {
    if (!challenge) return null;
    const today = new Date().toISOString().split('T')[0];
    // Ensure challenge is current week
    const monday = _getMondayStr();
    if (challenge.weekOf !== monday) return null;

    let current = challenge.current || 0;
    const pct = Math.min(100, Math.round((current / challenge.goal) * 100));
    const daysLeft = 7 - ((new Date() - new Date(challenge.weekOf)) / 86400000 | 0);
    return { ...challenge, current, pct, daysLeft: Math.max(0, daysLeft) };
  }

  // Call after each task completion to update the weekly challenge counter
  function tickWeeklyChallenge(challenge, task, context) {
    if (!challenge || challenge.completed) return challenge;
    const monday = _getMondayStr();
    if (challenge.weekOf !== monday) return challenge; // stale challenge
    let { current, goal } = challenge;
    if (challenge.type === 'volume')  current = Math.min(goal, current + 1);
    if (challenge.type === 'boss'  && task.isBoss)    current = Math.min(goal, current + 1);
    if (challenge.type === 'focus' && context === 'focus') current = Math.min(goal, current + 1);
    // 'streak', 'morning', 'chapter' are evaluated on render, not per-task tick
    const completed = current >= goal;
    return { ...challenge, current, completed };
  }

  // ─── Gear ────────────────────────────────────────────────────────────────────
  function getUnlockedSigils(user) {
    const badges = new Set(user.badges || []);
    return GEAR.sigils.filter(s => badges.has(s.badge));
  }

  function getUnlockedEmblems(user) {
    const badges = new Set(user.badges || []);
    return GEAR.emblems.filter(e => badges.has(e.badge));
  }

  function getOwnedArmors(user) {
    const owned = new Set(user.ownedArmors || ['default']);
    owned.add('default');
    return GEAR.armors.filter(a => owned.has(a.id));
  }

  function canAffordArmor(user, armorId) {
    const armor = GEAR.armors.find(a => a.id === armorId);
    if (!armor) return false;
    return (user.coins || 0) >= armor.price;
  }

  // ─── Streak + Freeze ─────────────────────────────────────────────────────────

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
    // Founders get 5-day reset instead of 7
    const resetDays = user.class === 'founder' ? 5 : 7;
    if (!last) return { ...user, streakFreezes: 2, lastFreezeReset: today };
    const days = Math.round((new Date(today) - new Date(last)) / 86400000);
    if (days >= resetDays) return { ...user, streakFreezes: 2, lastFreezeReset: today };
    return user;
  }

  function useStreakFreeze(user) {
    if ((user.streakFreezes || 0) <= 0) return { user, used: false };
    return {
      user: { ...user, streakFreezes: user.streakFreezes - 1, lastActive: new Date().toISOString().split('T')[0] },
      used: true,
    };
  }

  // ─── Badges ──────────────────────────────────────────────────────────────────

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

  // ─── Task Completion (main entry point) ───────────────────────────────────────

  function completeTask(user, task, tasks, milestones, context = '') {
    const streakMult = getMomentumMultiplier(user.streak);
    const classMult  = getClassBonus(user.class, task, context);
    const baseXP     = task.xpReward || 50;
    const xpEarned   = Math.round(baseXP * streakMult * classMult);

    // Coin award
    let coinsEarned = COINS.action;
    if (task.isBoss) coinsEarned += COINS.boss;

    let updated = {
      ...user,
      xp: user.xp + xpEarned,
      coins: (user.coins || 0) + coinsEarned,
      totalTasksDone: (user.totalTasksDone || 0) + 1,
    };
    updated = updateStreak(updated);

    const levelInfo = getLevelInfo(updated.xp);
    const leveledUp = levelInfo.current.level > user.level;
    if (leveledUp) updated.level = levelInfo.current.level;

    // Perfect day check
    const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, status: 'done' } : t);
    const isPerfectDay = checkPerfectDay(updatedTasks);
    let perfectDayBonus = 0;
    if (isPerfectDay) {
      perfectDayBonus = 100;
      updated.xp    += perfectDayBonus;
      updated.coins  = (updated.coins || 0) + COINS.perfectDay;
      updated.perfectDays = (updated.perfectDays || 0) + 1;
    }

    const { badges, newBadges } = checkBadges(updated, updatedTasks, milestones);
    updated.badges = badges;

    // Seasonal badge
    const { user: afterSeasonal, earned: seasonalEarned, quest: seasonalQuest } = checkSeasonalBadge(updated, updatedTasks);
    if (seasonalEarned) updated = afterSeasonal;

    // Weekly challenge tick
    const newChallenge = tickWeeklyChallenge(updated.weeklyChallenge, task, context);
    if (newChallenge !== updated.weeklyChallenge) {
      const wasCompleted = updated.weeklyChallenge && !updated.weeklyChallenge.completed;
      if (newChallenge.completed && wasCompleted) {
        updated.xp    += newChallenge.rewardXP || 0;
        updated.coins  = (updated.coins || 0) + (newChallenge.rewardCoins || 0);
      }
      updated.weeklyChallenge = newChallenge;
    }

    return {
      user: updated,
      xpEarned,
      coinsEarned,
      multiplier: streakMult * classMult,
      leveledUp,
      newBadges,
      levelInfo,
      isPerfectDay,
      perfectDayBonus,
      seasonalEarned,
      seasonalQuest,
    };
  }

  // ─── Progress ─────────────────────────────────────────────────────────────────

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

  // ─── Prestige ─────────────────────────────────────────────────────────────────
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
    return { ...user, xp: 0, level: 1, prestigeLevel: (user.prestigeLevel || 0) + 1 };
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

  // ─── Streak Calendar — last 28 days ──────────────────────────────────────────
  function buildStreakCalendar(user) {
    const today = new Date();
    const history = new Set(user.activeHistory || []);
    const days = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      days.push({
        date: str,
        label: d.toLocaleDateString('en', { weekday: 'short' })[0],
        day: d.getDate(),
        active: history.has(str),
        isToday: i === 0,
        isFuture: i < 0,
      });
    }
    return days;
  }

  // ─── Identity ─────────────────────────────────────────────────────────────────
  function getGoalIdentity(goalTitle) {
    const g = (goalTitle || '').toLowerCase();
    if (/consult|mbb|mckinsey|bain|bcg/.test(g)) return 'a consultant';
    if (/fit|gym|weight|muscle|run/.test(g)) return 'an athlete';
    if (/startup|founder|product|saas/.test(g)) return 'a founder';
    if (/learn|study|language|code|program/.test(g)) return 'a learner';
    return 'your best self';
  }

  function daysSinceActive(user) {
    if (!user.lastActive) return 0;
    const today = new Date().toISOString().split('T')[0];
    return Math.round((new Date(today) - new Date(user.lastActive)) / 86400000);
  }

  return {
    // Core
    getLevelInfo, getRankTitle,
    getMomentumMultiplier, getMomentumLabel,
    completeTask, getMilestoneProgress, getGoalProgress,
    // Streak / freeze
    updateStreak, refreshWeeklyFreezes, useStreakFreeze, checkPerfectDay,
    buildStreakCalendar, getGoalIdentity, daysSinceActive,
    // Prestige
    canPrestige, getPrestigeTitle, prestige,
    // Seasonal
    getSeasonalQuest, getSeasonalQuestProgress,
    // RPG system
    CLASSES, GEAR, COINS,
    getClassBonus, computeStats,
    generateWeeklyChallenge, getWeeklyChallengeProgress, tickWeeklyChallenge,
    getUnlockedSigils, getUnlockedEmblems, getOwnedArmors, canAffordArmor,
    // Constants
    BADGES, LEVELS, PRESTIGE_TITLES, SEASONAL_QUESTS, WEEKLY_CHALLENGE_TYPES,
  };
})();
