'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { logger } from '@/utils/logger';
import type { Vendor } from '@/types/vendor';
import Image from 'next/image';
import { api } from '@/services/api';
import { buildApiUrl } from '@/config';

interface BankAccount {
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  branch_name: string;
  account_holder_name: string;
}

interface VendorDetailsProps {
  vendor: Vendor;
  onClose: () => void;
}

export default function VendorDetails({ vendor, onClose }: VendorDetailsProps) {
  const [bankDetails, setBankDetails] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchBankDetails();
  }, [vendor.id]);

  const fetchBankDetails = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      if (!token) {
        throw new Error('No auth token found');
      }

      const url = buildApiUrl('/v1/superuser/vendor/account-details/get', {
        vendor_id: vendor.id
      });

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bank details');
      }

      const data = await response.json();
      setBankDetails(data);
    } catch (error) {
      logger.error('Error fetching bank details:', error);
      setError('Failed to load bank details');
    }
  };

  const toggleVendorActive = async () => {
    try {
      setLoading(true);
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      if (!token) {
        throw new Error('No auth token found');
      }

      const data = await api.patch('/v1/superuser/vendor/active/toggle', {
        token,
        params: {
          vendor_id: vendor.id,
          toggle: !vendor.is_active
        }
      });

      if (data.message) {
        window.location.reload();
      }
    } catch (error) {
      logger.error('Error toggling vendor status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update vendor status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header with Logo */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          {vendor.logo_url && !imageError ? (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={vendor.logo_url}
                alt={`${vendor.vendor_name} logo`}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                sizes="64px"
                priority
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-2xl">
                {vendor.vendor_name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{vendor.vendor_name}</h2>
            <span className="text-sm text-gray-500">{vendor.vendor_type}</span>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {error && (
        <div className="mb-4 text-red-500 text-sm">{error}</div>
      )}

      <div className="space-y-6">
        {/* Status Section */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="space-y-1">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              vendor.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {vendor.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
              vendor.is_online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {vendor.is_online ? 'Online' : 'Offline'}
            </span>
          </div>
          <button
            onClick={toggleVendorActive}
            disabled={loading}
            className="text-sm px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : (vendor.is_active ? 'Deactivate' : 'Activate')}
          </button>
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1">{vendor.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="mt-1">{vendor.phone_number}</p>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Location</h3>
          <div className="space-y-2">
            <a 
              href={vendor.address_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-indigo-600 hover:text-indigo-900"
            >
              <MapPinIcon className="h-5 w-5 mr-2" />
              View on Maps
            </a>
            <p className="text-sm text-gray-500">
              Pincode: {vendor.pincode}
            </p>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Bank Details</h3>
          {bankDetails ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Account Holder</label>
                <p className="mt-1">{bankDetails.account_holder_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Account Number</label>
                <p className="mt-1">{bankDetails.account_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Bank Name</label>
                <p className="mt-1">{bankDetails.bank_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                <p className="mt-1">{bankDetails.ifsc_code}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No bank details available</p>
          )}
        </div>

        {/* Description Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Menu Descriptions</h3>
          <ul className="list-disc pl-5 space-y-1">
            {vendor.descriptions.map((desc, index) => (
              <li key={index} className="text-sm text-gray-600">{desc}</li>
            ))}
          </ul>
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Business Details</h3>
          <div>
            <label className="text-sm font-medium text-gray-500">GST Number</label>
            <p className="mt-1">{vendor.gst_number}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 