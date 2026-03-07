import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,

  // Configure TypeScript checking
  typescript: {
    tsconfigPath: "./tsconfig.json"
  },

  // Disable SWC minification to avoid issues with certain dependencies
  swcMinify: true,
};

export default nextConfig;
