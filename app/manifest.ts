import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BNI항공여행",
    short_name: "BNI여행",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#c8a15a",

    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}