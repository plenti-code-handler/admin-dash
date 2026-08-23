'use client';
import { MapPinIcon, TicketIcon } from '@heroicons/react/24/outline';
import Can from '@/components/common/Can';
import ApprovalListState from './ApprovalListState';
import RequestPagination from './RequestPagination';
import { APPROVAL_PAGE_SIZE, type DineinCouponRequest } from './types';

type Props = {
  requests: DineinCouponRequest[];
  loading: boolean;
  error: string | null;
  skip: number;
  verifyingId: string | null;
  permissions: string[];
  onPrevious: () => void;
  onNext: () => void;
  onVerify: (couponId: string, approved: boolean) => void;
};

export default function DineinCouponRequestList({
  requests,
  loading,
  error,
  skip,
  verifyingId,
  permissions,
  onPrevious,
  onNext,
  onVerify,
}: Props) {
  return (
    <ApprovalListState
      loading={loading}
      error={error}
      empty={requests.length === 0}
      emptyTitle="No dine-in coupon requests"
      emptyDescription="There are no pending partner dine-in coupons at the moment."
      EmptyIcon={TicketIcon}
    >
      <div className="space-y-3">
        {requests.map((request) => {
          const busy = verifyingId === request.coupon_id;
          return (
            <div
              key={request.coupon_id}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {request.vendor_name || 'Vendor'}
                  </p>
                  <p className="mt-1 text-sm text-gray-700">{request.description}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-inset ring-amber-200">
                  Pending
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                {request.service ? <span>{request.service}</span> : null}
                {request.address_url ? (
                  <a
                    href={request.address_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MapPinIcon className="h-3.5 w-3.5" />
                    {request.site}
                  </a>
                ) : request.site ? (
                  <span>{request.site}</span>
                ) : null}
              </div>
              <Can permissions={permissions} permission="dinein_coupon:approve">
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onVerify(request.coupon_id, true)}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {busy ? 'Saving…' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onVerify(request.coupon_id, false)}
                    className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </Can>
            </div>
          );
        })}
      </div>
      <RequestPagination
        skip={skip}
        pageSize={APPROVAL_PAGE_SIZE}
        resultCount={requests.length}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </ApprovalListState>
  );
}
