type Environment = 'development' | 'production';

interface Config {
  apiBaseUrl: string;
  debug: boolean;
}

const configs: Record<Environment, Config> = {
  development: {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true'
  },
  production: {
    // Ensure HTTPS for production URL
    apiBaseUrl: 'https://api.plenti.co.in',
    debug: false
  }
};

const environment = (process.env.NEXT_PUBLIC_ENV || 'development') as Environment;

export const config: Config = configs[environment];

// Helper function to build API URLs
export const buildApiUrl = (path: string, params?: Record<string, string | number | boolean>) => {
  // Always force HTTPS in production
  let baseURL = config.apiBaseUrl;
  if (environment === 'production') {
    baseURL = baseURL.replace('http://', 'https://');
  }
    
  const url = new URL(path, baseURL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
  }
  
  // Force HTTPS for production URLs
  if (environment === 'production') {
    url.protocol = 'https:';
  }
  
  if (config.debug) {
    console.log('API Request URL:', url.toString());
  }
  
  return url.toString();
}; 