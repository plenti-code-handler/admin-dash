'use client';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import CouponTable from '@/components/coupons/CouponTable';
import CreateCouponModal from '@/components/coupons/CreateCouponModal';
import { api } from '@/services/api';
import { logger } from '@/utils/logger';
import { axiosFormClient } from '../../../../AxiosClient';
import { buildApiUrl } from '@/config';

export default function CouponsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      await api.delete('/v1/superuser/coupon/delete', {
        params: { coupon_id: couponId }
      });

      // Refresh the table
      window.location.reload();
    } catch (error) {
      logger.error('Error deleting coupon:', error);
      alert('Failed to delete coupon');
    }
  };

  const handleCreateCoupon = async (couponData: any, file: File | null) => {
    try {
      const {
        code,
        name,
        discount_type,
        discount_value,
        min_order_value,
        max_discount,
        usage_limit
      } = couponData;

      const payload = {
        code,
        name,
        discount_type,
        discount_value,
        min_order_value,
        max_discount,
        usage_limit
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      if (file) {
        formData.append('file', file);
      }

      const url = buildApiUrl('/v1/superuser/coupon/create');
      await axiosFormClient.post(url, formData);

      setIsCreateModalOpen(false);
      window.location.reload();
    } catch (error) {
      logger.error('Error creating coupon:', error);
      alert('Failed to create coupon');
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Coupon Management</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="glass-card p-6">
        <CouponTable onDelete={handleDeleteCoupon} />
      </div>

      {/* Create Coupon Modal */}
      <CreateCouponModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateCoupon}
      />
    </div>
  );
}
