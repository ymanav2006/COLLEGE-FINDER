import type { Metadata } from "next";
import { HigherStudiesExplorer } from "./HigherStudiesExplorer";

export const metadata: Metadata = {
  title: "Higher studies planner — master's, professional and research routes",
  description:
    "What comes after a bachelor's degree: master's, professional certifications, research and PhD, medical, legal and teaching routes — with duration, entry requirements, entrance exams, cost notes and last-verified dates.",
  alternates: { canonical: "/higher-studies" },
};

export default function HigherStudiesPage() {
  return <HigherStudiesExplorer />;
}
