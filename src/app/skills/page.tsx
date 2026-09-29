"use client";

import { useMemo, useState } from "react";
import { Search, Wrench } from "lucide-react";
import { Btn, PageHeader, Section, EmptyState, Note } from "@/components/ui";
import { SkillCard } from "@/components/cards";
import { SKILLS, SKILL_CATEGORIES } from "@/data/skills";
import { COURSES } from "@/data/courses";

export default function SkillsPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [course, setCourse] = useState("all");

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return SKILLS.filter((s) => {
      if (t && !`${s.name} ${s.category} ${s.why} ${s.blurb} ${s.certifications.join(" ")}`.toLowerCase().includes(t)) return false;
      if (category !== "all" && s.category !== category) return false;
      if (course !== "all" && !s.relatedCourseIds.includes(course)) return false;
      return true;
    });
  }, [q, category, course]);

  return (
    <>
      <PageHeader
        eyebrow="Skills library"
        title="What to learn alongside your degree"
        lede="Each skill has beginner-to-advanced levels with concrete outcomes, free and paid resources, project ideas and which certifications are actually recognised. Start now — you don't have to wait for semester one."
        actions={<Btn href="/roadmap">Put these on my 5-Year Map</Btn>}
      />

      <Section wide>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-faint" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Python, writing, Excel, public speaking…"
              className="w-full rounded-full border border-hairline bg-white py-2.5 pl-10 pr-4 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              aria-label="Search skills"
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category" className="rounded-full border border-hairline bg-white px-4 py-2.5 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100">
            <option value="all">All categories</option>
            {SKILL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={course} onChange={(e) => setCourse(e.target.value)} aria-label="Filter by course" className="rounded-full border border-hairline bg-white px-4 py-2.5 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100">
            <option value="all">Any course</option>
            {COURSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <p className="mb-5 text-xs text-ink-faint">{results.length} skill{results.length === 1 ? "" : "s"}</p>

        {results.length === 0 ? (
          <EmptyState
            title="Nothing matches that"
            body="Try a category filter instead — Technical, Analytical, Creative, Communication or Business."
            icon={<Wrench className="h-6 w-6" aria-hidden />}
            action={<Btn onClick={() => { setQ(""); setCategory("all"); setCourse("all"); }}>Clear filters</Btn>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((s) => <SkillCard key={s.id} s={s} />)}
          </div>
        )}

        <div className="mt-8">
          <Note>
            Learning a skill never guarantees a job. What it does is give you something concrete to show — projects,
            certificates and a portfolio beat a line on a CV that says “good communication skills”.
          </Note>
        </div>
      </Section>
    </>
  );
}
