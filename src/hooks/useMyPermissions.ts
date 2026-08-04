'use client';
import { useEffect, useState } from 'react';
import { buildApiUrl } from '@/config';
import axiosClient from '../../AxiosClient';

function readCachedPermissions(): string[] {
  try {
    const cached = localStorage.getItem('permissions');
    return cached ? (JSON.parse(cached) as string[]) : [];
  } catch {
    return [];
  }
}

export function useMyPermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Apply cache immediately after mount (same on every client, after hydration)
    const cached = readCachedPermissions();
    if (cached.length > 0) {
      setPermissions(cached);
    }

    const load = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        if (!cancelled) {
          setPermissions([]);
          setLoading(false);
        }
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
        // Keep cached permissions if refresh fails
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
