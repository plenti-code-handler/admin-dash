'use client';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';  // Import the api service instead of using fetch directly
import { logger } from '@/utils/logger';
import type { ApiResponse } from '@/services/api';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalVendors: number;
  totalOrders: number;
  totalPayments: number;
}

interface CountResponse {
  count: number;
  active_count?: number;
}

interface PaymentTotalResponse {
  total: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalVendors: 0,
    totalOrders: 0,
    totalPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Use the api service instead of fetch directly
        const [userData, vendorData, orderData, paymentData] = await Promise.all([
          api.get<ApiResponse<CountResponse>>('/v1/superuser/user/count/get', { token }),
          api.get<ApiResponse<CountResponse>>('/v1/superuser/vendor/count/get', { token }),
          api.get<ApiResponse<CountResponse>>('/v1/superuser/order/count/get', { token }),
          api.get<ApiResponse<PaymentTotalResponse>>('/v1/superuser/payment/total/get', { token })
        ]);

        setStats({
          totalUsers: userData.response.count || 0,
          activeUsers: userData.response.active_count || 0,
          totalVendors: vendorData.response.count || 0,
          totalOrders: orderData.response.count || 0,
          totalPayments: paymentData.response.total || 0
        });
      } catch (err) {
        logger.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Error fetching stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}