import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { studyApi, tasksApi } from '../../api/endpoints.js';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDomEvents.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useStudyContext } from './StudyLayout.jsx';
import { useSessionActions } from './useSessionActions.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Card, { CardHeader } from '../../components/ui/Card.jsx';
import Badge, { PriorityBadge } from '../../components/ui/Badge.jsx';
import { ProgressRing } from '../../components/ui/Progress.jsx';
import { DateTile } from '../../components/ui/Bits.jsx';
import { EmptyState, ListSkeleton } from '../../components/ui/States.jsx';
import SessionRow from './SessionRow.jsx';
import { SessionForm, SubjectForm } from './StudyForms.jsx';
import { daysUntil, formatMinutes, relativeDay, todayKey } from '../../utils/format.js';
import { indexById, subjectColor } from '../../utils/subjects.js';
import styles from './Study.module.css';

function SubjectCard({ subject }) {
  const examIn = subject.examDate ? daysUntil(subject.examDate) : null;
  return (
    <Link to={`subjects/${subject.id}`} className={styles.subjectCard} style={{ '--subject': subjectColor(subject.color) }}>
      <div className={styles.subjectTop}>
        <div>
          <p className={styles.subjectCode}>{subject.code || 'Subject'}</p>
          <h3 className={styles.subjectName}>{subject.name}</h3>
        </div>
        <ProgressRing value={subject.progress} size={64} stroke={7} label={`${subject.name} progress`} color={subjectColor(subject.color)} />
      </div>
      <p className={styles.subjectHours}>
        {formatMinutes(subject.completedMinutes)} of {subject.targetHours} h studied
      </p>
      <div className={styles.subjectFoot}>
        <PriorityBadge priority={subject.priority} />
        {examIn !== null && examIn >= 0 && <Badge tone={examIn <= 7 ? 'danger' : 'lavender'}>Exam in {examIn} d</Badge>}
        <span className={styles.subjectNext}>{subject.nextSession ? `Next: ${relativeDay(subject.nextSession.date)}` : 'No session planned'}</span>
      </div>
    </Link>
  );
}

