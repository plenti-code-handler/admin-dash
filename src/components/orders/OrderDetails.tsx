'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { logger } from '@/utils/logger';
import type { Order } from '@/types/order';
import { buildApiUrl } from '@/config';
import axiosClient from '../../../AxiosClient';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
}

const formatTime = (timestamp: number) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp * 1000));
};

const formatDate = (timestamp: number) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(timestamp * 1000));
};

export default function OrderDetails({ order, onClose }: OrderDetailsProps) {
  const [vendorName, setVendorName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorDetails();
  }, [order.vendor_id]);

  const fetchVendorDetails = async () => {
    try {
      const url = buildApiUrl('/v1/superuser/vendor/get', {
        vendor_id: order.vendor_id
      });

      const response = await axiosClient.get(url);
      const data = response.data;
      setVendorName(data.vendor_name || 'Unknown Vendor');
    } catch (error) {
      logger.error('Error fetching vendor details:', error);
      setVendorName('Unknown Vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold">Order #{order.order_code}</h2>
          <span className={`mt-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            order.current_status === 'PICKED_UP' ? 'bg-green-100 text-green-800' :
            order.current_status === 'READY_TO_PICKUP' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {order.current_status.replace(/_/g, ' ')}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Timing Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Timing</h3>
          
          {/* Created At */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-500 text-sm mb-1">
              <CalendarIcon className="h-4 w-4" />
              <span>Created on</span>
            </div>
            <p className="text-gray-900">{formatDate(order.created_at)}</p>
            <p className="text-sm text-gray-500 mt-1">{formatTime(order.created_at)}</p>
          </div>

          {/* Pickup Window */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-indigo-600 text-sm mb-2">
              <ClockIcon className="h-4 w-4" />
              <span>Pickup Window</span>
            </div>
            
            <div className="space-y-3">
              {/* If pickup is on the same day, show date once */}
              {new Date(order.window_start_time * 1000).toDateString() === 
               new Date(order.window_end_time * 1000).toDateString() ? (
                <>
                  <p className="text-gray-900 font-medium">{formatDate(order.window_start_time)}</p>
                  <div className="flex items-center text-sm">
                    <div className="flex-1 text-gray-900">
                      {formatTime(order.window_start_time)}
                    </div>
                    <div className="text-gray-400 px-2">to</div>
                    <div className="flex-1 text-gray-900">
                      {formatTime(order.window_end_time)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">From</p>
                    <p className="text-gray-900">{formatDate(order.window_start_time)}</p>
                    <p className="text-sm text-gray-900">{formatTime(order.window_start_time)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">To</p>
                    <p className="text-gray-900">{formatDate(order.window_end_time)}</p>
                    <p className="text-sm text-gray-900">{formatTime(order.window_end_time)}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Vendor Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Vendor Details</h3>
          <div>
            <label className="text-sm font-medium text-gray-500">Vendor Name</label>
            <p className="mt-1">{loading ? 'Loading...' : vendorName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Vendor ID</label>
            <p className="mt-1">{order.vendor_id}</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Customer Details</h3>
          <div>
            <label className="text-sm font-medium text-gray-500">User ID</label>
            <p className="mt-1">{order.user_id}</p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Payment Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Payment ID</label>
              <p className="mt-1">{order.payment_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Amount</label>
              <p className="mt-1">₹{order.transaction_amount?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 