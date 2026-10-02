'use client';

import { useCallback, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { formatUnixSeconds } from '@/utils/datetime';
import { useOrderCodeSearch } from '@/hooks/useOrderCodeSearch';
import OrderSearchBottomSheet from '@/components/orders/OrderSearchBottomSheet';
import { OrderSearchResultList } from '@/components/orders/OrderSearchResultList';

export default function OrdersPage() {
  const { query, setQuery, results, activeQuery, loading, error, charsNeeded, minQueryLen } =
    useOrderCodeSearch();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const openSheet = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
    setSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    setSelectedOrderId(null);
  }, []);

  const showEmpty = Boolean(activeQuery) && !loading && !error && results.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <header>
        <h1 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">Orders</h1>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
          Search by order code, then open an order to review it or issue a refund.
        </p>
      </header>

      <section className="glass-card overflow-hidden rounded-xl">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-3 sm:px-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900">Find an order</h2>
            <p className="truncate text-xs text-gray-500">At least {minQueryLen} characters</p>
          </div>
          {loading && <span className="shrink-0 text-xs font-medium text-indigo-600">Searching…</span>}
        </div>

        <div className="px-3 py-3 sm:px-4">
          <label htmlFor="order-search" className="sr-only">
            Order code
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="order-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. PLN-ABCD-1234"
              autoComplete="off"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          {charsNeeded > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Enter {charsNeeded} more character{charsNeeded === 1 ? '' : 's'} to search.
            </p>
          )}
          {error && (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              {error}
            </p>
          )}
        </div>

        {!query.trim() && (
          <p className="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-500">
            Type an order code to see matching orders.
          </p>
        )}

        {loading && results.length === 0 && !error && query.trim().length >= minQueryLen && (
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
          <OrderSearchResultList
            results={results}
            onSelect={openSheet}
            formatTime={formatUnixSeconds}
            busy={loading}
          />
        )}

        {showEmpty && (
          <p className="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-500">
            No orders found for “{activeQuery}”.
          </p>
        )}
      </section>

      <OrderSearchBottomSheet isOpen={sheetOpen} orderId={selectedOrderId} onClose={closeSheet} />
    </div>
  );
}
