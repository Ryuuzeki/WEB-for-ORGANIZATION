import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // instrumentationHook: true, // In Next 15 it's often enabled by default or under this flag
  }
};

export default nextConfig;
