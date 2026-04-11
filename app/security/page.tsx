import type { Metadata } from "next";
import SecurityPolicyContent from "@/app/components/SecurityPolicyContent";

const url = "https://zefer.carrillo.app/security";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = {
  title: "Security Policy",
  description:
    "Zefer security policy. How to report vulnerabilities, supported versions, security architecture, and responsible disclosure guidelines.",
  keywords: [
    "security policy",
    "vulnerability reporting",
    "responsible disclosure",
    "zefer security",
    "AES-256-GCM security",
  ],
  openGraph: {
    url,
    title: "Security Policy | Zefer",
    description:
      "Zefer security policy. How to report vulnerabilities and our security architecture.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Security Policy | Zefer",
    description:
      "Zefer security policy. Vulnerability reporting, security architecture, and responsible disclosure.",
  },
  alternates: { canonical: url },
  robots: { index: false, follow: true },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Security Policy", item: url },
  ],
};

export default function SecurityPolicyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <SecurityPolicyContent />
    </>
  );
}
