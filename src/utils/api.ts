import { baseUrl } from '../../utility/BaseURL';

export const buildApiUrl = (path: string, params?: Record<string, string | number | boolean>) => {
  const url = new URL(path, baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
  }
  return url.toString();
};
