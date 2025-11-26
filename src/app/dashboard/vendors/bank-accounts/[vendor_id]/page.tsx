'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axiosClient from '../../../../../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';

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

interface ApproveResponse {
  message: string;
  status: string;
}

export default function BankAccountDetailPage() {
  const { vendor_id } = useParams();
  const router = useRouter();
  const [account, setAccount] = useState<BankAccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = buildApiUrl('/v1/superuser/vendor/account-details/get');
        const response = await axiosClient.post<BankAccountDetail[]>(url);
        const foundAccount = response.data.find(a => a.vendor_id === vendor_id);
        
        if (foundAccount) {
          setAccount(foundAccount);
        } else {
          setError('Bank account details not found');
        }
      } catch (err) {
        logger.error('Error fetching bank account details:', err);
        setError('Failed to load bank account details');
      } finally {
        setLoading(false);
      }
    };
    
    if (vendor_id) {
      fetchAccount();
    }
  }, [vendor_id]);

  const handleApprove = async () => {
    if (!vendor_id) return;

    try {
      setProcessing(true);
      setProcessError(null);
      setSuccess(false);
      setActionType('approve');

      const url = buildApiUrl('/v1/superuser/vendor/account-details/approve', {
        vendor_id: vendor_id as string,
        to_status: 'ACTIVE'
      });

      const response = await axiosClient.post<ApproveResponse>(url);
      
      if (response.data.message) {
        setSuccess(true);
        setAccount(prev => prev ? { ...prev, status: 'ACTIVE' } : null);
        setTimeout(() => {
          router.push('/dashboard/vendors');
        }, 2000);
      } else {
        setProcessError('Failed to approve account details');
      }
    } catch (err: any) {
      logger.error('Error approving bank account:', err);
      setProcessError(err.response?.data?.message || err.response?.data?.detail || 'Failed to approve account details');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!vendor_id) return;

    try {
      setProcessing(true);
      setProcessError(null);
      setSuccess(false);
      setActionType('reject');

      const url = buildApiUrl('/v1/superuser/vendor/account-details/approve', {
        vendor_id: vendor_id as string,
        to_status: 'REJECTED'
      });

      const response = await axiosClient.post<ApproveResponse>(url);
      
      if (response.data.message) {
        setSuccess(true);
        setAccount(prev => prev ? { ...prev, status: 'REJECTED' } : null);
        setTimeout(() => {
          router.push('/dashboard/vendors');
        }, 2000);
      } else {
        setProcessError('Failed to reject account details');
      }
    } catch (err: any) {
      logger.error('Error rejecting bank account:', err);
      setProcessError(err.response?.data?.message || err.response?.data?.detail || 'Failed to reject account details');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading bank account details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-500 text-base sm:text-lg mb-4">{error || 'Bank account details not found'}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto mt-4 sm:mt-8 mb-8 px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Bank Account Details</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {account.vendor_name}
              </p>
            </div>
            
            {/* Action Buttons - Only show if status is PENDING */}
            {account.status === 'PENDING' && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={handleApprove}
                  disabled={processing || success}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  {processing && actionType === 'approve' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      <span className="text-sm sm:text-base">Approving...</span>
                    </>
                  ) : success && actionType === 'approve' ? (
                    <>
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="text-sm sm:text-base">Approved!</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="text-sm sm:text-base">Approve</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || success}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  {processing && actionType === 'reject' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      <span className="text-sm sm:text-base">Rejecting...</span>
                    </>
                  ) : success && actionType === 'reject' ? (
                    <>
                      <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="text-sm sm:text-base">Rejected!</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="text-sm sm:text-base">Reject</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mt-4 rounded-md bg-green-50 p-3 sm:p-4 border border-green-200">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-green-800">
                    {actionType === 'approve' ? 'Account Approved' : 'Account Rejected'}
                  </h3>
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-green-700">
                    {actionType === 'approve' 
                      ? 'Bank account details approved successfully. Redirecting...'
                      : 'Bank account details rejected. Redirecting...'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {processError && (
            <div className="mt-4 rounded-md bg-red-50 p-3 sm:p-4 border border-red-200">
              <div className="flex">
                <div className="ml-0 sm:ml-3 min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-700 break-words">{processError}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vendor Information */}
        <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Vendor Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-500">Vendor Name</label>
              <p className="mt-1 text-sm sm:text-base text-gray-900">{account.vendor_name}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-sm sm:text-base text-gray-900">{account.email}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-500">Phone Number</label>
              <p className="mt-1 text-sm sm:text-base text-gray-900">{account.phone_number}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-500">Status</label>
              <p className="mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(account.status)}`}>
                  {account.status}
                </span>
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs sm:text-sm font-medium text-gray-500">Address</label>
              <p className="mt-1 text-sm sm:text-base text-gray-900">{account.address}</p>
            </div>
          </div>
        </div>

        {/* Bank Account Information */}
        <div className="glass-card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Bank Account Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-500">Account Holder Name</label>
              <p className="mt-1 text-sm sm:text-base text-gray-900 font-medium">{account.account_holder_name}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-500">Account Number</label>
              <p className="mt-1 text-sm sm:text-base text-gray-900 font-mono">{account.account_number}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-500">IFSC Code</label>
              <p className="mt-1 text-sm sm:text-base text-gray-900 font-mono">{account.ifsc_code}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-500">Vendor ID</label>
              <p className="mt-1 text-sm sm:text-base text-gray-900 font-mono">{account.vendor_id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
