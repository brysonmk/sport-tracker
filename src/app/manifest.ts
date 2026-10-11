import type { MetadataRoute } from "next";

/** Web app manifest: lets phones "install" Sports Tracker to the home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sports Tracker",
    short_name: "Sports Tracker",
    description: "Standings, player stats and live scores for your soccer league.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7f5",
    theme_color: "#0f7a3d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
