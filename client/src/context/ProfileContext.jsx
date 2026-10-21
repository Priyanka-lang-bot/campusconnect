// ProfileContext — the student's profile and preferences, loaded once from
// the API and shared with the sidebar, top bar, dashboard, tasks page and
// settings. Without this context the profile would have to be passed as a
// prop through every layout component (prop drilling).
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { profileApi } from '../api/endpoints.js';
import { useApi } from '../hooks/useApi.js';

const ProfileContext = createContext(null);

const DEFAULT_PREFERENCES = {
  weeklyStudyGoalHours: 12,
  showCompletedTasks: true,
  confirmDeletes: true,
  compactMode: false,
  startPage: '/',
};

export function ProfileProvider({ children }) {
  const { data: profile, loading, error, setData, reload } = useApi((signal) => profileApi.get({ signal }), []);

  const preferences = useMemo(() => ({ ...DEFAULT_PREFERENCES, ...profile?.preferences }), [profile]);

  // Apply the compact-density preference globally.
  useEffect(() => {
    document.documentElement.dataset.density = preferences.compactMode ? 'compact' : 'comfortable';
  }, [preferences.compactMode]);

  const updateProfile = useCallback(
    async (values) => {
      const updated = await profileApi.update(values);
      setData(updated);
      return updated;
    },
    [setData],
  );

  const updatePreferences = useCallback(
    async (changes) => {
      const updated = await profileApi.updatePreferences(changes);
      setData(updated);
      return updated;
    },
    [setData],
  );

  const value = useMemo(
    () => ({ profile, preferences, loading, error, reload, updateProfile, updatePreferences }),
    [profile, preferences, loading, error, reload, updateProfile, updatePreferences],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}
