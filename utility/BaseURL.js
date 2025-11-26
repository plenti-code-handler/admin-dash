// Environment-based base URL configuration
const getBaseUrl = () => {
    if (typeof window === 'undefined') {
      // Server-side: use environment variable or default
      return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    }
    
    // Client-side: check environment
    const env = process.env.NEXT_PUBLIC_ENV || 'development';
    
    if (env === 'production') {
      return 'https://api.plenti.co.in';
    }
    
    return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  };
  
  export const baseUrl = getBaseUrl();