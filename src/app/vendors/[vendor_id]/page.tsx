'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { logger } from '@/utils/logger';
import { buildApiUrl } from '@/config';
import { ArrowLeftIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Sidebar from '@/components/layout/Sidebar';
import axiosClient from '../../../../AxiosClient';

interface VendorDetails {
  vendor_id: string;
  vendor_name: string;
  email: string;
  phone_number: string;
  vendor_type: string;
  gst_number: string | null;
  fssai_number: string | null;
  pan_number: string | null;
  address_url: string;
  address: string;
  is_active: boolean;
  is_online: boolean;
  account_approved: boolean;
  mou_signed: boolean;
  created_at: number;
  logo_url: string | null;
  backcover_url: string | null;
}

export default function VendorDetailsPage() {
  const { vendor_id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [approving, setApproving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get<VendorDetails>(`/v1/superuser/vendor/get/${vendor_id}`);
        setVendor(data);
      } catch (err) {
        logger.error('Error fetching vendor details:', err);
        setError('Failed to load vendor details');
      } finally {
        setLoading(false);
      }
    };
    if (vendor_id) fetchVendor();
  }, [vendor_id, refreshKey]);

  // Approve vendor handler
  const handleApproveVendor = async () => {
    if (!vendor) return;
    
    try {
      setApproving(true);
      const url = buildApiUrl('/v1/superuser/vendor/account/true', {
        vendor_id,
      });
      await axiosClient.patch(url);
      setRefreshKey((k) => k + 1);
      alert('Vendor approved successfully');
    } catch (err) {
      logger.error('Error approving vendor:', err);
      alert('Failed to approve vendor');
    } finally {
      setApproving(false);
    }
  };

  // Deactivate vendor handler
  const handleDeactivateVendor = async () => {
    if (!vendor) return;
    
    try {
      setDeactivating(true);
      const url = buildApiUrl('/v1/superuser/vendor/account/false', {
        vendor_id,
      });
      await axiosClient.patch(url);
      setRefreshKey((k) => k + 1);
      alert('Vendor deactivated successfully');
    } catch (err) {
      logger.error('Error deactivating vendor:', err);
      alert('Failed to deactivate vendor');
    } finally {
      setDeactivating(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading vendor details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-500 text-base sm:text-lg mb-4">{error || 'No vendor found'}</p>
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 relative max-w-4xl mx-auto mt-4 sm:mt-8 mb-8 px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 bg-[#5F22D9] hover:bg-[#4b1aa8] text-white rounded-full p-1.5 sm:p-2 shadow transition focus:outline-none focus:ring-2 focus:ring-[#5F22D9]"
        >
          <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Backcover image */}
        <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-br from-gray-200 to-gray-300">
          {vendor.backcover_url ? (
            <img
              src={vendor.backcover_url}
              alt="Backcover"
              className="object-cover w-full h-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs sm:text-sm">
              No Backcover Image
            </div>
          )}
          
          {/* Logo as profile image */}
          <div className="absolute left-1/2 -bottom-8 sm:-bottom-12 transform -translate-x-1/2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
              {vendor.logo_url ? (
                <img
                  src={vendor.logo_url}
                  alt="Logo"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-lg sm:text-xl md:text-2xl font-bold">
                  {vendor.vendor_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vendor Info */}
        <div className="pt-10 sm:pt-14 md:pt-16 pb-6 sm:pb-8 px-4 sm:px-6 md:px-8">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">{vendor.vendor_name}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                vendor.vendor_type === 'RESTAURANT' ? 'bg-red-100 text-red-700' :
                vendor.vendor_type === 'BAKERY' ? 'bg-amber-100 text-amber-700' :
                vendor.vendor_type === 'SUPERMARKET' ? 'bg-emerald-100 text-emerald-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {vendor.vendor_type}
              </span>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                vendor.mou_signed ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {vendor.mou_signed ? 'MOU Signed' : 'MOU Not Signed'}
              </span>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                vendor.account_approved ? 'bg-blue-100 text-blue-700' : 'bg-orange-200 text-orange-700'
              }`}>
                {vendor.account_approved ? 'Account Approved' : 'Pending Approval'}
              </span>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                vendor.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {vendor.is_active ? 'Dashboard Active' : 'Dashboard Inactive'}
              </span>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                vendor.is_online ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {vendor.is_online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            {!vendor.account_approved && (
              <button
                onClick={handleApproveVendor}
                disabled={approving}
                className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approving ? 'Approving...' : 'Approve Vendor'}
              </button>
            )}
            {vendor.account_approved && (
              <button
                onClick={handleDeactivateVendor}
                disabled={deactivating}
                className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deactivating ? 'Deactivating...' : 'Deactivate Vendor'}
              </button>
            )}
          </div>

          {/* Contact Information */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm sm:text-base text-gray-900 break-words">{vendor.email}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Phone Number</label>
                <p className="mt-1 text-sm sm:text-base text-gray-900">{vendor.phone_number}</p>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Business Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">GST Number</label>
                <p className="mt-1 text-sm sm:text-base text-gray-900">{vendor.gst_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">FSSAI Number</label>
                <p className="mt-1 text-sm sm:text-base text-gray-900">{vendor.fssai_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">PAN Number</label>
                <p className="mt-1 text-sm sm:text-base text-gray-900">{vendor.pan_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Vendor ID</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900 font-mono break-all">{vendor.vendor_id}</p>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Location</h2>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Address</label>
                <div className="mt-1 flex items-start">
                  <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm sm:text-base text-gray-900 break-words">{vendor.address}</p>
                </div>
              </div>
              {vendor.address_url && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Map Location</label>
                  <p className="mt-1">
                    <a
                      href={vendor.address_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 underline break-all text-xs sm:text-sm"
                    >
                      {vendor.address_url}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500">Created At</label>
                <p className="mt-1 text-sm sm:text-base text-gray-900">{formatDate(vendor.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}