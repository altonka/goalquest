const Decompose = (() => {

  const WORLD_COLORS = ['#7c5cfc','#4299e1','#4fd1c5','#68d391','#f6e05e','#ed8936'];

  const TEMPLATES = {
    consultant: {
      milestones: [
        { title: 'Foundation', desc: 'Build consulting knowledge base', weeks: 4 },
        { title: 'Case Mastery', desc: 'Master case interview frameworks', weeks: 8 },
        { title: 'Network & CV', desc: 'Build network and polish materials', weeks: 4 },
        { title: 'Apply & Interview', desc: 'Active applications and interviews', weeks: 6 },
      ],
      taskSets: [
        ['Read Case in Point chapters 1–4','Practice mental math 20 min','Watch 2 McKinsey case videos','Summarize 3 key frameworks in notes','Research 1 target firm culture'],
        ['Complete 2 mock cases with partner','Practice market sizing 30 min','Study 1 industry vertical deeply','Read 1 consulting blog post','Drill hypothesis-driven structure'],
        ['Message 3 consultants on LinkedIn','Update CV with quantified results','Write 1 cover letter draft','Attend 1 networking event or webinar','Research coffee-chat etiquette'],
        ['Submit 2 applications','Do 1 first-round mock interview','Review and improve case notes','Follow up with 2 contacts','Debrief last mock and fix weak areas'],
      ]
    },
    fitness: {
      milestones: [
        { title: 'Baseline', desc: 'Establish routine and baseline metrics', weeks: 2 },
        { title: 'Build Habit', desc: 'Consistent training 4×/week', weeks: 6 },
        { title: 'Intensity Up', desc: 'Progressive overload and diet lock-in', weeks: 6 },
        { title: 'Peak & Maintain', desc: 'Hit target metrics, maintain', weeks: 4 },
      ],
      taskSets: [
        ['Complete full-body workout 45 min','Log all food for the day','Walk 8,000 steps','Sleep 7+ hours tonight','Take baseline measurements'],
        ['Do strength session push/pull/legs','Prep meals for next 2 days','Track bodyweight morning','Stretch 10 min post-workout','Hit daily protein target'],
        ['Complete HIIT session 25 min','Hit protein goal (bodyweight × 0.8 g)','Rest day — walk + mobility work','Review weekly progress photo','Increase load on 1 main lift'],
        ['Test 1RM on main lifts','Measure body composition','Plan next training block','Schedule deload week','Log final milestone metrics'],
      ]
    },
    startup: {
      milestones: [
        { title: 'Validate Idea', desc: 'Customer discovery and problem validation', weeks: 3 },
        { title: 'Build MVP', desc: 'Ship minimal working product', weeks: 6 },
        { title: 'Get Users', desc: 'First 10–100 users and feedback loops', weeks: 4 },
        { title: 'Revenue', desc: 'First paying customer', weeks: 5 },
      ],
      taskSets: [
        ['Interview 3 potential customers 30 min each','Define problem statement clearly','Research 5 competitors','Write 1-page hypothesis doc','Validate willingness to pay'],
        ['Code 1 core feature','Create landing page','Set up analytics tracking','Ship to 1 test user','Fix top 3 usability issues'],
        ['Post in 2 relevant communities','Cold email 10 target users','Fix top 3 user complaints','Run 1 user interview session','Document feedback patterns'],
        ['Send pricing page to 5 users','Set up payment flow','Close 1 paying customer','Document sales script','Plan onboarding for paid users'],
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
        ['Study core topic 1 hour','Take notes and summarize key points','Find 1 mentor or quality resource','Set up a tracking system','Map out learning plan for the week'],
        ['Work on main deliverable 90 min','Review progress vs plan','Practice or iterate 1 specific skill','Connect with 1 person in the field','Share work for external feedback'],
        ['Deep work session 2 hours','Get feedback from 1 person','Fix top issue identified last week','Read 1 relevant article or case study','Refine based on what you learned'],
        ['Final review and polish','Submit, publish, or share output','Measure result against success criteria','Document what worked and what didn\'t','Plan the next goal'],
      ]
    }
  };

  const NODE_SUBTITLES = ['Basics','Practice','Deep Dive','Application','Mastery','Challenge'];

  function detectTemplate(goalText) {
    const g = goalText.toLowerCase();
    if (/consult|mbb|mckinsey|bain|bcg|strategy/.test(g)) return TEMPLATES.consultant;
    if (/fit|gym|weight|muscle|run|marathon|health/.test(g)) return TEMPLATES.fitness;
    if (/startup|company|product|saas|app|launch/.test(g)) return TEMPLATES.startup;
    return TEMPLATES.default;
  }

  function uid() { return Math.random().toString(36).slice(2, 10); }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  const TASKS_PER_NODE = 4;

  function buildPlan(clarification) {
    const { goalText, deadline, hoursPerWeek, startDate = new Date().toISOString().split('T')[0] } = clarification;
    const template = detectTemplate(goalText);
    const goalId = uid();

    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const totalWeeks = deadline
      ? Math.max(4, Math.round((new Date(deadline) - new Date(startDate)) / msPerWeek))
      : template.milestones.reduce((s, m) => s + m.weeks, 0);

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
        color: WORLD_COLORS[mi % WORLD_COLORS.length],
      });

      const taskSet = template.taskSets[mi] || template.taskSets[0];
      const tasksPerWeek = Math.max(1, Math.ceil(taskSet.length / mWeeks));

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
            deadline: addDays(weekStart, (ti + 1) * 2),
            status: 'todo',
            xpReward: 50 + mi * 10,
            isBoss: false,
          });
        });
      }
      cursor = mDeadline;
    });

    // Build nodes (clusters of TASKS_PER_NODE tasks per milestone)
    const nodes = [];
    let globalIndex = 0;
    milestones.forEach((milestone) => {
      const mTasks = tasks.filter(t => t.milestoneId === milestone.id);
      const numNodes = Math.max(1, Math.ceil(mTasks.length / TASKS_PER_NODE));
      for (let ni = 0; ni < numNodes; ni++) {
        const nodeTasks = mTasks.slice(ni * TASKS_PER_NODE, (ni + 1) * TASKS_PER_NODE);
        const isBoss = ni === numNodes - 1;
        const nodeId = uid();
        // Boss tasks get 2× XP
        if (isBoss) {
          nodeTasks.forEach(t => { t.xpReward *= 2; t.isBoss = true; });
        }
        nodes.push({
          id: nodeId,
          milestoneId: milestone.id,
          goalId,
          title: isBoss
            ? `⚔️ Boss: ${milestone.title}`
            : `${milestone.title}: ${NODE_SUBTITLES[ni % NODE_SUBTITLES.length]}`,
          taskIds: nodeTasks.map(t => t.id),
          isBoss,
          index: ni,
          globalIndex: globalIndex++,
          color: milestone.color,
        });
      }
    });

    return { goal, milestones, tasks, nodes };
  }

  function getNodeState(node, tasks) {
    const nodeTasks = tasks.filter(t => node.taskIds.includes(t.id));
    const doneTasks = nodeTasks.filter(t => t.status === 'done');
    if (doneTasks.length === nodeTasks.length && nodeTasks.length > 0) return 'complete';
    if (doneTasks.length > 0) return 'partial';
    return 'available';
  }

  function computeNodeStates(nodes, tasks) {
    // Node unlocks when previous node is complete (or it's index 0)
    return nodes.map((node, i) => {
      const state = getNodeState(node, tasks);
      if (state === 'complete') return { ...node, state: 'complete' };
      if (i === 0) return { ...node, state: state === 'partial' ? 'partial' : 'active' };
      const prev = nodes[i - 1];
      const prevState = getNodeState(prev, tasks);
      if (prevState === 'complete') return { ...node, state: state === 'partial' ? 'partial' : 'active' };
      return { ...node, state: 'locked' };
    });
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

  function rescheduleTasks(tasks) {
    // Move overdue tasks to tomorrow
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = addDays(today, 1);
    return tasks.map(t =>
      t.status !== 'done' && t.deadline < today
        ? { ...t, deadline: tomorrow, rescheduled: true }
        : t
    );
  }

  function getTodayTasks(tasks) {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.deadline === today && t.status !== 'done');
  }

  return {
    buildPlan, computeNodeStates, getUpcomingTasks,
    getTodayTasks, getOverdueTasks, rescheduleTasks, addDays,
    WORLD_COLORS,
  };
})();
