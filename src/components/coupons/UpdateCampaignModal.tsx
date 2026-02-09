'use client';
import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { logger } from '@/utils/logger';
import { buildApiUrl } from '@/config';
import axiosClient from '../../../AxiosClient';

interface Campaign {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
}

interface UpdateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaign: Campaign | null;
}

export default function UpdateCampaignModal({ isOpen, onClose, onSuccess, campaign }: UpdateCampaignModalProps) {
  const [formData, setFormData] = useState({
    campaign_name: '',
    name: '',
    discount_type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discount_value: undefined as number | undefined,
    min_order_value: undefined as number | undefined,
    max_discount: undefined as number | undefined,
    valid_from: undefined as number | undefined,
    valid_until: undefined as number | undefined,
    public: undefined as boolean | undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (campaign) {
      setFormData({
        campaign_name: campaign.name || '',
        name: '',
        discount_type: 'PERCENTAGE',
        discount_value: undefined,
        min_order_value: undefined,
        max_discount: undefined,
        valid_from: undefined,
        valid_until: undefined,
        public: undefined,
      });
      setError(null);
    }
  }, [campaign, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    
    setLoading(true);
    setError(null);
    try {
      const payload: any = {};
      
      if (formData.campaign_name) payload.campaign_name = formData.campaign_name;
      if (formData.name) payload.name = formData.name;
      if (formData.discount_type) payload.discount_type = formData.discount_type;
      if (formData.discount_value !== undefined) payload.discount_value = formData.discount_value;
      if (formData.min_order_value !== undefined) payload.min_order_value = formData.min_order_value;
      if (formData.max_discount !== undefined) payload.max_discount = formData.max_discount;
      if (formData.valid_from !== undefined) payload.valid_from = formData.valid_from;
      if (formData.valid_until !== undefined) payload.valid_until = formData.valid_until;
      if (formData.public !== undefined) payload.public = formData.public;

      const url = buildApiUrl(`/v1/superuser/coupon/campaign/update/${campaign.id}`);
      await axiosClient.patch(url, payload);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update campaign');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (timestamp: number | undefined) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toISOString().split('T')[0];
  };

  const parseDate = (dateString: string) => {
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
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="w-full pr-8 sm:pr-0">
                  <div className="mb-6 sm:mb-8">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 sm:text-xl sm:leading-7">
                      Update Campaign
                    </Dialog.Title>
                    <p className="mt-1.5 text-xs text-gray-500 sm:text-sm">
                      Update campaign details. Changes to coupon fields will update all associated coupons.
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
                      <label className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                        Campaign Name
                      </label>
                      <input
                        type="text"
                        value={formData.campaign_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, campaign_name: e.target.value }))}
                        className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                        placeholder="Enter campaign name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                        <span>Coupon Description</span>
                        <span className="ml-1 text-xs font-normal text-gray-500">(Updates all coupons)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                        placeholder="Enter coupon description"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                          <span>Discount Type</span>
                          <span className="ml-1 text-xs font-normal text-gray-500">(Updates all coupons)</span>
                        </label>
                        <select
                          value={formData.discount_type}
                          onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value as 'PERCENTAGE' | 'FIXED' }))}
                          className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                        >
                          <option value="PERCENTAGE">Percentage</option>
                          <option value="FIXED">Fixed Amount</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                          <span>Discount Value</span>
                          <span className="ml-1 text-xs font-normal text-gray-500">(Updates all coupons)</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.discount_value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            setFormData(prev => ({ ...prev, discount_value: val !== undefined && isNaN(val) ? undefined : val }));
                          }}
                          onWheel={(e) => e.currentTarget.blur()}
                          className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                          placeholder="Leave empty to keep current"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                          <span>Minimum Order Value</span>
                          <span className="ml-1 text-xs font-normal text-gray-500">(Updates all coupons)</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.min_order_value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            setFormData(prev => ({ ...prev, min_order_value: val !== undefined && isNaN(val) ? undefined : val }));
                          }}
                          onWheel={(e) => e.currentTarget.blur()}
                          className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                          placeholder="Leave empty to keep current"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                          <span>Maximum Discount</span>
                          <span className="ml-1 text-xs font-normal text-gray-500">(Updates all coupons)</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.max_discount ?? ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            setFormData(prev => ({ ...prev, max_discount: val !== undefined && isNaN(val) ? undefined : val }));
                          }}
                          onWheel={(e) => e.currentTarget.blur()}
                          className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                          placeholder="Leave empty to keep current"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                          <span>Valid From</span>
                          <span className="ml-1 text-xs font-normal text-gray-500">(Updates all coupons)</span>
                        </label>
                        <input
                          type="date"
                          value={formatDateForInput(formData.valid_from)}
                          onChange={(e) => setFormData(prev => ({ ...prev, valid_from: parseDate(e.target.value) }))}
                          className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5 sm:text-sm sm:mb-2">
                          <span>Valid Until</span>
                          <span className="ml-1 text-xs font-normal text-gray-500">(Updates all coupons)</span>
                        </label>
                        <input
                          type="date"
                          value={formatDateForInput(formData.valid_until)}
                          onChange={(e) => setFormData(prev => ({ ...prev, valid_until: parseDate(e.target.value) }))}
                          className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-start sm:items-center">
                        <input
                          type="checkbox"
                          id="public"
                          checked={formData.public ?? false}
                          onChange={(e) => setFormData(prev => ({ ...prev, public: e.target.checked }))}
                          className="h-4 w-4 mt-0.5 rounded border-gray-300 text-gray-600 focus:ring-0 focus:ring-offset-0 cursor-pointer sm:mt-0"
                        />
                        <label htmlFor="public" className="ml-2.5 block text-xs font-medium text-gray-700 cursor-pointer leading-relaxed sm:ml-3 sm:text-sm">
                          <span>Make coupons publicly available</span>
                          <span className="ml-1 text-xs font-normal text-gray-500">(Updates all coupons)</span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-0 transition-colors sm:w-auto sm:px-5"
                        onClick={onClose}
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
                          'Update Campaign'
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
