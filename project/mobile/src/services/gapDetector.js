/**
 * Gap Detection Algorithm
 * Detects free time slots between scheduled classes/labs/tutorials.
 */

/**
 * Calculate free time gaps from a sorted timetable.
 * @param {Array} timetable - Sorted array of timetable entries with start_time and end_time
 * @param {string} dayStart - Day start time (HH:MM format), default "08:00"
 * @param {string} dayEnd - Day end time (HH:MM format), default "21:00"
 * @param {number} minGapMinutes - Minimum gap duration to consider (minutes), default 20
 * @returns {Array} Array of gap objects { start, end, duration_minutes }
 */
export const detectGaps = (timetable, dayStart = '08:00', dayEnd = '21:00', minGapMinutes = 20) => {
  if (!timetable || timetable.length === 0) {
    const duration = getMinutesDiff(dayStart, dayEnd);
    return [{ start: dayStart, end: dayEnd, duration_minutes: duration }];
  }

  // Sort by start time
  const sorted = [...timetable].sort((a, b) => {
    return timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
  });

  const gaps = [];

  // Gap before first class
  if (sorted[0].start_time > dayStart) {
    const duration = getMinutesDiff(dayStart, sorted[0].start_time);
    if (duration >= minGapMinutes) {
      gaps.push({
        start: dayStart,
        end: sorted[0].start_time,
        duration_minutes: duration,
        label: 'Before first class',
      });
    }
  }

  // Gaps between classes
  for (let i = 0; i < sorted.length - 1; i++) {
    const gapStart = sorted[i].end_time;
    const gapEnd = sorted[i + 1].start_time;
    const duration = getMinutesDiff(gapStart, gapEnd);

    if (duration >= minGapMinutes) {
      gaps.push({
        start: gapStart,
        end: gapEnd,
        duration_minutes: duration,
        label: `Between ${sorted[i].subject} and ${sorted[i + 1].subject}`,
        afterClass: sorted[i].subject,
        beforeClass: sorted[i + 1].subject,
      });
    }
  }

  // Gap after last class
  const lastEnd = sorted[sorted.length - 1].end_time;
  if (lastEnd < dayEnd) {
    const duration = getMinutesDiff(lastEnd, dayEnd);
    if (duration >= minGapMinutes) {
      gaps.push({
        start: lastEnd,
        end: dayEnd,
        duration_minutes: duration,
        label: 'After last class',
      });
    }
  }

  return gaps;
};

/**
 * Match tasks to gaps based on estimated time, deadline, and priority.
 */
export const matchTasksToGaps = (tasks, gaps) => {
  const pendingTasks = tasks
    .filter((t) => t.status === 'pending')
    .sort((a, b) => {
      // Priority: deadline > high priority > medium > low
      const priorityScore = { high: 3, medium: 2, low: 1 };
      const categoryScore = { deadline: 4, classes: 3, labs: 3, tuts: 2, extra: 1 };

      const scoreA = (priorityScore[a.priority] || 1) + (categoryScore[a.category] || 1);
      const scoreB = (priorityScore[b.priority] || 1) + (categoryScore[b.category] || 1);

      if (scoreA !== scoreB) return scoreB - scoreA;
      return new Date(a.deadline) - new Date(b.deadline);
    });

  const assignments = [];
  const usedTasks = new Set();

  for (const gap of gaps) {
    const gapTasks = [];
    let remainingMinutes = gap.duration_minutes;

    for (const task of pendingTasks) {
      if (usedTasks.has(task.id)) continue;
      if (task.estimated_minutes <= remainingMinutes) {
        gapTasks.push(task);
        usedTasks.add(task.id);
        remainingMinutes -= task.estimated_minutes;
      }
    }

    assignments.push({
      gap,
      tasks: gapTasks,
      remainingMinutes,
    });
  }

  return assignments;
};

/**
 * Get today's day name.
 */
export const getTodayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

/**
 * Filter timetable for today.
 */
export const getTodayTimetable = (timetable) => {
  const today = getTodayName();
  return timetable
    .filter((entry) => entry.day_of_week === today)
    .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
};

// Utility: Convert "HH:MM" to total minutes
export const timeToMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// Utility: Get difference in minutes between two times
export const getMinutesDiff = (time1, time2) => {
  return timeToMinutes(time2) - timeToMinutes(time1);
};

// Utility: Format minutes to "Xh Ym"
export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// Utility: Check if current time is within a gap
export const isCurrentlyInGap = (gap) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const gapStart = timeToMinutes(gap.start);
  const gapEnd = timeToMinutes(gap.end);
  return currentMinutes >= gapStart && currentMinutes < gapEnd;
};

// Utility: Get next upcoming gap
export const getNextGap = (gaps) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return gaps.find((gap) => timeToMinutes(gap.start) > currentMinutes);
};

// Utility: Calculate total free time
export const getTotalFreeTime = (gaps) => {
  return gaps.reduce((sum, gap) => sum + gap.duration_minutes, 0);
};
