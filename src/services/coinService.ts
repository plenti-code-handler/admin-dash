import axiosClient from '../../AxiosClient';
import { buildApiUrl } from '@/config';

export type CoinIssuance = {
  id: string;
  user_id: string;
  user_name: string | null;
  user_phone: string | null;
  amount: number;
  source_type: string;
  reason: string | null;
  expires_at: number;
  created_at: number;
  checkout_id: string | null;
  idempotency_key: string;
};

export type IssueCoinsRequest = {
  user_id: string;
  amount: number;
  expires_at: number;
  reason?: string;
};

export async function issueCoins(body: IssueCoinsRequest): Promise<{ message: string }> {
  const response = await axiosClient.post<{ message: string }>(
    buildApiUrl('/v1/superuser/coin/issue'),
    body
  );
  return response.data;
}

export async function listMyCoinIssuances(skip = 0, limit = 20): Promise<CoinIssuance[]> {
  const response = await axiosClient.get<CoinIssuance[]>(
    buildApiUrl('/v1/superuser/coin/issuances', { skip, limit })
  );
  return response.data;
}
