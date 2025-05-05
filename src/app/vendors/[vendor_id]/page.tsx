'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { logger } from '@/utils/logger';
import { buildApiUrl } from '@/config';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Sidebar from '@/components/layout/Sidebar';

export default function VendorDetailsPage() {
  const { vendor_id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [backcoverUrl, setBackcoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) throw new Error('No auth token found');
        const data = await api.get<any>(`/v1/superuser/vendor/get/${vendor_id}`, { token });
        setVendor(data.Vendors);
        setLogoUrl(data.logo_url);
        setBackcoverUrl(data.backcover_url);
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
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) throw new Error('No auth token found');
      const toggle = vendor.is_active ? 'false' : 'true';
      const url = buildApiUrl('/v1/superuser/vendor/active/toggle', {
        vendor_id,
        toggle,
      });
      const res = await fetch(
        url,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) throw new Error('Failed to toggle status');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      logger.error('Error toggling vendor status:', err);
      alert('Failed to toggle status');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading vendor details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!vendor) return <div className="p-8 text-center">No vendor found.</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 relative max-w-3xl mx-auto mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Elegant Plenti Purple Back Button */}
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="absolute top-4 left-4 z-10 bg-[#5F22D9] hover:bg-[#4b1aa8] text-white rounded-full p-2 shadow transition
                     focus:outline-none focus:ring-2 focus:ring-[#5F22D9]"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        {/* Backcover image */}
        <div className="relative h-48 bg-gray-200">
          {backcoverUrl ? (
            <img
              src={backcoverUrl}
              alt="Backcover"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Backcover Image
            </div>
          )}
          {/* Logo as profile image */}
          <div className="absolute left-1/2 -bottom-12 transform -translate-x-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Logo
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Vendor Info */}
        <div className="pt-16 pb-8 px-8">
          <h1 className="text-2xl font-bold mb-2">{vendor.vendor_name}</h1>
          <p className="text-gray-600 mb-4">{vendor.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div><span className="font-semibold">Type:</span> {vendor.vendor_type}</div>
            <div><span className="font-semibold">Email:</span> {vendor.email}</div>
            <div><span className="font-semibold">Phone:</span> {vendor.phone_number}</div>
            <div><span className="font-semibold">GST Number:</span> {vendor.gst_number || 'N/A'}</div>
            <div><span className="font-semibold">Pincode:</span> {vendor.pincode}</div>
            <div><span className="font-semibold">Store Manager:</span> {vendor.store_manager_name}</div>
            <div>
              <span className="font-semibold">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold
                ${vendor.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                {vendor.is_active ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={handleToggleActive}
                className={`ml-4 px-3 py-1 rounded text-xs font-semibold transition
                  ${vendor.is_active
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
              >
                {vendor.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
            <div><span className="font-semibold">Online:</span> {vendor.is_online ? 'Online' : 'Offline'}</div>
            <div><span className="font-semibold">Email Verified:</span> {vendor.email_verified ? 'Yes' : 'No'}</div>
            <div><span className="font-semibold">Latitude:</span> {vendor.latitude}</div>
            <div><span className="font-semibold">Longitude:</span> {vendor.longitude}</div>
            <div className="col-span-2"><span className="font-semibold">Address:</span> {vendor.address}</div>
            <div className="col-span-2"><span className="font-semibold">Address URL:</span> <a href={vendor.address_url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{vendor.address_url}</a></div>
            <div className="col-span-2"><span className="font-semibold">Created At:</span> {vendor.created_at ? new Date(vendor.created_at * 1000).toLocaleString() : 'N/A'}</div>
          </div>
          {/* Item Descriptions */}
          {vendor.item_descriptions && vendor.item_descriptions.length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold mb-2">Item Descriptions</h2>
              <ul className="list-disc list-inside text-gray-700">
                {vendor.item_descriptions.map((desc: string, idx: number) => (
                  <li key={idx}>{desc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 