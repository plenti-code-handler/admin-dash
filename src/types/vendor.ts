export type VendorType = 'RESTAURANT' | 'BAKERY' | 'SUPERMARKET';

export interface Vendor {
  id: string;
  vendor_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  is_online: boolean;
  created_at: number;
  vendor_type: VendorType;
  store_manager_name: string | null;
  descriptions: string[];
  address_url: string;
  pincode: string;
  gst_number: string;
  latitude: number;
  longitude: number;
  logo_url?: string;
} 