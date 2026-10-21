// Custom hook: toggle/delete study sessions with optimistic UI and toasts.
// Shared by the overview page and the subject detail page.
import { useCallback } from 'react';
import { studyApi } from '../../api/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatMinutes } from '../../utils/format.js';

export function useSessionActions({ updateSessions, onChanged }) {
  const toast = useToast();

  const toggle = useCallback(
    async (session) => {
      const completed = !session.completed;
      updateSessions((list) => list.map((s) => (s.id === session.id ? { ...s, completed } : s)));
      try {
        await studyApi.updateSession(session.id, { completed });
        if (completed) toast.success(`Logged ${formatMinutes(session.durationMinutes)} of study`);
        onChanged();
      } catch (err) {
        updateSessions((list) => list.map((s) => (s.id === session.id ? session : s)));
        toast.error(err.message);
      }
    },
    [updateSessions, onChanged, toast],
  );

  const remove = useCallback(
    async (session) => {
      updateSessions((list) => list.filter((s) => s.id !== session.id));
      try {
        await studyApi.removeSession(session.id);
        toast.success('Session removed');
        onChanged();
      } catch (err) {
        updateSessions((list) => [...list, session]);
        toast.error(err.message);
      }
    },
    [updateSessions, onChanged, toast],
  );

  return { toggle, remove };
}
