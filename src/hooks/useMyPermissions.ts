'use client';
import { useEffect, useState } from 'react';
import { buildApiUrl } from '@/config';
import axiosClient from '../../AxiosClient';

/**
 * Loads the signed-in superuser's permissions from GET /me/get.
 * Cached in localStorage so sidebar/nav can render without a flash on every mount.
 */
export function useMyPermissions() {
  const [permissions, setPermissions] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const cached = localStorage.getItem('permissions');
      return cached ? (JSON.parse(cached) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        const response = await axiosClient.get(buildApiUrl('/v1/superuser/me/get'));
        const next = Array.isArray(response.data?.permissions)
          ? (response.data.permissions as string[])
          : [];
        if (!cancelled) {
          setPermissions(next);
          localStorage.setItem('permissions', JSON.stringify(next));
        }
      } catch {
        if (!cancelled) {
          // Keep cached permissions if refresh fails
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { permissions, loading };
}
