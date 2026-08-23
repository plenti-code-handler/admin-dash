export const APPROVAL_PAGE_SIZE = 10;

export type ApprovalSheetKind = 'catalogue' | 'bank' | 'dinein';

export interface CatalogueRequest {
  request_id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_type: string;
  address: string;
  request_catalogue: unknown;
  current_catalogue: unknown;
}

export interface BankAccountDetail {
  vendor_id: string;
  vendor_name: string;
  email: string;
  phone_number: string;
  address: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  status: string;
}

export interface DineinCouponRequest {
  coupon_id: string;
  vendor_id: string;
  vendor_name: string | null;
  site: string;
  address_url: string | null;
  service: string;
  description: string;
  service_type: string;
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  validity_period: number;
  approved: boolean | null;
  is_active: boolean;
  created_at: number;
}
