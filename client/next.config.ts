import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    unoptimized: true,
  },
  // Allow cheerio + service files (CommonJS) to be bundled in API routes
  serverExternalPackages: [],
};

export default nextConfig;
