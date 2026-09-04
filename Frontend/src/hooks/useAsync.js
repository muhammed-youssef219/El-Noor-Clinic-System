import { useCallback, useEffect, useRef, useState } from "react";

// Wraps any async fetcher into the {data, loading, error, reload} shape every
// list screen renders against (loading / empty / data states).
export function useAsync(fetcher, deps = [], options = {}) {
  const { intervalMs = 0, refreshOnFocus = true } = options;
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const latestFetcher = useRef(fetcher);

  useEffect(() => {
    latestFetcher.current = fetcher;
  }, [fetcher]);

  const reload = useCallback(() => {
    let cancelled = false;
    setState(s => ({ ...s, loading: true, error: null }));
    latestFetcher.current()
      .then(data => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch(error => { if (!cancelled) setState({ data: null, loading: false, error }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
    if (!intervalMs || intervalMs <= 0) return undefined;

    const timer = window.setInterval(() => {
      reload();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [reload, intervalMs]);

  useEffect(() => {
    if (!refreshOnFocus || typeof window === "undefined") return undefined;

    const handleFocus = () => reload();
    const handleVisibility = () => {
      if (!document.hidden) reload();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reload, refreshOnFocus]);

  return { ...state, reload };
}
