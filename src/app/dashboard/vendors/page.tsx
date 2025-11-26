'use client';
import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, DocumentTextIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import axiosClient from '../../../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';

interface SearchVendorResult {
  vendor_id: string;
  vendor_name: string;
  address: string;
}

interface CatalogueRequest {
  request_id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_type: string;
  address: string;
  request_catalogue: any;
  current_catalogue: any;
}

interface BankAccountDetail {
  vendor_id: string;
  vendor_name: string;
  email: string;
  phone_number: string;
  address: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  status: string;
}

const PAGE_SIZE = 10;

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchVendorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  
  // Catalogue requests state
  const [showCatalogueRequests, setShowCatalogueRequests] = useState(false);
  const [catalogueRequests, setCatalogueRequests] = useState<CatalogueRequest[]>([]);
  const [catalogueLoading, setCatalogueLoading] = useState(false);
  const [catalogueError, setCatalogueError] = useState<string | null>(null);
  const [catalogueSkip, setCatalogueSkip] = useState(0);
  
  // Bank account details state
  const [showBankAccounts, setShowBankAccounts] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccountDetail[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [bankSkip, setBankSkip] = useState(0);
  
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

  // Fetch catalogue requests
  const fetchCatalogueRequests = useCallback(async (offset: number = 0) => {
    try {
      setCatalogueLoading(true);
      setCatalogueError(null);

      const url = buildApiUrl('/v1/superuser/catalogue/request/get', {
        skip: offset,
        limit: PAGE_SIZE
      });

      const response = await axiosClient.get<CatalogueRequest[]>(url);
      setCatalogueRequests(response.data || []);
    } catch (err: any) {
      logger.error('Error fetching catalogue requests:', err);
      setCatalogueError(err.response?.data?.detail || 'Failed to fetch catalogue requests');
      setCatalogueRequests([]);
    } finally {
      setCatalogueLoading(false);
    }
  }, []);

  // Fetch bank account details
  const fetchBankAccounts = useCallback(async (offset: number = 0) => {
    try {
      setBankLoading(true);
      setBankError(null);

      const url = buildApiUrl('/v1/superuser/vendor/account-details/get', {
        skip: offset,
        limit: PAGE_SIZE
      });

      const response = await axiosClient.post<BankAccountDetail[]>(url);
      setBankAccounts(response.data || []);
    } catch (err: any) {
      logger.error('Error fetching bank account details:', err);
      setBankError(err.response?.data?.detail || 'Failed to fetch bank account details');
      setBankAccounts([]);
    } finally {
      setBankLoading(false);
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

  // Fetch catalogue requests when shown
  useEffect(() => {
    if (showCatalogueRequests) {
      fetchCatalogueRequests(catalogueSkip);
    }
  }, [showCatalogueRequests, catalogueSkip, fetchCatalogueRequests]);

  // Fetch bank accounts when shown
  useEffect(() => {
    if (showBankAccounts) {
      fetchBankAccounts(bankSkip);
    }
  }, [showBankAccounts, bankSkip, fetchBankAccounts]);

  const handlePrevious = () => {
    setSkip((prev) => Math.max(0, prev - PAGE_SIZE));
  };

  const handleNext = () => {
    setSkip((prev) => prev + PAGE_SIZE);
  };

  const handleCataloguePrevious = () => {
    setCatalogueSkip((prev) => Math.max(0, prev - PAGE_SIZE));
  };

  const handleCatalogueNext = () => {
    setCatalogueSkip((prev) => prev + PAGE_SIZE);
  };

  const handleBankPrevious = () => {
    setBankSkip((prev) => Math.max(0, prev - PAGE_SIZE));
  };

  const handleBankNext = () => {
    setBankSkip((prev) => prev + PAGE_SIZE);
  };

  const handleVendorClick = (vendorId: string) => {
    router.push(`/vendors/${vendorId}`);
  };

  const handleCatalogueRequestClick = (requestId: string) => {
    router.push(`/dashboard/vendors/catalogue-requests/${requestId}`);
  };

  const handleBankAccountClick = (vendorId: string) => {
    router.push(`/dashboard/vendors/bank-accounts/${vendorId}`);
  };

  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;
  const hasMoreResults = searchResults.length === PAGE_SIZE;
  const isPreviousDisabled = skip === 0;
  const isNextDisabled = !hasMoreResults;

  const catalogueCurrentPage = Math.floor(catalogueSkip / PAGE_SIZE) + 1;
  const hasMoreCatalogueResults = catalogueRequests.length === PAGE_SIZE;
  const isCataloguePreviousDisabled = catalogueSkip === 0;
  const isCatalogueNextDisabled = !hasMoreCatalogueResults;

  const bankCurrentPage = Math.floor(bankSkip / PAGE_SIZE) + 1;
  const hasMoreBankResults = bankAccounts.length === PAGE_SIZE;
  const isBankPreviousDisabled = bankSkip === 0;
  const isBankNextDisabled = !hasMoreBankResults;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="glass-card p-4 sm:p-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Vendor Search</h1>
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

      {/* Catalogue Requests Section */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
          <div className="flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Catalogue Requests</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">View and manage vendor catalogue update requests</p>
          </div>
          <button
            onClick={() => {
              setShowCatalogueRequests(!showCatalogueRequests);
              if (!showCatalogueRequests) {
                setCatalogueSkip(0);
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {showCatalogueRequests ? 'Hide' : 'View'} Catalogue Requests
          </button>
        </div>

        {showCatalogueRequests && (
          <>
            {catalogueLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : catalogueError ? (
              <div className="rounded-md bg-red-50 p-3 sm:p-4">
                <div className="flex">
                  <div className="ml-0 sm:ml-3 min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-700 break-words">{catalogueError}</div>
                  </div>
                </div>
              </div>
            ) : catalogueRequests.length > 0 ? (
              <>
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
                              Vendor Type
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                              Address
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {catalogueRequests.map((request) => (
                            <tr
                              key={request.request_id}
                              onClick={() => handleCatalogueRequestClick(request.request_id)}
                              className="hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                                {request.vendor_name}
                                {/* Mobile view - show type badge below name */}
                                <div className="sm:hidden mt-1">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    request.vendor_type === 'RESTAURANT' ? 'bg-red-100 text-red-700' :
                                    request.vendor_type === 'BAKERY' ? 'bg-amber-100 text-amber-700' :
                                    request.vendor_type === 'SUPERMARKET' ? 'bg-emerald-100 text-emerald-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {request.vendor_type}
                                  </span>
                                </div>
                                {/* Mobile view - show address below name */}
                                <div className="md:hidden sm:block mt-1">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <MapPinIcon className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
                                    <span className="truncate">{request.address}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  request.vendor_type === 'RESTAURANT' ? 'bg-red-100 text-red-700' :
                                  request.vendor_type === 'BAKERY' ? 'bg-amber-100 text-amber-700' :
                                  request.vendor_type === 'SUPERMARKET' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {request.vendor_type}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                                <div className="flex items-center">
                                  <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 flex-shrink-0" />
                                  <span className="truncate max-w-xs lg:max-w-md">{request.address}</span>
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
                {(hasMoreCatalogueResults || catalogueSkip > 0) && (
                  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3 mt-4">
                    <button
                      onClick={handleCataloguePrevious}
                      disabled={isCataloguePreviousDisabled}
                      className="relative inline-flex items-center rounded-md bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-xs sm:text-sm text-gray-700">
                      Page {catalogueCurrentPage}
                    </span>
                    <button
                      onClick={handleCatalogueNext}
                      disabled={isCatalogueNextDisabled}
                      className="relative inline-flex items-center rounded-md bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <DocumentTextIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">No catalogue requests</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  There are no pending catalogue requests at the moment.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bank Account Details Section */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
          <div className="flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Bank Account Details</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">View and manage vendor bank account information</p>
          </div>
          <button
            onClick={() => {
              setShowBankAccounts(!showBankAccounts);
              if (!showBankAccounts) {
                setBankSkip(0);
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <CreditCardIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {showBankAccounts ? 'Hide' : 'View'} Bank Account Details
          </button>
        </div>

        {showBankAccounts && (
          <>
            {bankLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : bankError ? (
              <div className="rounded-md bg-red-50 p-3 sm:p-4">
                <div className="flex">
                  <div className="ml-0 sm:ml-3 min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-700 break-words">{bankError}</div>
                  </div>
                </div>
              </div>
            ) : bankAccounts.length > 0 ? (
              <>
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
                              Status
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                              Address
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {bankAccounts.map((account) => (
                            <tr
                              key={account.vendor_id}
                              onClick={() => handleBankAccountClick(account.vendor_id)}
                              className="hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                                {account.vendor_name}
                                {/* Mobile view - show status badge below name */}
                                <div className="sm:hidden mt-1">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    account.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    account.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                    account.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {account.status}
                                  </span>
                                </div>
                                {/* Mobile view - show address below name */}
                                <div className="md:hidden sm:block mt-1">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <MapPinIcon className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
                                    <span className="truncate">{account.address}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  account.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                  account.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                  account.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {account.status}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                                <div className="flex items-center">
                                  <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 flex-shrink-0" />
                                  <span className="truncate max-w-xs lg:max-w-md">{account.address}</span>
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
                {(hasMoreBankResults || bankSkip > 0) && (
                  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3 mt-4">
                    <button
                      onClick={handleBankPrevious}
                      disabled={isBankPreviousDisabled}
                      className="relative inline-flex items-center rounded-md bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-xs sm:text-sm text-gray-700">
                      Page {bankCurrentPage}
                    </span>
                    <button
                      onClick={handleBankNext}
                      disabled={isBankNextDisabled}
                      className="relative inline-flex items-center rounded-md bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <CreditCardIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900">No bank account details</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  There are no bank account details available at the moment.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}