import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Disables TypeScript type errors from failing the Vercel build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Prevents ESLint warnings/errors from failing the Vercel build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
