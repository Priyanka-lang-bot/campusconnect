// Date and number formatting helpers (pure functions, easy to test).

const pad = (n) => String(n).padStart(2, '0');

export const toDateKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayKey = () => toDateKey(new Date());

export function addDays(dateKey, days) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return toDateKey(new Date(y, m - 1, d + days));
}

// Parse 'YYYY-MM-DD' as a LOCAL date (new Date('2026-10-21') would be UTC).
export function parseDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysUntil(dateKey) {
  const ms = parseDateKey(dateKey) - parseDateKey(todayKey());
  return Math.round(ms / 86_400_000);
}

export function formatDate(dateKey, options = { day: 'numeric', month: 'short' }) {
  if (!dateKey) return '—';
  return parseDateKey(dateKey).toLocaleDateString('en-IN', options);
}

export const formatLongDate = (dateKey) =>
  formatDate(dateKey, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

// "Today", "Tomorrow", "In 3 days", "2 days ago"
export function relativeDay(dateKey) {
  const diff = daysUntil(dateKey);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return `In ${diff} days`;
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return formatDate(dateKey);
}

export function timeAgo(iso) {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

export function formatMinutes(total) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

export function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${pad(m)} ${suffix}`;
}

export const greeting = (date = new Date()) => {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
