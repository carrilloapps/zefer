import type { Metadata } from "next";
import TermsContent from "@/app/components/TermsContent";

const url = "https://zefer.carrillo.app/terms";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Zefer terms of service, conditions of use, liability limitations, and acceptable use policy.",
  keywords: ["terms of service", "conditions of use", "MIT license", "acceptable use policy"],
  openGraph: {
    url,
    title: "Terms & Conditions | Zefer",
    description: "Zefer terms of service, conditions of use, and liability limitations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | Zefer",
    description:
      "Zefer terms of service, acceptable use policy, and liability limitations. MIT Licensed, open-source encryption tool.",
  },
  alternates: { canonical: url },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return <TermsContent />;
}
