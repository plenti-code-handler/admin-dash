export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface Coupon {
  id: string;
  code: string;
  discount_value: number;
  min_order_value: number;
  valid_from: number;
  is_active: boolean;
  times_used: number;
  discount_type: DiscountType;
  max_discount: number | null;
  valid_until: number | null;
  usage_limit: number | null;
}

export interface CreateCouponData {
  code: string;
  discount_value: number;
  discount_type: DiscountType;
  min_order_value: number;
  max_discount?: number;
  usage_limit?: number;
  valid_from: number;
  valid_until?: number;
} 