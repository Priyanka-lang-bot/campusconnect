// Single source of truth for navigation — used by the sidebar and the 404 page.
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/tasks', label: 'My Tasks', icon: 'tasks' },
  { to: '/study', label: 'Study Planner', icon: 'study' },
  { to: '/events', label: 'Campus Events', icon: 'events' },
  { to: '/resources', label: 'Resources', icon: 'resources' },
];

export const SECONDARY_NAV = [
  { to: '/settings', label: 'Profile & Settings', icon: 'settings' },
  { to: '/feedback', label: 'Feedback', icon: 'feedback' },
];
