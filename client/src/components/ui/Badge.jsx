import styles from './Badge.module.css';

// tone: neutral | accent | lavender | success | warning | danger
export default function Badge({ tone = 'neutral', dot = false, className = '', children }) {
  return (
    <span className={`${styles.badge} ${styles[tone]} ${className}`}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}

const PRIORITY_TONES = { high: 'danger', medium: 'warning', low: 'neutral' };

export function PriorityBadge({ priority }) {
  return (
    <Badge tone={PRIORITY_TONES[priority]} dot>
      {priority[0].toUpperCase() + priority.slice(1)}
      <span className="visually-hidden"> priority</span>
    </Badge>
  );
}
