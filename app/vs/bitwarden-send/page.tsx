import type { Metadata } from "next";
import VsContent from "@/app/components/VsContent";

const url = "https://zefer.carrillo.app/vs/bitwarden-send";
const siteUrl = "https://zefer.carrillo.app";

export const metadata: Metadata = {
  title: "Zefer vs Bitwarden Send — Free Secret Sharing Compared",
  description:
    "Compare Zefer and Bitwarden Send for sharing secrets. Free vs freemium, no account vs vault-integrated, and advanced access controls compared.",
  keywords: ["zefer vs bitwarden send", "bitwarden send alternative", "free secret sharing", "bitwarden send review", "share passwords securely"],
  openGraph: { url, title: "Zefer vs Bitwarden Send — Free Secret Sharing", description: "Free zero-knowledge encryption vs vault-integrated secret sharing. Full comparison." },
  twitter: { card: "summary_large_image", title: "Zefer vs Bitwarden Send", description: "Which free secret sharing tool is right for you? Zero-knowledge vs vault-integrated." },
  alternates: { canonical: url },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Zefer vs Bitwarden Send", item: url },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Is Zefer a good alternative to Bitwarden Send?", acceptedAnswer: { "@type": "Answer", text: "Yes. Zefer is completely free with no account required, offers more access control features (dual key, secret question, IP restriction), and is 100% client-side. Bitwarden Send requires a Bitwarden account and limits file sharing to premium users." } },
    { "@type": "Question", name: "Can I share secrets without creating an account?", acceptedAnswer: { "@type": "Answer", text: "With Zefer, yes. You can encrypt and share secrets immediately with no sign-up. Bitwarden Send requires a Bitwarden account, and file attachments require a premium subscription." } },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <VsContent competitor="bitwarden" />
    </>
  );
}
