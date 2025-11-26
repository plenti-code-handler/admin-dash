'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axiosClient from '../../../../../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';

interface CatalogueRequest {
  request_id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_type: string;
  address: string;
  request_catalogue: {
    payout: {
      tier: string;
      threshold: number;
    };
    item_types: {
      [key: string]: {
        asp: number;
        bags: {
          SMALL: number;
          MEDIUM: number;
          LARGE: number;
        };
        cuts: {
          SMALL: number;
          MEDIUM: number;
          LARGE: number;
        };
      };
    };
  };
  current_catalogue: {
    payout: {
      tier: string;
      threshold: number;
    };
    item_types: {
      [key: string]: {
        asp: number;
        bags: {
          SMALL: number;
          MEDIUM: number;
          LARGE: number;
        };
        cuts: {
          SMALL: number;
          MEDIUM: number;
          LARGE: number;
        };
      };
    };
  } | null;
}

interface ApproveResponse {
  code: number;
  message: string;
}

const SIZE_ORDER = ['SMALL', 'MEDIUM', 'LARGE'] as const;

export default function CatalogueRequestDetailPage() {
  const { request_id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<CatalogueRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = buildApiUrl('/v1/superuser/catalogue/request/get', {
          skip: 0,
          limit: 100
        });
        const response = await axiosClient.get<CatalogueRequest[]>(url);
        const foundRequest = response.data.find(r => r.request_id === request_id);
        
        if (foundRequest) {
          setRequest(foundRequest);
        } else {
          setError('Catalogue request not found');
        }
      } catch (err) {
        logger.error('Error fetching catalogue request:', err);
        setError('Failed to load catalogue request');
      } finally {
        setLoading(false);
      }
    };
    
    if (request_id) {
      fetchRequest();
    }
  }, [request_id]);

  const handleApprove = async () => {
    if (!request_id) return;

    try {
      setApproving(true);
      setApproveError(null);
      setApproveSuccess(false);

      const url = buildApiUrl('/v1/superuser/catalogue/request/approve', {
        request_id: request_id as string
      });

      const response = await axiosClient.post<ApproveResponse>(url);
      
      if (response.data.code === 200) {
        setApproveSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/vendors');
        }, 2000);
      } else {
        setApproveError(response.data.message || 'Failed to approve request');
      }
    } catch (err: any) {
      logger.error('Error approving catalogue request:', err);
      setApproveError(err.response?.data?.message || err.response?.data?.detail || 'Failed to approve request');
    } finally {
      setApproving(false);
    }
  };

  const renderCatalogueTable = (catalogue: CatalogueRequest['request_catalogue'] | null, isRequest: boolean = false) => {
    if (!catalogue || !catalogue.item_types || Object.keys(catalogue.item_types).length === 0) {
      return (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
          <p className="text-sm sm:text-base text-gray-500">
            {isRequest ? 'No catalogue data available' : 'No current catalogue available'}
          </p>
        </div>
      );
    }

    const itemTypes = Object.keys(catalogue.item_types);
    
    return (
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${isRequest ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-3 py-3 sm:px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Item Type
                  </th>
                  <th className="px-3 py-3 sm:px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    ASP
                  </th>
                  <th colSpan={3} className="px-2 py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-l-2 border-gray-300">
                    Bags
                  </th>
                  <th colSpan={3} className="px-2 py-3 sm:px-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border-l-2 border-gray-300">
                    Cuts
                  </th>
                </tr>
                <tr>
                  <th></th>
                  <th></th>
                  <th className="px-2 py-2 sm:px-4 text-xs font-medium text-gray-600">S</th>
                  <th className="px-2 py-2 sm:px-4 text-xs font-medium text-gray-600">M</th>
                  <th className="px-2 py-2 sm:px-4 text-xs font-medium text-gray-600">L</th>
                  <th className="px-2 py-2 sm:px-4 text-xs font-medium text-gray-600 border-l-2 border-gray-300">S</th>
                  <th className="px-2 py-2 sm:px-4 text-xs font-medium text-gray-600">M</th>
                  <th className="px-2 py-2 sm:px-4 text-xs font-medium text-gray-600">L</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {itemTypes.map((itemType) => {
                  const itemData = catalogue.item_types[itemType];
                  return (
                    <tr key={itemType} className={isRequest ? 'bg-indigo-50/30' : ''}>
                      <td className="px-3 py-3 sm:px-4 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                        <span className="hidden sm:inline">{itemType.replace(/_/g, ' ')}</span>
                        <span className="sm:hidden">{itemType.replace(/_/g, ' ').split(' ')[0]}</span>
                      </td>
                      <td className="px-3 py-3 sm:px-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                        ₹{itemData.asp}
                      </td>
                      <td className="px-2 py-3 sm:px-4 text-xs sm:text-sm text-gray-900 text-center border-l-2 border-gray-200 whitespace-nowrap">
                        ₹{itemData.bags.SMALL}
                      </td>
                      <td className="px-2 py-3 sm:px-4 text-xs sm:text-sm text-gray-900 text-center whitespace-nowrap">
                        ₹{itemData.bags.MEDIUM}
                      </td>
                      <td className="px-2 py-3 sm:px-4 text-xs sm:text-sm text-gray-900 text-center whitespace-nowrap">
                        ₹{itemData.bags.LARGE}
                      </td>
                      <td className="px-2 py-3 sm:px-4 text-xs sm:text-sm text-gray-900 text-center border-l-2 border-gray-200 whitespace-nowrap">
                        ₹{itemData.cuts.SMALL}
                      </td>
                      <td className="px-2 py-3 sm:px-4 text-xs sm:text-sm text-gray-900 text-center whitespace-nowrap">
                        ₹{itemData.cuts.MEDIUM}
                      </td>
                      <td className="px-2 py-3 sm:px-4 text-xs sm:text-sm text-gray-900 text-center whitespace-nowrap">
                        ₹{itemData.cuts.LARGE}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading catalogue request...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-500 text-base sm:text-lg mb-4">{error || 'Catalogue request not found'}</p>
            <button
              onClick={() => router.back()}
              className="text-indigo-600 hover:text-indigo-800 underline text-sm sm:text-base"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasCurrentCatalogue = request.current_catalogue && 
    request.current_catalogue.item_types && 
    Object.keys(request.current_catalogue.item_types).length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto mt-4 sm:mt-8 mb-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Back
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Catalogue Request</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {request.vendor_name} • {request.vendor_type}
              </p>
            </div>
            
            {/* Approve Button */}
            <button
              onClick={handleApprove}
              disabled={approving || approveSuccess}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {approving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                  <span className="text-sm sm:text-base">Approving...</span>
                </>
              ) : approveSuccess ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-sm sm:text-base">Approved!</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-sm sm:text-base">Approve Request</span>
                </>
              )}
            </button>
          </div>

          {/* Success/Error Messages */}
          {approveSuccess && (
            <div className="mt-4 rounded-md bg-green-50 p-3 sm:p-4 border border-green-200">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-green-800">Request Approved</h3>
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-green-700">
                    Catalogue updated successfully. Redirecting...
                  </div>
                </div>
              </div>
            </div>
          )}

          {approveError && (
            <div className="mt-4 rounded-md bg-red-50 p-3 sm:p-4 border border-red-200">
              <div className="flex">
                <div className="ml-0 sm:ml-3 min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-700 break-words">{approveError}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payout Information */}
        <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Payout Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">New Catalogue</h3>
              <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">
                  Tier: <span className="font-medium text-gray-900">{request.request_catalogue.payout.tier}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Threshold: <span className="font-medium text-gray-900">₹{request.request_catalogue.payout.threshold}</span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Current Catalogue</h3>
              {hasCurrentCatalogue && request.current_catalogue ? (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Tier: <span className="font-medium text-gray-900">{request.current_catalogue.payout.tier}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Threshold: <span className="font-medium text-gray-900">₹{request.current_catalogue.payout.threshold}</span>
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-xs sm:text-sm text-gray-500 italic">No current catalogue available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Catalogue Comparison */}
        <div className="space-y-4 sm:space-y-6">
          {/* Request Catalogue */}
          <div className="glass-card p-4 sm:p-6">
            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Request Catalogue</h2>
              <span className="self-start sm:self-auto px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold whitespace-nowrap">
                NEW REQUEST
              </span>
            </div>
            {renderCatalogueTable(request.request_catalogue, true)}
          </div>

          {/* Current Catalogue */}
          {hasCurrentCatalogue && (
            <div className="glass-card p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Current Catalogue</h2>
              {renderCatalogueTable(request.current_catalogue, false)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}