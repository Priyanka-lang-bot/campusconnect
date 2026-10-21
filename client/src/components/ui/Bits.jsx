// Small presentational pieces reused across pages.
import Icon from './Icon.jsx';
import { parseDateKey } from '../../utils/format.js';
import styles from './Bits.module.css';

// Calendar-style date tile: "OCT / 24"
export function DateTile({ date, tone = 'accent' }) {
  const d = parseDateKey(date);
  return (
    <span className={`${styles.dateTile} ${styles[tone]}`} aria-hidden="true">
      <small>{d.toLocaleDateString('en-IN', { month: 'short' })}</small>
      <strong>{d.getDate()}</strong>
    </span>
  );
}

// Circular completion checkbox (a real button with aria-pressed).
export function CheckButton({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      className={`${styles.check} ${checked ? styles.checked : ''}`}
      aria-pressed={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
    >
      <Icon name="check" size={13} strokeWidth={3} />
    </button>
  );
}

export function ColorDot({ color, size = 10 }) {
  return <span className={styles.dot} style={{ background: color, width: size, height: size }} aria-hidden="true" />;
}

export function MetaItem({ icon, children }) {
  return (
    <span className={styles.meta}>
      <Icon name={icon} size={14} />
      {children}
    </span>
  );
}
