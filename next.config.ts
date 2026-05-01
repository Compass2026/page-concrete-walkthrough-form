import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disables ESLint errors from failing the build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disables TypeScript type errors from failing the build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
