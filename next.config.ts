import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Old placeholder routes from the original skeleton, kept working for old bookmarks.
  async redirects() {
    return [
      { source: "/login", destination: "/open", permanent: true },
      { source: "/matches-table", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
