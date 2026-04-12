import type { Metadata } from "next";
import InstallContent from "@/app/components/InstallContent";

const url = "https://zefer.carrillo.app/install";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = {
  title: "Install Zefer — PWA, Self-Host, or Use Online",
  description:
    "Install Zefer as a Progressive Web App, self-host with Docker or Vercel, or encrypt directly from the browser. Free, no account, AES-256-GCM encryption. Compare with Hat.sh, Picocrypt, Bitwarden Send, Cryptomator, and VeraCrypt.",
  keywords: [
    "install zefer",
    "PWA encryption app",
    "self-host encryption",
    "progressive web app",
    "encrypt files online free",
    "hat.sh alternative",
    "picocrypt alternative",
    "bitwarden send alternative",
    "cryptomator alternative",
    "veracrypt alternative",
  ],
  openGraph: {
    url,
    title: "Install Zefer — PWA, Self-Host, or Use Online",
    description:
      "Free AES-256-GCM encryption. Install as PWA, self-host, or use directly in your browser. No account required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Install Zefer — PWA, Self-Host, or Use Online",
    description:
      "Free AES-256-GCM encryption. Install as PWA, self-host, or use in your browser. Compare with Hat.sh, Picocrypt, and more.",
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
