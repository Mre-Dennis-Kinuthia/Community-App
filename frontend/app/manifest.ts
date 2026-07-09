import type { MetadataRoute } from "next"

const APP_ID = "/"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: APP_ID,
    name: "Impact Hub Nairobi",
    short_name: "Impact Hub",
    description:
      "Impact Hub Nairobi member platform — book workspace, connect with the community, and join programs.",
    start_url: "/dashboard?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#A6192E",
    categories: ["business", "productivity", "social"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/impact-hub-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  }
}
