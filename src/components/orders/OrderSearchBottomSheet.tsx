'use client';
import { Fragment, useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { buildApiUrl } from '@/config';
import axiosClient from '../../../AxiosClient';
import { logger } from '@/utils/logger';
import { getApiErrorDetail } from '@/utils/apiError';
import { formatUnixSeconds } from '@/utils/datetime';
import type { SuperUserOrderDetail } from '@/types/order';
import RaiseSupportTicketForm from '@/components/support/RaiseSupportTicketForm';
import { canRaiseSupportTicketForOrder } from '@/constants/supportTicket';

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

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const url = buildApiUrl(`/v1/superuser/order/get/${encodeURIComponent(orderId)}`);
      const { data } = await axiosClient.get<SuperUserOrderDetail>(url);
      setDetail(data);
    } catch (err) {
      setLoadError(getApiErrorDetail(err, 'Failed to load order'));
      setDetail(null);
      logger.error('Order detail fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!isOpen || !orderId) {
      return;
    }
    loadOrder();
  }, [isOpen, orderId, loadOrder]);

  const hasTicket = detail?.ticket_status != null && detail.ticket_status !== '';
  const showRaiseTicketForm =
    detail != null &&
    orderId != null &&
    canRaiseSupportTicketForOrder(detail.ticket_status, detail.order_status);

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
                {detail && !loading && orderId && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-3 rounded-xl border-2 border-gray-200 bg-gray-50/90 p-4 sm:grid-cols-2">
                      <LabeledBlock label="Customer" value={detail.username} />
                      <LabeledBlock label="Phone" value={detail.user_phone_number} tabular />
                    </div>
                    <OrderMetadata d={detail} />
                    {hasTicket && detail.checkout_id ? (
                      <Link
                        href={`/support/${encodeURIComponent(detail.checkout_id)}`}
                        className="block w-full rounded-lg border border-orange-200 bg-orange-50 py-2.5 text-center text-sm font-medium text-orange-900 transition hover:bg-orange-100"
                        onClick={onClose}
                      >
                        View support ticket
                      </Link>
                    ) : showRaiseTicketForm ? (
                      <RaiseSupportTicketForm orderId={orderId} onSuccess={loadOrder} />
                    ) : null}
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
