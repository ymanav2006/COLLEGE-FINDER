import type { Metadata } from "next";
import { UniversitiesExplorer } from "./UniversitiesExplorer";

export const metadata: Metadata = {
  title: "Universities — worldwide first, then India",
  description:
    "Every university tracked in this build, ordered strongest-first with the formula shown in full. Universities outside India are listed first, then Indian institutions — with the 13-dimension scorecard, fees, eligibility and sources behind each one.",
  alternates: { canonical: "/universities" },
};

export default function UniversitiesPage() {
  return <UniversitiesExplorer />;
}
