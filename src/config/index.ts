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
    // Force HTTPS in production
    apiBaseUrl: (process.env.NEXT_PUBLIC_API_URL || 'https://api.plenti.co.in').replace('http://', 'https://'),
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true'
  }
};

const environment = (process.env.NEXT_PUBLIC_ENV || 'development') as Environment;

export const config: Config = configs[environment];

// Helper function to build API URLs
export const buildApiUrl = (path: string, params?: Record<string, string | number | boolean>) => {
  // Ensure we're using HTTPS in production
  const baseURL = environment === 'production' 
    ? config.apiBaseUrl.replace('http://', 'https://')
    : config.apiBaseUrl;
    
  const url = new URL(path, baseURL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
  }
  
  if (config.debug) {
    console.log('API Request URL:', url.toString());
  }
  
  return url.toString();
}; 