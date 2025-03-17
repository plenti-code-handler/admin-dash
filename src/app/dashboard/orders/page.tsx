'use client';
import { useState } from 'react';
import OrderTable from '@/components/orders/OrderTable';
import OrderDetails from '@/components/orders/OrderDetails';
import { OrderStatus } from '@/types/order';
import type { Order } from '@/types/order';
import { CheckCircleIcon, ClockIcon, TruckIcon } from '@heroicons/react/24/outline';

const statusOptions = [
  {
    value: '',
    label: 'All Orders',
    icon: null,
    description: 'View all orders regardless of status'
  },
  {
    value: 'WAITING_FOR_PICKUP',
    label: 'Waiting for Pickup',
    icon: ClockIcon,
    description: 'Orders waiting to be picked up',
    color: 'yellow'
  },
  {
    value: 'READY_TO_PICKUP',
    label: 'Ready to Pickup',
    icon: TruckIcon,
    description: 'Orders ready for pickup',
    color: 'blue'
  },
  {
    value: 'PICKED_UP',
    label: 'Picked Up',
    icon: CheckCircleIcon,
    description: 'Orders that have been picked up',
    color: 'green'
  }
];

export default function OrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <div className="glass-card rounded-xl p-6">
            {/* Status Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Filter by Status
              </label>
              <div className="grid grid-cols-4 gap-4">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value as OrderStatus | '')}
                    className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all
                      ${selectedStatus === option.value ? 
                        option.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
                        option.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                        option.color === 'green' ? 'border-green-500 bg-green-50' :
                        'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    {option.icon && (
                      <option.icon 
                        className={`h-6 w-6 mb-2
                          ${selectedStatus === option.value ?
                            option.color === 'yellow' ? 'text-yellow-600' :
                            option.color === 'blue' ? 'text-blue-600' :
                            option.color === 'green' ? 'text-green-600' :
                            'text-indigo-600'
                            : 'text-gray-400'
                          }
                        `}
                      />
                    )}
                    <span className={`text-sm font-medium
                      ${selectedStatus === option.value ?
                        option.color === 'yellow' ? 'text-yellow-900' :
                        option.color === 'blue' ? 'text-blue-900' :
                        option.color === 'green' ? 'text-green-900' :
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

            {/* Orders Table */}
            <OrderTable 
              orderStatus={selectedStatus} 
              onOrderSelect={setSelectedOrder}
            />
          </div>
        </div>

        {/* Order Details Sidebar */}
        {selectedOrder && (
          <div className="w-96">
            <div className="glass-card rounded-xl p-6 sticky top-6">
              <OrderDetails 
                order={selectedOrder} 
                onClose={() => setSelectedOrder(null)} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
