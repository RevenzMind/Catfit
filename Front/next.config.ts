import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "us-east-1.tixte.net",
      },
      {
        protocol: "https",
        hostname: "tr.rbxcdn.com",
      },
    ],
  },
};

export default nextConfig;
