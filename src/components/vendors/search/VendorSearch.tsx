'use client';

import { MagnifyingGlassIcon, MapPinIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useVendorSearch } from '@/hooks/useVendorSearch';
import type { SearchVendorResult } from './types';

function vendorInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`;
  return (letters || '?').toUpperCase();
}

function VendorResultRow({
  vendor,
  onOpen,
}: {
  vendor: SearchVendorResult;
  onOpen: (vendorId: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(vendor.vendor_id)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-indigo-50/60 focus:outline-none focus-visible:bg-indigo-50 sm:px-4"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[11px] font-semibold text-indigo-700">
          {vendorInitials(vendor.vendor_name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-gray-900">
            {vendor.vendor_name}
          </span>
          <span className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-gray-500">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{vendor.address || 'No address'}</span>
          </span>
        </span>
        <span className="hidden max-w-[9rem] truncate font-mono text-[11px] text-gray-400 lg:block">
          {vendor.vendor_id}
        </span>
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-300" />
      </button>
    </li>
  );
}

export default function VendorSearch() {
  const router = useRouter();
  const {
    query,
    setQuery,
    activeQuery,
    results,
    loading,
    pending,
    error,
    page,
    hasMore,
    canGoBack,
    goPrevious,
    goNext,
  } = useVendorSearch();

  const showResults = Boolean(query.trim());
  const busy = loading || pending;
  const showEmpty = showResults && !busy && !error && results.length === 0 && Boolean(activeQuery);

  return (
    <section className="glass-card overflow-hidden rounded-xl">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">Find a vendor</h2>
          <p className="truncate text-xs text-gray-500">Search by name</p>
        </div>
        {(loading || pending) && (
          <span className="shrink-0 text-xs font-medium text-indigo-600">Searching…</span>
        )}
      </div>

      <div className="px-3 py-3 sm:px-4">
        <label htmlFor="vendor-search" className="sr-only">
          Search vendors by name
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="vendor-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Vendor name"
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

      {!showResults && (
        <p className="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-500">
          Type a vendor name to open their profile.
        </p>
      )}

      {showResults && busy && results.length === 0 && !error && (
        <ul className="divide-y divide-gray-100 border-t border-gray-100" aria-hidden>
          {Array.from({ length: 4 }).map((_, index) => (
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

      {results.length > 0 && (
        <>
          <ul
            className={`divide-y divide-gray-100 border-t border-gray-100 ${busy ? 'opacity-60' : ''}`}
            aria-busy={busy}
          >
            {results.map((vendor) => (
              <VendorResultRow
                key={vendor.vendor_id}
                vendor={vendor}
                onOpen={(vendorId) => router.push(`/vendors/${vendorId}`)}
              />
            ))}
          </ul>
          {(hasMore || canGoBack) && (
            <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2 sm:px-4">
              <button
                type="button"
                onClick={goPrevious}
                disabled={!canGoBack || busy}
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">Page {page}</span>
              <button
                type="button"
                onClick={goNext}
                disabled={!hasMore || busy}
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showEmpty && (
        <p className="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-500">
          No vendors found for “{activeQuery}”.
        </p>
      )}
    </section>
  );
}
