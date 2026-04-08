import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zefer — Share Secrets Securely",
    short_name: "Zefer",
    description: "End-to-end encrypted secret sharing. AES-256-GCM. Zero-knowledge. 100% client-side.",
    start_url: "/",
    display: "standalone",
    background_color: "#050a0e",
    theme_color: "#22c55e",
    orientation: "portrait-primary",
    categories: ["security", "utilities", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
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
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
