'use client';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatsWidgetProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ElementType;
}

export default function StatsWidget({ title, value, trend, icon: Icon }: StatsWidgetProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
          {trend && (
            <p className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? (
                <ArrowUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 mr-1" />
              )}
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="bg-blue-50 p-3 rounded-full">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}