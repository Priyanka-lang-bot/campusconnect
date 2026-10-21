// useApi — the app's main custom Hook for loading server data.
//
//   const { data, loading, error, reload, setData } = useApi(
//     (signal) => tasksApi.list({}, { signal }),
//     [],               // dependencies: refetch when these change
//   );
//
// It handles loading and error state, cancels in-flight requests with
// AbortController when the component unmounts or dependencies change,
// and exposes setData so pages can apply optimistic updates.
import { useCallback, useEffect, useRef, useState } from 'react';

export function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher; // always call the latest fetcher without re-subscribing
  const controllerRef = useRef(null);

  const load = useCallback(async ({ silent = false } = {}) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    if (!silent) setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcherRef.current(controller.signal);
      if (!controller.signal.aborted) setState({ data, loading: false, error: null });
    } catch (error) {
      if (error.name === 'AbortError' || controller.signal.aborted) return;
      setState((prev) => ({ ...prev, loading: false, error }));
    }
  }, []);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = useCallback((updater) => {
    setState((prev) => ({ ...prev, data: typeof updater === 'function' ? updater(prev.data) : updater }));
  }, []);

  return {
    ...state,
    reload: load,
    refresh: useCallback(() => load({ silent: true }), [load]),
    setData,
  };
}
