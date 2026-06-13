import type { Metadata } from "next";
import ConductContent from "@/app/components/ConductContent";
import { pageMetadata } from "@/app/lib/seo";

const url = "https://zefer.carrillo.app/conduct";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = pageMetadata({
  path: "/conduct",
  index: false,
  title: "Code of Conduct — Contributor Covenant",
  description:
    "Zefer community code of conduct. Our pledge to maintain a welcoming, inclusive, and harassment-free environment for all contributors.",
  keywords: [
    "code of conduct",
    "contributor covenant",
    "open source community",
    "zefer community guidelines",
  ],
  ogTitle: "Code of Conduct | Zefer",
  ogDescription:
    "Zefer community code of conduct. Our pledge for a welcoming and inclusive environment.",
  twitterTitle: "Code of Conduct | Zefer",
  twitterDescription:
    "Zefer community code of conduct. Our pledge for a welcoming, inclusive, and harassment-free environment.",
});

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
