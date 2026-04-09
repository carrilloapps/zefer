import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://zefer.carrillo.app";
  const lastModified = new Date("2026-04-07T23:59:00Z");

  return [
    { url: baseUrl, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/how`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/project`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/device`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/install`, lastModified, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/install/guide`, lastModified, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/llms.txt`, lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/agents.md`, lastModified, changeFrequency: "monthly", priority: 0.3 },
  ];
}
