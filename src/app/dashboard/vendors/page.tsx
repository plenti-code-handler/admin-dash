'use client';

import VendorSearch from '@/components/vendors/search/VendorSearch';
import ParentSearch from '@/components/vendors/search/ParentSearch';
import CreateParentVendor from '@/components/vendors/CreateParentVendor';
import VendorApprovals from '@/components/vendors/approvals/VendorApprovals';
import VendorPayoutBulkUpdate from '@/components/vendors/VendorPayoutBulkUpdate';

export default function VendorsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <header>
        <h1 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">Vendors</h1>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
          Find a vendor or parent brand, create a parent, review approvals, or update payouts.
        </p>
      </header>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div className="grid gap-4">
          <VendorSearch />
          <ParentSearch />
        </div>
        <div className="grid items-start gap-4 lg:grid-cols-2 xl:grid-cols-1">
          <CreateParentVendor />
          <VendorApprovals />
          <VendorPayoutBulkUpdate />
        </div>
      </div>
    </div>
  );
}
