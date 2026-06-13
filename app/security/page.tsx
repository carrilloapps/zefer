import type { Metadata } from "next";
import SecurityPolicyContent from "@/app/components/SecurityPolicyContent";
import { pageMetadata } from "@/app/lib/seo";

const url = "https://zefer.carrillo.app/security";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = pageMetadata({
  path: "/security",
  index: false,
  title: "Security Policy — Vulnerability Reporting",
  description:
    "Zefer security policy. How to report vulnerabilities, supported versions, security architecture, and responsible disclosure guidelines.",
  keywords: [
    "security policy",
    "vulnerability reporting",
    "responsible disclosure",
    "zefer security",
    "AES-256-GCM security",
  ],
  ogTitle: "Security Policy | Zefer",
  ogDescription:
    "Zefer security policy. How to report vulnerabilities and our security architecture.",
  twitterTitle: "Security Policy | Zefer",
  twitterDescription:
    "Zefer security policy. Vulnerability reporting, security architecture, and responsible disclosure.",
});

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
