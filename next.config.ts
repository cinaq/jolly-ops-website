import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Configure for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/jolly-ops-website' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
