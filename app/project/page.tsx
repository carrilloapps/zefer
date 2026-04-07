import type { Metadata } from "next";
import ProjectContent from "@/app/components/ProjectContent";

export const metadata: Metadata = {
  title: "Project",
  description:
    "Zefer is an open-source, client-side encryption tool. MIT Licensed. Created by José Carrillo.",
};

export default function ProjectPage() {
  return <ProjectContent />;
}