export default function StudyOverview() {
  useDocumentTitle('Study Planner');
  const toast = useToast();
  const { subjects, refreshSubjects } = useStudyContext();
  const [dialog, setDialog] = useState(null); // 'subject' | 'session' | null

  const { data, loading, setData, refresh } = useApi(
    (signal) => Promise.all([studyApi.sessions({}, { signal }), tasksApi.list({}, { signal })]).then(([sessions, tasks]) => ({ sessions, tasks })),
    [],
  );

  const subjectsById = useMemo(() => indexById(subjects), [subjects]);
  const updateSessions = useCallback((fn) => setData((prev) => ({ ...prev, sessions: fn(prev.sessions) })), [setData]);
  const afterChange = useCallback(() => {
    refreshSubjects();
    refresh();
  }, [refreshSubjects, refresh]);
  const { toggle, remove } = useSessionActions({ updateSessions, onChanged: afterChange });

  const today = todayKey();
  const upcoming = useMemo(
    () => (data?.sessions ?? []).filter((s) => !s.completed && daysUntil(s.date) >= -3).slice(0, 8),
    [data],
  );

  // Exams + subject-linked tasks, merged into one chronological list.
  const deadlines = useMemo(() => {
    const exams = subjects
      .filter((s) => s.examDate && s.examDate >= today)
      .map((s) => ({ id: `exam-${s.id}`, kind: 'Exam', title: `${s.name} exam`, date: s.examDate, subject: s }));
    const tasks = (data?.tasks ?? [])
      .filter((t) => t.subjectId && t.status !== 'done' && t.dueDate >= today)
      .map((t) => ({ id: t.id, kind: 'Task', title: t.title, date: t.dueDate, subject: subjectsById[t.subjectId] }));
    return [...exams, ...tasks].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);
  }, [subjects, data, subjectsById, today]);

  const totals = useMemo(
    () => ({
      done: subjects.reduce((sum, s) => sum + s.completedMinutes, 0),
      planned: subjects.reduce((sum, s) => sum + s.plannedMinutes, 0),
      target: subjects.reduce((sum, s) => sum + s.targetHours * 60, 0),
    }),
    [subjects],
  );

  const createSubject = async (payload) => {
    await studyApi.createSubject(payload);
    toast.success(`Added ${payload.name}`);
    setDialog(null);
    refreshSubjects();
  };

  const createSession = async (payload) => {
    const created = await studyApi.createSession(payload);
    updateSessions((list) => [...list, created].sort((a, b) => a.date.localeCompare(b.date)));
    toast.success('Study session planned');
    setDialog(null);
    refreshSubjects();
  };

  return (
    <>
      <PageHeader
        eyebrow="Academics"
        title="Study Planner"
        description="Track subjects, plan focused sessions and keep exams in view."
        actions={
          <>
            <Button variant="secondary" icon="plus" onClick={() => setDialog('subject')}>
              Add subject
            </Button>
            <Button icon="clock" onClick={() => setDialog('session')} disabled={!subjects.length}>
              Plan session
            </Button>
          </>
        }
      />

      <div className={styles.totals}>
        <div>
          <strong>{formatMinutes(totals.done)}</strong>
          <span>studied this semester</span>
        </div>
        <div>
          <strong>{formatMinutes(totals.planned)}</strong>
          <span>planned in sessions</span>
        </div>
        <div>
          <strong>{totals.target ? Math.round((totals.done / totals.target) * 100) : 0}%</strong>
          <span>of total target hours</span>
        </div>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <EmptyState
            icon="study"
            title="No subjects yet"
            message="Add the subjects you are taking this semester to start planning."
            action={
              <Button icon="plus" onClick={() => setDialog('subject')}>
                Add subject
              </Button>
            }
          />
        </Card>
      ) : (
        <section aria-label="Subjects" className={styles.subjectGrid}>
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </section>
      )}

      <div className={styles.columns}>
        <Card aria-labelledby="upcoming-sessions">
          <CardHeader id="upcoming-sessions" title="Upcoming sessions" icon="clock" />
          {loading && !data ? (
            <ListSkeleton rows={4} />
          ) : upcoming.length ? (
            <ul className={styles.sessionList}>
              {upcoming.map((session) => (
                <SessionRow key={session.id} session={session} subject={subjectsById[session.subjectId]} onToggle={toggle} onDelete={remove} />
              ))}
            </ul>
          ) : (
            <EmptyState icon="clock" title="Nothing planned" message="Plan a session to block time for a topic." />
          )}
        </Card>

        <Card aria-labelledby="deadlines">
          <CardHeader id="deadlines" title="Academic deadlines" icon="flag" linkTo="/tasks" linkLabel="All tasks" />
          {deadlines.length ? (
            <ul className={styles.deadlines}>
              {deadlines.map((item) => (
                <li key={item.id} className={styles.deadline}>
                  <DateTile date={item.date} tone={item.kind === 'Exam' ? 'lavender' : 'accent'} />
                  <div className={styles.deadlineText}>
                    <strong>{item.title}</strong>
                    <span>
                      {item.kind} · {item.subject?.code || item.subject?.name} · {relativeDay(item.date)}
                    </span>
                  </div>
                  {item.kind === 'Exam' && <Badge tone="lavender">Exam</Badge>}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="flag" title="No upcoming deadlines" message="Add exam dates to subjects or link tasks to a subject." />
          )}
        </Card>
      </div>

      {dialog === 'subject' && <SubjectForm onClose={() => setDialog(null)} onSubmit={createSubject} />}
      {dialog === 'session' && <SessionForm subjects={subjects} onClose={() => setDialog(null)} onSubmit={createSession} />}
    </>
  );
}
