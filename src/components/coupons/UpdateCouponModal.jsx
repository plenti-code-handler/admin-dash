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
    public: false,
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
        public: coupon.public !== undefined ? coupon.public : false,
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
        public: formData.public,
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white px-4 pb-4 pt-4 text-left shadow-lg transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:px-6 sm:pb-6 sm:pt-6 md:px-8 md:pb-8 md:pt-8">
                <div className="absolute right-0 top-0 pr-4 pt-4 sm:pr-6 sm:pt-6">
                  <button
                    type="button"
                    className="rounded-lg text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-colors"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="w-full pr-8 sm:pr-0">
                  <div className="mb-6 sm:mb-8">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 sm:text-xl sm:leading-7">
                      Update Coupon
                    </Dialog.Title>
                    <p className="mt-1.5 text-xs text-gray-500 sm:text-sm">
                      Update the details below to modify the coupon
                    </p>
                  </div>

                    {error && (
                      <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 sm:mb-6 sm:p-4">
                        <div className="flex">
                          <div>
                            <h3 className="text-xs font-medium text-red-800 sm:text-sm">Error</h3>
                            <div className="mt-1 text-xs text-red-700 sm:text-sm">{error}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                      <div>
                        <label htmlFor="code" className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                          Coupon Code
                        </label>
                        <input
                          type="text"
                          name="code"
                          id="code"
                          required
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                          className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                          placeholder="Enter coupon code"
                        />
                      </div>

                      <div>
                        <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                          Coupon Description
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                          placeholder="Enter coupon description"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                        <div>
                          <label htmlFor="discount_type" className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                            Discount Type
                          </label>
                          <select
                            name="discount_type"
                            id="discount_type"
                            required
                            value={formData.discount_type}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                          >
                            <option value="PERCENTAGE">Percentage</option>
                            <option value="FIXED">Fixed Amount</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="discount_value" className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                            Discount Value
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
                            className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                        <div>
                          <label htmlFor="min_order_value" className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                            Minimum Order Value
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
                            className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label htmlFor="max_discount" className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                            <span>Maximum Discount</span>
                            <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span>
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
                            className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                            placeholder="Leave empty for no limit"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                        <div>
                          <label htmlFor="usage_limit" className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                            <span>Usage Limit</span>
                            <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span>
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
                            className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                            placeholder="Leave empty for unlimited"
                          />
                        </div>

                        <div>
                          <label htmlFor="is_active" className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                            Status
                          </label>
                          <div className="pt-2">
                            <div className="flex items-start sm:items-center">
                              <input
                                type="checkbox"
                                name="is_active"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="h-4 w-4 mt-0.5 rounded border-gray-300 text-gray-600 focus:ring-0 focus:ring-offset-0 cursor-pointer sm:mt-0"
                              />
                              <label htmlFor="is_active" className="ml-2.5 block text-xs font-medium text-gray-700 cursor-pointer leading-relaxed sm:ml-3 sm:text-sm">
                                Active
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                        <div>
                          <label htmlFor="valid_from" className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                            <span>Valid From</span>
                            <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span>
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
                            className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                          />
                        </div>

                        <div>
                          <label htmlFor="valid_until" className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                            <span>Valid Until</span>
                            <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span>
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
                            className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="flex items-start sm:items-center">
                          <input
                            type="checkbox"
                            name="public"
                            id="public"
                            checked={formData.public}
                            onChange={handleChange}
                            className="h-4 w-4 mt-0.5 rounded border-gray-300 text-gray-600 focus:ring-0 focus:ring-offset-0 cursor-pointer sm:mt-0"
                          />
                          <label htmlFor="public" className="ml-2.5 block text-xs font-medium text-gray-700 cursor-pointer leading-relaxed sm:ml-3 sm:text-sm">
                            Make this coupon publicly available
                          </label>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={onClose}
                          className="inline-flex w-full justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-0 transition-colors sm:w-auto sm:px-5"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-0 transition-colors sm:w-auto sm:px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Updating...
                            </>
                          ) : (
                            'Update Coupon'
                          )}
                        </button>
                      </div>
                    </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}