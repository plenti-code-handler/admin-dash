'use client';
import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboardService';
import type { DashboardStats } from '@/types/api';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVendors: 0,
    totalOrders: 0,
    totalPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        if (!token) {
          throw new Error('Authentication token not found');
        }

        const [
          userCount,
          vendorCount,
          orderCount,
          paymentTotal
        ] = await Promise.all([
          dashboardService.getUserCount(token),
          dashboardService.getVendorCount(token),
          dashboardService.getOrderCount(token),
          dashboardService.getPaymentTotal(token)
        ]);

        setStats({
          totalUsers: userCount.count,
          totalVendors: vendorCount.count,
          totalOrders: orderCount.count,
          totalPayments: paymentTotal.total
        });
      } catch (err) {
        console.error('Dashboard Stats Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
} 