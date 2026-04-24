export type OrderStatus = 'READY_TO_PICKUP' | 'WAITING_FOR_PICKUP' | 'PICKED_UP';

export interface Order {
  id: string;
  order_code: string;
  user_id: string;
  vendor_id: string;
  payment_id: string;
  checkout_id: string;
  current_status: OrderStatus;
  created_at: number;
  window_start_time: number;
  window_end_time: number;
  transaction_amount: number;
}

/** Superuser order search (`GET /v1/superuser/order/search/...`) */
export interface SuperUserOrderSearchResult {
  order_id: string;
  order_code: string;
  vendor_name: string;
  username: string | null;
  user_phone_number: string | null;
  created_at: number;
  order_status: string;
}

/** Superuser order detail (`GET /v1/superuser/order/get/{order_id}`) */
export interface SuperUserOrderDetail {
  order_id: string;
  order_code: string;
  vendor_name: string;
  username: string;
  user_phone_number: string;
  window_start_time: number;
  window_end_time: number;
  transaction_amount: number;
  created_at: number;
  order_status: string;
  payment_status: string;
}