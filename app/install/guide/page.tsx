import type { Metadata } from "next";
import GuideContent from "@/app/components/GuideContent";

export const metadata: Metadata = {
  title: "Usage Guide",
  description: "Complete guide to encrypt and decrypt files with Zefer. Learn about advanced security features, URL parameters for automation, and self-hosting.",
};

export default function GuidePage() {
  return <GuideContent />;
}
