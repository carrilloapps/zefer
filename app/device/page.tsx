import type { Metadata } from "next";
import DeviceContent from "@/app/components/DeviceContent";

const url = "https://zefer.carrillo.app/device";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = {
  title: "Device Detection and Encryption Performance",
  description:
    "See how Zefer detects your device RAM, CPU cores, and GPU to calculate dynamic file size limits. Optimize your browser for maximum encryption performance.",
  keywords: [
    "device detection",
    "browser performance",
    "encryption speed",
    "Web Crypto API",
    "file size limits",
    "browser optimization",
    "encryption performance test",
    "client-side crypto benchmark",
  ],
  openGraph: {
    url,
    title: "Device & Performance | Zefer",
    description:
      "Live device detection: RAM, CPU, GPU. See how Zefer calculates your maximum file size and optimize your browser for encryption.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Device & Performance | Zefer",
    description:
      "Live device detection and browser optimization for maximum encryption performance. See your RAM, CPU, and GPU analysis.",
  },
  alternates: { canonical: url },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Device & Performance", item: url },
  ],
};

export default function DevicePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <DeviceContent />
    </>
  );
}
