const State = (() => {
  const KEY = 'goalquest_v2';

  const defaults = {
    goals: [],
    milestones: [],
    nodes: [],
    tasks: [],
    stepProgress: {},           // { taskId: [stepIndex, ...] } — persisted step checks
    user: {
      xp: 0,
      level: 1,
      streak: 0,
      lastActive: null,
      badges: [],
      streakFreezes: 2,
      lastFreezeReset: null,
      totalTasksDone: 0,
      perfectDays: 0,
      activeHistory: [],        // dates user completed ≥1 task
      taskFeedback: {},         // taskId → 'hard'|'right'|'easy'
      consecutiveHard: 0,       // consecutive "too hard" feedbacks
      consecutiveEasy: 0,       // consecutive "too easy" feedbacks
      comebackCount: 0,         // times returned after breaking streak
      lastComebackDate: null,   // YYYY-MM-DD — prevents repeat comeback screen same day
      goalIdentity: '',         // e.g. "a consultant"
    },
    currentGoalId: null,
    calendarEvents: [],   // { id, type:'USER_EVENT', title, date, startHour, endHour, isCompleted, isPinned }
    taskSchedules: {},    // { [taskId]: { date, startHour, endHour, isUserModified } }
    planChat: [],         // { role:'user'|'assistant'|'system', content, ts }
    planVersions: [],     // { id, goalId, versionNumber, status, createdAt, changeSummary }
    userAvailability: {   // daily capacity settings
      workStart: 9,
      workEnd: 22,
      maxDailyMinutes: 240,
    },
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...defaults };
      const saved = JSON.parse(raw);
      // Migrate: ensure user has new fields
      saved.user = { ...defaults.user, ...saved.user };
      if (!saved.user.activeHistory) saved.user.activeHistory = [];
      if (!saved.user.taskFeedback) saved.user.taskFeedback = {};
      if (!saved.nodes) saved.nodes = [];
      if (!saved.stepProgress) saved.stepProgress = {};
      if (!saved.calendarEvents) saved.calendarEvents = [];
      if (!saved.taskSchedules) saved.taskSchedules = {};
      if (!saved.planChat) saved.planChat = [];
      if (!saved.planVersions) saved.planVersions = [];
      if (!saved.userAvailability) saved.userAvailability = { workStart: 9, workEnd: 22, maxDailyMinutes: 240 };
      // Migrate goals: ensure every goal has a status field
      if (saved.goals) saved.goals = saved.goals.map(g => g.status ? g : { ...g, status: 'active' });
      return saved;
    } catch { return { ...defaults }; }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  let _state = load();

  return {
    get: () => _state,
    set: (updater) => {
      _state = typeof updater === 'function' ? updater(_state) : { ..._state, ...updater };
      save(_state);
    },
    reset: () => { _state = { ...defaults }; save(_state); },
  };
})();
