'use client';

import { useMemo, useState } from 'react';
import {
  TICKET_COUPON_DISCOUNT_VALUES,
  TICKET_COUPON_VALIDITY_OPTIONS,
  type TicketCouponValidityPeriod,
} from '@/constants/ticketCoupon';
import { createCoupon } from '@/services/couponService';
import { getApiErrorDetail } from '@/utils/apiError';
import {
  generateTicketCouponCode,
  getTicketCouponDescription,
  getTicketCouponValidFrom,
  getTicketCouponValidUntil,
} from '@/utils/ticketCoupon';
import { formatUnixSeconds } from '@/utils/datetime';

type Props = {
  userId: string;
  checkoutId?: string | null;
  disabled?: boolean;
  onCreated?: (couponCode: string) => void | Promise<void>;
  className?: string;
};

export default function TicketCouponForm({
  userId,
  checkoutId,
  disabled = false,
  onCreated,
  className = '',
}: Props) {
  const [discountValue, setDiscountValue] = useState<number | null>(null);
  const [validityPeriod, setValidityPeriod] = useState<TicketCouponValidityPeriod>('1_week');
  const [usageLimit, setUsageLimit] = useState('1');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const description =
    discountValue !== null ? getTicketCouponDescription(discountValue) : null;

  const validityPreview = useMemo(() => {
    const validFrom = getTicketCouponValidFrom();
    const validUntil = getTicketCouponValidUntil(validityPeriod, validFrom);
    return {
      validFrom,
      validUntil,
    };
  }, [validityPeriod]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (discountValue === null) {
      setError('Select a discount percentage.');
      return;
    }

    const parsedUsageLimit = Number.parseInt(usageLimit.trim(), 10);
    if (!Number.isFinite(parsedUsageLimit) || parsedUsageLimit < 1) {
      setError('Usage limit must be at least 1.');
      return;
    }

    setBusy(true);
    setError(null);
    setSuccessCode(null);

    try {
      const validFrom = getTicketCouponValidFrom();
      const code = generateTicketCouponCode();

      const response = await createCoupon(
        {
          code,
          name: getTicketCouponDescription(discountValue),
          user_id: userId,
          discount_type: 'PERCENTAGE',
          discount_value: discountValue,
          min_order_value: 0,
          max_discount: 1000,
          usage_limit: parsedUsageLimit,
          public: false,
          valid_from: validFrom,
          valid_until: getTicketCouponValidUntil(validityPeriod, validFrom),
        },
        checkoutId
      );

      const createdCode = response?.coupon?.code ?? code;
      setSuccessCode(createdCode);
      if (onCreated) {
        await onCreated(createdCode);
      }
    } catch (err) {
      setError(getApiErrorDetail(err, 'Failed to create coupon'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900">Issue coupon</h3>

      <div>
        <span className="mb-1.5 block text-xs text-gray-600">Discount</span>
        <div className="flex flex-wrap gap-2">
          {TICKET_COUPON_DISCOUNT_VALUES.map((value) => (
            <button
              key={value}
              type="button"
              disabled={busy || disabled}
              onClick={() => setDiscountValue(value)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                discountValue === value
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                  : 'border-gray-200 text-gray-700'
              } disabled:opacity-50`}
            >
              {value}%
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1 block text-xs text-gray-600">Description</span>
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
          {description ?? 'Select a discount to preview the coupon description.'}
        </p>
      </div>

      <div>
        <label htmlFor="ticket-coupon-validity" className="mb-1 block text-xs text-gray-600">
          Valid for
        </label>
        <select
          id="ticket-coupon-validity"
          value={validityPeriod}
          onChange={(e) => setValidityPeriod(e.target.value as TicketCouponValidityPeriod)}
          disabled={busy || disabled}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {TICKET_COUPON_VALIDITY_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Valid from {formatUnixSeconds(validityPreview.validFrom)} until{' '}
          {formatUnixSeconds(validityPreview.validUntil)} IST
        </p>
      </div>

      <div>
        <label htmlFor="ticket-coupon-usage-limit" className="mb-1 block text-xs text-gray-600">
          Usage limit
        </label>
        <input
          id="ticket-coupon-usage-limit"
          type="text"
          inputMode="numeric"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          value={usageLimit}
          onChange={(e) => setUsageLimit(e.target.value)}
          disabled={busy || disabled}
        />
      </div>

      {successCode && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
          Coupon created: <span className="font-mono font-semibold">{successCode}</span>
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || disabled}
        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {busy ? 'Creating…' : 'Create coupon'}
      </button>
    </form>
  );
}
