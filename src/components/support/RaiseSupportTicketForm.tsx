'use client';

import { useState } from 'react';
import { SUPPORT_TICKET_TYPES } from '@/constants/supportTicket';
import { raiseSupportTicket } from '@/services/supportService';
import { getApiErrorDetail } from '@/utils/apiError';

type Props = {
  orderId: string;
  onSuccess?: () => void;
};

export default function RaiseSupportTicketForm({ orderId, onSuccess }: Props) {
  const [ticketType, setTicketType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketType) {
      setError('Select a problem type.');
      return;
    }
    const text = description.trim();
    if (!text) {
      setError('Enter a description.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await raiseSupportTicket({
        order_id: orderId,
        ticket_type: ticketType,
        description: text,
      });
      setTicketType(null);
      setDescription('');
      onSuccess?.();
    } catch (err) {
      setError(getApiErrorDetail(err, 'Failed to raise ticket'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 border-t border-gray-200 pt-6">
      <h3 className="text-sm font-semibold text-gray-900">Raise support ticket</h3>
      <p className="text-xs text-gray-600">
        Create a ticket for this order so refunds and resolution can be tracked.
      </p>
      <div>
        <span className="mb-1.5 block text-xs text-gray-600">Problem type</span>
        <div className="flex flex-wrap gap-2">
          {SUPPORT_TICKET_TYPES.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              disabled={busy}
              onClick={() => setTicketType(value)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                ticketType === value
                  ? 'border-orange-500 bg-orange-50 text-orange-900'
                  : 'border-gray-200 text-gray-700'
              } disabled:opacity-50`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="raise-ticket-description" className="mb-1 block text-xs text-gray-600">
          Description
        </label>
        <textarea
          id="raise-ticket-description"
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="What went wrong?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={busy}
        />
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-orange-600 py-2.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-60"
      >
        {busy ? 'Raising…' : 'Raise ticket'}
      </button>
    </form>
  );
}
