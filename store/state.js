// Central state - persisted to localStorage
const State = (() => {
  const KEY = 'goalquest_state';

  const defaults = {
    goals: [],
    milestones: [],
    tasks: [],
    user: { xp: 0, level: 1, streak: 0, lastActive: null, badges: [] },
    clarification: null,
    currentGoalId: null,
  };

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || { ...defaults };
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
