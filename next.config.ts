import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "10.10.3.80",
        port: "3001",
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://16.16.197.93:3000/api/:path*', 
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://16.16.197.93:3000/socket.io/:path*', 
      },
    ];
  },
  allowedDevOrigins: ['10.10.3.80'],
};

export default nextConfig;

