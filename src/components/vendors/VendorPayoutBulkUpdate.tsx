'use client';

import { useState, useCallback } from 'react';
import { BanknotesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axiosClient from '../../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';

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
  const [statusBool, setStatusBool] = useState(true);
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
        status: statusBool,
      });

      const response = await axiosClient.patch<{
        message?: string;
        status?: boolean;
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
    <div className="glass-card p-4 sm:p-6">
      <div className="mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BanknotesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
          Vendor payout status
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Paste payout IDs (one per line), choose COMPLETED or FAILED, then submit.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <label htmlFor="payout-paste" className="sr-only">
            Payout IDs
          </label>
          <textarea
            id="payout-paste"
            rows={5}
            placeholder={'vpay_bay21r483d\nvpay_r1l7fk2x33\n...'}
            value={pasteInput}
            onChange={(e) => setPasteInput(e.target.value)}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
          />
        </div>
        <div className="flex sm:flex-col sm:justify-start shrink-0">
          <button
            type="button"
            onClick={handleAdd}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add
          </button>
        </div>
      </div>

    
      <div className="mt-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex flex-wrap gap-2 min-w-0 flex-1">
          {payoutIds.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-md bg-gray-100 text-xs sm:text-sm text-gray-800 font-mono border border-gray-200"
            >
              <span className="truncate max-w-[200px] sm:max-w-none">{id}</span>
              <button
                type="button"
                onClick={() => removeId(id)}
                className="p-0.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={`Remove ${id}`}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 lg:justify-end">
          <button
            type="button"
            onClick={() => {
              setStatusBool(true);
              setFeedback(null);
            }}
            className={`inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              statusBool
                ? 'border-green-600 bg-green-50 text-green-800 ring-2 ring-green-200'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            COMPLETED
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusBool(false);
              setFeedback(null);
            }}
            className={`inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              !statusBool
                ? 'border-red-600 bg-red-50 text-red-800 ring-2 ring-red-200'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            FAILED
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || payoutIds.length === 0}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
      

      {feedback && (
        <div
          className={`mt-4 rounded-md p-3 sm:p-4 ${
            feedback.type === 'success' ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <p
            className={`text-xs sm:text-sm font-medium ${
              feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {feedback.type === 'success' ? 'Success' : 'Error'}
          </p>
          <p
            className={`mt-1 text-xs sm:text-sm break-words ${
              feedback.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {feedback.message}
          </p>
        </div>
      )}
    </div>
  );
}
