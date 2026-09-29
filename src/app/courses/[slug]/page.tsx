import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COURSE_SLUG_MAP } from "@/data/courses";
import CourseProfile from "./CourseProfile";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = COURSE_SLUG_MAP.get(slug);
  if (!c) return { title: "Course not found" };
  return {
    title: `${c.name} — duration, eligibility, cost & careers`,
    description: `${c.name}: ${c.durationYears} years. ${c.tagline} Core subjects, entrance exams, cost range with source and date, and where it leads.`,
    alternates: { canonical: `/courses/${c.slug}` },
  };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const course = COURSE_SLUG_MAP.get(slug);
  if (!course) notFound();
  return <CourseProfile courseId={course.id} />;
}
