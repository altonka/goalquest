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

  // Return slots only for tasks the user has explicitly scheduled via taskSchedules.
  // Unscheduled tasks appear in the sidebar; they do NOT auto-populate the grid.
  // Returns: [{ taskId, date, startHour, endHour, isUserModified }]
  function getTaskSlots(tasks, taskSchedules, weekDates) {
    const taskById = new Map(tasks.map(t => [t.id, t]));
    const slots = [];
    for (const [taskId, sched] of Object.entries(taskSchedules || {})) {
      if (!sched || !weekDates.includes(sched.date)) continue;
      if (!taskById.has(taskId)) continue;
      slots.push({
        taskId,
        date: sched.date,
        startHour: sched.startHour,
        endHour: sched.endHour,
        isUserModified: true,
      });
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
