import type { Metadata } from "next";
import PrivacyContent from "@/app/components/PrivacyContent";

const url = "https://zefer.carrillo.app/privacy";

export const metadata: Metadata = {
  title: "Privacy & Security",
  description:
    "Zefer privacy policy and security details. Zero-knowledge architecture, AES-256-GCM encryption, minimal metadata, automatic expiration, and burn-after-reading.",
  keywords: ["privacy policy", "zero knowledge", "no data collection", "GDPR compliant", "CCPA compliant", "encryption privacy"],
  openGraph: {
    url,
    title: "Privacy & Security | Zefer",
    description: "Zefer privacy policy. Zero-knowledge architecture, no data collection, GDPR/CCPA/LGPD compliant.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy & Security | Zefer",
    description:
      "Zefer privacy policy. Zero-knowledge architecture, no cookies, no trackers. GDPR, CCPA, and LGPD compliant.",
  },
  alternates: { canonical: url },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
