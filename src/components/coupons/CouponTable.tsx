'use client';
import React, { useState, useEffect } from 'react';
import { TrashIcon, TagIcon } from '@heroicons/react/24/outline';
import { api } from '@/services/api';
import { logger } from '@/utils/logger';
import type { Coupon } from '@/types/coupon';
import { buildApiUrl } from '@/config';
import axiosClient from '../../../AxiosClient';

interface CouponTableProps {
  onDelete: (couponId: string) => void;
  refreshKey: number;
}

interface CouponApiResponse {
  response: Coupon[];
  total_response: number;
}

function formatDate(ts: number | null) {
  if (!ts) return 'No Expiry';
  const d = new Date(ts * 1000);
  return d.toLocaleDateString();
}

function formatDiscount(value: number, type: string) {
  return type === 'PERCENTAGE' ? `${value}%` : `₹${value}`;
}

const PAGE_SIZE = 10; // Number of coupons per page

export default function CouponTable({ onDelete, refreshKey }: CouponTableProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCoupons();
  }, [refreshKey, skip]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const url = buildApiUrl('/v1/superuser/coupon/get', {
        skip
      });
      const response = await axiosClient.get(url);
      const data = response.data;
      setCoupons(data.response);
      setTotal(data.total_response);
    } catch (error) {
      logger.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (couponId: string) => {
    setDeleteId(null);
    try {
      await onDelete(couponId);
      setShowSnackbar(true);
      // Optionally, refetch coupons here instead of reloading the page
      fetchCoupons();
    } catch (error) {
      logger.error('Error deleting coupon:', error);
    }
  };

  // Auto-hide snackbar after 2 seconds
  useEffect(() => {
    if (showSnackbar) {
      const timer = setTimeout(() => setShowSnackbar(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSnackbar]);

  const handlePrevious = () => setSkip((prev) => Math.max(0, prev - PAGE_SIZE));
  const handleNext = () => setSkip((prev) => prev + PAGE_SIZE);

  // Disable "Next" if you are at the end (i.e., skip + PAGE_SIZE >= total)
  const isNextDisabled = total < PAGE_SIZE;
  const isPreviousDisabled = skip === 0;

  // For display
  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      {/* Snackbar */}
      {showSnackbar && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 transition">
          Coupon deleted successfully!
        </div>
      )}

      {/* Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Delete Coupon</h2>
            <p className="mb-6">Are you sure you want to delete this coupon?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Validity</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {coupons.map((coupon) => (
            <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2">
                <img
                  src={coupon.image_url}
                  alt={coupon.name}
                  className="w-10 h-10 rounded object-contain border"
                />
              </td>
              <td className="px-4 py-2">{coupon.name}</td>
              <td className="px-4 py-2 font-mono">{coupon.code}</td>
              <td className="px-4 py-2">
                {formatDiscount(coupon.discount_value, coupon.discount_type)}
              </td>
              <td className="px-4 py-2">
                {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_until)}
              </td>
              <td className="px-4 py-2">
                <div className="text-sm text-gray-900">
                  {coupon.times_used} uses
                  {coupon.usage_limit && (
                    <span className="text-gray-500"> / {coupon.usage_limit} limit</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-2">{coupon.coupon_type}</td>
              <td className="px-4 py-2 whitespace-nowrap text-right">
                <button
                  onClick={() => setDeleteId(coupon.id)}
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

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrevious}
          disabled={isPreviousDisabled}
          className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage}
        </span>
        <button
          onClick={handleNext}
          disabled={false}
          className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
} 