import type { Metadata } from "next";
import InstallContent from "@/app/components/InstallContent";

const url = "https://zefer.carrillo.app/install";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = {
  title: "Install",
  description:
    "Install Zefer as a Progressive Web App on any device, self-host your own instance with Docker or Vercel, or use it directly from the browser. No account required.",
  keywords: [
    "install zefer",
    "PWA",
    "self-hosting",
    "encryption setup",
    "progressive web app",
    "install encryption app",
    "self-host encryption tool",
    "Docker encryption",
  ],
  openGraph: {
    url,
    title: "Install | Zefer",
    description:
      "Install Zefer as PWA on any device, self-host with Docker or Vercel, or use directly from the browser. No account required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Install | Zefer",
    description:
      "Install Zefer as a PWA, self-host your own instance, or use it directly from the browser. No account required.",
  },
  alternates: { canonical: url },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Install", item: url },
  ],
};

export default function InstallPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <InstallContent />
    </>
  );
}
