import { config, buildApiUrl } from '@/config';

interface ApiResponse<T> {
  response: T;
  total_response?: number;
}

interface ApiOptions {
  token?: string;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
}

export const api = {
  get: async <T>(path: string, { token, params }: ApiOptions = {}): Promise<T> => {
    const url = buildApiUrl(path, params);
    
    const headers: HeadersInit = {
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'API request failed');
    }

    return response.json() as Promise<T>;
  },

  post: async <T>(path: string, { token, data }: ApiOptions = {}): Promise<ApiResponse<T>> => {
    const url = buildApiUrl(path);
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  },

  patch: async (path: string, { token, params }: ApiOptions = {}) => {
    const url = buildApiUrl(path, params);
    
    const headers: HeadersInit = {
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  },

  delete: async (path: string, { token, params }: ApiOptions = {}) => {
    const url = buildApiUrl(path, params);
    
    const headers: HeadersInit = {
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  }
}; 