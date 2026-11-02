import axiosClient from '../../AxiosClient';
import { buildApiUrl } from '@/config';

export type RefundMethod = 'cash' | 'coins';

export type RefundRequest = {
  refund_reason: string;
  refund_multiplier: number;
  refund_method?: RefundMethod;
};

export async function initiateOrderRefund(
  orderId: string,
  body: RefundRequest
): Promise<{ message: string }> {
  const response = await axiosClient.post<{ message: string }>(
    buildApiUrl(`/v1/superuser/order/refund/${encodeURIComponent(orderId)}`),
    body
  );
  return response.data;
}
