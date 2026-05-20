'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { formatUnixSeconds, formatUnixSecondsCompact } from '@/utils/datetime';
import {
  formatTicketType,
  formatTransactionType,
  isTicketUnresolved,
} from '@/utils/supportFormat';
import OrderRefundForm from '@/components/orders/OrderRefundForm';
import { fetchSupportTicket, updateSupportTicket } from '@/services/supportService';
import { getApiErrorDetail } from '@/utils/apiError';
import { buildRefundResolutionNote } from '@/utils/refundMessage';
import type { SuperUserSupportTicket, SupportTicketTimelineEntry } from '@/types/support';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ToastNotice from '@/components/common/ToastNotice';
import { useToast } from '@/hooks/useToast';

type UpdateAction = 'resolve' | 'update';

type Props = {
  checkoutId: string;
};

function Timeline({ entries }: { entries: SupportTicketTimelineEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [entries]);

  if (entries.length === 0) {
    return <p className="text-sm text-gray-500">No events yet.</p>;
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]"
    >
      {entries.map((entry, index) => (
        <div
          key={`${entry.created_at}-${entry.transaction_type}-${index}`}
          className={`w-48 shrink-0 rounded-lg border px-3 py-2 text-sm ${
            index === entries.length - 1
              ? 'border-indigo-300 bg-indigo-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <p className="font-medium text-gray-900">
            {formatTransactionType(entry.transaction_type)}
          </p>
          <p className="text-xs text-gray-500">{formatUnixSecondsCompact(entry.created_at)}</p>
          <p className="mt-1 line-clamp-3 text-xs text-gray-600">
            {entry.notes?.trim() || '—'}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function SupportTicketView({ checkoutId }: Props) {
  const [ticket, setTicket] = useState<SuperUserSupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [action, setAction] = useState<UpdateAction | null>(null);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { toast, dismiss, showSuccess, showError } = useToast();

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        setTicket(await fetchSupportTicket(checkoutId));
        if (!silent) setError(null);
      } catch (err) {
        const message = getApiErrorDetail(err, 'Failed to load support ticket');
        if (silent) showError(message);
        else {
          setError(message);
          setTicket(null);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [checkoutId, showError]
  );

  useEffect(() => {
    load();
  }, [load]);

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = note.trim();
    if (!text) {
      setSubmitError('Enter a note for this update.');
      return;
    }
    if (!action) {
      setSubmitError('Choose resolve or update.');
      return;
    }
    setSubmitBusy(true);
    setSubmitError(null);
    try {
      await updateSupportTicket(checkoutId, { description: text, update_type: action });
      setNote('');
      setAction(null);
      showSuccess(
        action === 'resolve' ? 'Ticket resolved successfully.' : 'Ticket updated successfully.'
      );
      await load(true);
    } catch (err) {
      const message = getApiErrorDetail(err, 'Failed to update ticket');
      setSubmitError(message);
      showError(message);
    } finally {
      setSubmitBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
        {error}
      </p>
    );
  }

  if (!ticket) return null;

  const imageUrl = ticket.images?.trim() || null;
  const showUpdateForm = isTicketUnresolved(ticket.timeline);

  return (
    <>
      <ToastNotice toast={toast} onDismiss={dismiss} />
      <div className="mx-auto max-w-4xl space-y-4">
        <Link href="/dashboard/orders" className="text-sm font-medium text-indigo-600 hover:underline">
          ← Back to orders
        </Link>

        <div className="glass-card space-y-3 rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-lg font-semibold text-gray-900">Support ticket</h1>
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
              {formatTicketType(ticket.ticket_type)}
            </span>
          </div>
          <p className="break-all font-mono text-xs text-gray-500">{checkoutId}</p>
          <p className="text-xs text-gray-500">
            Raised {formatUnixSeconds(ticket.created_at)} IST
          </p>
          <div>
            <h2 className="text-xs font-medium uppercase text-gray-500">Issue</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
              {ticket.description || '—'}
            </p>
            {imageUrl && (
              <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Attachment"
                  className="max-h-36 rounded border border-gray-200 object-contain"
                />
              </a>
            )}
          </div>
        </div>

        <div className="glass-card grid gap-4 rounded-xl p-4 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-medium uppercase text-gray-500">User</h2>
            <p className="font-medium text-gray-900">{ticket.user_name || '—'}</p>
            {ticket.user_phone ? (
              <a href={`tel:${ticket.user_phone.replace(/\s/g, '')}`} className="text-sm text-indigo-600">
                {ticket.user_phone}
              </a>
            ) : (
              <p className="text-sm text-gray-500">—</p>
            )}
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase text-gray-500">Vendor</h2>
            <p className="font-medium text-gray-900">{ticket.vendor_name || '—'}</p>
            {ticket.vendor_phone ? (
              <a href={`tel:${ticket.vendor_phone.replace(/\s/g, '')}`} className="text-sm text-indigo-600">
                {ticket.vendor_phone}
              </a>
            ) : (
              <p className="text-sm text-gray-500">—</p>
            )}
          </div>
        </div>

        {showUpdateForm && ticket.order_id && (
          <div className="glass-card rounded-xl p-4">
            <OrderRefundForm
              orderId={ticket.order_id}
              onRefunded={async (multiplier) => {
                const description = buildRefundResolutionNote(multiplier);
                await updateSupportTicket(checkoutId, {
                  description,
                  update_type: 'resolve',
                });
                setNote(description);
                showSuccess('Refund initiated and ticket resolved.');
                await load(true);
              }}
            />
          </div>
        )}

        {showUpdateForm && !ticket.order_id && (
          <p className="text-sm text-amber-800 rounded-lg bg-amber-50 px-3 py-2">
            No order linked to this checkout — refund must be issued from Orders.
          </p>
        )}

        {showUpdateForm && (
          <form onSubmit={submitUpdate} className="glass-card space-y-3 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-900">Resolve / update ticket</h2>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Note shown to the user…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitBusy}
            />
            <div className="flex flex-wrap gap-2">
              {(['update', 'resolve'] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  disabled={submitBusy}
                  onClick={() => setAction(id)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize ${
                    action === id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  {id}
                </button>
              ))}
              <button
                type="submit"
                disabled={submitBusy}
                className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitBusy ? 'Submitting…' : 'Submit'}
              </button>
            </div>
            {submitError && (
              <p className="text-sm text-red-700" role="alert">
                {submitError}
              </p>
            )}
          </form>
        )}

        <div className="glass-card rounded-xl p-4">
          <h2 className="mb-2 text-xs font-medium uppercase text-gray-500">Timeline</h2>
          <Timeline entries={ticket.timeline} />
        </div>
      </div>
    </>
  );
}
