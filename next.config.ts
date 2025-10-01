// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Don’t fail the production build because of ESLint errors.
    ignoreDuringBuilds: true,
  },
  // (optional) you can add more config here later
};

export default nextConfig;
