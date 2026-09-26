export type DiscountType = 'PERCENTAGE' | 'FIXED';

export type QualificationCombinator = 'and' | 'or';
export type QualificationField = 'new_user' | 'order_count' | 'service_location';
export type QualificationOperator = '=' | '<' | '<=' | '>=' | '>' | 'in' | 'notIn';

export interface QualificationRule {
  field: QualificationField;
  operator: QualificationOperator;
  value: boolean | number | string | string[];
}

export interface QualificationGroup {
  combinator: QualificationCombinator;
  rules: Array<QualificationRule | QualificationGroup>;
}

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
  image_url: string;
  coupon_type: string;
  user_id?: string | null;
  public?: boolean;
  name?: string;
  qualification?: QualificationGroup | null;
}

export interface CreateCouponData {
  code: string;
  name?: string;
  user_id?: string | null;
  public?: boolean;
  discount_value: number;
  discount_type: DiscountType;
  min_order_value: number;
  max_discount?: number;
  usage_limit?: number;
  valid_from: number;
  valid_until?: number;
  qualification?: QualificationGroup | null;
} 