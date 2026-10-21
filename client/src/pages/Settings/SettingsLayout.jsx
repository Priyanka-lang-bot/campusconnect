// Parent route for /settings/* with tab navigation and a nested <Outlet />.
import { NavLink, Outlet } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';
import { ErrorState, PageSkeleton } from '../../components/ui/States.jsx';
import styles from './Settings.module.css';

const TABS = [
  { to: 'profile', label: 'Profile', icon: 'user' },
  { to: 'preferences', label: 'Preferences', icon: 'settings' },
];

export default function SettingsLayout() {
  const { profile, loading, error, reload } = useProfile();

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile & Settings" description="Manage your details and how CampusConnect works for you." />
      <nav className={styles.tabs} aria-label="Settings sections">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}>
            <Icon name={tab.icon} size={16} />
            {tab.label}
          </NavLink>
        ))}
      </nav>
      {loading && !profile && <PageSkeleton cards={2} />}
      {error && !profile && <ErrorState error={error} onRetry={reload} title="Could not load your profile" />}
      {profile && <Outlet />}
    </>
  );
}
