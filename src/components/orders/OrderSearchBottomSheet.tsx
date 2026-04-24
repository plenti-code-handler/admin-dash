'use client';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { buildApiUrl } from '@/config';
import axiosClient from '../../../AxiosClient';
import { logger } from '@/utils/logger';
import { getApiErrorDetail } from '@/utils/apiError';
import { formatUnixSeconds } from '@/utils/datetime';
import type { SuperUserOrderDetail } from '@/types/order';

const REFUND_MULTIPLIERS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
] as const;

const L = 'text-xs font-medium uppercase tracking-wide text-gray-500';
const V = 'mt-0.5 text-base font-semibold text-gray-900';
const V_MUTED = 'mt-0.5 text-sm font-medium text-gray-900';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
};

function LabeledBlock({
  label,
  value,
  tabular,
}: {
  label: string;
  value: string;
  tabular?: boolean;
}) {
  return (
    <div>
      <p className={L}>{label}</p>
      <p className={`${V} ${tabular ? 'tabular-nums' : ''}`}>{value || '—'}</p>
    </div>
  );
}

function OrderMetadata({ d }: { d: SuperUserOrderDetail }) {
  const rows: { label: string; value: ReactNode; wide?: boolean; muted?: boolean }[] = [
    { label: 'Order code', value: d.order_code },
    {
      label: 'Order ID',
      value: <span className="break-all font-mono text-xs">{d.order_id}</span>,
    },
    { label: 'Vendor', value: d.vendor_name },
    { label: 'Amount', value: `₹${d.transaction_amount}` },
    { label: 'Order status', value: d.order_status },
    { label: 'Payment status', value: d.payment_status },
    {
      label: 'Window',
      value: `${formatUnixSeconds(d.window_start_time)} — ${formatUnixSeconds(d.window_end_time)}`,
      wide: true,
      muted: true,
    },
    { label: 'Created', value: formatUnixSeconds(d.created_at), wide: true, muted: true },
  ];

  return (
    <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
      {rows.map(({ label: lb, value, wide, muted }) => (
        <div key={lb} className={wide ? 'sm:col-span-2' : undefined}>
          <dt className={L}>{lb}</dt>
          <dd className={muted ? V_MUTED : V}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function OrderSearchBottomSheet({ isOpen, onClose, orderId }: Props) {
  const [detail, setDetail] = useState<SuperUserOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [reason, setReason] = useState('');
  const [multiplier, setMultiplier] = useState<number | null>(null);
  const [refundBusy, setRefundBusy] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !orderId) {
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      setDetail(null);
      setReason('');
      setMultiplier(null);
      setRefundError(null);
      try {
        const url = buildApiUrl(`/v1/superuser/order/get/${encodeURIComponent(orderId)}`);
        const { data } = await axiosClient.get<SuperUserOrderDetail>(url);
        if (!cancelled) {
          setDetail(data);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(getApiErrorDetail(err, 'Failed to load order'));
        }
        logger.error('Order detail fetch failed', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, orderId]);

  const submitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || multiplier === null) {
      setRefundError('Select a refund percentage.');
      return;
    }
    const text = reason.trim();
    if (!text) {
      setRefundError('Enter a refund reason.');
      return;
    }
    setRefundBusy(true);
    setRefundError(null);
    try {
      const url = buildApiUrl(`/v1/superuser/order/refund/${encodeURIComponent(orderId)}`);
      await axiosClient.post(url, { refund_reason: text, refund_multiplier: multiplier });
      onClose();
    } catch (err) {
      setRefundError(getApiErrorDetail(err, 'Refund failed'));
      logger.error('Refund failed', err);
    } finally {
      setRefundBusy(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden p-0 sm:p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="translate-y-full opacity-0"
            enterTo="translate-y-0 opacity-100"
            leave="ease-in duration-200"
            leaveFrom="translate-y-0 opacity-100"
            leaveTo="translate-y-full opacity-0"
          >
            <Dialog.Panel className="flex max-h-[min(90vh,900px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white text-left shadow-xl sm:max-h-[85vh] sm:rounded-2xl">
              <header className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
                <Dialog.Title className="text-lg font-semibold text-gray-900">Order details</Dialog.Title>
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                {loading && (
                  <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  </div>
                )}
                {loadError && !loading && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                    {loadError}
                  </p>
                )}
                {detail && !loading && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-3 rounded-xl border-2 border-gray-200 bg-gray-50/90 p-4 sm:grid-cols-2">
                      <LabeledBlock label="Customer" value={detail.username} />
                      <LabeledBlock label="Phone" value={detail.user_phone_number} tabular />
                    </div>
                    <OrderMetadata d={detail} />
                    <form onSubmit={submitRefund} className="space-y-4 border-t border-gray-200 pt-6">
                      <h3 className="text-base font-medium text-gray-900">Initiate refund</h3>
                      <div>
                        <label htmlFor="refund-reason" className="mb-1 block text-sm text-gray-700">
                          Refund reason
                        </label>
                        <textarea
                          id="refund-reason"
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Describe why this refund is being issued"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          disabled={refundBusy}
                        />
                      </div>
                      <div>
                        <span className="mb-2 block text-sm text-gray-700">Refund amount</span>
                        <div className="flex flex-wrap gap-2">
                          {REFUND_MULTIPLIERS.map(({ label: lb, value }) => (
                            <button
                              key={value}
                              type="button"
                              disabled={refundBusy}
                              onClick={() => setMultiplier(value)}
                              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                multiplier === value
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              } disabled:opacity-50`}
                            >
                              {lb}
                            </button>
                          ))}
                        </div>
                      </div>
                      {refundError && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                          {refundError}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={refundBusy}
                        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {refundBusy ? 'Processing…' : 'Submit refund'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
