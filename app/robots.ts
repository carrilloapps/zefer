import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/sw.js"],
      },
    ],
    sitemap: "https://zefer.carrillo.app/sitemap.xml",
    host: "https://zefer.carrillo.app",
  };
}
