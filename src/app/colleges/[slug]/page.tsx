import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INSTITUTION_SLUG_MAP } from "@/data/colleges";
import CollegeProfile from "./CollegeProfile";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const i = INSTITUTION_SLUG_MAP.get(slug);
  if (!i) return { title: "Institution not found" };
  return {
    title: `${i.name} — profile, fees, eligibility & scorecard`,
    description: `${i.name} in ${i.city}, ${i.state}. Tuition, admission route, 13-dimension scorecard with evidence, placements and last-verified dates.`,
    alternates: { canonical: `/colleges/${i.slug}` },
  };
}

export default async function InstitutionPage({ params }: Props) {
  const { slug } = await params;
  const institution = INSTITUTION_SLUG_MAP.get(slug);
  if (!institution) notFound();
  return <CollegeProfile institutionId={institution.id} />;
}
