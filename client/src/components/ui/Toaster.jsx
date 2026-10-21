import Icon from './Icon.jsx';
import styles from './Toaster.module.css';

// Renders the toast stack. aria-live makes screen readers announce new toasts.
export default function Toaster({ toasts, onDismiss }) {
  return (
    <div className={styles.region} aria-live="polite" aria-relevant="additions">
      {toasts.map(({ id, message, type, action }) => (
        <div key={id} className={`${styles.toast} ${styles[type]}`} role={type === 'error' ? 'alert' : 'status'}>
          <span className={styles.icon}>
            <Icon name={type === 'error' ? 'alert' : 'check'} size={16} strokeWidth={2.4} />
          </span>
          <p className={styles.message}>{message}</p>
          {action && (
            <button
              type="button"
              className={styles.action}
              onClick={() => {
                action.onClick();
                onDismiss(id);
              }}
            >
              {action.label}
            </button>
          )}
          <button type="button" className={styles.close} onClick={() => onDismiss(id)} aria-label="Dismiss notification">
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
