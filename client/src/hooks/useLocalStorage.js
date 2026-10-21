// useLocalStorage — useState that persists to localStorage.
// Used only for harmless client-side preferences and drafts (theme, filters,
// an unsent feedback draft). Real application data lives on the server.
import { useCallback, useEffect, useState } from 'react';

const PREFIX = 'cc:';

function readValue(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback; // private mode, blocked storage or bad JSON
  }
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue));

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — the app keeps working in memory.
    }
  }, [key, value]);

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch {
      /* ignore */
    }
    setValue(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue, remove];
}
