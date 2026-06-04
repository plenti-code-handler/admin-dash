import { buildApiUrl } from '@/config';
import { axiosFormClient } from '../../AxiosClient';

export type CreateTicketCouponPayload = {
  code: string;
  name: string;
  user_id: string;
  discount_type: 'PERCENTAGE';
  discount_value: number;
  min_order_value: number;
  max_discount: number;
  usage_limit: number;
  public: false;
  valid_from: number;
  valid_until: number;
};

export async function createCoupon(
  payload: CreateTicketCouponPayload,
  checkoutId?: string | null
) {
  const form = new FormData();
  form.append('data', JSON.stringify(payload));

  const params = checkoutId ? { checkout_id: checkoutId } : undefined;
  const url = buildApiUrl('/v1/superuser/coupon/create');
  const { data } = await axiosFormClient.post(url, form, { params });
  return data;
}
