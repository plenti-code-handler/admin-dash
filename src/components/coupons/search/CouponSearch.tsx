'use client';

import { useState } from 'react';
import { ChevronRightIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { usePagedQuerySearch } from '@/hooks/usePagedQuerySearch';
import CreateCouponModal from '@/components/coupons/CreateCouponModal';
import { SearchPager, SearchSkeleton } from './SearchChrome';
import { formatCouponDate, type SearchCouponResult } from './types';

export default function CouponSearch() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const search = usePagedQuerySearch<SearchCouponResult>(
    '/v1/superuser/coupon/search',
    'Failed to search coupons'
  );
  const busy = search.loading || search.pending;
  const showResults = Boolean(search.query.trim());
  const showEmpty =
    showResults && !busy && !search.error && search.results.length === 0 && Boolean(search.activeQuery);

  return (
    <section className="glass-card overflow-hidden rounded-xl">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">Find a coupon</h2>
          <p className="truncate text-xs text-gray-500">Search by code</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {busy && <span className="text-xs font-medium text-indigo-600">Searching…</span>}
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Create
          </button>
        </div>
      </div>

      <div className="px-3 py-3 sm:px-4">
        <label htmlFor="coupon-search" className="sr-only">
          Search coupons by code
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="coupon-search"
            type="search"
            value={search.query}
            onChange={(e) => search.setQuery(e.target.value)}
            placeholder="Coupon code"
            autoComplete="off"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        {search.error && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
            {search.error}
          </p>
        )}
      </div>

      {!showResults && (
        <p className="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-500">
          Type a coupon code to open it.
        </p>
      )}

      {showResults && busy && search.results.length === 0 && !search.error && <SearchSkeleton />}

      {search.results.length > 0 && (
        <>
          <ul
            className={`divide-y divide-gray-100 border-t border-gray-100 ${busy ? 'opacity-60' : ''}`}
            aria-busy={busy}
          >
            {search.results.map((coupon) => (
              <li key={coupon.coupon_id}>
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/coupons/${coupon.coupon_id}`)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-indigo-50/60 focus:outline-none focus-visible:bg-indigo-50 sm:px-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[11px] font-semibold text-indigo-700">
                    {coupon.code.slice(0, 2).toUpperCase() || '?'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-sm font-medium text-gray-900">
                      {coupon.code}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500">
                      {coupon.name}
                      {' · '}
                      {formatCouponDate(coupon.valid_from)}
                      {' – '}
                      {coupon.valid_until ? formatCouponDate(coupon.valid_until) : 'No expiry'}
                    </span>
                  </span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-300" />
                </button>
              </li>
            ))}
          </ul>
          <SearchPager
            page={search.page}
            canGoBack={search.canGoBack}
            hasMore={search.hasMore}
            busy={busy}
            onPrevious={search.goPrevious}
            onNext={search.goNext}
          />
        </>
      )}

      {showEmpty && (
        <p className="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-500">
          No coupons found for “{search.activeQuery}”.
        </p>
      )}

      <CreateCouponModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          search.reload();
        }}
      />
    </section>
  );
}
