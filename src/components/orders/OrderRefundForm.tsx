'use client';

import { useState } from 'react';
import { initiateOrderRefund } from '@/services/orderService';
import { getApiErrorDetail } from '@/utils/apiError';

type Props = {
  orderId: string;
  disabled?: boolean;
  /** Runs after the refund API succeeds. */
  onRefunded?: () => void | Promise<void>;
  /** Optional hook when everything is done (e.g. close bottom sheet). */
  onComplete?: () => void;
  className?: string;
};

export default function OrderRefundForm({
  orderId,
  disabled = false,
  onRefunded,
  onComplete,
  className = '',
}: Props) {
  const [reason, setReason] = useState('');
  const [percentage, setPercentage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const percent = Number(percentage.trim().replace(/%$/, ''));
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
      setError('Enter a percentage greater than 0 and up to 100.');
      return;
    }
    const text = reason.trim();
    if (!text) {
      setError('Enter a refund reason.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await initiateOrderRefund(orderId, {
        refund_reason: text,
        refund_multiplier: percent / 100,
      });
      if (onRefunded) {
        await onRefunded();
      }
      setReason('');
      setPercentage('');
      onComplete?.();
    } catch (err) {
      setError(getApiErrorDetail(err, 'Refund failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900">Initiate refund</h3>
      <div>
        <label htmlFor="refund-reason" className="mb-1 block text-xs text-gray-600">
          Refund reason (internal)
        </label>
        <textarea
          id="refund-reason"
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Why this refund is being issued"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={busy || disabled}
        />
      </div>
      <div>
        <label htmlFor="refund-percentage" className="mb-1 block text-xs text-gray-600">
          Refund percentage
        </label>
        <div className="relative w-28">
          <input
            id="refund-percentage"
            type="text"
            inputMode="decimal"
            className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm"
            placeholder="e.g. 40"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            disabled={busy || disabled}
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500" aria-hidden="true">
            %
          </span>
        </div>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || disabled}
        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {busy ? 'Processing…' : 'Submit refund'}
      </button>
    </form>
  );
}
