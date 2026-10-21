// /resources and /resources/:category — the category comes from the URL.
import { useMemo, useRef, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { resourcesApi } from '../../api/endpoints.js';
import { useApi } from '../../hooks/useApi.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { useDocumentTitle, useKeyboardShortcut } from '../../hooks/useDomEvents.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { FilterChips, SearchInput } from '../../components/ui/Filters.jsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States.jsx';
import styles from './Resources.module.css';

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const LEVEL_TONES = { Beginner: 'success', Intermediate: 'accent', Advanced: 'lavender' };

export default function ResourcesPage() {
  const { category: categorySlug } = useParams();
  const searchRef = useRef(null);
  const [query, setQuery] = useState('');
  const q = useDebounce(query).trim().toLowerCase();
  const [view, setView] = useState('all'); // 'all' | 'saved'
  // Bookmarks are personal and harmless, so they live in localStorage.
  const [saved, setSaved] = useLocalStorage('savedResources', []);

  useKeyboardShortcut('/', (e) => {
    e.preventDefault();
    searchRef.current?.focus();
  });

  const { data, loading, error, reload } = useApi(
    (signal) => Promise.all([resourcesApi.list({}, { signal }), resourcesApi.categories({ signal })]).then(([items, categories]) => ({ items, categories })),
    [],
  );

  const activeCategory = data?.categories.find((c) => slugify(c.name) === categorySlug);
  useDocumentTitle(activeCategory ? `${activeCategory.name} resources` : 'Resources');

  const visible = useMemo(() => {
    if (!data) return [];
    return data.items
      .filter((r) => !activeCategory || r.category === activeCategory.name)
      .filter((r) => view === 'all' || saved.includes(r.id))
      .filter((r) => !q || `${r.title} ${r.description} ${r.type} ${r.category}`.toLowerCase().includes(q));
  }, [data, activeCategory, view, saved, q]);

  const toggleSaved = (id) => setSaved((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  if (error && !data) return <ErrorState error={error} onRetry={reload} title="Could not load resources" />;

  const unknownCategory = data && categorySlug && !activeCategory;

  return (
    <>
      <PageHeader eyebrow="Learn" title="Resources" description="Hand-picked documentation, courses and tools for your semester." />

      <div className={styles.layout}>
        <nav aria-label="Resource categories" className={styles.categories}>
          <NavLink to="/resources" end className={({ isActive }) => `${styles.catLink} ${isActive ? styles.catActive : ''}`}>
            <span>All resources</span>
            <span className={styles.catCount}>{data?.items.length ?? '–'}</span>
          </NavLink>
          {(data?.categories ?? []).map((c) => (
            <NavLink key={c.name} to={`/resources/${slugify(c.name)}`} className={({ isActive }) => `${styles.catLink} ${isActive ? styles.catActive : ''}`}>
              <span>{c.name}</span>
              <span className={styles.catCount}>{c.count}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.main}>
          <div className={styles.toolbar}>
            <SearchInput ref={searchRef} value={query} onChange={setQuery} label="Search resources" placeholder="Search resources" />
            <FilterChips
              label="Show"
              value={view}
              onChange={setView}
              options={[
                { value: 'all', label: 'All' },
                { value: 'saved', label: 'Saved', count: saved.length },
              ]}
            />
          </div>

          {loading && !data && (
            <div className={styles.grid}>
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} height={180} radius="var(--radius-lg)" />
              ))}
            </div>
          )}

          {unknownCategory && (
            <Card>
              <EmptyState icon="resources" title="Unknown category" message={`There is no “${categorySlug}” category.`} action={<Button to="/resources">Browse all resources</Button>} />
            </Card>
          )}

          {data && !unknownCategory && visible.length === 0 && (
            <Card>
              <EmptyState
                icon={view === 'saved' ? 'star' : 'search'}
                title={view === 'saved' ? 'Nothing saved yet' : 'No resources match'}
                message={view === 'saved' ? 'Tap the star on any resource to keep it here.' : 'Try a different search term.'}
              />
            </Card>
          )}

          {data && !unknownCategory && visible.length > 0 && (
            <ul className={styles.grid}>
              {visible.map((r) => {
                const isSaved = saved.includes(r.id);
                return (
                  <li key={r.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <Badge tone="neutral">{r.type}</Badge>
                      <Badge tone={LEVEL_TONES[r.level]}>{r.level}</Badge>
                      <button
                        type="button"
                        className={`${styles.star} ${isSaved ? styles.starred : ''}`}
                        aria-pressed={isSaved}
                        aria-label={isSaved ? `Remove ${r.title} from saved` : `Save ${r.title}`}
                        onClick={() => toggleSaved(r.id)}
                      >
                        <Icon name="star" size={18} filled={isSaved} />
                      </button>
                    </div>
                    <h2 className={styles.title}>{r.title}</h2>
                    <p className={styles.desc}>{r.description}</p>
                    <div className={styles.cardFoot}>
                      <span className={styles.category}>{r.category}</span>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className={styles.open}>
                        Open <Icon name="external" size={14} />
                        <span className="visually-hidden"> {r.title} (opens in a new tab)</span>
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
