'use client';
import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TagIcon } from '@heroicons/react/24/outline';
import { api } from '@/services/api';
import { logger } from '@/utils/logger';
import { buildApiUrl } from '@/config';

export default function UpdateCouponModal({ isOpen, onClose, onSuccess, coupon }) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discount_type: 'PERCENTAGE',
    discount_value: 0,
    min_order_value: 0,
    max_discount: undefined,
    usage_limit: undefined,
    valid_from: undefined,
    valid_until: undefined,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Populate form when coupon data is available
  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        name: coupon.name || '',
        discount_type: coupon.discount_type || 'PERCENTAGE',
        discount_value: coupon.discount_value || 0,
        min_order_value: coupon.min_order_value || 0,
        max_discount: coupon.max_discount || undefined,
        usage_limit: coupon.usage_limit || undefined,
        valid_from: coupon.valid_from || undefined,
        valid_until: coupon.valid_until || undefined,
        is_active: coupon.is_active !== undefined ? coupon.is_active : true,
      });
      setError(null);
    }
  }, [coupon, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        min_order_value: formData.min_order_value,
        max_discount: formData.max_discount,
        usage_limit: formData.usage_limit,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        is_active: formData.is_active,
      };
  
      // Fix: Use path parameter instead of query parameter, and use correct api.patch format
      await api.patch(`/v1/superuser/coupon/update/${coupon.id}`, { data: payload });
  
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      logger.error('Error updating coupon:', err);
      setError(err.response?.data?.detail || 'Failed to update coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toISOString().split('T')[0];
  };

  const parseDate = (dateString) => {
    if (!dateString) return undefined;
    return Math.floor(new Date(dateString).getTime() / 1000);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TagIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      Update Coupon
                    </Dialog.Title>

                    {error && (
                      <div className="mb-4 rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                            Coupon Code *
                          </label>
                          <input
                            type="text"
                            name="code"
                            id="code"
                            required
                            value={formData.code}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          />
                        </div>

                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          />
                        </div>

                        <div>
                          <label htmlFor="discount_type" className="block text-sm font-medium text-gray-700">
                            Discount Type *
                          </label>
                          <select
                            name="discount_type"
                            id="discount_type"
                            required
                            value={formData.discount_type}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          >
                            <option value="PERCENTAGE">Percentage</option>
                            <option value="FIXED">Fixed Amount</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="discount_value" className="block text-sm font-medium text-gray-700">
                            Discount Value *
                          </label>
                          <input
                            type="number"
                            name="discount_value"
                            id="discount_value"
                            required
                            min="0"
                            step="0.01"
                            value={formData.discount_value}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          />
                        </div>

                        <div>
                          <label htmlFor="min_order_value" className="block text-sm font-medium text-gray-700">
                            Minimum Order Value *
                          </label>
                          <input
                            type="number"
                            name="min_order_value"
                            id="min_order_value"
                            required
                            min="0"
                            step="0.01"
                            value={formData.min_order_value}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          />
                        </div>

                        <div>
                          <label htmlFor="max_discount" className="block text-sm font-medium text-gray-700">
                            Maximum Discount
                          </label>
                          <input
                            type="number"
                            name="max_discount"
                            id="max_discount"
                            min="0"
                            step="0.01"
                            value={formData.max_discount || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              max_discount: e.target.value ? parseFloat(e.target.value) : undefined
                            }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          />
                        </div>

                        <div>
                          <label htmlFor="usage_limit" className="block text-sm font-medium text-gray-700">
                            Usage Limit
                          </label>
                          <input
                            type="number"
                            name="usage_limit"
                            id="usage_limit"
                            min="1"
                            value={formData.usage_limit || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              usage_limit: e.target.value ? parseInt(e.target.value) : undefined
                            }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          />
                        </div>

                        <div>
                          <label htmlFor="valid_from" className="block text-sm font-medium text-gray-700">
                            Valid From
                          </label>
                          <input
                            type="date"
                            name="valid_from"
                            id="valid_from"
                            value={formatDate(formData.valid_from)}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              valid_from: parseDate(e.target.value)
                            }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          />
                        </div>

                        <div>
                          <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700">
                            Valid Until
                          </label>
                          <input
                            type="date"
                            name="valid_until"
                            id="valid_until"
                            value={formatDate(formData.valid_until)}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              valid_until: parseDate(e.target.value)
                            }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="is_active"
                              id="is_active"
                              checked={formData.is_active}
                              onChange={handleChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                              Active
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                        >
                          {loading ? 'Updating...' : 'Update Coupon'}
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}