'use client';
import { useState, useEffect } from 'react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalVendors: number;
  totalOrders: number;
  totalPayments: number;
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

        const headers = {
          'Authorization': `Bearer ${token}`
        };

        // Fetch all stats in parallel
        const [userCount, vendorCount, orderCount, paymentTotal] = await Promise.all([
          fetch('http://localhost:8000/v1/superuser/user/count/get', { headers }),
          fetch('http://localhost:8000/v1/superuser/vendor/count/get', { headers }),
          fetch('http://localhost:8000/v1/superuser/order/count/get', { headers }),
          fetch('http://localhost:8000/v1/superuser/payment/total/get', { headers })
        ]);

        const [userData, vendorData, orderData, paymentData] = await Promise.all([
          userCount.json(),
          vendorCount.json(),
          orderCount.json(),
          paymentTotal.json()
        ]);

        setStats({
          totalUsers: userData.count || 0,
          activeUsers: userData.active_count || 0, // Adjust based on actual API response
          totalVendors: vendorData.count || 0,
          totalOrders: orderData.count || 0,
          totalPayments: paymentData.total || 0
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Error fetching stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
} 