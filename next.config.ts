import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Basic hardening headers for every page.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          // Other sites only ever see our origin, never a path (admin links contain the token).
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  // Old placeholder routes from the original skeleton, kept working for old bookmarks.
  async redirects() {
    return [
      { source: "/login", destination: "/open", permanent: true },
      { source: "/matches-table", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
