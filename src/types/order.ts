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