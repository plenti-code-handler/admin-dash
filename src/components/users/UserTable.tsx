'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { logger } from '@/utils/logger';
import { buildApiUrl } from '@/config';
import { getApiErrorDetail } from '@/utils/apiError';
import axiosClient from '../../../AxiosClient';

export type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  joinedDate: string;
};

interface UserTableProps {
  onUserSelect: (user: DirectoryUser) => void;
  selectedId: string | null;
}

const PAGE_SIZE = 10;

function formatDate(timestamp: string | number | null) {
  if (!timestamp) return 'N/A';
  const date = new Date(Number(timestamp) * 1000);
  if (Number.isNaN(date.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatValue(value: unknown, defaultValue = 'N/A') {
  if (value === null || value === undefined || (typeof value === 'number' && Number.isNaN(value))) {
    return defaultValue;
  }
  return String(value);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`;
  return (letters || '?').toUpperCase();
}

export default function UserTable({ onUserSelect, selectedId }: UserTableProps) {
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const url = buildApiUrl('/v1/superuser/user/get', {
          skip: (currentPage - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
        });
        const response = await axiosClient.get(url);
        if (cancelled) return;

        const data = response.data;
        const transformedUsers: DirectoryUser[] = (data.response ?? []).map(
          (user: {
            id?: unknown;
            name?: unknown;
            email?: unknown;
            phone_number?: unknown;
            is_active?: boolean;
            created_at?: string | number | null;
          }) => ({
            id: formatValue(user.id),
            name: formatValue(user.name),
            email: formatValue(user.email),
            phone: formatValue(user.phone_number),
            status: user.is_active ? 'active' : 'inactive',
            joinedDate: formatDate(user.created_at ?? null),
          })
        );

        setUsers(transformedUsers);
      } catch (err) {
        if (cancelled) return;
        logger.error('Error fetching users:', err);
        setError(getApiErrorDetail(err, 'Error fetching users'));
        setUsers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  const filteredUsers = useMemo(() => {
    const searchTerm = localSearch.trim().toLowerCase();
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.phone.includes(searchTerm)
    );
  }, [users, localSearch]);

  const hasMore = users.length === PAGE_SIZE;

  return (
    <section className="glass-card overflow-hidden rounded-xl">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">Directory</h2>
          <p className="truncate text-xs text-gray-500">Filter the current page</p>
        </div>
        {loading && <span className="shrink-0 text-xs font-medium text-indigo-600">Loading…</span>}
      </div>

      <div className="px-3 py-3 sm:px-4">
        <label htmlFor="user-filter" className="sr-only">
          Filter users on this page
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="user-filter"
            type="search"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filter this page by name, email, or phone"
            autoComplete="off"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        {error && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>

      {loading && users.length === 0 && !error && (
        <ul className="divide-y divide-gray-100 border-t border-gray-100" aria-hidden>
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={index} className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
              <span className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-gray-100" />
              <span className="min-w-0 flex-1 space-y-1.5">
                <span className="block h-3.5 w-2/5 animate-pulse rounded bg-gray-100" />
                <span className="block h-3 w-3/5 animate-pulse rounded bg-gray-100" />
              </span>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && filteredUsers.length === 0 && (
        <p className="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-500">
          {localSearch.trim() ? 'No users on this page match that filter.' : 'No users found.'}
        </p>
      )}

      {filteredUsers.length > 0 && (
        <ul
          className={`divide-y divide-gray-100 border-t border-gray-100 ${loading ? 'opacity-60' : ''}`}
          aria-busy={loading}
        >
          {filteredUsers.map((user) => {
            const selected = user.id === selectedId;
            return (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => onUserSelect(user)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:bg-indigo-50 sm:px-4 ${
                    selected ? 'bg-indigo-50' : 'hover:bg-indigo-50/60'
                  }`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[11px] font-semibold text-indigo-700">
                    {initials(user.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-900">{user.name}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.status}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500">
                      {user.email}
                      {' · '}
                      {user.phone}
                      {' · '}
                      {user.joinedDate}
                    </span>
                  </span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-300" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!error && (hasMore || currentPage > 1) && (
        <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2 sm:px-4">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage <= 1 || loading}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">Page {currentPage}</span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={!hasMore || loading}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
