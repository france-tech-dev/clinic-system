import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Upload de logo/avatar até 5 MB (MEDIA_KIND); margem para multipart.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    qualities: [75, 85, 95, 100],
  },
};

export default nextConfig;
