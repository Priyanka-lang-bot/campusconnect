import styles from './Progress.module.css';

// Horizontal progress bar with an accessible progressbar role.
export function ProgressBar({ value, label, color = 'var(--accent)', size = 'md' }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={`${styles.bar} ${styles[size]}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span className={styles.fill} style={{ width: `${clamped}%`, background: color }} />
    </div>
  );
}

// Circular SVG progress ring with the percentage in the middle.
export function ProgressRing({ value, size = 96, stroke = 9, label, sublabel, color = 'var(--accent)' }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className={styles.ring} style={{ width: size, height: size }} role="img" aria-label={`${label}: ${clamped}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className={styles.track} cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <circle
          className={styles.indicator}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className={styles.ringLabel} aria-hidden="true">
        <strong>{clamped}%</strong>
        {sublabel && <small>{sublabel}</small>}
      </span>
    </div>
  );
}
