'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatUnixSeconds, parseIstDatetimeLocal } from '@/utils/datetime';
import { getApiErrorDetail } from '@/utils/apiError';
import { issueCoins, listMyCoinIssuances, type CoinIssuance } from '@/services/coinService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

function defaultExpiryInput(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(expiresAt * 1000));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

export default function CoinsPage() {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [expiresAt, setExpiresAt] = useState(defaultExpiryInput);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const [issuances, setIssuances] = useState<CoinIssuance[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const loadIssuances = useCallback(async () => {
    setLoading(true);
    try {
      setIssuances(await listMyCoinIssuances());
      setListError(null);
    } catch (err) {
      setListError(getApiErrorDetail(err, 'Failed to load issuances'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIssuances();
  }, [loadIssuances]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const coins = Number(amount.trim());
    if (!userId.trim()) {
      setFormError('Enter a user id.');
      return;
    }
    if (!Number.isInteger(coins) || coins <= 0) {
      setFormError('Enter a whole number of rupees.');
      return;
    }
    const expiry = parseIstDatetimeLocal(expiresAt);
    if (!expiry || expiry <= Math.floor(Date.now() / 1000)) {
      setFormError('Choose an expiry in the future.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormMessage(null);
    try {
      await issueCoins({
        user_id: userId.trim(),
        amount: coins,
        expires_at: expiry,
        reason: reason.trim() || undefined,
      });
      setAmount('');
      setReason('');
      setFormMessage('Coin issue queued. It appears in the list once the grant is saved.');
      await loadIssuances();
    } catch (err) {
      setFormError(getApiErrorDetail(err, 'Failed to issue coins'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <header>
        <h1 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">Coins</h1>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
          Issue coins manually. 1 coin = ₹1.
        </p>
      </header>

      <form onSubmit={submit} className="glass-card space-y-3 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-900">Issue coins</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="coin-user-id" className="mb-1 block text-xs text-gray-600">
              User id
            </label>
            <input
              id="coin-user-id"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              disabled={submitting}
              placeholder="usr_..."
            />
          </div>
          <div>
            <label htmlFor="coin-amount" className="mb-1 block text-xs text-gray-600">
              Amount (₹)
            </label>
            <input
              id="coin-amount"
              inputMode="numeric"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={submitting}
              placeholder="100"
            />
          </div>
          <div>
            <label htmlFor="coin-expiry" className="mb-1 block text-xs text-gray-600">
              Expires (IST)
            </label>
            <input
              id="coin-expiry"
              type="datetime-local"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              disabled={submitting}
            />
          </div>
          <div>
            <label htmlFor="coin-reason" className="mb-1 block text-xs text-gray-600">
              Reason shown to the user
            </label>
            <input
              id="coin-reason"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={submitting}
              placeholder="Goodwill credit"
            />
          </div>
        </div>
        {formError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
            {formError}
          </p>
        )}
        {formMessage && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{formMessage}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Issuing…' : 'Issue coins'}
        </button>
      </form>

      <section className="glass-card overflow-hidden rounded-xl">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Your issuances</h2>
          <p className="mt-0.5 text-xs text-gray-500">Grants recorded under your admin account.</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : listError ? (
          <p className="px-4 py-6 text-sm text-red-800" role="alert">
            {listError}
          </p>
        ) : issuances.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">No coins issued yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2 font-medium">User</th>
                  <th className="px-4 py-2 font-medium">Amount</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Reason</th>
                  <th className="px-4 py-2 font-medium">Issued</th>
                  <th className="px-4 py-2 font-medium">Expires</th>
                </tr>
              </thead>
              <tbody>
                {issuances.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{row.user_name || '—'}</p>
                      <p className="text-xs text-gray-500">{row.user_phone || row.user_id}</p>
                    </td>
                    <td className="px-4 py-3">₹{row.amount}</td>
                    <td className="px-4 py-3">{row.source_type}</td>
                    <td className="px-4 py-3 text-gray-700">{row.reason || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{formatUnixSeconds(row.created_at)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatUnixSeconds(row.expires_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
