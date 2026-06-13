import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Allow any HTTPS image source so admins can paste image links from
    // anywhere (Cloudinary, Unsplash, social media, etc.)
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
