import type { NextConfig } from 'next';
const config: NextConfig = {
  allowedDevOrigins: ['hash-analyst-interface-variance.trycloudflare.com'],
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
};
export default config;
