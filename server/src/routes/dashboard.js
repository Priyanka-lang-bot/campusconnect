// /api/dashboard — one aggregated payload for the dashboard page,
// so the page can render with a single request.
const express = require('express');
const store = require('../db/store');
const { subjectStats, weeklyMinutes } = require('../services/study');
const { dateFromToday } = require('../utils/ids');

const router = express.Router();

router.get('/', (req, res) => {
  const today = dateFromToday(0);
  const weekAhead = dateFromToday(7);

  const tasks = store.read('tasks');
  const sessions = store.read('sessions');
  const events = store.read('events');
  const profile = store.read('profile');

  const openTasks = tasks.filter((t) => t.status !== 'done');
  const weekly = weeklyMinutes(sessions);
  const minutesThisWeek = weekly.reduce((sum, day) => sum + day.minutes, 0);

  res.json({
    data: {
      stats: {
        openTasks: openTasks.length,
        overdueTasks: openTasks.filter((t) => t.dueDate < today).length,
        dueThisWeek: openTasks.filter((t) => t.dueDate >= today && t.dueDate <= weekAhead).length,
        completedTasks: tasks.filter((t) => t.status === 'done').length,
        totalTasks: tasks.length,
        minutesThisWeek,
        weeklyGoalMinutes: profile.preferences.weeklyStudyGoalHours * 60,
        registeredEvents: events.filter((e) => e.registered && e.date >= today).length,
      },
      dueSoon: openTasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5),
      subjects: store.read('subjects').map((s) => subjectStats(s, sessions)),
      weekly,
      upcomingEvents: events
        .filter((e) => e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 3),
      announcements: store.read('announcements'),
      activity: store.read('activity').slice(0, 6),
    },
  });
});

module.exports = router;
