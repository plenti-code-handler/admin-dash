import { useState, useEffect, useRef } from 'react';
import axiosClient from '../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';
import { getApiErrorDetail, isAbortedRequest } from '@/utils/apiError';
import type { SuperUserOrderSearchResult } from '@/types/order';

const DEBOUNCE_MS = 300;
const MIN_LEN = 3;
const LIMIT = 100;

export function useOrderCodeSearch() {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [results, setResults] = useState<SuperUserOrderSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  useEffect(() => {
    const seq = ++requestSeq.current;
    const q = query.trim();
    if (q.length < MIN_LEN) {
      setResults([]);
      setActiveQuery('');
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      (async () => {
        try {
          const url = buildApiUrl(`/v1/superuser/order/search/${encodeURIComponent(q)}`, {
            skip: 0,
            limit: LIMIT,
          });
          const { data } = await axiosClient.get<SuperUserOrderSearchResult[]>(url, {
            signal: controller.signal,
          });
          if (seq !== requestSeq.current) {
            return;
          }
          setResults(data);
          setActiveQuery(q);
        } catch (err) {
          if (seq !== requestSeq.current || isAbortedRequest(err)) {
            return;
          }
          setError(getApiErrorDetail(err, 'Search failed'));
          logger.error('Order search failed', err);
        } finally {
          if (seq === requestSeq.current) {
            setLoading(false);
          }
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const trimmed = query.trim();
  const charsNeeded =
    trimmed.length > 0 && trimmed.length < MIN_LEN ? MIN_LEN - trimmed.length : 0;

  return {
    query,
    setQuery,
    results,
    activeQuery,
    loading,
    error,
    charsNeeded,
    minQueryLen: MIN_LEN,
  };
}
