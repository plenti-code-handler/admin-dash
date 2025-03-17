export type PaymentStatus = 'CAPTURED' | 'FAILED' | 'REFUND';
export type PaymentType = 'upi' | 'netbanking';

export interface Payment {
  id: string;
  user_id: string;
  checkout_id: string;
  payment_gateway_id: string;
  payment_order_id: string;
  payment_type: PaymentType;
  transaction_amount: number;
  status: PaymentStatus;
  responses: Record<string, unknown> | null;
  created_at: number;
  updated_at: number;
} 