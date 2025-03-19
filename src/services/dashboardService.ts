import { buildApiUrl } from '@/config';
import { CountResponse, PaymentTotalResponse } from '@/types/api';

const ENDPOINTS = {
  USER_COUNT: '/v1/superuser/user/count/get/',
  VENDOR_COUNT: '/v1/superuser/vendor/count/get/',
  ORDER_COUNT: '/v1/superuser/order/count/get/',
  PAYMENT_TOTAL: '/v1/superuser/payment/total/get'
} as const;

async function fetchWithAuth<T>(url: string, token: string): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    console.log(response, "************");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to fetch data from API');
  }
}

export const dashboardService = {
  async getUserCount(token: string): Promise<CountResponse> {
    try {
      const url = buildApiUrl(ENDPOINTS.USER_COUNT);
      return await fetchWithAuth<CountResponse>(url, token);
    } catch (error) {
      console.error('Failed to fetch user count:', error);
      throw error;
    }
  },

  async getVendorCount(token: string): Promise<CountResponse> {
    try {
      const url = buildApiUrl(ENDPOINTS.VENDOR_COUNT);
      return await fetchWithAuth<CountResponse>(url, token);
    } catch (error) {
      console.error('Failed to fetch vendor count:', error);
      throw error;
    }
  },

  async getOrderCount(token: string): Promise<CountResponse> {
    try {
      const url = buildApiUrl(ENDPOINTS.ORDER_COUNT);
      return await fetchWithAuth<CountResponse>(url, token);
    } catch (error) {
      console.error('Failed to fetch order count:', error);
      throw error;
    }
  },

  async getPaymentTotal(token: string): Promise<PaymentTotalResponse> {
    try {
      const url = buildApiUrl(ENDPOINTS.PAYMENT_TOTAL);
      return await fetchWithAuth<PaymentTotalResponse>(url, token);
    } catch (error) {
      console.error('Failed to fetch payment total:', error);
      throw error;
    }
  }
}; 