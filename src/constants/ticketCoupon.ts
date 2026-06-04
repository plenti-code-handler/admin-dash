export const TICKET_COUPON_DISCOUNT_VALUES = [5, 7.5, 10, 12.5, 15, 16, 17, 18] as const;

export type TicketCouponValidityPeriod =
  | '1_week'
  | '2_weeks'
  | '1_month'
  | '2_months'
  | '3_months';

export const TICKET_COUPON_VALIDITY_OPTIONS: {
  id: TicketCouponValidityPeriod;
  label: string;
  seconds: number;
}[] = [
  { id: '1_week', label: '1 week', seconds: 7 * 86400 },
  { id: '2_weeks', label: '2 weeks', seconds: 14 * 86400 },
  { id: '1_month', label: '1 month', seconds: 30 * 86400 },
  { id: '2_months', label: '2 months', seconds: 60 * 86400 },
  { id: '3_months', label: '3 months', seconds: 90 * 86400 },
];

export const TICKET_COUPON_VALID_FROM_OFFSET_SECONDS = 86400;
