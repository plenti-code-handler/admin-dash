'use client';
import { useEffect, useState } from 'react';
import { UsersIcon, BuildingStorefrontIcon, ShoppingBagIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const CACHE_KEY = 'dashboard_stats_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function DashboardPage() {
  const [cachedStats, setCachedStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Example trend data (replace with real data)
  const userTrendData = [
    { date: 'Jan', value: 1200 },
    { date: 'Feb', value: 1400 },
    { date: 'Mar', value: 1800 },
  ];
  const vendorTrendData = [
    { date: 'Jan', value: 80 },
    { date: 'Feb', value: 95 },
    { date: 'Mar', value: 120 },
  ];
  const revenueTrendData = [
    { date: 'Jan', value: 150000 },
    { date: 'Feb', value: 180000 },
    { date: 'Mar', value: 220000 },
  ];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  // Use the original hook, but only fetch if not cached
  const { stats, loading: hookLoading, error: hookError } = useDashboardStats();

  useEffect(() => {
    // Try to load from localStorage
    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
      const { data, timestamp } = JSON.parse(cache);
      if (Date.now() - timestamp < CACHE_DURATION) {
        setCachedStats(data);
        setLoading(false);
        return;
      }
    }
    // If not cached or expired, wait for hook to load
    if (!hookLoading && stats) {
      setCachedStats(stats);
      setLoading(false);
      // Save to cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: stats, timestamp: Date.now() }));
    } else if (!hookLoading && hookError) {
      setError(hookError);
      setLoading(false);
    }
  }, [hookLoading, stats, hookError]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-base text-gray-400">Loading dashboard...</span>
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

  // Use cachedStats for rendering
  const statsToShow = cachedStats || stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e8eaf6] py-8 px-2 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 mb-1">Welcome back 👋</h1>
          <p className="text-gray-500 text-sm">Here's a summary of your platform's performance.</p>
        </div>
        <div className="mt-3 md:mt-0">
          {/* Add any quick actions or filters here */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Link href="/dashboard/users" className="group">
          <StatsCard
            title="Total Users"
            value={statsToShow.totalUsers}
            icon={<UsersIcon className="h-6 w-6 text-[#7c3aed]" />}
            color="from-[#ede9fe] to-[#f3f4f6]"
            clickable
          />
        </Link>
        <Link href="/dashboard/vendors" className="group">
          <StatsCard
            title="Total Vendors"
            value={statsToShow.totalVendors}
            icon={<BuildingStorefrontIcon className="h-6 w-6 text-[#059669]" />}
            color="from-[#d1fae5] to-[#f3f4f6]"
            clickable
          />
        </Link>
        <Link href="/dashboard/orders" className="group">
          <StatsCard
            title="Total Orders"
            value={statsToShow.totalOrders}
            icon={<ShoppingBagIcon className="h-6 w-6 text-[#f59e42]" />}
            color="from-[#fef3c7] to-[#f3f4f6]"
            clickable
          />
        </Link>
        <Link href="/dashboard/payments" className="group">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(statsToShow.totalPayments)}
            icon={<CurrencyRupeeIcon className="h-6 w-6 text-[#f472b6]" />}
            color="from-[#fce7f3] to-[#f3f4f6]"
            clickable
          />
        </Link>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="User Trend">
          <DashboardLineChart data={userTrendData} color="#a5b4fc" />
        </ChartCard>
        <ChartCard title="Vendor Trend">
          <DashboardLineChart data={vendorTrendData} color="#6ee7b7" />
        </ChartCard>
        <ChartCard title="Revenue Trend" valuePrefix="₹">
          <DashboardLineChart data={revenueTrendData} color="#fde68a" valuePrefix="₹" />
        </ChartCard>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon,
  color,
  clickable = false,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
  color: string;
  clickable?: boolean;
}) {
  return (
    <div
      className={`rounded-xl shadow-sm p-4 bg-gradient-to-br ${color} flex items-center gap-3 transition
        ${clickable ? 'cursor-pointer group-hover:shadow-md group-hover:scale-[1.025]' : ''}
      `}
    >
      <div className="bg-white bg-opacity-60 rounded-full p-2 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-700">{title}</div>
        <div className="text-lg font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

// Chart Card Wrapper
function ChartCard({ title, children, valuePrefix }: { title: string, children: React.ReactNode, valuePrefix?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
      <div className="mb-2 text-base font-medium text-gray-700">{title}</div>
      <div className="flex-1 min-h-[180px]">{children}</div>
    </div>
  );
}

// Dashboard Line Chart using Recharts
function DashboardLineChart({ data, color, valuePrefix }: { data: any[], color: string, valuePrefix?: string }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <defs>
          <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.7}/>
            <stop offset="100%" stopColor={color} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fill: '#b0b3b8', fontSize: 12 }} />
        <YAxis tick={{ fill: '#b0b3b8', fontSize: 12 }} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 10, background: '#fff', border: 'none', boxShadow: '0 2px 8px #0001', fontSize: 13 }}
          formatter={(value: any) => valuePrefix ? `${valuePrefix}${value}` : value}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3, stroke: color, strokeWidth: 1, fill: '#fff' }}
          activeDot={{ r: 5 }}
          fill="url(#colorLine)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}