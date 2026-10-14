'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axiosClient from '../../../../../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';
import CataloguePricingTable, { type Catalogue } from '@/components/vendors/catalogue/CataloguePricingTable';

interface CatalogueRequest {
  request_id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_type: string;
  address: string;
  request_catalogue: Catalogue;
  current_catalogue: Catalogue | null;
}

interface ApproveResponse {
  code: number;
  message: string;
}

interface RejectResponse {
  code: number;
  message: string;
}

export default function CatalogueRequestDetailPage() {
  const { request_id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<CatalogueRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectSuccess, setRejectSuccess] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);


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
      setRejectError(null);
      setRejectSuccess(false);

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

  const handleReject = async () => {
    if (!request_id) return;

    try {
      setRejecting(true);
      setRejectError(null);
      setRejectSuccess(false);
      setApproveError(null);
      setApproveSuccess(false);

      const url = buildApiUrl('/v1/superuser/catalogue/request/reject', {
        request_id: request_id as string
      });

      const response = await axiosClient.post<RejectResponse>(url);
      
      if (response.data.code === 200) {
        setRejectSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/vendors');
        }, 2000);
      } else {
        setRejectError(response.data.message || 'Failed to reject request');
      }
    } catch (err: any) {
      logger.error('Error rejecting catalogue request:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to reject request';
      setRejectError(errorMessage);
    } finally {
      setRejecting(false);
    }
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

  const hasCurrentCatalogue = (request.current_catalogue?.pricing?.length ?? 0) > 0;

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
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Catalogue Request</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {request.vendor_name} • {request.vendor_type}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Approve Button */}
              <button
                onClick={handleApprove}
                disabled={approving || approveSuccess || rejecting || rejectSuccess}
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

              {/* Reject Button */}
              <button
                onClick={handleReject}
                disabled={rejecting || rejectSuccess || approving || approveSuccess}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                {rejecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    <span className="text-sm sm:text-base">Rejecting...</span>
                  </>
                ) : rejectSuccess ? (
                  <>
                    <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="text-sm sm:text-base">Rejected!</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="text-sm sm:text-base">Reject Request</span>
                  </>
                )}
              </button>
            </div>
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

          {rejectSuccess && (
            <div className="mt-4 rounded-md bg-green-50 p-3 sm:p-4 border border-green-200">
              <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-green-800">Request Rejected</h3>
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-green-700">
                    Catalogue request rejected successfully. Redirecting...
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

          {rejectError && (
            <div className="mt-4 rounded-md bg-red-50 p-3 sm:p-4 border border-red-200">
              <div className="flex">
                <div className="ml-0 sm:ml-3 min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-700 break-words">{rejectError}</div>
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
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">New Catalogue</h2>
              <span className="self-start sm:self-auto px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold whitespace-nowrap">
                NEW REQUEST
              </span>
            </div>
            <CataloguePricingTable
              catalogue={request.request_catalogue}
              isRequest
              currentCatalogue={request.current_catalogue}
            />
          </div>

          {/* Current Catalogue */}
          {hasCurrentCatalogue && (
            <div className="glass-card p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Current Catalogue</h2>
              <CataloguePricingTable catalogue={request.current_catalogue} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}