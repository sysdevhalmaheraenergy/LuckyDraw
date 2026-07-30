import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        hostname: "hsm-apps.firebasestorage.app",
      },
    ],
  },
};

export default nextConfig;
