// Custom hook: register / unregister for an event with loading + toasts.
import { useCallback, useState } from 'react';
import { eventsApi } from '../../api/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';

export function useRegistration(onUpdated) {
  const toast = useToast();
  const [pendingId, setPendingId] = useState(null);

  const toggleRegistration = useCallback(
    async (event) => {
      setPendingId(event.id);
      try {
        const updated = event.registered ? await eventsApi.unregister(event.id) : await eventsApi.register(event.id);
        onUpdated(updated);
        toast.success(updated.registered ? `You're registered for ${updated.title}` : `Registration cancelled for ${updated.title}`);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setPendingId(null);
      }
    },
    [onUpdated, toast],
  );

  return { toggleRegistration, pendingId };
}

export const CATEGORY_TONES = {
  Technical: 'accent',
  Workshop: 'lavender',
  Career: 'success',
  Cultural: 'warning',
  Sports: 'danger',
  Club: 'neutral',
};
