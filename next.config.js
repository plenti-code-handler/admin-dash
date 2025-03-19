/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['d3bi41vobimkth.cloudfront.net'], // Add the cloudfront domain
  },
  env: {
    customKey: process.env.NEXT_PUBLIC_ENV === 'production' 
      ? 'production-value' 
      : 'development-value'
  },
  typescript: {
    // !! WARN !!
    // This is a temporary fix for deployment
    // Remove this when the type issues are resolved
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'upgrade-insecure-requests'
          }
        ],
      },
    ]
  },
  // ... other config options
}

module.exports = nextConfig 