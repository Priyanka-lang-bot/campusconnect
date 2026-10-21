import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { DateTile, MetaItem } from '../../components/ui/Bits.jsx';
import { ProgressBar } from '../../components/ui/Progress.jsx';
import { formatTime, relativeDay } from '../../utils/format.js';
import { CATEGORY_TONES } from './useRegistration.js';
import styles from './Events.module.css';

export default function EventCard({ event, onToggle, pending }) {
  const full = event.attendees >= event.capacity;
  const fill = (event.attendees / event.capacity) * 100;
  const spotsLeft = event.capacity - event.attendees;

  return (
    <article className={`${styles.card} ${event.registered ? styles.registered : ''}`} aria-labelledby={`event-${event.id}`}>
      <div className={styles.cardTop}>
        <DateTile date={event.date} tone={event.registered ? 'lavender' : 'accent'} />
        <div className={styles.cardHeading}>
          <Badge tone={CATEGORY_TONES[event.category] ?? 'neutral'}>{event.category}</Badge>
          <h2 id={`event-${event.id}`} className={styles.cardTitle}>
            <Link to={`/events/${event.id}`} className={styles.cardLink}>
              {event.title}
            </Link>
          </h2>
        </div>
      </div>
      <p className={styles.summary}>{event.summary}</p>
      <div className={styles.meta}>
        <MetaItem icon="clock">
          {relativeDay(event.date)} · {formatTime(event.startTime)}
        </MetaItem>
        <MetaItem icon="pin">{event.venue}</MetaItem>
      </div>
      <div className={styles.capacity}>
        <ProgressBar value={fill} size="sm" label={`${event.attendees} of ${event.capacity} spots taken`} color={full ? 'var(--danger)' : 'var(--accent-2)'} />
        <span>{full ? 'Fully booked' : `${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'} left`}</span>
      </div>
      <div className={styles.cardActions}>
        <Button
          variant={event.registered ? 'secondary' : 'primary'}
          size="sm"
          icon={event.registered ? 'check' : undefined}
          onClick={() => onToggle(event)}
          loading={pending}
          disabled={!event.registered && full}
          aria-label={event.registered ? `Cancel registration for ${event.title}` : `Register for ${event.title}`}
        >
          {event.registered ? 'Registered' : full ? 'Full' : 'Register'}
        </Button>
        <Button to={`/events/${event.id}`} variant="ghost" size="sm">
          Details
        </Button>
      </div>
    </article>
  );
}
