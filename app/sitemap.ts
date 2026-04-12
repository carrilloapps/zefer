import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://zefer.carrillo.app";
  const lastModified = new Date("2026-04-12T00:00:00Z");

  return [
    { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/how`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/project`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/device`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/install`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/install/guide`, lastModified, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/vs/hat-sh`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/vs/picocrypt`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/vs/bitwarden-send`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/vs/cryptomator`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/vs/veracrypt`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/llms.txt`, lastModified, changeFrequency: "monthly", priority: 0.3 },
  ];
}
