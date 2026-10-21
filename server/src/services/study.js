// Derived study statistics shared by the study routes and the dashboard.
const { dateFromToday } = require('../utils/ids');

function subjectStats(subject, sessions) {
  const own = sessions.filter((s) => s.subjectId === subject.id);
  const completedMinutes = own.filter((s) => s.completed).reduce((sum, s) => sum + s.durationMinutes, 0);
  const plannedMinutes = own.filter((s) => !s.completed).reduce((sum, s) => sum + s.durationMinutes, 0);
  const targetMinutes = subject.targetHours * 60;
  const today = dateFromToday(0);
  const nextSession = own
    .filter((s) => !s.completed && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0] || null;

  return {
    ...subject,
    sessionCount: own.length,
    completedMinutes,
    plannedMinutes,
    progress: Math.min(100, Math.round((completedMinutes / targetMinutes) * 100)),
    nextSession,
  };
}

// Minutes studied in each of the last 7 days (oldest first) — feeds the bar chart.
function weeklyMinutes(sessions) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = dateFromToday(i - 6);
    const minutes = sessions
      .filter((s) => s.completed && s.date === date)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    return { date, minutes };
  });
}

module.exports = { subjectStats, weeklyMinutes };
