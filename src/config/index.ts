type Environment = 'development' | 'production';

interface Config {
  apiBaseUrl: string;
  debug: boolean;
}

const configs: Record<Environment, Config> = {
  development: {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true', 
    // protocol: process.env.NEXT_PUBLIC_API_URL?.split('://')[0] || 'https:',
    // host: process.env.NEXT_PUBLIC_API_URL?.split('://')[1] || 'api.plenti.co.in'

  },
  production: {
    apiBaseUrl: 'https://api.plenti.co.in',
    debug: false, 
    // protocol: 'https:',
    // host: 'api.plenti.co.in'
  }
};

const environment = (process.env.NEXT_PUBLIC_ENV || 'development') as Environment;

export const config: Config = configs[environment];

// Helper function to build API URLs
export const buildApiUrl = (path: string, params?: Record<string, string | number | boolean>) => {
  const url = new URL(path, config.apiBaseUrl);
  
  // Force correct protocol and host based on environment
  // if (environment === 'production') {
  //   url.protocol = 'https:';
  //   url.host = 'api.plenti.co.in';
  // } else {
  //   url.protocol = 'https:';
  //   url.host = 'api.plenti.co.in';
  // }
  
  // Add query parameters if any
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
  }
  
  const finalUrl = url.toString();

  
  if (config.debug) {
    console.log('Built API URL:', finalUrl);
  }
  
  return finalUrl;
}; 