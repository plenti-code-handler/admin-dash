import { useCallback, useEffect, useRef, useState } from 'react';
import axiosClient from '../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';
import { getApiErrorDetail, isAbortedRequest } from '@/utils/apiError';

const DEBOUNCE_MS = 400;
export const PARENT_SEARCH_PAGE_SIZE = 10;

export interface SearchParentResult {
  vendor_id: string;
  legal_name: string | null;
  address: string | null;
}

export function useParentSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [skip, setSkip] = useState(0);
  const [results, setResults] = useState<SearchParentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        const url = buildApiUrl(
          `/v1/superuser/vendor/parent/search/${encodeURIComponent(debouncedQuery)}`,
          { skip, limit: PARENT_SEARCH_PAGE_SIZE }
        );
        const { data } = await axiosClient.get<SearchParentResult[]>(url, {
          signal: controller.signal,
        });
        if (seq !== requestSeq.current) return;
        setResults(data ?? []);
      } catch (err) {
        if (seq !== requestSeq.current || isAbortedRequest(err)) return;
        logger.error('Error searching parents:', err);
        setError(getApiErrorDetail(err, 'Failed to search parents'));
        setResults([]);
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [debouncedQuery, skip]);

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

  const page = Math.floor(skip / PARENT_SEARCH_PAGE_SIZE) + 1;
  const hasMore = results.length === PARENT_SEARCH_PAGE_SIZE;
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
    goPrevious: () => setSkip((prev) => Math.max(0, prev - PARENT_SEARCH_PAGE_SIZE)),
    goNext: () => setSkip((prev) => prev + PARENT_SEARCH_PAGE_SIZE),
  };
}
