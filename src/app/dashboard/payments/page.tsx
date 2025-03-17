'use client';
import { useState } from 'react';
import {
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  QrCodeIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import PaymentTable from '@/components/payments/PaymentTable';
import type { PaymentStatus, PaymentType } from '@/types/payment';

const statusOptions = [
  {
    value: '',
    label: 'All Payments',
    icon: BanknotesIcon,
    description: 'View all payment statuses',
    color: 'indigo'
  },
  {
    value: 'CAPTURED',
    label: 'Captured',
    icon: CheckCircleIcon,
    description: 'Successfully processed payments',
    color: 'green'
  },
  {
    value: 'FAILED',
    label: 'Failed',
    icon: XCircleIcon,
    description: 'Failed payment attempts',
    color: 'red'
  },
  {
    value: 'REFUND',
    label: 'Refunded',
    icon: ArrowPathIcon,
    description: 'Refunded payments',
    color: 'purple'
  }
];

const methodOptions = [
  {
    value: '',
    label: 'All Methods',
    icon: BanknotesIcon,
    description: 'View all payment methods',
    color: 'indigo'
  },
  {
    value: 'upi',
    label: 'UPI',
    icon: QrCodeIcon,
    description: 'UPI payments',
    color: 'blue'
  },
  {
    value: 'netbanking',
    label: 'Net Banking',
    icon: BuildingLibraryIcon,
    description: 'Net banking payments',
    color: 'emerald'
  }
];

export default function PaymentsPage() {
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | ''>('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentType | ''>('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h1 className="text-xl font-semibold text-gray-900">Payment Management</h1>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <div className="glass-card p-6">
            {/* Filters */}
            <div className="space-y-6">
              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Filter by Status
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedStatus(option.value as PaymentStatus | '')}
                      className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all
                        ${selectedStatus === option.value ? 
                          option.color === 'green' ? 'border-green-500 bg-green-50' :
                          option.color === 'red' ? 'border-red-500 bg-red-50' :
                          option.color === 'purple' ? 'border-purple-500 bg-purple-50' :
                          'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }
                      `}
                    >
                      <option.icon 
                        className={`h-5 w-5 mb-2
                          ${selectedStatus === option.value ?
                            option.color === 'green' ? 'text-green-600' :
                            option.color === 'red' ? 'text-red-600' :
                            option.color === 'purple' ? 'text-purple-600' :
                            'text-indigo-600'
                            : 'text-gray-400'
                          }
                        `}
                      />
                      <span className={`text-sm font-medium
                        ${selectedStatus === option.value ?
                          option.color === 'green' ? 'text-green-900' :
                          option.color === 'red' ? 'text-red-900' :
                          option.color === 'purple' ? 'text-purple-900' :
                          'text-indigo-900'
                          : 'text-gray-900'
                        }
                      `}>
                        {option.label}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 text-center">
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Filter by Payment Method
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {methodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedMethod(option.value as PaymentType | '')}
                      className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all
                        ${selectedMethod === option.value ? 
                          option.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                          option.color === 'emerald' ? 'border-emerald-500 bg-emerald-50' :
                          'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }
                      `}
                    >
                      <option.icon 
                        className={`h-5 w-5 mb-2
                          ${selectedMethod === option.value ?
                            option.color === 'blue' ? 'text-blue-600' :
                            option.color === 'emerald' ? 'text-emerald-600' :
                            'text-indigo-600'
                            : 'text-gray-400'
                          }
                        `}
                      />
                      <span className={`text-sm font-medium
                        ${selectedMethod === option.value ?
                          option.color === 'blue' ? 'text-blue-900' :
                          option.color === 'emerald' ? 'text-emerald-900' :
                          'text-indigo-900'
                          : 'text-gray-900'
                        }
                      `}>
                        {option.label}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 text-center">
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="mt-6">
              <PaymentTable 
                paymentStatus={selectedStatus}
                paymentMethod={selectedMethod}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
