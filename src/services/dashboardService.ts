import axiosClient from '../../AxiosClient';
import { CountResponse, PaymentTotalResponse } from '@/types/api';

const ENDPOINTS = {
  USER_COUNT: '/v1/superuser/user/count/get/',
  VENDOR_COUNT: '/v1/superuser/vendor/count/get/',
  ORDER_COUNT: '/v1/superuser/order/count/get/',
  PAYMENT_TOTAL: '/v1/superuser/payment/total/get'
} as const;

export const dashboardService = {
  async getUserCount(): Promise<CountResponse> {
    try {
      const response = await axiosClient.get<CountResponse>(ENDPOINTS.USER_COUNT);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user count:', error);
      throw error;
    }
  },

  async getVendorCount(): Promise<CountResponse> {
    try {
      const response = await axiosClient.get<CountResponse>(ENDPOINTS.VENDOR_COUNT);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch vendor count:', error);
      throw error;
    }
  },

  async getOrderCount(): Promise<CountResponse> {
    try {
      const response = await axiosClient.get<CountResponse>(ENDPOINTS.ORDER_COUNT);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch order count:', error);
      throw error;
    }
  },

  async getPaymentTotal(): Promise<PaymentTotalResponse> {
    try {
      const response = await axiosClient.get<PaymentTotalResponse>(ENDPOINTS.PAYMENT_TOTAL);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment total:', error);
      throw error;
    }
  }
};