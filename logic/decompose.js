// Goal decomposition engine
const Decompose = (() => {

  // Template library keyed by goal keywords
  const TEMPLATES = {
    consultant: {
      milestones: [
        { title: 'Foundation', desc: 'Build consulting knowledge base', weeks: 4 },
        { title: 'Case Mastery', desc: 'Master case interview frameworks', weeks: 8 },
        { title: 'Network & CV', desc: 'Build network and polish materials', weeks: 4 },
        { title: 'Apply & Interview', desc: 'Active applications and interviews', weeks: 6 },
      ],
      taskSets: [
        ['Read "Case in Point" chapters 1-4', 'Practice 3 math drills (20 min)', 'Watch 2 McKinsey case videos', 'Summarize key frameworks in notes'],
        ['Complete 2 mock cases with partner', 'Practice market sizing (30 min)', 'Study 1 industry vertical deeply', 'Read 1 consulting blog post'],
        ['Message 3 consultants on LinkedIn', 'Update CV with quantified results', 'Write 1 cover letter draft', 'Attend 1 networking event/webinar'],
        ['Submit 2 applications', 'Do 1 first-round mock interview', 'Review and improve case notes', 'Follow up with 2 contacts'],
      ]
    },
    fitness: {
      milestones: [
        { title: 'Baseline', desc: 'Establish routine and baseline metrics', weeks: 2 },
        { title: 'Build Habit', desc: 'Consistent training 4x/week', weeks: 6 },
        { title: 'Intensity Up', desc: 'Progressive overload and diet lock-in', weeks: 6 },
        { title: 'Peak & Maintain', desc: 'Hit target metrics, maintain', weeks: 4 },
      ],
      taskSets: [
        ['Complete full-body workout (45 min)', 'Log food for the day', 'Walk 8,000 steps', 'Sleep 7+ hours'],
        ['Do strength session (push/pull/legs)', 'Prep meals for next 2 days', 'Track bodyweight', 'Stretch 10 min post-workout'],
        ['Complete HIIT session (25 min)', 'Hit protein target (bodyweight x 0.8g)', 'Rest day: walk + mobility', 'Review weekly progress photo'],
        ['Test 1RM on main lifts', 'Measure body composition', 'Plan next training block', 'Schedule deload week'],
      ]
    },
    startup: {
      milestones: [
        { title: 'Validate Idea', desc: 'Customer discovery and problem validation', weeks: 3 },
        { title: 'Build MVP', desc: 'Ship minimal working product', weeks: 6 },
        { title: 'Get Users', desc: 'First 10-100 users and feedback loops', weeks: 4 },
        { title: 'Revenue', desc: 'First paying customer', weeks: 5 },
      ],
      taskSets: [
        ['Interview 3 potential customers (30 min each)', 'Define problem statement', 'Research 5 competitors', 'Write 1-page hypothesis doc'],
        ['Code 1 core feature', 'Create landing page', 'Set up analytics', 'Ship to 1 test user'],
        ['Post in 2 relevant communities', 'Cold email 10 target users', 'Fix top 3 user complaints', 'Run 1 user interview'],
        ['Send pricing page to 5 users', 'Set up payment flow', 'Close 1 paying customer', 'Document sales script'],
      ]
    },
    default: {
      milestones: [
        { title: 'Learn & Prepare', desc: 'Research and skill foundation', weeks: 3 },
        { title: 'Build & Practice', desc: 'Active work and iteration', weeks: 5 },
        { title: 'Refine & Grow', desc: 'Improve quality and expand', weeks: 4 },
        { title: 'Complete & Ship', desc: 'Final push to goal completion', weeks: 4 },
      ],
      taskSets: [
        ['Study core topic 1 hour', 'Take notes and summarize', 'Find 1 mentor or resource', 'Set up tracking system'],
        ['Work on main deliverable (90 min)', 'Review progress vs plan', 'Practice/iterate 1 skill', 'Connect with 1 person in the field'],
        ['Deep work session (2 hours)', 'Get feedback from 1 person', 'Fix top issue from last week', 'Read 1 relevant article'],
        ['Final review and polish', 'Submit/publish/share output', 'Measure against success criteria', 'Plan next goal'],
      ]
    }
  };

  function detectTemplate(goalText) {
    const g = goalText.toLowerCase();
    if (/consult|mbb|mckinsey|bain|bcg|strategy/.test(g)) return TEMPLATES.consultant;
    if (/fit|gym|weight|muscle|run|marathon|health/.test(g)) return TEMPLATES.fitness;
    if (/startup|company|product|saas|app|launch/.test(g)) return TEMPLATES.startup;
    return TEMPLATES.default;
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  function buildPlan(clarification) {
    const { goalText, deadline, hoursPerWeek, startDate = new Date().toISOString().split('T')[0] } = clarification;
    const template = detectTemplate(goalText);
    const goalId = uid();

    // Calculate total weeks available
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const totalWeeks = deadline
      ? Math.max(4, Math.round((new Date(deadline) - new Date(startDate)) / msPerWeek))
      : template.milestones.reduce((s, m) => s + m.weeks, 0);

    // Scale milestone durations proportionally
    const totalTemplateWeeks = template.milestones.reduce((s, m) => s + m.weeks, 0);
    const scale = totalWeeks / totalTemplateWeeks;

    const goal = {
      id: goalId,
      title: goalText,
      deadline: deadline || addDays(startDate, totalWeeks * 7),
      priority: clarification.priority || 7,
      hoursPerWeek: hoursPerWeek || 10,
      successCriteria: clarification.successCriteria || `Successfully achieve: ${goalText}`,
      startDate,
      createdAt: new Date().toISOString(),
    };

    const milestones = [];
    const tasks = [];
    let cursor = startDate;

    template.milestones.forEach((m, mi) => {
      const mWeeks = Math.max(1, Math.round(m.weeks * scale));
      const mDeadline = addDays(cursor, mWeeks * 7);
      const milestoneId = uid();

      milestones.push({
        id: milestoneId,
        goalId,
        title: m.title,
        desc: m.desc,
        deadline: mDeadline,
        startDate: cursor,
        progress: 0,
        index: mi,
      });

      // Generate tasks: 1 task per week per milestone phase, distributed
      const taskSet = template.taskSets[mi] || template.taskSets[0];
      const tasksPerWeek = Math.ceil(taskSet.length / mWeeks);

      for (let w = 0; w < mWeeks; w++) {
        const weekStart = addDays(cursor, w * 7);
        const weekTasks = taskSet.slice(w * tasksPerWeek, (w + 1) * tasksPerWeek);

        weekTasks.forEach((taskTitle, ti) => {
          tasks.push({
            id: uid(),
            milestoneId,
            goalId,
            title: taskTitle,
            estimatedMinutes: Math.round((hoursPerWeek || 10) * 60 / Math.max(taskSet.length, 4)),
            deadline: addDays(weekStart, (ti + 1) * 2), // spread across week
            status: 'todo',
            xpReward: 50 + (mi * 10),
          });
        });
      }

      cursor = mDeadline;
    });

    return { goal, milestones, tasks };
  }

  function getTasksForDate(tasks, dateStr) {
    return tasks.filter(t => t.deadline === dateStr && t.status !== 'done');
  }

  function getUpcomingTasks(tasks, days = 7) {
    const today = new Date().toISOString().split('T')[0];
    const future = addDays(today, days);
    return tasks
      .filter(t => t.status !== 'done' && t.deadline >= today && t.deadline <= future)
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }

  function getOverdueTasks(tasks) {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.status !== 'done' && t.deadline < today);
  }

  return { buildPlan, getUpcomingTasks, getTasksForDate, getOverdueTasks, addDays };
})();
