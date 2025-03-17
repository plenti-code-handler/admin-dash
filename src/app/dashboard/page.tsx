'use client';
import { useEffect } from 'react';
import StatsWidget from '@/components/dashboard/StatsWidget';
import { UsersIcon, UserGroupIcon, BuildingStorefrontIcon, ShoppingCartIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import TrendChart from '@/components/dashboard/TrendChart';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Link from 'next/link';

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // Format numbers for display
  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `₹${(num / 1000000).toFixed(1)}M`;

  const userTrendData = [
    { date: '2024-01', value: 1200 },
    { date: '2024-02', value: 1400 },
    { date: '2024-03', value: 1800 },
    // ... more data
  ];

  const vendorTrendData = [
    { date: '2024-01', value: 80 },
    { date: '2024-02', value: 95 },
    { date: '2024-03', value: 120 },
    // ... more data
  ];

  const revenueTrendData = [
    { date: '2024-01', value: 150000 },
    { date: '2024-02', value: 180000 },
    { date: '2024-03', value: 220000 },
    // ... more data
  ];

  return (
    <div className="space-y-6 relative">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Link href="/dashboard/users">
          <StatsWidget 
            title="Total Users"
            value={formatNumber(stats.totalUsers)}
            trend={{ value: "↑", isPositive: true }}
            icon={UsersIcon}
          />
        </Link>
        
        <Link href="/dashboard/users">
          <StatsWidget 
            title="Active Users"
            value={formatNumber(stats.activeUsers)}
            trend={{ value: "↑", isPositive: true }}
            icon={UserGroupIcon}
          />
        </Link>

        <Link href="/dashboard/vendors">
          <StatsWidget 
            title="Total Vendors"
            value={formatNumber(stats.totalVendors)}
            trend={{ value: "↑", isPositive: true }}
            icon={BuildingStorefrontIcon}
          />
        </Link>

        <Link href="/dashboard/orders">
          <StatsWidget 
            title="Total Orders"
            value={formatNumber(stats.totalOrders)}
            trend={{ value: "↑", isPositive: true }}
            icon={ShoppingCartIcon}
          />
        </Link>

        <Link href="/dashboard/payments">
          <StatsWidget 
            title="Total Payments"
            value={formatCurrency(stats.totalPayments)}
            trend={{ value: "↑", isPositive: true }}
            icon={CreditCardIcon}
          />
        </Link>
      </div>

      <div className="space-y-6">
        {/* Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TrendChart 
            title="User Trend"
            data={userTrendData}
            color="#3B82F6"
          />
          <TrendChart 
            title="Vendor Trend"
            data={vendorTrendData}
            color="#10B981"
          />
          <TrendChart 
            title="Revenue Trend"
            data={revenueTrendData}
            valuePrefix="₹"
            color="#F59E0B"
          />
        </div>
      </div>
    </div>
  );
}