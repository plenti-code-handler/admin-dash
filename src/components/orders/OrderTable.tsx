'use client';
import { useState, useEffect, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { logger } from '@/utils/logger';
import type { Order, OrderStatus } from '@/types/order';
import { buildApiUrl } from '@/config';
import axiosClient from '../../../AxiosClient';

interface OrderTableProps {
  orderStatus: OrderStatus | '';
  onOrderSelect: (order: Order) => void;
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString();
};

export default function OrderTable({ orderStatus, onOrderSelect }: OrderTableProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [localSearch, setLocalSearch] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when status changes
    fetchOrders();
  }, [orderStatus]);

  // Add separate effect for page changes
  useEffect(() => {
    if (currentPage > 1) { // Only fetch if not first page (first page is handled by status change)
      fetchOrders();
    }
  }, [currentPage]);

  // Filter orders based on search query
  const filteredOrders = useMemo(() => {
    const searchTerm = localSearch.toLowerCase();
    return orders.filter(order => 
      order.order_code.toLowerCase().includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm) ||
      order.vendor_id.toLowerCase().includes(searchTerm) ||
      order.user_id.toLowerCase().includes(searchTerm)
    );
  }, [orders, localSearch]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = buildApiUrl('/v1/superuser/order/active/get-all', {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        ...(orderStatus ? { order_status: orderStatus } : {})
      });

      logger.info('Fetching orders:', url);

      const response = await axiosClient.get(url);
      const data = response.data;
      setOrders(data.response);
      setTotalItems(data.total_response);
      setTotalPages(Math.ceil(data.total_response / itemsPerPage));
    } catch (error: any) {
      logger.error('Error fetching orders:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to fetch orders';
      // You might want to set an error state here
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Code</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor ID</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredOrders.map((order) => (
            <tr 
              key={order.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onOrderSelect(order)}
            >
              <td className="px-6 py-4 whitespace-nowrap">{order.order_code}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  order.current_status === 'PICKED_UP' ? 'bg-green-100 text-green-800' :
                  order.current_status === 'READY_TO_PICKUP' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.current_status.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ₹{order.transaction_amount?.toFixed(2) || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{order.user_id}</td>
              <td className="px-6 py-4 whitespace-nowrap">{order.vendor_id}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500">
          No orders found
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
            <ChevronRightIcon className="h-5 w-5 ml-2" />
          </button>
        </div>
      )}
    </div>
  );
} 