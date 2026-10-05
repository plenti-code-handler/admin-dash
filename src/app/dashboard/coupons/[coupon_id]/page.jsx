'use client';
import { useCallback, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import axiosClient from '../../../../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';
import { api } from '@/services/api';
import UpdateCouponModal from '@/components/coupons/UpdateCouponModal';
import ToastNotice from '@/components/common/ToastNotice';

function Section({ title, children }) {
  return (
    <section className="glass-card rounded-xl p-4 sm:p-6">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="mb-1 block text-sm font-medium text-gray-700">{label}</p>
      <div className="text-sm text-gray-900">{children}</div>
    </div>
  );
}

function StatusBadge({ label, tone }) {
  const toneClass = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
  }[tone];

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${toneClass}`}>
      {label}
    </span>
  );
}

function CopyButton({ copied, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-green-600" />
      ) : (
        <ClipboardDocumentIcon className="h-4 w-4" />
      )}
    </button>
  );
}

export default function CouponDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const couponId = Array.isArray(params?.coupon_id) ? params.coupon_id[0] : params?.coupon_id;

  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (couponId) {
      fetchCoupon();
    }
  }, [couponId]);

  const fetchCoupon = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = buildApiUrl(`/v1/superuser/coupon/get/${couponId}`);
      const response = await axiosClient.get(url);
      setCoupon(response.data);
      setImageFailed(false);
    } catch (err) {
      logger.error('Error fetching coupon:', err);
      setError(err.response?.data?.detail || 'Failed to fetch coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await api.delete('/v1/superuser/coupon/delete', {
        params: { coupon_id: couponId },
      });
      router.push('/dashboard/coupons');
    } catch (err) {
      logger.error('Error deleting coupon:', err);
      setToast({
        message: err.response?.data?.detail || 'Failed to delete coupon',
        variant: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateSuccess = async () => {
    setIsUpdateModalOpen(false);
    await fetchCoupon();
  };

  const copyValue = async (value, key, label) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1500);
      setToast({ message: `${label} copied`, variant: 'success' });
    } catch (err) {
      logger.error('Error copying value:', err);
      setToast({ message: `Could not copy ${label.toLowerCase()}`, variant: 'error' });
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatType = (value) => value.replace(/_/g, ' ').toLowerCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
        </div>
      ) : error || !coupon ? (
        <div className="glass-card rounded-xl p-6">
          <div className="py-12 text-center">
            <h3 className="mb-2 text-sm font-medium text-gray-900">Error</h3>
            <p className="mb-4 text-sm text-gray-500">{error || 'Coupon not found'}</p>
            <button
              onClick={() => router.push('/dashboard/coupons')}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Coupons
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="glass-card rounded-xl p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => router.push('/dashboard/coupons')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Update
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {coupon.image_url && !imageFailed ? (
                  <img
                    src={coupon.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-indigo-600">
                    {(coupon.code || '?').slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h1 className="break-all text-xl font-mono font-semibold text-gray-900">
                    {coupon.code}
                    <CopyButton
                      copied={copied === 'code'}
                      label="Copy coupon code"
                      onClick={() => copyValue(coupon.code, 'code', 'Coupon code')}
                    />
                  </h1>
                  
                </div>
                {coupon.name && (
                  <div className="mt-1 flex items-center gap-1">
                    <p className="break-all  text-sm text-gray-900">{coupon.name}</p>
                  </div>
                )}
                <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold capitalize text-gray-800">
                  {formatType(coupon.coupon_type)}
                </span>
              </div>
            </div>
          </div>

          <Section title="Status">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <Field label="Status">
                <StatusBadge
                  label={coupon.is_active ? 'Active' : 'Inactive'}
                  tone={coupon.is_active ? 'green' : 'gray'}
                />
              </Field>
              <Field label="Visibility">
                <StatusBadge
                  label={coupon.public ? 'Public' : 'Private'}
                  tone={coupon.public ? 'blue' : 'gray'}
                />
              </Field>
              <Field label="Times used">{coupon.times_used}</Field>
              <Field label="Usage limit">{coupon.usage_limit ? coupon.usage_limit : 'Unlimited'}</Field>
            </div>
          </Section>

          <Section title="Offer">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field label="Discount type">
                <p className="capitalize">{formatType(coupon.discount_type)}</p>
              </Field>
              <Field label="Discount value">
                {coupon.discount_type === 'PERCENTAGE'
                  ? `${coupon.discount_value}%`
                  : `₹${coupon.discount_value}`}
              </Field>
              <Field label="Minimum order value">₹{coupon.min_order_value}</Field>
              <Field label="Maximum discount">
                {coupon.max_discount ? `₹${coupon.max_discount}` : 'No limit'}
              </Field>
            </div>
          </Section>

          <Section title="Validity">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field label="Valid from">{formatDate(coupon.valid_from)}</Field>
              <Field label="Valid until">
                {coupon.valid_until ? formatDate(coupon.valid_until) : 'No expiry'}
              </Field>
              <Field label="Created">{formatDate(coupon.created_at)}</Field>
            </div>
          </Section>

          {coupon.user_id && (
            <Section title="Assigned user">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="User ID">
                  <div className="flex items-start gap-2">
                    <p className="break-all font-mono text-xs sm:text-sm">{coupon.user_id}</p>
                    <CopyButton
                      copied={copied === 'user'}
                      label="Copy user ID"
                      onClick={() => copyValue(coupon.user_id, 'user', 'User ID')}
                    />
                  </div>
                </Field>
                <Field label="User name">{coupon.user_name || '—'}</Field>
                <Field label="Phone number">
                  {coupon.user_phone_number ? (
                    <a
                      href={`tel:${coupon.user_phone_number.replace(/\s/g, '')}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {coupon.user_phone_number}
                    </a>
                  ) : (
                    '—'
                  )}
                </Field>
              </div>
            </Section>
          )}

          <UpdateCouponModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            onSuccess={handleUpdateSuccess}
            coupon={coupon}
          />
        </>
      )}
      <ToastNotice toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
