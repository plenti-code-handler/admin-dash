import { useCallback, useEffect, useRef, useState } from 'react';
import axiosClient from '../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';
import { getApiErrorDetail, isAbortedRequest } from '@/utils/apiError';

const DEBOUNCE_MS = 400;
const PAGE_SIZE = 10;

export function usePagedQuerySearch<T>(path: string, fallbackError: string) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [skip, setSkip] = useState(0);
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const requestSeq = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const timer = setTimeout(() => {
      setSkip(0);
      setDebouncedQuery(trimmed);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const seq = ++requestSeq.current;
    if (!debouncedQuery) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const url = buildApiUrl(path, {
          search_query: debouncedQuery,
          skip,
          limit: PAGE_SIZE,
        });
        const { data } = await axiosClient.get<T[]>(url, { signal: controller.signal });
        if (seq !== requestSeq.current) return;
        setResults(data ?? []);
      } catch (err) {
        if (seq !== requestSeq.current || isAbortedRequest(err)) return;
        logger.error(fallbackError, err);
        setError(getApiErrorDetail(err, fallbackError));
        setResults([]);
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [path, fallbackError, debouncedQuery, skip, refreshToken]);

  const updateQuery = useCallback((value: string) => {
    setQuery(value);
    if (!value.trim()) {
      requestSeq.current += 1;
      setDebouncedQuery('');
      setSkip(0);
      setResults([]);
      setError(null);
      setLoading(false);
    }
  }, []);

  const page = Math.floor(skip / PAGE_SIZE) + 1;
  const hasMore = results.length === PAGE_SIZE;
  const trimmedQuery = query.trim();
  const pending = trimmedQuery.length > 0 && trimmedQuery !== debouncedQuery;

  return {
    query,
    setQuery: updateQuery,
    activeQuery: debouncedQuery,
    results,
    loading,
    pending,
    error,
    page,
    hasMore,
    canGoBack: skip > 0,
    goPrevious: () => setSkip((prev) => Math.max(0, prev - PAGE_SIZE)),
    goNext: () => setSkip((prev) => prev + PAGE_SIZE),
    reload: () => setRefreshToken((token) => token + 1),
  };
}
