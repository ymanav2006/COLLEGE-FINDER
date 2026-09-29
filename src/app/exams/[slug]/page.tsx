import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EXAM_SLUG_MAP } from "@/data/exams";
import ExamProfile from "./ExamProfile";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = EXAM_SLUG_MAP.get(slug);
  if (!e) return { title: "Exam not found" };
  return {
    title: `${e.name} — dates, pattern, syllabus & official link`,
    description: `${e.name}, conducted by ${e.conductedBy}. Eligibility, pattern, important dates with windows, syllabus and the official registration URL.`,
    alternates: { canonical: `/exams/${e.slug}` },
  };
}

export default async function ExamPage({ params }: Props) {
  const { slug } = await params;
  const exam = EXAM_SLUG_MAP.get(slug);
  if (!exam) notFound();
  return <ExamProfile examId={exam.id} />;
}
