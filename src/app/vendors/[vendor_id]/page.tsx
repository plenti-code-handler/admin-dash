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
  const [toggling, setToggling] = useState(false);

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

  // Toggle active status handler
  const handleToggleActive = async () => {
    if (!vendor) return;
    
    try {
      setToggling(true);
      const url = buildApiUrl('/v1/superuser/vendor/active/toggle', {
        vendor_id,
        toggle: vendor.is_active ? 'false' : 'true',
      });
      await axiosClient.patch(url);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      logger.error('Error toggling vendor status:', err);
      alert('Failed to toggle status');
    } finally {
      setToggling(false);
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vendor details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">{error || 'No vendor found'}</p>
            <button
              onClick={() => router.back()}
              className="text-indigo-600 hover:text-indigo-800 underline"
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
      <div className="flex-1 relative max-w-4xl mx-auto mt-8 mb-8 bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="absolute top-4 left-4 z-10 bg-[#5F22D9] hover:bg-[#4b1aa8] text-white rounded-full p-2 shadow transition focus:outline-none focus:ring-2 focus:ring-[#5F22D9]"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        {/* Backcover image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
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
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Backcover Image
            </div>
          )}
          
          {/* Logo as profile image */}
          <div className="absolute left-1/2 -bottom-12 transform -translate-x-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
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
                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-2xl font-bold">
                  {vendor.vendor_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vendor Info */}
        <div className="pt-16 pb-8 px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{vendor.vendor_name}</h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                vendor.vendor_type === 'RESTAURANT' ? 'bg-red-100 text-red-700' :
                vendor.vendor_type === 'BAKERY' ? 'bg-amber-100 text-amber-700' :
                vendor.vendor_type === 'SUPERMARKET' ? 'bg-emerald-100 text-emerald-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {vendor.vendor_type}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                vendor.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {vendor.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                vendor.is_online ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {vendor.is_online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mb-6">
            <button
              onClick={handleToggleActive}
              disabled={toggling}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                vendor.is_active
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {toggling ? 'Updating...' : (vendor.is_active ? 'Deactivate Vendor' : 'Activate Vendor')}
            </button>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-gray-900">{vendor.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="mt-1 text-gray-900">{vendor.phone_number}</p>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">GST Number</label>
                <p className="mt-1 text-gray-900">{vendor.gst_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">FSSAI Number</label>
                <p className="mt-1 text-gray-900">{vendor.fssai_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">PAN Number</label>
                <p className="mt-1 text-gray-900">{vendor.pan_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Vendor ID</label>
                <p className="mt-1 text-gray-900 font-mono text-sm">{vendor.vendor_id}</p>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <div className="mt-1 flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-900">{vendor.address}</p>
                </div>
              </div>
              {vendor.address_url && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Map Location</label>
                  <p className="mt-1">
                    <a
                      href={vendor.address_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 underline break-all"
                    >
                      {vendor.address_url}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="mt-1 text-gray-900">{formatDate(vendor.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}