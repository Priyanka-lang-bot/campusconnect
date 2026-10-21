// /study/subjects/:subjectId — reads the route parameter with useParams.
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { studyApi } from '../../api/endpoints.js';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDomEvents.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useStudyContext } from './StudyLayout.jsx';
import { useSessionActions } from './useSessionActions.js';
import Button from '../../components/ui/Button.jsx';
import Card, { CardHeader } from '../../components/ui/Card.jsx';
import Badge, { PriorityBadge } from '../../components/ui/Badge.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { ProgressRing } from '../../components/ui/Progress.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { EmptyState, ErrorState, PageSkeleton } from '../../components/ui/States.jsx';
import SessionRow from './SessionRow.jsx';
import { SessionForm, SubjectForm } from './StudyForms.jsx';
import { daysUntil, formatLongDate, formatMinutes, relativeDay } from '../../utils/format.js';
import { subjectColor } from '../../utils/subjects.js';
import styles from './Study.module.css';

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { subjects, refreshSubjects } = useStudyContext();
  const [dialog, setDialog] = useState(null); // 'edit' | 'session' | 'delete'
  const [busy, setBusy] = useState(false);

  // Refetches automatically when the :subjectId parameter changes.
  const { data: subject, loading, error, reload, refresh, setData } = useApi((signal) => studyApi.subject(subjectId, { signal }), [subjectId]);
  useDocumentTitle(subject?.name ?? 'Subject');

  const updateSessions = useCallback((fn) => setData((prev) => ({ ...prev, sessions: fn(prev.sessions) })), [setData]);
  const afterChange = useCallback(() => {
    refresh();
    refreshSubjects();
  }, [refresh, refreshSubjects]);
  const { toggle, remove } = useSessionActions({ updateSessions, onChanged: afterChange });

  const [upcoming, completed] = useMemo(() => {
    const sessions = subject?.sessions ?? [];
    return [sessions.filter((s) => !s.completed), sessions.filter((s) => s.completed).reverse()];
  }, [subject]);

  if (loading && !subject) return <PageSkeleton cards={2} />;
  if (error) {
    return (
      <div className={styles.detailError}>
        <ErrorState error={error} onRetry={error.status === 404 ? undefined : reload} title={error.status === 404 ? 'Subject not found' : 'Could not load subject'} />
        <Button to="/study" variant="secondary" icon="arrowLeft">
          Back to Study Planner
        </Button>
      </div>
    );
  }

  const examIn = subject.examDate ? daysUntil(subject.examDate) : null;

  const saveSubject = async (payload) => {
    await studyApi.updateSubject(subject.id, payload);
    toast.success('Subject updated');
    setDialog(null);
    afterChange();
  };

  const addSession = async (payload) => {
    await studyApi.createSession(payload);
    toast.success('Study session planned');
    setDialog(null);
    afterChange();
  };

  const deleteSubject = async () => {
    setBusy(true);
    try {
      await studyApi.removeSubject(subject.id);
      toast.success(`Removed ${subject.name}`);
      refreshSubjects();
      navigate('/study');
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link to="/study">Study Planner</Link>
        <Icon name="chevronRight" size={14} />
        <span aria-current="page">{subject.name}</span>
      </nav>

      <section className={styles.detailHero} style={{ '--subject': subjectColor(subject.color) }}>
        <ProgressRing value={subject.progress} size={112} stroke={10} label={`${subject.name} progress`} sublabel="complete" color={subjectColor(subject.color)} />
        <div className={styles.detailInfo}>
          <p className={styles.subjectCode}>{subject.code || 'Subject'}</p>
          <h1 className={styles.detailTitle}>{subject.name}</h1>
          <div className={styles.detailMeta}>
            <PriorityBadge priority={subject.priority} />
            <Badge tone="neutral">
              {formatMinutes(subject.completedMinutes)} / {subject.targetHours} h
            </Badge>
            {subject.examDate && (
              <Badge tone={examIn !== null && examIn <= 7 && examIn >= 0 ? 'danger' : 'lavender'}>
                Exam {examIn >= 0 ? `in ${examIn} days` : 'finished'} · {formatLongDate(subject.examDate)}
              </Badge>
            )}
          </div>
        </div>
        <div className={styles.detailActions}>
          <Button icon="plus" onClick={() => setDialog('session')}>
            Plan session
          </Button>
          <Button variant="secondary" icon="edit" onClick={() => setDialog('edit')}>
            Edit
          </Button>
          <Button variant="ghost" icon="trash" onClick={() => setDialog('delete')}>
            Delete
          </Button>
        </div>
      </section>

      <div className={styles.columns}>
        <Card aria-labelledby="subject-upcoming">
          <CardHeader id="subject-upcoming" title={`Planned sessions (${upcoming.length})`} icon="clock" />
          {upcoming.length ? (
            <ul className={styles.sessionList}>
              {upcoming.map((s) => (
                <SessionRow key={s.id} session={s} showSubject={false} onToggle={toggle} onDelete={remove} />
              ))}
            </ul>
          ) : (
            <EmptyState icon="clock" title="No planned sessions" message="Plan your next session for this subject." />
          )}
        </Card>

        <Card aria-labelledby="subject-deadlines">
          <CardHeader id="subject-deadlines" title="Linked tasks" icon="tasks" linkTo="/tasks" linkLabel="Manage" />
          {subject.tasks.length ? (
            <ul className={styles.deadlines}>
              {subject.tasks.map((task) => (
                <li key={task.id} className={styles.linkedTask}>
                  <Icon name={task.status === 'done' ? 'check' : 'flag'} size={16} />
                  <span className={task.status === 'done' ? styles.struck : ''}>{task.title}</span>
                  <Badge tone={task.status === 'done' ? 'success' : 'neutral'}>{task.status === 'done' ? 'Done' : relativeDay(task.dueDate)}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="tasks" title="No linked tasks" message="When you create a task, choose this subject to see it here." />
          )}
        </Card>
      </div>

      <Card aria-labelledby="subject-history" className={styles.history}>
        <CardHeader id="subject-history" title={`Completed sessions (${completed.length})`} icon="check" />
        {completed.length ? (
          <ul className={styles.sessionList}>
            {completed.map((s) => (
              <SessionRow key={s.id} session={s} showSubject={false} onToggle={toggle} onDelete={remove} />
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>Tick off a planned session once you have studied it.</p>
        )}
      </Card>

      {dialog === 'edit' && <SubjectForm subject={subject} onClose={() => setDialog(null)} onSubmit={saveSubject} />}
      {dialog === 'session' && <SessionForm subjects={subjects} defaultSubjectId={subject.id} onClose={() => setDialog(null)} onSubmit={addSession} />}
      <ConfirmDialog
        open={dialog === 'delete'}
        title={`Delete ${subject.name}?`}
        message="Its study sessions will be deleted. Linked tasks are kept but unlinked from this subject."
        confirmLabel="Delete subject"
        onConfirm={deleteSubject}
        onCancel={() => setDialog(null)}
        loading={busy}
      />
    </>
  );
}
