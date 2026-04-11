import type { Metadata } from "next";
import ProjectContent from "@/app/components/ProjectContent";

const url = "https://zefer.carrillo.app/project";

export const metadata: Metadata = {
  title: "Project",
  description:
    "Zefer is an open-source, client-side encryption tool. MIT Licensed. Created by José Carrillo.",
  keywords: ["open source encryption", "MIT license", "José Carrillo", "carrilloapps", "zefer project"],
  openGraph: {
    url,
    title: "Project | Zefer",
    description: "Zefer is an open-source, client-side encryption tool. MIT Licensed. Created by José Carrillo.",
  },
  twitter: {
    title: "Project | Zefer",
    description: "Open-source client-side encryption tool. MIT Licensed.",
  },
  alternates: { canonical: url },
};

export default function ProjectPage() {
  return <ProjectContent />;
}
