import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // Allow build to complete even with unused variables (created by linters)
    tsconfigPath: './tsconfig.json',
  },
  // Skip static generation for routes with environment variable dependencies
  staticPageGenerationTimeout: 180,
}

export default nextConfig
