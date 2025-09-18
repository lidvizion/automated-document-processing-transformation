import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    unoptimized: true, // Allow data URLs
  },
  // Webpack configuration for all environments
  webpack: (config, { isServer }) => {
    // Ensure @ alias is properly resolved in production builds
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    // Additional resolve configuration for deployment
    config.resolve.modules = [
      path.resolve(__dirname, 'src'),
      'node_modules',
    ];
    
    return config;
  },
  // Move typedRoutes to top level (Next.js 15 requirement)
  typedRoutes: false,
};

export default nextConfig;
