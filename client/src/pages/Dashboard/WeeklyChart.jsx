// Seven-day study bar chart drawn with plain SVG (no chart library).
import { useMemo } from 'react';
import { formatMinutes, parseDateKey, todayKey } from '../../utils/format.js';
import styles from './Dashboard.module.css';

export default function WeeklyChart({ days }) {
  const max = useMemo(() => Math.max(60, ...days.map((d) => d.minutes)), [days]);
  const today = todayKey();
  const height = 140;
  const barWidth = 28;
  const gap = 18;
  const width = days.length * (barWidth + gap) - gap;

  return (
    <figure className={styles.chart}>
      <svg viewBox={`0 0 ${width} ${height + 24}`} width="100%" role="img" aria-labelledby="weekly-chart-desc">
        <desc id="weekly-chart-desc">
          Minutes studied over the last seven days: {days.map((d) => `${parseDateKey(d.date).toLocaleDateString('en-IN', { weekday: 'short' })} ${d.minutes}`).join(', ')}.
        </desc>
        {days.map((day, i) => {
          const h = day.minutes ? Math.max(6, (day.minutes / max) * height) : 3;
          const x = i * (barWidth + gap);
          const isToday = day.date === today;
          return (
            <g key={day.date}>
              <rect className={styles.barTrack} x={x} y={0} width={barWidth} height={height} rx={8} />
              <rect className={isToday ? styles.barToday : styles.bar} x={x} y={height - h} width={barWidth} height={h} rx={8}>
                <title>{`${formatMinutes(day.minutes)} on ${parseDateKey(day.date).toDateString()}`}</title>
              </rect>
              <text className={styles.barLabel} x={x + barWidth / 2} y={height + 18} textAnchor="middle">
                {parseDateKey(day.date).toLocaleDateString('en-IN', { weekday: 'narrow' })}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
