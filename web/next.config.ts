import type { NextConfig } from "next";

const engineBase =
  process.env.ENGINE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/engine/:path*",
          destination: `${engineBase}/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;

