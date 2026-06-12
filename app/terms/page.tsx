import type { Metadata } from "next";
import TermsContent from "@/app/components/TermsContent";
import { pageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/terms",
  index: false,
  title: "Terms & Conditions",
  description:
    "Zefer terms of service: conditions of use, liability limitations, acceptable use policy, and MIT open-source license details.",
  keywords: ["terms of service", "conditions of use", "MIT license", "acceptable use policy"],
  ogTitle: "Terms & Conditions | Zefer",
  ogDescription: "Zefer terms of service, conditions of use, and liability limitations.",
  twitterTitle: "Terms & Conditions | Zefer",
  twitterDescription:
    "Zefer terms of service, acceptable use policy, and liability limitations. MIT Licensed, open-source encryption tool.",
});

export default function TermsPage() {
  return <TermsContent />;
}
