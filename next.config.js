/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow images from external sources
  images: {
    domains: ['mbola.org'],
  },
  // Output configuration for Vercel (standalone is optimal)
  output: 'standalone',
}

module.exports = nextConfig
