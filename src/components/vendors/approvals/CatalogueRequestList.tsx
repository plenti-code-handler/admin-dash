'use client';
import { DocumentTextIcon, MapPinIcon } from '@heroicons/react/24/outline';
import ApprovalListState from './ApprovalListState';
import RequestPagination from './RequestPagination';
import { APPROVAL_PAGE_SIZE, type CatalogueRequest } from './types';

type Props = {
  requests: CatalogueRequest[];
  loading: boolean;
  error: string | null;
  skip: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (requestId: string) => void;
};

function vendorTypeClass(vendorType: string) {
  if (vendorType === 'RESTAURANT') return 'bg-red-100 text-red-700';
  if (vendorType === 'BAKERY') return 'bg-amber-100 text-amber-700';
  if (vendorType === 'SUPERMARKET') return 'bg-emerald-100 text-emerald-700';
  return 'bg-gray-100 text-gray-700';
}

export default function CatalogueRequestList({
  requests,
  loading,
  error,
  skip,
  onPrevious,
  onNext,
  onSelect,
}: Props) {
  return (
    <ApprovalListState
      loading={loading}
      error={error}
      empty={requests.length === 0}
      emptyTitle="No catalogue requests"
      emptyDescription="There are no pending catalogue requests at the moment."
      EmptyIcon={DocumentTextIcon}
    >
      <div className="divide-y divide-gray-100 overflow-hidden rounded-xl ring-1 ring-gray-200">
        {requests.map((request) => (
          <button
            key={request.request_id}
            type="button"
            onClick={() => onSelect(request.request_id)}
            className="flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-gray-50"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{request.vendor_name}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${vendorTypeClass(request.vendor_type)}`}>
                {request.vendor_type}
              </span>
            </div>
            {request.address ? (
              <div className="flex items-center text-xs text-gray-500">
                <MapPinIcon className="mr-1.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="truncate">{request.address}</span>
              </div>
            ) : null}
          </button>
        ))}
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
