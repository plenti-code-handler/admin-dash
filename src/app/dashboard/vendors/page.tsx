'use client';
import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import axiosClient from '../../../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';
import VendorPayoutBulkUpdate from '@/components/vendors/VendorPayoutBulkUpdate';
import VendorApprovals from '@/components/vendors/approvals/VendorApprovals';

interface SearchVendorResult {
  vendor_id: string;
  vendor_name: string;
  address: string;
}

const PAGE_SIZE = 10;

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchVendorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const router = useRouter();

  // Debounced search function
  const searchVendors = useCallback(async (query: string, offset: number = 0) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const encodedQuery = encodeURIComponent(query.trim());
      const url = buildApiUrl(`/v1/superuser/vendor/search/${encodedQuery}`, {
        skip: offset,
        limit: PAGE_SIZE
      });

      const response = await axiosClient.get<SearchVendorResult[]>(url);
      setSearchResults(response.data || []);
    } catch (err: any) {
      logger.error('Error searching vendors:', err);
      setError(err.response?.data?.detail || 'Failed to search vendors');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSkip(0);
      searchVendors(searchQuery, 0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchVendors]);

  // Handle pagination
  useEffect(() => {
    if (searchQuery.trim()) {
      searchVendors(searchQuery, skip);
    }
  }, [skip, searchQuery, searchVendors]);

  const handlePrevious = () => {
    setSkip((prev) => Math.max(0, prev - PAGE_SIZE));
  };

  const handleNext = () => {
    setSkip((prev) => prev + PAGE_SIZE);
  };

  const handleVendorClick = (vendorId: string) => {
    router.push(`/vendors/${vendorId}`);
  };

  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;
  const hasMoreResults = searchResults.length === PAGE_SIZE;
  const isPreviousDisabled = skip === 0;
  const isNextDisabled = !hasMoreResults;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="glass-card p-4 sm:p-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Vendor Management</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Search vendors by name</p>
      </div>

      {/* Search Section */}
      <div className="glass-card p-4 sm:p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search vendors by name..."
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
                            Vendor Name
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Address
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Vendor ID
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {searchResults.map((vendor) => (
                          <tr
                            key={vendor.vendor_id}
                            onClick={() => handleVendorClick(vendor.vendor_id)}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                              {vendor.vendor_name}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                              <div className="flex items-center">
                                <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="truncate max-w-xs lg:max-w-md">{vendor.address}</span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 font-mono hidden md:table-cell">
                              {vendor.vendor_id}
                            </td>
                            {/* Mobile view - show address in vendor name row */}
                            <td className="px-3 py-3 text-xs text-gray-500 sm:hidden">
                              <div className="flex items-center mt-1">
                                <MapPinIcon className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
                                <span className="truncate">{vendor.address}</span>
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
              <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">No vendors found</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Try searching with a different vendor name.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State - No Search Yet */}
      {!searchQuery.trim() && !loading && (
        <div className="glass-card p-8 sm:p-12 text-center">
          <MagnifyingGlassIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
          <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">Search for vendors</h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Enter a vendor name in the search box above to find vendors.
          </p>
        </div>
      )}

      <VendorApprovals />

      <VendorPayoutBulkUpdate />
    </div>
  );
}
