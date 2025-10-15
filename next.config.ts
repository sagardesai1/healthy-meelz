import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */

  // Set the correct workspace root to avoid lockfile warnings
  outputFileTracingRoot: path.join(__dirname),

  // Exclude Firebase Functions directory from Next.js build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "firebase-functions": false,
        "firebase-admin": false,
      };
    }
    return config;
  },
};

export default nextConfig;
