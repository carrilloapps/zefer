import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zefer — Share Secrets Securely",
    short_name: "Zefer",
    description:
      "End-to-end encrypted secret sharing. Zero-knowledge. Burn after reading.",
    start_url: "/",
    display: "standalone",
    background_color: "#050a0e",
    theme_color: "#22c55e",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
