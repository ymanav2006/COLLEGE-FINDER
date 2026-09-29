import type { Metadata } from "next";
import { AbroadSearch } from "./SearchClient";

export const metadata: Metadata = {
  title: "Search abroad opportunities",
  description:
    "One search across international universities, 2+2 and transfer pathways, country guides, scholarships, language and entrance tests, and courses with study-abroad routes — with sources and last-verified dates attached.",
  alternates: { canonical: "/abroad/search" },
};

export default function AbroadSearchPage() {
  return <AbroadSearch />;
}
