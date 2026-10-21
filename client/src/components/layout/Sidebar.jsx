import { useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Logo from './Logo.jsx';
import { NAV_ITEMS, SECONDARY_NAV } from './navItems.js';
import { useProfile } from '../../context/ProfileContext.jsx';
import { useClickOutside, useKeyboardShortcut } from '../../hooks/useDomEvents.js';
import { initials } from '../../utils/format.js';
import styles from './Sidebar.module.css';

function NavItem({ to, label, icon, end, onNavigate }) {
  return (
    <li>
      <NavLink to={to} end={end} onClick={onNavigate} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
        <Icon name={icon} size={18} />
        <span>{label}</span>
      </NavLink>
    </li>
  );
}

export default function Sidebar({ open, onClose }) {
  const { profile } = useProfile(); // shared via context — no props needed
  const panelRef = useRef(null);

  // On mobile the sidebar is a drawer: close it on Escape or an outside tap.
  useKeyboardShortcut('Escape', onClose, { enabled: open });
  useClickOutside(panelRef, onClose, open);

  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.backdropVisible : ''}`} aria-hidden="true" />
      <aside ref={panelRef} id="app-sidebar" className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-label="Main navigation">
        <Link to="/" className={styles.brand} onClick={onClose}>
          <Logo />
          <span>
            Campus<span className={styles.brandAccent}>Connect</span>
          </span>
        </Link>

        <nav className={styles.nav}>
          <p className={styles.sectionLabel}>Workspace</p>
          <ul>
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.to} {...item} onNavigate={onClose} />
            ))}
          </ul>
          <p className={styles.sectionLabel}>Account</p>
          <ul>
            {SECONDARY_NAV.map((item) => (
              <NavItem key={item.to} {...item} onNavigate={onClose} />
            ))}
          </ul>
        </nav>

        {profile && (
          <Link to="/settings/profile" className={styles.profile} onClick={onClose}>
            <span className={styles.avatar}>{initials(profile.name)}</span>
            <span className={styles.profileText}>
              <strong>{profile.name}</strong>
              <small>
                Year {profile.year} · Sem {profile.semester}
              </small>
            </span>
          </Link>
        )}
      </aside>
    </>
  );
}
