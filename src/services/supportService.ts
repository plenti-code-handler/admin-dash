import axiosClient, { axiosFormClient } from '../../AxiosClient';
import { buildApiUrl } from '@/config';
import { api } from '@/services/api';
import type {
  SuperUserSupportTicket,
  SuperUserSupportTicketUpdateBody,
} from '@/types/support';

const SUPPORT_BASE = 'v2/superuser/support';

export type SuperUserRaiseSupportTicketBody = {
  order_id: string;
  ticket_type: string;
  description: string;
};

export async function fetchSupportTicket(
  checkoutId: string
): Promise<SuperUserSupportTicket> {
  return api.get<SuperUserSupportTicket>(`${SUPPORT_BASE}/get`, {
    params: { checkout_id: checkoutId },
  });
}

export async function raiseSupportTicket(
  body: SuperUserRaiseSupportTicketBody
): Promise<{ detail: string }> {
  const formData = new FormData();
  formData.append('support_ticket_data', JSON.stringify(body));
  const response = await axiosFormClient.post<{ detail: string }>(
    buildApiUrl(`${SUPPORT_BASE}/raise`),
    formData
  );
  return response.data;
}

export async function updateSupportTicket(
  checkoutId: string,
  body: SuperUserSupportTicketUpdateBody
): Promise<{ detail: string }> {
  const response = await axiosClient.post<{ detail: string }>(
    buildApiUrl(`${SUPPORT_BASE}/update`, { checkout_id: checkoutId }),
    body
  );
  return response.data;
}
