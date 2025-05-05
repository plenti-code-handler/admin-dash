'use client';
import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  BuildingStorefrontIcon,
  CakeIcon,
  ShoppingBagIcon,
  ViewColumnsIcon
} from '@heroicons/react/24/outline';
import VendorTable from '@/components/vendors/VendorTable';
import type { Vendor, VendorType } from '@/types/vendor';

const vendorTypeOptions = [
  {
    value: '',
    label: 'All Vendors',
    icon: ViewColumnsIcon,
    description: 'View all vendor types',
    color: 'indigo'
  },
  {
    value: 'RESTAURANT',
    label: 'Restaurants',
    icon: BuildingStorefrontIcon,
    description: 'Food and dining establishments',
    color: 'red'
  },
  {
    value: 'BAKERY',
    label: 'Bakeries',
    icon: CakeIcon,
    description: 'Fresh baked goods and desserts',
    color: 'amber'
  },
  {
    value: 'SUPERMARKET',
    label: 'Supermarkets',
    icon: ShoppingBagIcon,
    description: 'Grocery and retail stores',
    color: 'emerald'
  }
];

export default function VendorsPage() {
  const [selectedType, setSelectedType] = useState<VendorType | ''>('');

  const fetchVendors = useCallback(async () => {
    // ... existing fetch code
  }, []); // Empty dependency array if no external dependencies

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]); // Add fetchVendors to dependency array

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h1 className="text-xl font-semibold text-gray-900">Vendor Management</h1>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <div className="glass-card p-6">
            {/* Vendor Type Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Filter by Type
              </label>
              <div className="grid grid-cols-4 gap-4">
                {vendorTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedType(option.value as VendorType | '')}
                    className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all
                      ${selectedType === option.value ? 
                        option.color === 'red' ? 'border-red-500 bg-red-50' :
                        option.color === 'amber' ? 'border-amber-500 bg-amber-50' :
                        option.color === 'emerald' ? 'border-emerald-500 bg-emerald-50' :
                        'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <option.icon className={`h-5 w-5 mb-2 ${
                      selectedType === option.value ?
                        option.color === 'red' ? 'text-red-600' :
                        option.color === 'amber' ? 'text-amber-600' :
                        option.color === 'emerald' ? 'text-emerald-600' :
                        'text-indigo-600'
                        : 'text-gray-400'
                    }`} />
                    <span className="text-sm font-medium text-gray-900">
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-500 mt-1 text-center">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vendors Table */}
            <VendorTable 
              vendorType={selectedType}
              onVendorSelect={() => {}} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
