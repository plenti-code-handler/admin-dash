import type { SuperUserOrderSearchResult } from '@/types/order';

type Props = {
  results: SuperUserOrderSearchResult[];
  onSelect: (orderId: string) => void;
  formatTime: (ts: number) => string;
};

const label = 'text-xs font-medium uppercase tracking-wide text-gray-500';
const valueLg = 'text-base font-semibold text-gray-900';

export function OrderSearchResultList({ results, onSelect, formatTime }: Props) {
  return (
    <ul className="mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
      {results.map((row) => (
        <li key={row.order_id}>
          <button
            type="button"
            onClick={() => onSelect(row.order_id)}
            className="flex w-full flex-col gap-2 px-4 py-3 text-left transition hover:bg-gray-50"
          >
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-base font-semibold text-gray-900">{row.order_code}</span>
              <span className="text-sm text-gray-600">{row.vendor_name}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 sm:grid-cols-2">
              <div>
                <p className={label}>Customer</p>
                <p className={valueLg}>{row.username || '—'}</p>
              </div>
              <div>
                <p className={label}>Phone</p>
                <p className={`${valueLg} tabular-nums`}>{row.user_phone_number || '—'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600">
              <span>{formatTime(row.created_at)}</span>
              <span className="font-medium text-gray-800">{row.order_status}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
