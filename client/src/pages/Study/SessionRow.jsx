import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { CheckButton, ColorDot } from '../../components/ui/Bits.jsx';
import { daysUntil, formatMinutes, relativeDay } from '../../utils/format.js';
import { subjectColor } from '../../utils/subjects.js';
import styles from './Study.module.css';

export default function SessionRow({ session, subject, onToggle, onDelete, showSubject = true }) {
  const missed = !session.completed && daysUntil(session.date) < 0;
  return (
    <li className={`${styles.session} ${session.completed ? styles.sessionDone : ''}`}>
      <CheckButton
        checked={session.completed}
        onChange={() => onToggle(session)}
        label={session.completed ? `Mark “${session.title}” as not studied` : `Mark “${session.title}” as studied`}
      />
      <div className={styles.sessionMain}>
        <p className={styles.sessionTitle}>{session.title}</p>
        <p className={styles.sessionMeta}>
          {showSubject && subject && (
            <span className={styles.sessionSubject}>
              <ColorDot color={subjectColor(subject.color)} size={8} />
              {subject.code || subject.name}
            </span>
          )}
          <span>{relativeDay(session.date)}</span>
          <span>{formatMinutes(session.durationMinutes)}</span>
          {missed && <Badge tone="warning">Missed</Badge>}
        </p>
        {session.notes && <p className={styles.sessionNotes}>{session.notes}</p>}
      </div>
      <Button variant="ghost" size="sm" icon="trash" iconOnly onClick={() => onDelete(session)}>
        Delete session “{session.title}”
      </Button>
    </li>
  );
}
