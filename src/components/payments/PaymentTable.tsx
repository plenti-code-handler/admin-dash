'use client';
import { useState, useEffect } from 'react';
import { CurrencyRupeeIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { api } from '@/services/api';
import { logger } from '@/utils/logger';
import type { Payment } from '@/types/payment';
import { buildApiUrl } from '@/config';

interface PaymentTableProps {
  paymentStatus: string;
  paymentMethod: string;
}

interface PaymentApiResponse {
  response: Array<Payment>;
  total_response: number;
}

export default function PaymentTable({ paymentStatus, paymentMethod }: PaymentTableProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setSkip(0); // Reset to first page on filter change
  }, [paymentStatus, paymentMethod]);

  useEffect(() => {
    fetchPayments();
  }, [skip, paymentStatus, paymentMethod]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CAPTURED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUND':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'upi':
        return 'UPI';
      case 'netbanking':
        return 'Net Banking';
      default:
        return type;
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) {
        throw new Error('No auth token found');
      }
      const result = await api.get<PaymentApiResponse>(
        '/v1/superuser/payment/get',
        { 
          token,
          params: {
            skip,
            limit: PAGE_SIZE,
            ...(paymentMethod ? { payment_type: paymentMethod } : {})
          }
        }
      );
      setPayments(result.response);
      setTotal(result.total_response || 0);
    } catch (error) {
      logger.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => setSkip(prev => Math.max(0, prev - PAGE_SIZE));
  const handleNext = () => setSkip(prev => prev + PAGE_SIZE);

  const isNextDisabled = total < PAGE_SIZE;
  const isPreviousDisabled = skip === 0;
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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <CurrencyRupeeIcon className="h-5 w-5 text-indigo-500 mr-2" />
                  <div>
                    <div className="font-medium text-gray-900">{payment.payment_order_id}</div>
                    <div className="text-xs text-gray-500">ID: {payment.id}</div>
                    <div className="text-xs text-gray-500">User: {payment.user_id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">₹{payment.transaction_amount.toFixed(2)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <CreditCardIcon className="h-4 w-4 text-gray-400 mr-1.5" />
                  <span className="text-sm text-gray-900 capitalize">{getPaymentTypeIcon(payment.payment_type)}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatDate(payment.created_at)}</div>
                {payment.updated_at !== payment.created_at && (
                  <div className="text-xs text-gray-500">
                    Updated: {formatDate(payment.updated_at)}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {payments.length === 0 && (
        <div className="text-center py-12">
          <CurrencyRupeeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
          <p className="mt-1 text-sm text-gray-500">No payments match the selected criteria.</p>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
        <button
          onClick={handlePrevious}
          disabled={isPreviousDisabled}
          className="relative inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage}
        </span>
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          className="relative inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
} 