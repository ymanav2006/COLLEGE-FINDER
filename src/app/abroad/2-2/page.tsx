import type { Metadata } from "next";
import { TwinningExplorer } from "./TwinningExplorer";

export const metadata: Metadata = {
  title: "2+2 and transfer pathways — study 2 years in India, 2 abroad",
  description:
    "Split-degree routes: 2+2, 3+1, 2+1, 1+3 and credit transfer. What each structure costs on both legs, how credit transfer actually works, what can go wrong, and exactly where to verify the current agreement before you pay.",
  alternates: { canonical: "/abroad/2-2" },
};

export default function TwinningPage() {
  return <TwinningExplorer />;
}
