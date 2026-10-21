import { useCallback, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventsApi } from '../../api/endpoints.js';
import { useApi } from '../../hooks/useApi.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useDocumentTitle, useKeyboardShortcut } from '../../hooks/useDomEvents.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { FilterChips, SearchInput } from '../../components/ui/Filters.jsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States.jsx';
import EventCard from './EventCard.jsx';
import { useRegistration } from './useRegistration.js';
import styles from './Events.module.css';

export default function EventsPage() {
  useDocumentTitle('Campus Events');
  const searchRef = useRef(null);
  // Category and "registered only" live in the URL (?category=Workshop&registered=1),
  // so filtered views can be bookmarked and the back button works.
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'All';
  const registeredOnly = params.get('registered') === '1';
  const [query, setQuery] = useState('');
  const q = useDebounce(query, 300);

  useKeyboardShortcut('/', (e) => {
    e.preventDefault();
    searchRef.current?.focus();
  });

  const { data: categories } = useApi((signal) => eventsApi.categories({ signal }), []);

  // Filtering happens on the SERVER here: the request re-runs when filters change.
  const { data: events, loading, error, reload, setData } = useApi(
    (signal) => eventsApi.list({ category, q, registered: registeredOnly ? 'true' : undefined }, { signal }),
    [category, q, registeredOnly],
  );

  const onUpdated = useCallback(
    (updated) =>
      setData((list) => (registeredOnly && !updated.registered ? list.filter((e) => e.id !== updated.id) : list.map((e) => (e.id === updated.id ? updated : e)))),
    [setData, registeredOnly],
  );
  const { toggleRegistration, pendingId } = useRegistration(onUpdated);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <>
      <PageHeader eyebrow="Campus life" title="Campus Events" description="Hackathons, workshops, fests and talks happening around campus." />

      <Card as="div" className={styles.toolbar}>
        <div className={styles.toolbarRow}>
          <SearchInput ref={searchRef} value={query} onChange={setQuery} label="Search events" placeholder="Search by title, club or venue" />
          <FilterChips
            label="Show"
            value={registeredOnly ? 'mine' : 'all'}
            onChange={(v) => updateParam('registered', v === 'mine' ? '1' : '')}
            options={[
              { value: 'all', label: 'All events' },
              { value: 'mine', label: 'My registrations' },
            ]}
          />
        </div>
        <FilterChips label="Filter by category" value={category} onChange={(v) => updateParam('category', v === 'All' ? '' : v)} options={['All', ...(categories ?? [])]} />
      </Card>

      <section aria-live="polite" aria-busy={loading}>
        {error && !events && <ErrorState error={error} onRetry={reload} title="Could not load events" />}
        {loading && !events && (
          <div className={styles.grid}>
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} height={260} radius="var(--radius-lg)" />
            ))}
          </div>
        )}
        {events && events.length === 0 && (
          <Card>
            <EmptyState
              icon={registeredOnly ? 'events' : 'search'}
              title={registeredOnly ? 'No registrations yet' : 'No events found'}
              message={registeredOnly ? 'Browse all events and register for the ones you like.' : 'Try another search term or category.'}
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('');
                    setParams({}, { replace: true });
                  }}
                >
                  Show all events
                </Button>
              }
            />
          </Card>
        )}
        {events && events.length > 0 && (
          <div className={`${styles.grid} ${loading ? styles.refreshing : ''}`}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} onToggle={toggleRegistration} pending={pendingId === event.id} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
