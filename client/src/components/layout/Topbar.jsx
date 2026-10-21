import { Link, useLocation } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import Logo from './Logo.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import { initials, formatLongDate, todayKey } from '../../utils/format.js';
import styles from './Topbar.module.css';

export default function Topbar({ onMenuClick, menuOpen }) {
  const { theme, toggle } = useTheme();
  const { profile } = useProfile();
  const { pathname } = useLocation();

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <Button
          variant="ghost"
          icon="menu"
          iconOnly
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-expanded={menuOpen}
          aria-controls="app-sidebar"
        >
          Open navigation menu
        </Button>
        <Link to="/" className={styles.mobileBrand} aria-label="CampusConnect home">
          <Logo size={28} />
        </Link>
        <p className={styles.date}>
          <time dateTime={todayKey()}>{formatLongDate(todayKey())}</time>
        </p>
      </div>

      <div className={styles.right}>
        {pathname !== '/tasks' && (
          <Button to="/tasks?new=1" variant="secondary" size="sm" icon="plus" className={styles.quickAdd}>
            New task
          </Button>
        )}
        <Button variant="ghost" iconOnly icon={theme === 'dark' ? 'sun' : 'moon'} onClick={toggle} aria-pressed={theme === 'dark'}>
          {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        </Button>
        <Link to="/settings/profile" className={styles.avatar} aria-label="Open profile settings">
          {profile ? initials(profile.name) : '…'}
        </Link>
      </div>
    </header>
  );
}
