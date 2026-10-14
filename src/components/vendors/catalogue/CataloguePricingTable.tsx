'use client';

import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

export interface PricingEntry {
  item_type: string;
  id: string;
  name: string | null;
  asp: number;
  bags: { SMALL?: number; MEDIUM?: number; LARGE?: number };
  cuts: { SMALL?: number; MEDIUM?: number; LARGE?: number };
  descriptions: string[] | null;
  tcs?: boolean;
  tcs_rate?: number;
  item_gst_rate?: number;
  platform_gst_rate?: number;
}

export interface Catalogue {
  payout: { tier: string; threshold: number };
  pricing: PricingEntry[];
}

interface CataloguePricingTableProps {
  catalogue: Catalogue | null;
  isRequest?: boolean;
  currentCatalogue?: Catalogue | null;
}

const SIZES = ['SMALL', 'MEDIUM', 'LARGE'] as const;

function formatInr(value: number | undefined) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Money({ value }: { value: number | undefined }) {
  const formatted = formatInr(value);
  return (
    <span className={formatted ? 'tabular-nums text-gray-800' : 'text-gray-300'}>{formatted ?? '—'}</span>
  );
}

export default function CataloguePricingTable({
  catalogue,
  isRequest = false,
  currentCatalogue = null,
}: CataloguePricingTableProps) {
  if (!catalogue?.pricing?.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-10 text-center">
        <p className="text-sm font-medium text-gray-800">
          {isRequest ? 'No catalogue data' : 'No current catalogue'}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {isRequest ? 'This request does not include pricing rows.' : 'This vendor has no active pricing yet.'}
        </p>
      </div>
    );
  }

  const pricing = catalogue.pricing;
  const currentPricingMap = new Map<string, PricingEntry>();
  if (currentCatalogue?.pricing) {
    currentCatalogue.pricing.forEach((entry) => currentPricingMap.set(`${entry.item_type}:${entry.id}`, entry));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-[11px] font-medium uppercase tracking-wide text-gray-500">
              <th className="sticky left-0 z-20 bg-gray-50 px-4 py-3">Item</th>
              <th className="bg-gray-50 px-4 py-3">Pricing</th>
              <th className="bg-gray-50 px-4 py-3">ASP</th>
              <th className="bg-gray-50 px-4 py-3">Packed</th>
              <th colSpan={3} className="border-l border-gray-200 bg-gray-50 px-3 py-3 text-center">
                Bags
              </th>
              <th colSpan={3} className="border-l border-gray-200 bg-gray-50 px-3 py-3 text-center">
                Cuts
              </th>
              <th className="border-l border-gray-200 bg-gray-50 px-4 py-3">Descriptions</th>
            </tr>
            <tr className="text-[11px] font-medium text-gray-400">
              <th className="sticky left-0 z-20 border-b border-gray-200 bg-gray-50" />
              <th className="border-b border-gray-200 bg-gray-50" />
              <th className="border-b border-gray-200 bg-gray-50" />
              <th className="border-b border-gray-200 bg-gray-50" />
              {SIZES.map((size, index) => (
                <th
                  key={`bag-${size}`}
                  className={`border-b border-gray-200 bg-gray-50 px-3 pb-2 text-center ${index === 0 ? 'border-l border-gray-200' : ''}`}
                >
                  {size[0]}
                </th>
              ))}
              {SIZES.map((size, index) => (
                <th
                  key={`cut-${size}`}
                  className={`border-b border-gray-200 bg-gray-50 px-3 pb-2 text-center ${index === 0 ? 'border-l border-gray-200' : ''}`}
                >
                  {size[0]}
                </th>
              ))}
              <th className="border-b border-l border-gray-200 bg-gray-50" />
            </tr>
          </thead>
          <tbody className="[&>tr:last-child>td]:border-b-0">
            {pricing.map((entry, index) => {
              const bags = entry.bags || {};
              const cuts = entry.cuts || {};
              const rowKey = `${entry.item_type}-${entry.id}-${index}`;
              const currentEntry = currentPricingMap.get(`${entry.item_type}:${entry.id}`);
              const isNew = isRequest && !currentEntry;
              const aspDelta =
                isRequest && currentEntry != null && currentEntry.asp !== entry.asp
                  ? entry.asp - currentEntry.asp
                  : null;
              const packedItem = Boolean(entry.tcs);
              const descriptions = Array.isArray(entry.descriptions)
                ? entry.descriptions.filter((description) => String(description).trim())
                : [];
              const rowBg = isNew ? 'bg-indigo-50/50' : 'bg-white';
              const hoverBg = isNew ? 'group-hover:bg-indigo-50' : 'group-hover:bg-gray-50/80';

              return (
                <tr key={rowKey} className="group">
                  <td className={`sticky left-0 z-10 whitespace-nowrap border-b border-gray-100 px-4 py-3 ${rowBg} ${hoverBg}`}>
                    <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {titleCase(entry.item_type)}
                    </span>
                  </td>
                  <td className={`whitespace-nowrap border-b border-gray-100 px-4 py-3 ${rowBg} ${hoverBg}`}>
                    <span className="inline-flex items-center gap-2 font-medium text-gray-900">
                      {entry.name ?? entry.id}
                      {isNew && (
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                          New
                        </span>
                      )}
                    </span>
                  </td>
                  <td className={`whitespace-nowrap border-b border-gray-100 px-4 py-3 ${rowBg} ${hoverBg}`}>
                    <span className="inline-flex items-center gap-2">
                      <span className="font-medium tabular-nums text-gray-900">{formatInr(entry.asp)}</span>
                      {aspDelta !== null && aspDelta !== 0 && (
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${
                            aspDelta > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}
                          title={aspDelta > 0 ? `${formatInr(aspDelta)} above current` : `${formatInr(aspDelta)} below current`}
                        >
                          {aspDelta > 0 ? (
                            <ArrowUpIcon className="h-3 w-3" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3" />
                          )}
                          {aspDelta > 0 ? `+${formatInr(aspDelta)}` : formatInr(aspDelta)}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className={`whitespace-nowrap border-b border-gray-100 px-4 py-3 ${rowBg} ${hoverBg}`}>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        packedItem ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {packedItem ? 'Yes' : 'No'}
                    </span>
                  </td>
                  {SIZES.map((size, sizeIndex) => (
                    <td
                      key={`${rowKey}-bag-${size}`}
                      className={`whitespace-nowrap border-b border-gray-100 px-3 py-3 text-center text-xs ${rowBg} ${hoverBg} ${sizeIndex === 0 ? 'border-l border-gray-100' : ''}`}
                    >
                      <Money value={bags[size]} />
                    </td>
                  ))}
                  {SIZES.map((size, sizeIndex) => (
                    <td
                      key={`${rowKey}-cut-${size}`}
                      className={`whitespace-nowrap border-b border-gray-100 px-3 py-3 text-center text-xs ${rowBg} ${hoverBg} ${sizeIndex === 0 ? 'border-l border-gray-100' : ''}`}
                    >
                      <Money value={cuts[size]} />
                    </td>
                  ))}
                  <td className={`min-w-[180px] border-b border-l border-gray-100 px-4 py-3 ${rowBg} ${hoverBg}`}>
                    {descriptions.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {descriptions.map((text, descIndex) => (
                          <span
                            key={`${rowKey}-desc-${descIndex}`}
                            className="inline-flex rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-600 ring-1 ring-gray-200"
                          >
                            {text}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
