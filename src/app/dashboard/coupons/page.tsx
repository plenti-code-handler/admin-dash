'use client';
import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import axiosClient from '../../../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';
import CreateCouponModal from '@/components/coupons/CreateCouponModal';
import CreateCampaignModal from '@/components/coupons/CreateCampaignModal';
import UpdateCampaignModal from '@/components/coupons/UpdateCampaignModal';

interface SearchCouponResult {
  coupon_id: string;
  code: string;
  name: string;
  valid_from: number;
  valid_until: number | null;
}

interface Campaign {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
}

const PAGE_SIZE = 10;

export default function CouponsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchCouponResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Campaign states
  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');
  const [campaignResults, setCampaignResults] = useState<Campaign[]>([]);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [campaignSkip, setCampaignSkip] = useState(0);
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false);
  const [isUpdateCampaignModalOpen, setIsUpdateCampaignModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  const router = useRouter();

  // Debounced search function
  const searchCoupons = useCallback(async (query: string, offset: number = 0) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const encodedQuery = encodeURIComponent(query.trim());
      const url = buildApiUrl('/v1/superuser/coupon/search', {
        search_query: encodedQuery,
        skip: offset,
        limit: PAGE_SIZE
      });

      const response = await axiosClient.get<SearchCouponResult[]>(url);
      setSearchResults(response.data || []);
    } catch (err: any) {
      logger.error('Error searching coupons:', err);
      setError(err.response?.data?.detail || 'Failed to search coupons');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSkip(0);
      searchCoupons(searchQuery, 0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchCoupons]);

  // Handle pagination
  useEffect(() => {
    if (searchQuery.trim()) {
      searchCoupons(searchQuery, skip);
    }
  }, [skip, searchQuery, searchCoupons]);

  const handlePrevious = () => {
    setSkip((prev) => Math.max(0, prev - PAGE_SIZE));
  };

  const handleNext = () => {
    setSkip((prev) => prev + PAGE_SIZE);
  };

  const handleCouponClick = (couponId: string) => {
    router.push(`/dashboard/coupons/${couponId}`);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    // Optionally refresh search if there's a query
    if (searchQuery.trim()) {
      searchCoupons(searchQuery, skip);
    }
  };

  // Campaign search function
  const searchCampaigns = useCallback(async (query: string, offset: number = 0) => {
    if (!query.trim()) {
      setCampaignResults([]);
      setCampaignError(null);
      return;
    }

    try {
      setCampaignLoading(true);
      setCampaignError(null);

      const encodedQuery = encodeURIComponent(query.trim());
      const url = buildApiUrl('/v1/superuser/coupon/campaign/search', {
        search_query: encodedQuery,
        skip: offset,
        limit: PAGE_SIZE
      });

      const response = await axiosClient.get<Campaign[]>(url);
      setCampaignResults(response.data || []);
    } catch (err: any) {
      logger.error('Error searching campaigns:', err);
      setCampaignError(err.response?.data?.detail || 'Failed to search campaigns');
      setCampaignResults([]);
    } finally {
      setCampaignLoading(false);
    }
  }, []);

  // Debounce campaign search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setCampaignSkip(0);
      searchCampaigns(campaignSearchQuery, 0);
    }, 500);

    return () => clearTimeout(timer);
  }, [campaignSearchQuery, searchCampaigns]);

  // Handle campaign pagination
  useEffect(() => {
    if (campaignSearchQuery.trim()) {
      searchCampaigns(campaignSearchQuery, campaignSkip);
    }
  }, [campaignSkip, campaignSearchQuery, searchCampaigns]);

  const handleCampaignPrevious = () => {
    setCampaignSkip((prev) => Math.max(0, prev - PAGE_SIZE));
  };

  const handleCampaignNext = () => {
    setCampaignSkip((prev) => prev + PAGE_SIZE);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsUpdateCampaignModalOpen(true);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This will deactivate all associated coupons.')) {
      return;
    }

    try {
      const url = buildApiUrl(`/v1/superuser/coupon/campaign/delete/${campaignId}`);
      await axiosClient.delete(url);
      
      // Refresh campaign search
      if (campaignSearchQuery.trim()) {
        searchCampaigns(campaignSearchQuery, campaignSkip);
      }
    } catch (err: any) {
      logger.error('Error deleting campaign:', err);
      alert(err.response?.data?.detail || 'Failed to delete campaign');
    }
  };

  const handleCreateCampaignSuccess = () => {
    setIsCreateCampaignModalOpen(false);
    if (campaignSearchQuery.trim()) {
      searchCampaigns(campaignSearchQuery, campaignSkip);
    }
  };

  const handleUpdateCampaignSuccess = () => {
    setIsUpdateCampaignModalOpen(false);
    setSelectedCampaign(null);
    if (campaignSearchQuery.trim()) {
      searchCampaigns(campaignSearchQuery, campaignSkip);
    }
  };

  const campaignCurrentPage = Math.floor(campaignSkip / PAGE_SIZE) + 1;
  const campaignHasMoreResults = campaignResults.length === PAGE_SIZE;
  const campaignIsPreviousDisabled = campaignSkip === 0;
  const campaignIsNextDisabled = !campaignHasMoreResults;

  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;
  const hasMoreResults = searchResults.length === PAGE_SIZE;
  const isPreviousDisabled = skip === 0;
  const isNextDisabled = !hasMoreResults;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Coupon Management</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Search coupons by code</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="glass-card p-4 sm:p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search coupons by code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 sm:p-4">
            <div className="flex">
              <div className="ml-0 sm:ml-3 min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-700 break-words">{error}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {searchQuery.trim() && (
        <div className="glass-card p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-gray-600">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  {hasMoreResults && ' (showing first page)'}
                </p>
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Valid From
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                            Valid Until
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {searchResults.map((coupon) => (
                          <tr
                            key={coupon.coupon_id}
                            onClick={() => handleCouponClick(coupon.coupon_id)}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                              <span className="font-mono">{coupon.code}</span>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                              {coupon.name}
                            </td>
                            <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                              {formatDate(coupon.valid_from)}
                            </td>
                            <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                              {coupon.valid_until ? formatDate(coupon.valid_until) : 'No expiry'}
                            </td>
                            {/* Mobile view - show dates below name */}
                            <td className="px-3 py-3 text-xs text-gray-500 md:hidden">
                              <div className="space-y-1">
                                <div>From: {formatDate(coupon.valid_from)}</div>
                                {coupon.valid_until && (
                                  <div>Until: {formatDate(coupon.valid_until)}</div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Pagination */}
              {(hasMoreResults || skip > 0) && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3 mt-4">
                  <button
                    onClick={handlePrevious}
                    disabled={isPreviousDisabled}
                    className="relative inline-flex items-center rounded-md bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-xs sm:text-sm text-gray-700">
                    Page {currentPage}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    className="relative inline-flex items-center rounded-md bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <MagnifyingGlassIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">No coupons found</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Try searching with a different coupon code.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State - No Search Yet */}
      {!searchQuery.trim() && !loading && (
        <div className="glass-card p-8 sm:p-12 text-center">
          <MagnifyingGlassIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
          <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">Search for coupons</h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Enter a coupon code in the search box above to find coupons.
          </p>
        </div>
      )}

      {/* Campaign Management Section */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Campaign Management</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Search campaigns by name</p>
          </div>
          <button
            onClick={() => setIsCreateCampaignModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Create Campaign
          </button>
        </div>

        {/* Campaign Search Section */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search campaigns by name..."
            value={campaignSearchQuery}
            onChange={(e) => setCampaignSearchQuery(e.target.value)}
            className="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
          />
        </div>

        {campaignError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 sm:p-4">
            <div className="flex">
              <div className="ml-0 sm:ml-3 min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-700 break-words">{campaignError}</div>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Results Section */}
        {campaignSearchQuery.trim() && (
          <div>
            {campaignLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : campaignResults.length > 0 ? (
              <>
                <div className="mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Found {campaignResults.length} campaign{campaignResults.length !== 1 ? 's' : ''}
                    {campaignHasMoreResults && ' (showing first page)'}
                  </p>
                </div>

                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Campaign Name
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                              Created At
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                              Updated At
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {campaignResults.map((campaign) => (
                            <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                                {campaign.name}
                              </td>
                              <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                                {formatDate(campaign.created_at)}
                              </td>
                              <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                                {formatDate(campaign.updated_at)}
                              </td>
                              <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditCampaign(campaign);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                                    title="Edit campaign"
                                  >
                                    <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCampaign(campaign.id);
                                    }}
                                    className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                                    title="Delete campaign"
                                  >
                                    <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Campaign Pagination */}
                {(campaignHasMoreResults || campaignSkip > 0) && (
                  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3 mt-4">
                    <button
                      onClick={handleCampaignPrevious}
                      disabled={campaignIsPreviousDisabled}
                      className="relative inline-flex items-center rounded-md bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-xs sm:text-sm text-gray-700">
                      Page {campaignCurrentPage}
                    </span>
                    <button
                      onClick={handleCampaignNext}
                      disabled={campaignIsNextDisabled}
                      className="relative inline-flex items-center rounded-md bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <MagnifyingGlassIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">No campaigns found</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Try searching with a different campaign name.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Campaign Empty State - No Search Yet */}
        {!campaignSearchQuery.trim() && !campaignLoading && (
          <div className="text-center py-8 sm:py-12">
            <MagnifyingGlassIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">Search for campaigns</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Enter a campaign name in the search box above to find campaigns.
            </p>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      <CreateCouponModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={isCreateCampaignModalOpen}
        onClose={() => setIsCreateCampaignModalOpen(false)}
        onSuccess={handleCreateCampaignSuccess}
      />

      {/* Update Campaign Modal */}
      <UpdateCampaignModal
        isOpen={isUpdateCampaignModalOpen}
        onClose={() => {
          setIsUpdateCampaignModalOpen(false);
          setSelectedCampaign(null);
        }}
        onSuccess={handleUpdateCampaignSuccess}
        campaign={selectedCampaign}
      />
    </div>
  );
}