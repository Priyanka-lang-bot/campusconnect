// The persistent application frame: sidebar + top bar + routed page content.
// <Outlet /> renders whichever nested route is active.
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import Icon from '../ui/Icon.jsx';
import { PageSkeleton } from '../ui/States.jsx';
import { useOnlineStatus } from '../../hooks/useDomEvents.js';
import { useProfile } from '../../context/ProfileContext.jsx';
import styles from './AppShell.module.css';

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const online = useOnlineStatus();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { preferences, profile } = useProfile();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Close the mobile drawer and move to the top whenever the page changes.
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  // Honour the "start page" preference once per browser session.
  useEffect(() => {
    if (!profile) return;
    try {
      if (sessionStorage.getItem('cc:startPageApplied')) return;
      sessionStorage.setItem('cc:startPageApplied', '1');
    } catch {
      return;
    }
    if (pathname === '/' && preferences.startPage !== '/') navigate(preferences.startPage, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  return (
    <div className={styles.shell}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar open={menuOpen} onClose={closeMenu} />
      <div className={styles.main}>
        <Topbar onMenuClick={() => setMenuOpen(true)} menuOpen={menuOpen} />
        {!online && (
          <div className={styles.offline} role="status">
            <Icon name="wifiOff" size={16} />
            You are offline. Changes will fail until your connection returns.
          </div>
        )}
        <main id="main-content" className={styles.content} tabIndex={-1}>
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
