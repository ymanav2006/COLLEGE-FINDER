import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CAREER_SLUG_MAP } from "@/data/careers";
import CareerProfile from "./CareerProfile";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = CAREER_SLUG_MAP.get(slug);
  if (!c) return { title: "Career not found" };
  return {
    title: `${c.name} — what the work is like, routes in & salary`,
    description: `${c.name} (${c.domain}). ${c.blurb} Entry routes, skills, progression and salary ranges with source and date.`,
    alternates: { canonical: `/careers/${c.slug}` },
  };
}

export default async function CareerPage({ params }: Props) {
  const { slug } = await params;
  const career = CAREER_SLUG_MAP.get(slug);
  if (!career) notFound();
  return <CareerProfile careerId={career.id} />;
}
