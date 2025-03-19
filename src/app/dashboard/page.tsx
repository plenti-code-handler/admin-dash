'use client';
import { useEffect } from 'react';
import StatsWidget from '@/components/dashboard/StatsWidget';
import { UsersIcon, UserGroupIcon, BuildingStorefrontIcon, ShoppingCartIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import TrendChart from '@/components/dashboard/TrendChart';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Link from 'next/link';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ShoppingBagIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Format numbers for display
  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<UsersIcon className="h-6 w-6 text-indigo-600" />}
        />
        <StatsCard
          title="Total Vendors"
          value={stats.totalVendors}
          icon={<BuildingStorefrontIcon className="h-6 w-6 text-indigo-600" />}
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingBagIcon className="h-6 w-6 text-indigo-600" />}
        />
        <StatsCard
          title="Total Revenue"
          value={stats.totalPayments}
          icon={<CurrencyRupeeIcon className="h-6 w-6 text-indigo-600" />}
          formatter={formatCurrency}
        />
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