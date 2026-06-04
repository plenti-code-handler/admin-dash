import {
  TICKET_COUPON_VALID_FROM_OFFSET_SECONDS,
  TICKET_COUPON_VALIDITY_OPTIONS,
  type TicketCouponValidityPeriod,
} from '@/constants/ticketCoupon';

export function getTicketCouponDescription(discountValue: number): string {
  return `Get flat ${discountValue}% off for your order.`;
}

export function getTicketCouponValidFrom(nowSeconds = Math.floor(Date.now() / 1000)) {
  return nowSeconds - TICKET_COUPON_VALID_FROM_OFFSET_SECONDS;
}

export function getTicketCouponValidUntil(
  validityPeriod: TicketCouponValidityPeriod,
  validFrom: number
) {
  const option = TICKET_COUPON_VALIDITY_OPTIONS.find((item) => item.id === validityPeriod);
  if (!option) {
    throw new Error('Invalid validity period');
  }
  return validFrom + option.seconds;
}

export function generateTicketCouponCode() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TKT${suffix}`;
}
