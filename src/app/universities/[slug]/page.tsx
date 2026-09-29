import { notFound, permanentRedirect } from "next/navigation";
import { INSTITUTION_SLUG_MAP } from "@/data/colleges";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * University deep links resolve to the institution profile. The profile is the
 * canonical URL (set in /colleges/[slug]) — this route exists so a link typed
 * as /universities/<slug> lands somewhere real instead of a 404.
 */
export async function generateMetadata({ params }: Props): Promise<{
  title: string;
  alternates: { canonical: string };
}> {
  const { slug } = await params;
  const i = INSTITUTION_SLUG_MAP.get(slug);
  if (!i) return { title: "University not found", alternates: { canonical: `/universities/${slug}` } };
  return {
    title: i.name,
    alternates: { canonical: `/colleges/${i.slug}` },
  };
}

export default async function UniversityDeepLink({ params }: Props) {
  const { slug } = await params;
  const institution = INSTITUTION_SLUG_MAP.get(slug);
  if (!institution) notFound();
  permanentRedirect(`/colleges/${institution.slug}`);
}
