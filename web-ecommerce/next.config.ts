import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  transpilePackages: [
    "@manufacturing-industry/ui",
    "@manufacturing-industry/config",
    "@manufacturing-industry/types",
    "@manufacturing-industry/templates",
  ],
  experimental: {
    externalDir: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/customer-auth/:path*",
        destination: "http://localhost:5007/api/customer-auth/:path*",
      },
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:5003/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
