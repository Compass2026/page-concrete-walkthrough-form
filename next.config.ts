import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Disables TypeScript type errors from failing the Vercel build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
