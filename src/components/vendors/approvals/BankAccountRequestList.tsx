'use client';
import { CreditCardIcon, MapPinIcon } from '@heroicons/react/24/outline';
import ApprovalListState from './ApprovalListState';
import RequestPagination from './RequestPagination';
import { APPROVAL_PAGE_SIZE, type BankAccountDetail } from './types';

type Props = {
  accounts: BankAccountDetail[];
  loading: boolean;
  error: string | null;
  skip: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (vendorId: string) => void;
};

function statusClass(status: string) {
  if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700';
  if (status === 'APPROVED' || status === 'ACTIVE') return 'bg-green-100 text-green-700';
  if (status === 'REJECTED') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
}

export default function BankAccountRequestList({
  accounts,
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
      empty={accounts.length === 0}
      emptyTitle="No bank account details"
      emptyDescription="There are no bank account details available at the moment."
      EmptyIcon={CreditCardIcon}
    >
      <div className="divide-y divide-gray-100 overflow-hidden rounded-xl ring-1 ring-gray-200">
        {accounts.map((account) => (
          <button
            key={account.vendor_id}
            type="button"
            onClick={() => onSelect(account.vendor_id)}
            className="flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-gray-50"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{account.vendor_name}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass(account.status)}`}>
                {account.status}
              </span>
            </div>
            {account.address ? (
              <div className="flex items-center text-xs text-gray-500">
                <MapPinIcon className="mr-1.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="truncate">{account.address}</span>
              </div>
            ) : null}
          </button>
        ))}
      </div>
      <RequestPagination
        skip={skip}
        pageSize={APPROVAL_PAGE_SIZE}
        resultCount={accounts.length}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </ApprovalListState>
  );
}
