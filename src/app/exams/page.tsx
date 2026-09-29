"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, CalendarDays, Filter } from "lucide-react";
import { Btn, PageHeader, Section, EmptyState, Note, Badge, PageSkeleton } from "@/components/ui";
import { ExamCard } from "@/components/cards";
import { EXAMS } from "@/data/exams";
import { COUNTRIES } from "@/data/countries";

function ExamsPage() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("search") ?? "");
  const [level, setLevel] = useState("all");
  const [country, setCountry] = useState("all");

  const levels = useMemo(() => Array.from(new Set(EXAMS.map((e) => e.level))), []);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return EXAMS.filter((e) => {
      if (t && !`${e.name} ${e.conductedBy} ${e.subjects.join(" ")} ${e.whoNeedsIt}`.toLowerCase().includes(t)) return false;
      if (level !== "all" && e.level !== level) return false;
      if (country !== "all" && e.countryId !== country) return false;
      return true;
    });
  }, [q, level, country]);

  return (
    <>
      <PageHeader
        eyebrow="Entrance exams"
        title="Dates, pattern, syllabus and official links"
        lede="Every exam records who it's for, eligibility, pattern, important dates with their windows, and the official registration URL. Dates are confirmed before you rely on them — and we still tell you to double-check."
        actions={<Btn href="/tools/deadlines">Track these deadlines</Btn>}
      />

      <Section wide>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-faint" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="JEE, NEET, CUET, CLAT, CAT, SAT…"
              className="w-full rounded-full border border-hairline bg-white py-2.5 pl-10 pr-4 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              aria-label="Search entrance exams"
            />
          </div>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            aria-label="Filter by level"
            className="rounded-full border border-hairline bg-white px-4 py-2.5 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
          >
            <option value="all">All levels</option>
            {levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Filter by country"
            className="rounded-full border border-hairline bg-white px-4 py-2.5 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
          >
            <option value="all">All countries</option>
            {COUNTRIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="mb-6">
          <Note tone="warn">
            <strong>Exam schedules move.</strong> Application windows, exam dates and result dates are re-announced
            every cycle. Every date below carries its last-checked date — and the official site always wins.
          </Note>
        </div>

        <p className="mb-5 flex items-center gap-2 text-xs text-ink-faint">
          <Filter className="h-3.5 w-3.5" aria-hidden />
          {results.length} exam{results.length === 1 ? "" : "s"}
        </p>

        {results.length === 0 ? (
          <EmptyState
            title="No exam matches that"
            body="Search by name — JEE, NEET, CUET, CLAT, CAT, GATE, SAT, GRE — or clear the filters."
            icon={<CalendarDays className="h-6 w-6" aria-hidden />}
            action={<Btn onClick={() => { setQ(""); setLevel("all"); setCountry("all"); }}>Clear filters</Btn>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((e) => <ExamCard key={e.id} e={e} />)}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          <Badge tone="neutral">Free official resources are marked</Badge>
          <Badge tone="neutral">Paid prep links are labelled, never hidden</Badge>
          <Badge tone="neutral">No affiliate placement</Badge>
        </div>
      </Section>
    </>
  );
}

export default function ExamsRoute() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ExamsPage />
    </Suspense>
  );
}
