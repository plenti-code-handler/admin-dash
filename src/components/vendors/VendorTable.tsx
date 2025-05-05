'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { logger } from '@/utils/logger';
import type { Vendor, VendorType } from '@/types/vendor';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

interface VendorTableProps {
  vendorType: VendorType | '';
  searchQuery: string;
}

interface ApiResponse {
  response: Vendor[];
  total_response: number;
}

const PAGE_SIZE = 10; // Number of vendors per page

const VendorTable: React.FC<VendorTableProps> = ({ vendorType, searchQuery }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [localSearch, setLocalSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchVendors();
  }, [skip, vendorType]);

  // Reset skip to 0 when vendorType changes
  useEffect(() => {
    setSkip(0);
  }, [vendorType]);

  const handlePrevious = () => setSkip((prev) => Math.max(0, prev - PAGE_SIZE));
  const handleNext = () => setSkip((prev) => prev + PAGE_SIZE);

  // Filter vendors based on search query
  const filteredVendors = useMemo(() => {
    const searchTerm = localSearch.toLowerCase();

    return vendors.filter(vendor => {
      // Filter by vendorType if provided
      const matchesType = vendorType ? (vendor.vendor_type === vendorType) : true;
      // Filter by search
      const matchesSearch =
        (vendor.vendor_name?.toLowerCase() || '').includes(searchTerm) ||
        (vendor.email?.toLowerCase() || '').includes(searchTerm) ||
        (vendor.vendor_type?.toLowerCase() || '').includes(searchTerm);

      return matchesType && matchesSearch;
    });
  }, [vendors, localSearch, vendorType]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      if (!token) {
        throw new Error('No auth token found');
      }

      const data = await api.get<ApiResponse>('/v1/superuser/vendor/get', {
        token,
        params: {
          skip,
          limit: PAGE_SIZE,
          ...(vendorType ? { vendor_type: vendorType } : {})
        }
      });

      if (data && data.response) {
        setVendors(data.response);
        setTotal(data.total_response || 0);
      }
    } catch (error) {
      logger.error('Error fetching vendors:', error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const isNextDisabled = total;
  const isPreviousDisabled = skip === 0;
  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No vendors found
      </div>
    );
  }
  console.log

  return (
    <div className="space-y-4">
      {/* Local Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search in table..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Online</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredVendors.map((vendor) => (
            <tr
              key={vendor.id}
              onClick={() => router.push(`/vendors/${vendor.id}`)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap">{vendor.vendor_name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{vendor.vendor_type}</td>
              <td className="px-6 py-4 whitespace-nowrap">{vendor.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  vendor.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {vendor.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  vendor.is_online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {vendor.is_online ? 'Online' : 'Offline'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Show "No results found" when filtered results are empty */}
      {filteredVendors.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500">
          No results found
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <button
          onClick={handlePrevious}
          disabled={isPreviousDisabled}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-2" />
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Next
          <ChevronRightIcon className="h-5 w-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default VendorTable; 