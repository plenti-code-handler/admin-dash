import { ChevronRightIcon } from '@heroicons/react/24/outline';
import type { SuperUserOrderSearchResult } from '@/types/order';

type Props = {
  results: SuperUserOrderSearchResult[];
  onSelect: (orderId: string) => void;
  formatTime: (ts: number) => string;
  busy?: boolean;
};

export function OrderSearchResultList({ results, onSelect, formatTime, busy = false }: Props) {
  return (
    <ul
      className={`divide-y divide-gray-100 border-t border-gray-100 ${busy ? 'opacity-60' : ''}`}
      aria-busy={busy}
    >
      {results.map((row) => (
        <li key={row.order_id}>
          <button
            type="button"
            onClick={() => onSelect(row.order_id)}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-indigo-50/60 focus:outline-none focus-visible:bg-indigo-50 sm:px-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[11px] font-semibold text-indigo-700">
              {row.order_code.replace(/[^A-Za-z0-9]/g, '').slice(-2).toUpperCase() || '?'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-medium text-gray-900">{row.order_code}</span>
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                  {row.order_status}
                </span>
              </span>
              <span className="mt-0.5 block truncate text-xs text-gray-500">
                {row.vendor_name}
                {' · '}
                {row.username || 'Unknown customer'}
                {' · '}
                {row.user_phone_number || 'No phone'}
                {' · '}
                {formatTime(row.created_at)}
              </span>
            </span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-300" />
          </button>
        </li>
      ))}
    </ul>
  );
}
