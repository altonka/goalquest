const PlanChat = (() => {

  function _addDays(dateStr, n) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  }

  // Returns structured change objects from a natural-language command.
  function parseCommand(text, plan) {
    const t = text.toLowerCase().trim();
    const changes = [];

    // Which milestone is targeted?
    const msNumMatch = t.match(/(?:milestone|section|week|phase|stage)\s*(\d+)/);
    const msIndex = msNumMatch ? parseInt(msNumMatch[1]) - 1 : null;
    const targets = msIndex !== null && plan.milestones[msIndex]
      ? [msIndex]
      : plan.milestones.map((_, i) => i);

    // Reduce / fewer / remove tasks
    if (/\b(reduce|fewer|less|cut|remove)\b.*task|task.*\b(reduce|fewer|less)\b/.test(t)) {
      targets.forEach(i => changes.push({ type: 'reduce_tasks', milestoneIndex: i, factor: 0.6 }));
    }
    // Add / more tasks
    else if (/\b(add|more|extra|additional|increase)\b.*task|task.*\b(add|more)\b/.test(t)) {
      targets.forEach(i => changes.push({ type: 'add_tasks', milestoneIndex: i, count: 2 }));
    }
    // Easier / simpler
    else if (/\b(easier|simpler|lighter|gentle|beginner|basic)\b/.test(t)) {
      targets.forEach(i => changes.push({ type: 'change_difficulty', milestoneIndex: i, target: 'easy' }));
    }
    // Harder / more intensive
    else if (/\b(harder|intensive|challenging|difficult|advanced|harder)\b/.test(t)) {
      targets.forEach(i => changes.push({ type: 'change_difficulty', milestoneIndex: i, target: 'stretch' }));
    }
    // Replace resources with videos / YouTube
    else if (/\b(video|youtube|watch)\b/.test(t) && /\b(resourc|replac|swap|use|with)\b/.test(t)) {
      targets.forEach(i => changes.push({ type: 'replace_resources', milestoneIndex: i }));
    }
    // Move / push milestone later
    else if (/\b(move|push|shift|delay|extend|later|back)\b/.test(t)) {
      const numMatch = t.match(/(\d+)\s*(day|week)/);
      const days = numMatch
        ? parseInt(numMatch[1]) * (numMatch[2].startsWith('week') ? 7 : 1)
        : 7;
      const idx = msIndex !== null ? msIndex : plan.milestones.length - 1;
      if (plan.milestones[idx]) {
        changes.push({ type: 'shift_milestone', milestoneIndex: idx, days });
      }
    }
    // Shorten tasks / shorter / 30 min
    else if (/\b(shorten|shorter|quick|brief|small|30.?min|under.?\d+.?min)\b/.test(t)) {
      const capMatch = t.match(/under\s*(\d+)\s*min/);
      const maxMinutes = capMatch ? parseInt(capMatch[1]) : 30;
      targets.forEach(i => changes.push({ type: 'shorten_tasks', milestoneIndex: i, maxMinutes }));
    }
    // More practice
    else if (/\b(practice|drill|exercise|hands.?on)\b/.test(t)) {
      targets.forEach(i => changes.push({ type: 'add_tasks', milestoneIndex: i, count: 2, difficulty: 'easy', label: 'practice' }));
    }

    return changes;
  }

  // Human-readable summary of each change.
  function describeChanges(changes, plan) {
    return changes.map(c => {
      const ms = plan.milestones[c.milestoneIndex];
      const name = ms ? `"${ms.title}"` : `Milestone ${(c.milestoneIndex || 0) + 1}`;
      switch (c.type) {
        case 'reduce_tasks':      return `Remove ~40% of tasks in ${name}`;
        case 'add_tasks':         return `Add ${c.count} extra ${c.label || ''} tasks to ${name}`.trim();
        case 'change_difficulty': return `Set all tasks in ${name} to "${c.target}"`;
        case 'replace_resources': return `Replace resources in ${name} with YouTube video links`;
        case 'shift_milestone':   return `Push ${name} deadline ${c.days} day${c.days !== 1 ? 's' : ''} later (cascade to later milestones)`;
        case 'shorten_tasks':     return `Cap all tasks in ${name} to ${c.maxMinutes} minutes`;
        default: return JSON.stringify(c);
      }
    });
  }

  // Apply a list of changes to a plan and return the modified plan (deep clone).
  function applyChanges(plan, changes) {
    let { goal, milestones, tasks, nodes } = JSON.parse(JSON.stringify(plan));

    for (const c of changes) {
      const ms = milestones[c.milestoneIndex];
      if (!ms) continue;

      if (c.type === 'reduce_tasks') {
        const msTasks = tasks.filter(t => t.milestoneId === ms.id);
        const keepCount = Math.max(2, Math.round(msTasks.length * c.factor));
        const toRemove = new Set(msTasks.slice(keepCount).map(t => t.id));
        tasks = tasks.filter(t => !toRemove.has(t.id));
        nodes = nodes
          .map(n => ({ ...n, taskIds: n.taskIds.filter(id => !toRemove.has(id)) }))
          .filter(n => n.taskIds.length > 0 || n.isBoss);
      }

      else if (c.type === 'add_tasks') {
        const msTasks = tasks.filter(t => t.milestoneId === ms.id);
        const ref = msTasks[msTasks.length - 1] || msTasks[0];
        if (!ref) continue;
        for (let i = 0; i < c.count; i++) {
          const label = c.label || 'practice';
          tasks.push({
            ...ref,
            id: `task_chat_${Date.now()}_${i}`,
            title: `${ms.title} — extra ${label} session ${i + 1}`,
            difficulty: c.difficulty || 'easy',
            estimatedMinutes: 30,
            xpReward: 50,
            status: 'todo',
            isBoss: false,
            completedAt: undefined,
          });
        }
      }

      else if (c.type === 'change_difficulty') {
        const xpMap = { easy: 50, core: 100, stretch: 150 };
        tasks = tasks.map(t => {
          if (t.milestoneId !== ms.id) return t;
          return { ...t, difficulty: c.target, xpReward: xpMap[c.target] || 100 };
        });
      }

      else if (c.type === 'replace_resources') {
        tasks = tasks.map(t => {
          if (t.milestoneId !== ms.id) return t;
          const q = encodeURIComponent(t.title + ' tutorial');
          const mq = encodeURIComponent(ms.title + ' course');
          return {
            ...t,
            resources: [
              { label: `${t.title} — YouTube`, url: `https://www.youtube.com/results?search_query=${q}`, primary: true },
              { label: `${ms.title} Course`, url: `https://www.youtube.com/results?search_query=${mq}`, primary: false },
            ],
          };
        });
      }

      else if (c.type === 'shift_milestone') {
        // Shift this milestone and all following ones (cascade)
        for (let i = c.milestoneIndex; i < milestones.length; i++) {
          const m = milestones[i];
          milestones[i] = {
            ...m,
            deadline: _addDays(m.deadline, c.days),
            startDate: _addDays(m.startDate, c.days),
          };
          const mid = m.id;
          tasks = tasks.map(t => t.milestoneId !== mid ? t : { ...t, deadline: _addDays(t.deadline, c.days) });
        }
      }

      else if (c.type === 'shorten_tasks') {
        tasks = tasks.map(t => {
          if (t.milestoneId !== ms.id || t.estimatedMinutes <= c.maxMinutes) return t;
          return {
            ...t,
            estimatedMinutes: c.maxMinutes,
            steps: Array.isArray(t.steps) ? t.steps.slice(0, 3) : t.steps,
          };
        });
      }
    }

    return { goal, milestones, tasks, nodes, _usedFallback: plan._usedFallback };
  }

  // Generate the assistant reply text.
  function generateResponse(text, changes, plan) {
    if (changes.length === 0) {
      return `I'm not sure what you'd like to change. Try something like:\n• "Reduce tasks in milestone 2"\n• "Make week 1 easier"\n• "Add practice tasks to section 3"\n• "Replace resources with YouTube videos"\n• "Move milestone 2 back 1 week"\n• "Shorten all tasks to 30 minutes"`;
    }
    const descs = describeChanges(changes, plan);
    return `Here's what I'll change:\n${descs.map(d => `• ${d}`).join('\n')}\n\nReview the preview below and click Apply if it looks right.`;
  }

  // Call real AI via Vercel serverless function.
  // Returns { assistant_message, proposed_changes, change_summary }.
  // Throws on network or API error (caller should catch + fall back to parseCommand).
  async function callAPI(message, plan) {
    const res = await fetch('/api/planchat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        plan: {
          goal: plan.goal,
          milestones: plan.milestones,
          tasks: plan.tasks.map(t => ({
            id: t.id,
            milestoneId: t.milestoneId,
            title: t.title,
            difficulty: t.difficulty,
            estimatedMinutes: t.estimatedMinutes,
            status: t.status,
          })),
        },
      }),
    });
    if (!res.ok) throw new Error(`planchat API ${res.status}`);
    return res.json();
  }

  return { parseCommand, applyChanges, generateResponse, describeChanges, callAPI };
})();
