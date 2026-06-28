import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },

      // Backend uploads (localhost)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },

      // Production backend (change later)
      {
        protocol: "https",
        hostname: "api.stratumiq.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;