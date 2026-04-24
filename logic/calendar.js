const CalendarHelper = (() => {

  // Monday of the week containing `date`.
  function getWeekStart(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay(); // 0=Sun
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + diff);
    return d;
  }

  // Array of 7 YYYY-MM-DD strings Mon–Sun.
  function getWeekDates(weekStart) {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }

  // Compute display slots for AI tasks in the given week.
  // Returns: [{ taskId, date, startHour, endHour, isUserModified }]
  // Rules:
  //   - If a taskSchedule entry exists for this task on a date in the week → use it.
  //   - Otherwise auto-place: start at 9am, stack tasks on that day sequentially.
  //   - User-pinned events do not move auto-placed tasks (handled in conflict detection).
  function getTaskSlots(tasks, taskSchedules, weekDates) {
    const FIRST_HOUR = 9;
    const MAX_HOUR = 22;
    const GAP = 0.5; // hours between tasks

    // track next available start per day
    const nextFree = {};
    weekDates.forEach(d => { nextFree[d] = FIRST_HOUR; });

    const slots = [];

    for (const task of tasks) {
      // Only include tasks whose deadline falls in this week.
      if (!weekDates.includes(task.deadline)) continue;

      // User-scheduled override
      const sched = taskSchedules[task.id];
      if (sched && weekDates.includes(sched.date)) {
        slots.push({
          taskId: task.id,
          date: sched.date,
          startHour: sched.startHour,
          endHour: sched.endHour,
          isUserModified: true,
        });
        continue;
      }

      // Auto-place on deadline day
      const date = task.deadline;
      const durationH = Math.max(0.5, (task.estimatedMinutes || 60) / 60);
      const start = nextFree[date] ?? FIRST_HOUR;
      const end = Math.min(MAX_HOUR, start + durationH);

      slots.push({ taskId: task.id, date, startHour: start, endHour: end, isUserModified: false });
      nextFree[date] = end + GAP;
    }

    return slots;
  }

  // Find overlapping pairs between task slots and user events.
  // Returns: [{ slotTaskId, eventId }]
  function findConflicts(taskSlots, userEvents) {
    const conflicts = [];
    for (const slot of taskSlots) {
      for (const ev of userEvents) {
        if (ev.date !== slot.date) continue;
        if (slot.startHour < ev.endHour && ev.startHour < slot.endHour) {
          conflicts.push({ slotTaskId: slot.taskId, eventId: ev.id });
        }
      }
    }
    return conflicts;
  }

  // Resolve a conflict by suggesting a new start time past the user event.
  function suggestReschedule(slot, conflictingEvent) {
    const newStart = conflictingEvent.endHour + 0.25;
    const durationH = slot.endHour - slot.startHour;
    const newEnd = Math.min(22, newStart + durationH);
    return { ...slot, startHour: newStart, endHour: newEnd };
  }

  return { getWeekStart, getWeekDates, getTaskSlots, findConflicts, suggestReschedule };
})();
