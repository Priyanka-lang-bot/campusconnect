import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { NAV_ITEMS } from '../../components/layout/navItems.js';
import { useDocumentTitle } from '../../hooks/useDomEvents.js';
import styles from './NotFound.module.css';

export default function NotFound() {
  useDocumentTitle('Page not found');
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <section className={styles.wrap} aria-labelledby="nf-title">
      <svg className={styles.art} viewBox="0 0 280 150" aria-hidden="true">
        <text x="140" y="118" textAnchor="middle" className={styles.digits}>
          404
        </text>
        <circle cx="140" cy="76" r="30" className={styles.orbit} />
        <circle cx="168" cy="52" r="8" className={styles.moon} />
      </svg>
      <h1 id="nf-title" className={styles.title}>
        This page skipped class
      </h1>
      <p className={styles.text}>
        We couldn't find <code>{pathname}</code>. It may have moved, or the link might be mistyped.
      </p>
      <div className={styles.actions}>
        <Button icon="dashboard" to="/">
          Back to dashboard
        </Button>
        <Button variant="secondary" icon="arrowLeft" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
      <nav aria-label="Popular pages" className={styles.links}>
        <p>Or jump to</p>
        <ul>
          {NAV_ITEMS.slice(1).map((item) => (
            <li key={item.to}>
              <Link to={item.to}>
                <Icon name={item.icon} size={16} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
