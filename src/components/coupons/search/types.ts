export interface SearchCouponResult {
  coupon_id: string;
  code: string;
  name: string;
  valid_from: number;
  valid_until: number | null;
}

export interface Campaign {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
}

export function formatCouponDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
