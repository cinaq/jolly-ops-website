/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Configure for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/jolly-ops-website' : '',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig; 