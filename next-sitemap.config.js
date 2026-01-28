/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://dealflow.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  sitemapSize: 7000,
  
  // Routes to exclude from sitemap
  exclude: [
    '/api/*',
    '/admin/*',
    '/_next/*',
    '/404',
    '/500',
  ],
  
  // Additional paths to include
  additionalPaths: async (config) => [
    await config.transform(config, '/opportunities'),
    await config.transform(config, '/calculator'),
  ],
  
  // Robots.txt configuration
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://dealflow.vercel.app/server-sitemap.xml', // Future server-generated sitemap
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
    ],
  },
  
  // Transform function for custom sitemap entries
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: path === '/' ? 'daily' : 'weekly',
      priority: path === '/' ? 1.0 : 0.8,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}