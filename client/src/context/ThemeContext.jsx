// ThemeContext — shared light/dark theme for the whole app.
// The choice ('light' | 'dark' | 'system') is persisted in localStorage and
// applied as a data-theme attribute on <html>, which switches CSS variables.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const ThemeContext = createContext(null);
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useLocalStorage('theme', 'system');
  const [systemDark, setSystemDark] = useState(() => media().matches);

  // Follow OS changes while the preference is "system".
  useEffect(() => {
    const mq = media();
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#0a0f1f' : '#16213e');
  }, [resolved]);

  const value = useMemo(
    () => ({
      preference,
      theme: resolved,
      setPreference,
      toggle: () => setPreference(resolved === 'dark' ? 'light' : 'dark'),
    }),
    [preference, resolved, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
