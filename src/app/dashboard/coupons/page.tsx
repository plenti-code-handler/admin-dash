'use client';

import CampaignSearch from '@/components/coupons/search/CampaignSearch';
import CouponSearch from '@/components/coupons/search/CouponSearch';

export default function CouponsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <header>
        <h1 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">Coupons</h1>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
          Search coupon codes and manage campaigns.
        </p>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <CouponSearch />
        <CampaignSearch />
      </div>
    </div>
  );
}
