import type { Metadata } from "next";
import PrivacyContent from "@/app/components/PrivacyContent";

const url = "https://zefer.carrillo.app/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Zefer privacy policy. Zero-knowledge architecture, no data collection, no cookies, no trackers. GDPR, CCPA, and LGPD compliant.",
  keywords: ["privacy policy", "zero knowledge", "no data collection", "GDPR compliant", "CCPA compliant", "LGPD compliant"],
  openGraph: {
    url,
    title: "Privacy Policy | Zefer",
    description: "Zefer privacy policy. Zero-knowledge architecture, no data collection, GDPR/CCPA/LGPD compliant.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Zefer",
    description:
      "Zefer privacy policy. Zero-knowledge, no cookies, no trackers. GDPR, CCPA, and LGPD compliant.",
  },
  alternates: { canonical: url },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
