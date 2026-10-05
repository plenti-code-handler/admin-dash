'use client';

import { useState, useCallback } from 'react';
import { BanknotesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axiosClient from '../../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';

type VendorPayoutStatus = 'COMPLETED' | 'FAILED' | 'PROCESSING';

const PAYOUT_STATUS_OPTIONS: {
  value: VendorPayoutStatus;
  activeClassName: string;
  dotClassName: string;
}[] = [
  {
    value: 'COMPLETED',
    activeClassName: 'border-green-200 bg-green-50 text-green-800 shadow-sm',
    dotClassName: 'bg-green-500',
  },
  {
    value: 'FAILED',
    activeClassName: 'border-red-200 bg-red-50 text-red-800 shadow-sm',
    dotClassName: 'bg-red-500',
  },
  {
    value: 'PROCESSING',
    activeClassName: 'border-amber-200 bg-amber-50 text-amber-800 shadow-sm',
    dotClassName: 'bg-amber-500',
  },
];

function parsePayoutIdsFromText(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const id = line.replace(/\s+/g, '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export default function VendorPayoutBulkUpdate() {
  const [pasteInput, setPasteInput] = useState('');
  const [payoutIds, setPayoutIds] = useState<string[]>([]);
  const [status, setStatus] = useState<VendorPayoutStatus>('COMPLETED');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleAdd = useCallback(() => {
    const extracted = parsePayoutIdsFromText(pasteInput);
    if (extracted.length === 0) return;
    setPayoutIds((prev) => {
      const seen = new Set(prev);
      const next = [...prev];
      for (const id of extracted) {
        if (!seen.has(id)) {
          seen.add(id);
          next.push(id);
        }
      }
      return next;
    });
    setPasteInput('');
    setFeedback(null);
  }, [pasteInput]);

  const removeId = (id: string) => {
    setPayoutIds((prev) => prev.filter((x) => x !== id));
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (payoutIds.length === 0) {
      setFeedback({ type: 'error', message: 'Add at least one payout ID before submitting.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      const url = buildApiUrl('/v1/superuser/vendor/payout/update', {
        status,
      });

      const response = await axiosClient.patch<{
        message?: string;
        status?: VendorPayoutStatus;
      }>(url, { payout_ids: payoutIds });

      const msg =
        response.data?.message ?? 'Payout status updated successfully';
      setFeedback({ type: 'success', message: msg });
    } catch (err: unknown) {
      logger.error('Error updating payout status:', err);
      const ax = err as { response?: { data?: { detail?: unknown } } };
      const detail = ax.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d: { msg?: string }) => d?.msg ?? '').filter(Boolean).join(' ')
            : err instanceof Error
              ? err.message
              : 'Failed to update payout status';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="glass-card overflow-hidden rounded-xl">
      <div className="flex items-start gap-3 border-b border-gray-100 px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <BanknotesIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">Vendor payout status</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Paste payout IDs, one per line, then set COMPLETED, FAILED, or PROCESSING.
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <label htmlFor="payout-paste" className="text-xs font-medium text-gray-700">
            Payout IDs
          </label>
          <textarea
            id="payout-paste"
            rows={4}
            placeholder={'vpay_bay21r483d\nvpay_r1l7fk2x33'}
            value={pasteInput}
            onChange={(e) => setPasteInput(e.target.value)}
            className="block w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50/70">
          <div className="flex items-center justify-between gap-2 border-b border-gray-200/80 px-3 py-2">
            <p className="text-xs font-medium text-gray-700">Selected payouts</p>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium tabular-nums text-gray-500 ring-1 ring-gray-200">
              {payoutIds.length}
            </span>
          </div>
          {payoutIds.length === 0 ? (
            <p className="px-3 py-4 text-xs text-gray-400">No payout IDs added yet.</p>
          ) : (
            <div className="flex max-h-40 flex-wrap content-start gap-1.5 overflow-y-auto p-2.5">
              {payoutIds.map((id) => (
                <span
                  key={id}
                  className="inline-flex max-w-full items-center gap-1 rounded-md border border-gray-200 bg-white py-1 pl-2 pr-1 font-mono text-[11px] text-gray-800 shadow-sm"
                >
                  <span className="truncate">{id}</span>
                  <button
                    type="button"
                    onClick={() => removeId(id)}
                    className="rounded p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label={`Remove ${id}`}
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700">Status</p>
          <div className="grid gap-1.5">
            {PAYOUT_STATUS_OPTIONS.map((option) => {
              const selected = status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setStatus(option.value);
                    setFeedback(null);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    selected
                      ? option.activeClassName
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${option.dotClassName}`} />
                  {option.value}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || payoutIds.length === 0}
            className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>

        {feedback && (
          <div
            className={`rounded-lg px-3 py-2.5 ${
              feedback.type === 'success' ? 'bg-green-50 ring-1 ring-green-100' : 'bg-red-50 ring-1 ring-red-100'
            }`}
          >
            <p
              className={`text-xs font-medium ${
                feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {feedback.type === 'success' ? 'Success' : 'Error'}
            </p>
            <p
              className={`mt-0.5 break-words text-xs ${
                feedback.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {feedback.message}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}