'use client';
import { useState, useEffect } from 'react';
import { TrashIcon, TagIcon } from '@heroicons/react/24/outline';
import { api } from '@/services/api';
import { logger } from '@/utils/logger';
import type { Coupon } from '@/types/coupon';

interface CouponTableProps {
  onDelete: (couponId: string) => void;
}

export default function CouponTable({ onDelete }: CouponTableProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      if (!token) {
        throw new Error('No auth token found');
      }

      const data = await api.get('/v1/superuser/coupon', { token });
      setCoupons(data.response);
    } catch (error) {
      logger.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'No expiry';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {coupons.map((coupon) => (
            <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <TagIcon className="h-5 w-5 text-indigo-500 mr-2" />
                  <div>
                    <div className="font-medium text-gray-900">{coupon.code}</div>
                    <div className="text-sm text-gray-500">ID: {coupon.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {coupon.discount_value}{coupon.discount_type === 'PERCENTAGE' ? '%' : '₹'} OFF
                  </div>
                  <div className="text-gray-500">
                    Min order: ₹{coupon.min_order_value}
                    {coupon.max_discount && (
                      <span className="ml-2">Max discount: ₹{coupon.max_discount}</span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">
                  <div className="text-gray-900">From: {formatDate(coupon.valid_from)}</div>
                  <div className="text-gray-500">Until: {formatDate(coupon.valid_until)}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {coupon.times_used} uses
                  {coupon.usage_limit && (
                    <span className="text-gray-500"> / {coupon.usage_limit} limit</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  coupon.is_active 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <button
                  onClick={() => onDelete(coupon.id)}
                  className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {coupons.length === 0 && (
        <div className="text-center py-12">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No coupons</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new coupon.</p>
        </div>
      )}
    </div>
  );
} 