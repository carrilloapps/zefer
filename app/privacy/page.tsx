import type { Metadata } from "next";
import PrivacyContent from "@/app/components/PrivacyContent";
import { pageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  index: false,
  title: "Privacy Policy",
  description:
    "Zefer privacy policy. Zero-knowledge architecture, no data collection, no cookies, no trackers. GDPR, CCPA, and LGPD compliant.",
  keywords: ["privacy policy", "zero knowledge", "no data collection", "GDPR compliant", "CCPA compliant", "LGPD compliant"],
  ogTitle: "Privacy Policy | Zefer",
  ogDescription: "Zefer privacy policy. Zero-knowledge architecture, no data collection, GDPR/CCPA/LGPD compliant.",
  twitterTitle: "Privacy Policy | Zefer",
  twitterDescription:
    "Zefer privacy policy. Zero-knowledge, no cookies, no trackers. GDPR, CCPA, and LGPD compliant.",
});

export default function PrivacyPage() {
  return <PrivacyContent />;
}
