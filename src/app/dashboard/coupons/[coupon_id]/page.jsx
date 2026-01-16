'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import axiosClient from '../../../../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';
import { api } from '@/services/api';
import UpdateCouponModal from '@/components/coupons/UpdateCouponModal';

export default function CouponDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const couponId = params?.coupon_id;
  
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (couponId) {
      fetchCoupon();
    }
  }, [couponId]);

  const fetchCoupon = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = buildApiUrl(`/v1/superuser/coupon/get/${couponId}`);
      const response = await axiosClient.get(url);
      setCoupon(response.data);
    } catch (err) {
      logger.error('Error fetching coupon:', err);
      setError(err.response?.data?.detail || 'Failed to fetch coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await api.delete('/v1/superuser/coupon/delete', {
        params: { coupon_id: couponId }
      });
      router.push('/dashboard/coupons');
    } catch (err) {
      logger.error('Error deleting coupon:', err);
      alert(err.response?.data?.detail || 'Failed to delete coupon');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateSuccess = async () => {
    setIsUpdateModalOpen(false);
    await fetchCoupon(); // Refresh coupon data
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="glass-card p-6">
        <div className="text-center py-12">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-sm text-gray-500 mb-4">{error || 'Coupon not found'}</p>
          <button
            onClick={() => router.push('/dashboard/coupons')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Coupons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard/coupons')}
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4 sm:mb-0"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Update
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mt-4">Coupon Details</h1>
      </div>

      {/* Coupon Details */}
      <div className="glass-card p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupon.image_url && (
            <div className="md:col-span-2 flex justify-center">
              <img
                src={coupon.image_url}
                alt={coupon.name}
                className="h-32 w-32 object-cover rounded-lg border"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
            <p className="text-sm text-gray-900 font-mono">{coupon.code}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-sm text-gray-900">{coupon.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
            <p className="text-sm text-gray-900 capitalize">{coupon.discount_type.toLowerCase()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
            <p className="text-sm text-gray-900">
              {coupon.discount_type === 'PERCENTAGE' 
                ? `${coupon.discount_value}%`
                : `₹${coupon.discount_value}`
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Value</label>
            <p className="text-sm text-gray-900">₹{coupon.min_order_value}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Discount</label>
            <p className="text-sm text-gray-900">
              {coupon.max_discount ? `₹${coupon.max_discount}` : 'No limit'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
            <p className="text-sm text-gray-900">
              {coupon.usage_limit ? coupon.usage_limit : 'Unlimited'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Times Used</label>
            <p className="text-sm text-gray-900">{coupon.times_used}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
            <p className="text-sm text-gray-900">{formatDate(coupon.valid_from)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
            <p className="text-sm text-gray-900">
              {coupon.valid_until ? formatDate(coupon.valid_until) : 'No expiry'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              coupon.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {coupon.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Public</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              coupon.public 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {coupon.public ? 'Public' : 'Private'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Type</label>
            <p className="text-sm text-gray-900 capitalize">{coupon.coupon_type.replace(/_/g, ' ').toLowerCase()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
            <p className="text-sm text-gray-900">{formatDate(coupon.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Update Coupon Modal */}
      <UpdateCouponModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={handleUpdateSuccess}
        coupon={coupon}
      />
    </div>
  );
}