'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import axiosClient from '../../../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';
import { getApiErrorDetail } from '@/utils/apiError';
import { usePagedQuerySearch } from '@/hooks/usePagedQuerySearch';
import CreateCampaignModal from '@/components/coupons/CreateCampaignModal';
import UpdateCampaignModal from '@/components/coupons/UpdateCampaignModal';
import { SearchPager, SearchSkeleton } from './SearchChrome';
import { formatCouponDate, type Campaign } from './types';

export default function CampaignSearch() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const search = usePagedQuerySearch<Campaign>(
    '/v1/superuser/coupon/campaign/search',
    'Failed to search campaigns'
  );
  const busy = search.loading || search.pending;
  const showResults = Boolean(search.query.trim());
  const showEmpty =
    showResults && !busy && !search.error && search.results.length === 0 && Boolean(search.activeQuery);

  const deleteCampaign = async (campaignId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this campaign? This will deactivate all associated coupons.'
      )
    ) {
      return;
    }

    try {
      await axiosClient.delete(buildApiUrl(`/v1/superuser/coupon/campaign/delete/${campaignId}`));
      search.reload();
    } catch (err) {
      logger.error('Error deleting campaign:', err);
      alert(getApiErrorDetail(err, 'Failed to delete campaign'));
    }
  };

  return (
    <section className="glass-card overflow-hidden rounded-xl">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-3 sm:px-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">Campaigns</h2>
          <p className="truncate text-xs text-gray-500">Search by name</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {busy && <span className="text-xs font-medium text-indigo-600">Searching…</span>}
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Create
          </button>
        </div>
      </div>

      <div className="px-3 py-3 sm:px-4">
        <label htmlFor="campaign-search" className="sr-only">
          Search campaigns by name
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="campaign-search"
            type="search"
            value={search.query}
            onChange={(e) => search.setQuery(e.target.value)}
            placeholder="Campaign name"
            autoComplete="off"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        {search.error && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
            {search.error}
          </p>
        )}
      </div>

      {!showResults && (
        <p className="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-500">
          Type a campaign name to edit or delete it.
        </p>
      )}

      {showResults && busy && search.results.length === 0 && !search.error && <SearchSkeleton />}

      {search.results.length > 0 && (
        <>
          <ul
            className={`divide-y divide-gray-100 border-t border-gray-100 ${busy ? 'opacity-60' : ''}`}
            aria-busy={busy}
          >
            {search.results.map((campaign) => (
              <li key={campaign.id} className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[11px] font-semibold text-indigo-700">
                  {campaign.name.trim().slice(0, 1).toUpperCase() || '?'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-900">{campaign.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-gray-500">
                    Created {formatCouponDate(campaign.created_at)}
                    {' · '}
                    Updated {formatCouponDate(campaign.updated_at)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelected(campaign)}
                  className="rounded-md p-1.5 text-indigo-600 hover:bg-indigo-50"
                  aria-label={`Edit ${campaign.name}`}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteCampaign(campaign.id)}
                  className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                  aria-label={`Delete ${campaign.name}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <SearchPager
            page={search.page}
            canGoBack={search.canGoBack}
            hasMore={search.hasMore}
            busy={busy}
            onPrevious={search.goPrevious}
            onNext={search.goNext}
          />
        </>
      )}

      {showEmpty && (
        <p className="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-500">
          No campaigns found for “{search.activeQuery}”.
        </p>
      )}

      <CreateCampaignModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          search.reload();
        }}
      />
      <UpdateCampaignModal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        onSuccess={() => {
          setSelected(null);
          search.reload();
        }}
        campaign={selected}
      />
    </section>
  );
}
