import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  reactStrictMode: true,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
        locale: false
      }
    ]
  },
  env: {
    AUTH_API_BASE: process.env.AUTH_API_BASE,
    AUTH_STATIC_BEARER: process.env.AUTH_STATIC_BEARER,
    AUTH_TENANT: process.env.AUTH_TENANT,
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,
  }
}

export default nextConfig
