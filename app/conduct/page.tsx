import type { Metadata } from "next";
import ConductContent from "@/app/components/ConductContent";

const url = "https://zefer.carrillo.app/conduct";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = {
  title: "Code of Conduct",
  description:
    "Zefer community code of conduct. Our pledge to maintain a welcoming, inclusive, and harassment-free environment for all contributors.",
  keywords: [
    "code of conduct",
    "contributor covenant",
    "open source community",
    "zefer community guidelines",
  ],
  openGraph: {
    url,
    title: "Code of Conduct | Zefer",
    description:
      "Zefer community code of conduct. Our pledge for a welcoming and inclusive environment.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Code of Conduct | Zefer",
    description:
      "Zefer community code of conduct. Our pledge for a welcoming, inclusive, and harassment-free environment.",
  },
  alternates: { canonical: url },
  robots: { index: false, follow: true },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Code of Conduct", item: url },
  ],
};

export default function ConductPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ConductContent />
    </>
  );
}
