import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // App Router soft-navigation'larını document.startViewTransition ile sarar.
    viewTransition: true,
  },
};

export default nextConfig;
