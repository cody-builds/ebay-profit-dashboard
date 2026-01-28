/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')()
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: './analyze/client.html',
            openAnalyzer: false,
          })
        )
      }
      return config
    },
  }),

  // Performance optimizations
  experimental: {
    // optimizeCss: true, // Disabled due to critters module dependency issues
  },

  // Security headers (additional to vercel.json)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ],
      },
    ]
  },

  // Redirects and rewrites for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Image optimization
  images: {
    domains: ['images.pokemontcg.io', 'tcgplayer-cdn.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
