import axiosClient from '../../AxiosClient';
import { buildApiUrl } from '@/config';

interface ApiOptions {
  params?: Record<string, string | number | boolean>;
  data?: unknown;
}

interface ApiResponse<T> {
  response: T;
  total_response?: number;
}

export const api = {
  get: async <T>(path: string, { params }: ApiOptions = {}): Promise<T> => {
    const url = buildApiUrl(path, params);
    const response = await axiosClient.get<T>(url);
    return response.data;
  },

  post: async <T>(path: string, { data, params }: ApiOptions = {}): Promise<ApiResponse<T>> => {
    const url = buildApiUrl(path, params);
    const response = await axiosClient.post<ApiResponse<T>>(url, data);
    return response.data;
  },

  patch: async <T>(path: string, { data, params }: ApiOptions = {}): Promise<T> => {
    const url = buildApiUrl(path, params);
    const response = await axiosClient.patch<T>(url, data);
    return response.data;
  },

  delete: async <T>(path: string, { params }: ApiOptions = {}): Promise<T> => {
    const url = buildApiUrl(path, params);
    const response = await axiosClient.delete<T>(url, { params });
    return response.data;
  }
};