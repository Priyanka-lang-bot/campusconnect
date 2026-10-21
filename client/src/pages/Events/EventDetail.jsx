// /events/:eventId — event details page using a route parameter.
import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { eventsApi } from '../../api/endpoints.js';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDomEvents.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { ProgressBar } from '../../components/ui/Progress.jsx';
import { ErrorState, PageSkeleton } from '../../components/ui/States.jsx';
import { useRegistration, CATEGORY_TONES } from './useRegistration.js';
import { formatLongDate, formatTime, relativeDay } from '../../utils/format.js';
import styles from './Events.module.css';

// Builds an .ics calendar file in the browser and triggers a download by
// creating a temporary <a> element — direct DOM manipulation.
function downloadCalendarFile(event) {
  const stamp = (date, time) => `${date.replaceAll('-', '')}T${time.replace(':', '')}00`;
  const escape = (text) => text.replace(/[,;\\]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusConnect//Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@campusconnect`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${stamp(event.date, event.startTime)}`,
    `DTEND:${stamp(event.date, event.endTime)}`,
    `SUMMARY:${escape(event.title)}`,
    `LOCATION:${escape(event.venue)}`,
    `DESCRIPTION:${escape(event.summary)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function EventDetail() {
  const { eventId } = useParams();
  const { data: event, loading, error, reload, setData } = useApi((signal) => eventsApi.get(eventId, { signal }), [eventId]);
  useDocumentTitle(event?.title ?? 'Event');
  const onUpdated = useCallback((updated) => setData(updated), [setData]);
  const { toggleRegistration, pendingId } = useRegistration(onUpdated);

  if (loading && !event) return <PageSkeleton cards={2} />;
  if (error) {
    return (
      <div className={styles.errorWrap}>
        <ErrorState error={error} onRetry={error.status === 404 ? undefined : reload} title={error.status === 404 ? 'Event not found' : 'Could not load event'} />
        <Button to="/events" variant="secondary" icon="arrowLeft">
          Back to events
        </Button>
      </div>
    );
  }

  const full = event.attendees >= event.capacity;

  return (
    <article className={styles.detail}>
      <Link to="/events" className={styles.back}>
        <Icon name="arrowLeft" size={16} /> All events
      </Link>

      <header className={styles.detailHeader}>
        <Badge tone={CATEGORY_TONES[event.category] ?? 'neutral'}>{event.category}</Badge>
        <h1 className={styles.detailTitle}>{event.title}</h1>
        <p className={styles.detailSummary}>{event.summary}</p>
      </header>

      <div className={styles.detailGrid}>
        <Card className={styles.description}>
          <h2 className={styles.sectionTitle}>About this event</h2>
          <p>{event.description}</p>
          <ul className={styles.tags} aria-label="Tags">
            {event.tags.map((tag) => (
              <li key={tag}>#{tag}</li>
            ))}
          </ul>
        </Card>

        <Card as="aside" className={styles.facts} aria-label="Event details">
          <dl>
            <div>
              <dt>
                <Icon name="events" size={16} /> Date
              </dt>
              <dd>
                {formatLongDate(event.date)}
                <small>{relativeDay(event.date)}</small>
              </dd>
            </div>
            <div>
              <dt>
                <Icon name="clock" size={16} /> Time
              </dt>
              <dd>
                {formatTime(event.startTime)} – {formatTime(event.endTime)}
              </dd>
            </div>
            <div>
              <dt>
                <Icon name="pin" size={16} /> Venue
              </dt>
              <dd>{event.venue}</dd>
            </div>
            <div>
              <dt>
                <Icon name="people" size={16} /> Organiser
              </dt>
              <dd>{event.organizer}</dd>
            </div>
          </dl>

          <div className={styles.capacity}>
            <ProgressBar value={(event.attendees / event.capacity) * 100} label="Capacity" color={full ? 'var(--danger)' : 'var(--accent-2)'} />
            <span>
              {event.attendees} / {event.capacity} registered
            </span>
          </div>

          {event.registered && (
            <p className={styles.going} role="status">
              <Icon name="check" size={16} /> You're going to this event
            </p>
          )}

          <div className={styles.factActions}>
            <Button
              variant={event.registered ? 'secondary' : 'primary'}
              onClick={() => toggleRegistration(event)}
              loading={pendingId === event.id}
              disabled={!event.registered && full}
            >
              {event.registered ? 'Cancel registration' : full ? 'Event is full' : 'Register now'}
            </Button>
            <Button variant="ghost" icon="events" onClick={() => downloadCalendarFile(event)}>
              Add to calendar (.ics)
            </Button>
          </div>
        </Card>
      </div>
    </article>
  );
}
