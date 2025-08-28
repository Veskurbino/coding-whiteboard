/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    typedRoutes: true
  },
  webpack: (config) => {
    // Ensure Konva works in SSR/Next by aliasing the node build to browser build
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['konva/lib/index-node.js'] = 'konva/lib/index.js';
    config.resolve.alias['konva/lib/index-node'] = 'konva/lib/index.js';
    // Do not try to bundle the node 'canvas' module in browser builds
    config.resolve.fallback = { ...(config.resolve.fallback || {}), canvas: false };
    return config;
  }
};

module.exports = nextConfig;


