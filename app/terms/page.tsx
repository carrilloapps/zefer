import type { Metadata } from "next";
import TermsContent from "@/app/components/TermsContent";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Zefer terms of service, conditions of use, liability limitations, and acceptable use policy.",
};

export default function TermsPage() {
  return <TermsContent />;
}
