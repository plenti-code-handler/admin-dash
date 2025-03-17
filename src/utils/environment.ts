export const isDevelopment = process.env.NEXT_PUBLIC_ENV === 'development';
export const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';

export const getEnvironment = () => process.env.NEXT_PUBLIC_ENV || 'development';

// Usage example for debugging
export const logEnvironment = () => {
  console.log(`Running in ${getEnvironment()} mode`);
  console.log(`API URL: ${process.env.NEXT_PUBLIC_API_URL}`);
}; 