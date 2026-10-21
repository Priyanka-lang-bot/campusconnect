import { memo } from 'react';
import Badge, { PriorityBadge } from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { CheckButton, ColorDot } from '../../components/ui/Bits.jsx';
import { daysUntil, relativeDay } from '../../utils/format.js';
import { subjectColor } from '../../utils/subjects.js';
import styles from './Tasks.module.css';

const STATUS_LABELS = { todo: 'To do', 'in-progress': 'In progress', done: 'Done' };

// Receives everything it needs as props from TaskList (prop drilling — see TaskList.jsx).
// memo() skips re-rendering rows whose props did not change.
function TaskItem({ task, subject, onToggle, onEdit, onDelete }) {
  const done = task.status === 'done';
  const diff = daysUntil(task.dueDate);
  const overdue = !done && diff < 0;

  return (
    <li className={`${styles.item} ${done ? styles.done : ''}`}>
      <CheckButton checked={done} onChange={() => onToggle(task)} label={done ? `Mark “${task.title}” as not done` : `Mark “${task.title}” as done`} />
      <div className={styles.itemMain}>
        <p className={styles.itemTitle}>{task.title}</p>
        {task.description && <p className={styles.itemDesc}>{task.description}</p>}
        <div className={styles.itemMeta}>
          <PriorityBadge priority={task.priority} />
          {task.status === 'in-progress' && <Badge tone="accent">{STATUS_LABELS[task.status]}</Badge>}
          {subject && (
            <span className={styles.subject}>
              <ColorDot color={subjectColor(subject.color)} size={8} />
              {subject.name}
            </span>
          )}
          {task.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.itemSide}>
        <span className={`${styles.due} ${overdue ? styles.overdue : ''}`}>
          {overdue ? `Overdue · ${relativeDay(task.dueDate)}` : relativeDay(task.dueDate)}
        </span>
        <div className={styles.itemActions}>
          <Button variant="ghost" size="sm" icon="edit" iconOnly onClick={() => onEdit(task)}>
            Edit “{task.title}”
          </Button>
          <Button variant="ghost" size="sm" icon="trash" iconOnly onClick={() => onDelete(task)}>
            Delete “{task.title}”
          </Button>
        </div>
      </div>
    </li>
  );
}

export default memo(TaskItem);
