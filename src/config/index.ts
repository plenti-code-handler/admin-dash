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
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.plenti.co.in',
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true'
  }
};

const environment = (process.env.NEXT_PUBLIC_ENV || 'development') as Environment;

export const config: Config = configs[environment];

// Helper function to build API URLs
export const buildApiUrl = (path: string, params?: Record<string, string | number | boolean>) => {
  const url = new URL(`${config.apiBaseUrl}${path}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  if (config.debug) {
    console.log('API Request URL:', url.toString());
  }
  
  return url.toString();
}; 