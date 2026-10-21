// Loading, empty and error states shared by every page.
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import styles from './States.module.css';

export function Skeleton({ height = 16, width = '100%', radius, className = '' }) {
  return <span className={`${styles.skeleton} ${className}`} style={{ height, width, borderRadius: radius }} aria-hidden="true" />;
}

// Generic placeholder layout while a page loads.
export function PageSkeleton({ cards = 3 }) {
  return (
    <div className={styles.pageSkeleton} role="status" aria-live="polite">
      <span className="visually-hidden">Loading…</span>
      <Skeleton height={28} width="40%" />
      <Skeleton height={14} width="60%" />
      <div className={styles.skeletonGrid}>
        {Array.from({ length: cards }, (_, i) => (
          <Skeleton key={i} height={120} radius="var(--radius-lg)" />
        ))}
      </div>
      <Skeleton height={220} radius="var(--radius-lg)" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className={styles.list} role="status" aria-live="polite">
      <span className="visually-hidden">Loading…</span>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height={56} radius="var(--radius)" />
      ))}
    </div>
  );
}

export function EmptyState({ icon = 'layers', title, message, action }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyArt} aria-hidden="true">
        <svg viewBox="0 0 120 80" width="120" height="80">
          <rect x="18" y="14" width="84" height="56" rx="10" className={styles.artBack} />
          <rect x="10" y="22" width="84" height="52" rx="10" className={styles.artFront} />
          <circle cx="98" cy="18" r="10" className={styles.artDot} />
        </svg>
        <span className={styles.emptyIcon}>
          <Icon name={icon} size={22} />
        </span>
      </div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      {message && <p className={styles.emptyMessage}>{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = 'Something went wrong' }) {
  return (
    <div className={styles.error} role="alert">
      <span className={styles.errorIcon}>
        <Icon name="alert" size={22} />
      </span>
      <div>
        <h3 className={styles.emptyTitle}>{title}</h3>
        <p className={styles.emptyMessage}>{error?.message || 'An unexpected error occurred.'}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" icon="refresh" onClick={() => onRetry()}>
          Try again
        </Button>
      )}
    </div>
  );
}
