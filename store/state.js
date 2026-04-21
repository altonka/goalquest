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
