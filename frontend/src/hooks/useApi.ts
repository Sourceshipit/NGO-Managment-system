import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic data-fetching hook that replaces repetitive useState + useEffect patterns.
 *
 * @example
 * const { data: stats, loading } = useApi(() => dashboardAPI.getStats(), []);
 * const { data: volunteers, refetch } = useApi(() => volunteersAPI.getAll(), []);
 */
export function useApi<T>(
  fn: () => Promise<T>,
  deps: any[] = []
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err?.response?.data?.detail || err?.message || 'An error occurred');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useApi;
