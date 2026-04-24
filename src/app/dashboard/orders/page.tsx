'use client';
import { useState, useCallback } from 'react';
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

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Order Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Type at least {minQueryLen} characters of an order code; results update as you type. Open
          an order to see full details and process refunds.
        </p>
      </header>

      <section className="glass-card rounded-xl p-6">
        <div className="min-w-0">
          <div className="mb-1 flex items-center justify-between gap-2">
            <label htmlFor="order-search" className="block text-sm font-medium text-gray-700">
              Order code
            </label>
            {loading && <span className="text-xs text-indigo-600">Searching…</span>}
          </div>
          <input
            id="order-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. PLN-ABCD-1234"
            autoComplete="off"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {charsNeeded > 0 && (
            <p className="mt-1.5 text-xs text-gray-500">
              Enter {charsNeeded} more character{charsNeeded === 1 ? '' : 's'} to search.
            </p>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {error}
          </p>
        )}

        {!loading && results.length === 0 && activeQuery && !error && (
          <p className="mt-6 text-center text-sm text-gray-500">No orders found for that query.</p>
        )}

        {results.length > 0 && (
          <OrderSearchResultList
            results={results}
            onSelect={openSheet}
            formatTime={formatUnixSeconds}
          />
        )}
      </section>

      <OrderSearchBottomSheet isOpen={sheetOpen} orderId={selectedOrderId} onClose={closeSheet} />
    </div>
  );
}
