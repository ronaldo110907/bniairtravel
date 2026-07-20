import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eqzrecpphisfqqqvsmjq.supabase.co",
      },
    ],
  },
};

export default nextConfig;
