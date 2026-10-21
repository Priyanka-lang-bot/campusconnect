import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, tasksApi } from '../../api/endpoints.js';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDomEvents.js';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Card, { CardHeader } from '../../components/ui/Card.jsx';
import Badge, { PriorityBadge } from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { ProgressBar, ProgressRing } from '../../components/ui/Progress.jsx';
import { EmptyState, ErrorState, PageSkeleton } from '../../components/ui/States.jsx';
import { CheckButton, ColorDot, DateTile, MetaItem } from '../../components/ui/Bits.jsx';
import WeeklyChart from './WeeklyChart.jsx';
import { daysUntil, formatMinutes, formatTime, greeting, relativeDay, timeAgo } from '../../utils/format.js';
import { indexById, subjectColor } from '../../utils/subjects.js';
import styles from './Dashboard.module.css';

const ACTIVITY_ICONS = { task: 'tasks', study: 'study', event: 'events', profile: 'user' };

function StatCard({ icon, label, value, detail, tone = 'accent', to }) {
  return (
    <Link to={to} className={`${styles.stat} ${styles[`tone${tone}`]}`}>
      <span className={styles.statIcon}>
        <Icon name={icon} size={18} />
      </span>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
      {detail && <span className={styles.statDetail}>{detail}</span>}
    </Link>
  );
}

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { profile } = useProfile();
  const toast = useToast();
  const { data, loading, error, reload, refresh, setData } = useApi((signal) => dashboardApi.get({ signal }), []);

  const subjectsById = useMemo(() => indexById(data?.subjects), [data?.subjects]);

  if (loading && !data) return <PageSkeleton cards={4} />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} title="Could not load your dashboard" />;

  const { stats, dueSoon, subjects, weekly, upcomingEvents, announcements, activity } = data;
  const firstName = profile?.name?.split(' ')[0] ?? 'there';
  const goalPercent = (stats.minutesThisWeek / stats.weeklyGoalMinutes) * 100;
  const remaining = Math.max(0, stats.weeklyGoalMinutes - stats.minutesThisWeek);

  // Optimistically mark a task done, then refresh the aggregate numbers.
  const completeTask = async (task) => {
    setData((prev) => ({ ...prev, dueSoon: prev.dueSoon.filter((t) => t.id !== task.id) }));
    try {
      await tasksApi.update(task.id, { status: 'done' });
      toast.success(`Completed “${task.title}”`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            await tasksApi.update(task.id, { status: task.status });
            refresh();
          },
        },
      });
      refresh();
    } catch (err) {
      toast.error(err.message);
      refresh();
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroText}>
          <p className={styles.heroEyebrow}>Semester {profile?.semester ?? 3} · Week overview</p>
          <h1 id="hero-title" className={styles.heroTitle}>
            {greeting()}, {firstName}.
          </h1>
          <p className={styles.heroSummary}>
            You have <strong>{stats.dueThisWeek} tasks</strong> due in the next seven days
            {stats.overdueTasks > 0 && (
              <>
                {' '}
                and <strong className={styles.overdue}>{stats.overdueTasks} overdue</strong>
              </>
            )}
            .{' '}
            {remaining > 0
              ? `${formatMinutes(remaining)} of study left to reach this week's goal.`
              : 'You have hit your weekly study goal — great work!'}
          </p>
          <div className={styles.heroActions}>
            <Button to="/tasks?new=1" icon="plus">
              Add task
            </Button>
            <Button to="/study" variant="secondary" icon="study">
              Plan a session
            </Button>
          </div>
        </div>
        <div className={styles.heroGoal}>
          <ProgressRing value={goalPercent} size={128} stroke={11} label="Weekly study goal" sublabel="of goal" color="#c4b5fd" />
          <p>
            {formatMinutes(stats.minutesThisWeek)} / {stats.weeklyGoalMinutes / 60} h
          </p>
        </div>
      </section>

      <div className={styles.stats}>
        <StatCard icon="tasks" label="Open tasks" value={stats.openTasks} detail={`${stats.completedTasks} completed`} to="/tasks" />
        <StatCard icon="flag" label="Due this week" value={stats.dueThisWeek} detail={stats.overdueTasks ? `${stats.overdueTasks} overdue` : 'Nothing overdue'} tone="warning" to="/tasks" />
        <StatCard icon="clock" label="Studied this week" value={formatMinutes(stats.minutesThisWeek)} detail={`Goal ${stats.weeklyGoalMinutes / 60} h`} tone="lavender" to="/study" />
        <StatCard icon="events" label="Events joined" value={stats.registeredEvents} detail="Upcoming" tone="success" to="/events?registered=1" />
      </div>

      <div className={styles.grid}>
        <Card className={styles.dueSoon} aria-labelledby="due-soon">
          <CardHeader id="due-soon" title="Due soon" icon="flag" linkTo="/tasks" />
          {dueSoon.length === 0 ? (
            <EmptyState icon="check" title="All caught up" message="No open tasks. Enjoy the free time or plan ahead." />
          ) : (
            <ul className={styles.taskList}>
              {dueSoon.map((task) => {
                const diff = daysUntil(task.dueDate);
                const subject = subjectsById[task.subjectId];
                return (
                  <li key={task.id} className={styles.taskRow}>
                    <CheckButton checked={false} onChange={() => completeTask(task)} label={`Mark “${task.title}” as done`} />
                    <div className={styles.taskMain}>
                      <p className={styles.taskTitle}>{task.title}</p>
                      <div className={styles.taskMeta}>
                        {subject && (
                          <span className={styles.subjectTag}>
                            <ColorDot color={subjectColor(subject.color)} size={8} />
                            {subject.code || subject.name}
                          </span>
                        )}
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                    <Badge tone={diff < 0 ? 'danger' : diff <= 1 ? 'warning' : 'neutral'}>{relativeDay(task.dueDate)}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className={styles.weekly} aria-labelledby="weekly">
          <CardHeader id="weekly" title="Study time, last 7 days" icon="activity" />
          <WeeklyChart days={weekly} />
        </Card>

        <Card className={styles.progress} aria-labelledby="progress">
          <CardHeader id="progress" title="Study progress" icon="target" linkTo="/study" linkLabel="Planner" />
          <ul className={styles.subjectList}>
            {subjects.map((subject) => (
              <li key={subject.id}>
                <Link to={`/study/subjects/${subject.id}`} className={styles.subjectRow}>
                  <span className={styles.subjectName}>
                    <ColorDot color={subjectColor(subject.color)} />
                    {subject.name}
                  </span>
                  <span className={styles.subjectPct}>{subject.progress}%</span>
                  <ProgressBar value={subject.progress} color={subjectColor(subject.color)} size="sm" label={`${subject.name} progress`} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className={styles.events} aria-labelledby="up-events">
          <CardHeader id="up-events" title="Upcoming events" icon="events" linkTo="/events" />
          <ul className={styles.eventList}>
            {upcomingEvents.map((event) => (
              <li key={event.id}>
                <Link to={`/events/${event.id}`} className={styles.eventRow}>
                  <DateTile date={event.date} tone={event.registered ? 'lavender' : 'accent'} />
                  <span className={styles.eventText}>
                    <strong>{event.title}</strong>
                    <MetaItem icon="clock">
                      {formatTime(event.startTime)} · {event.venue}
                    </MetaItem>
                  </span>
                  {event.registered && <Badge tone="lavender">Going</Badge>}
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className={styles.announcements} aria-labelledby="announcements">
          <CardHeader id="announcements" title="Announcements" icon="megaphone" />
          <ul className={styles.annList}>
            {announcements.map((a) => (
              <li key={a.id} className={styles.annItem}>
                {a.level === 'important' && <Badge tone="danger">Important</Badge>}
                <strong>{a.title}</strong>
                <p>{a.body}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card className={styles.activity} aria-labelledby="activity">
          <CardHeader id="activity" title="Recent activity" icon="activity" />
          {activity.length === 0 ? (
            <p className={styles.muted}>Your actions will show up here.</p>
          ) : (
            <ol className={styles.timeline}>
              {activity.map((item) => (
                <li key={item.id}>
                  <span className={styles.timelineIcon}>
                    <Icon name={ACTIVITY_ICONS[item.type] ?? 'activity'} size={14} />
                  </span>
                  <span>
                    {item.message}
                    <time className={styles.timelineTime} dateTime={item.at}>
                      {timeAgo(item.at)}
                    </time>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}
