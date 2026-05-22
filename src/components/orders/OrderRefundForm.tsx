'use client';

import { useState } from 'react';
import { REFUND_MULTIPLIERS } from '@/constants/refund';
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
  const [multiplier, setMultiplier] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (multiplier === null) {
      setError('Select a refund percentage.');
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
        refund_multiplier: multiplier,
      });
      if (onRefunded) {
        await onRefunded();
      }
      setReason('');
      setMultiplier(null);
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
        <span className="mb-1.5 block text-xs text-gray-600">Refund amount</span>
        <div className="flex flex-wrap gap-2">
          {REFUND_MULTIPLIERS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              disabled={busy || disabled}
              onClick={() => setMultiplier(value)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                multiplier === value
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                  : 'border-gray-200 text-gray-700'
              } disabled:opacity-50`}
            >
              {label}
            </button>
          ))}
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
