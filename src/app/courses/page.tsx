"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, BookOpen } from "lucide-react";
import { Btn, Badge, PageHeader, Section, EmptyState, Note, PageSkeleton } from "@/components/ui";
import { CourseCard } from "@/components/cards";
import { COURSES, COURSE_GROUPS, ALL_COURSE_LEVELS, LEVEL_LABEL, streamIds } from "@/data/courses";
import { STREAM_MAP } from "@/data/streams";
import { useAppStore } from "@/lib/store";
import { recommendCourses, type Ranked } from "@/lib/recommend";
import type { Course, Level, StreamId } from "@/lib/types";

type SortKey = "relevance" | "duration" | "cost-asc" | "cost-desc" | "name";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "relevance", label: "Best fit for me" },
  { id: "cost-asc", label: "Cost: low → high" },
  { id: "cost-desc", label: "Cost: high → low" },
  { id: "duration", label: "Shortest first" },
  { id: "name", label: "Name A–Z" },
];

const midCost = (c: Course) => (c.annualCost.value.minINR + c.annualCost.value.maxINR) / 2;

function CoursesPage() {
  const params = useSearchParams();
  const groupParam = params.get("group");
  const profile = useAppStore((s) => s.profile);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [group, setGroup] = useState<string>(groupParam ?? "all");
  const [level, setLevel] = useState<Level | "all">("all");
  const [stream, setStream] = useState<StreamId | "all">("all");
  const [maxCost, setMaxCost] = useState(0);
  const [needsExam, setNeedsExam] = useState(false);
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);

  const ranked = useMemo(() => recommendCourses(profile, 500), [profile]);

  const results = useMemo(() => {
    let list: Ranked<Course>[] = ranked;

    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((r) =>
        `${r.item.name} ${r.item.tagline} ${r.item.coreSubjects.join(" ")} ${r.item.industries.join(" ")}`
          .toLowerCase()
          .includes(t),
      );
    }
    if (group !== "all") {
      const ids = new Set(COURSE_GROUPS.find((g) => g.id === group)?.courseIds ?? []);
      list = list.filter((r) => ids.has(r.item.id));
    }
    if (level !== "all") list = list.filter((r) => r.item.level === level);
    if (stream !== "all") list = list.filter((r) => r.item.streams.includes(stream));
    if (maxCost > 0) list = list.filter((r) => r.item.annualCost.value.minINR <= maxCost);
    if (needsExam) list = list.filter((r) => r.item.entranceExams.length > 0);
    if (eligibleOnly) list = list.filter((r) => r.eligibility.status === "likely");

    const sorted = [...list];
    switch (sort) {
      case "cost-asc": sorted.sort((a, b) => midCost(a.item) - midCost(b.item)); break;
      case "cost-desc": sorted.sort((a, b) => midCost(b.item) - midCost(a.item)); break;
      case "duration": sorted.sort((a, b) => a.item.durationYears - b.item.durationYears); break;
      case "name": sorted.sort((a, b) => a.item.name.localeCompare(b.item.name)); break;
      default: sorted.sort((a, b) => b.score - a.score);
    }
    return sorted;
  }, [ranked, q, group, level, stream, maxCost, needsExam, eligibleOnly, sort]);

  const activeCount =
    (group !== "all" ? 1 : 0) + (level !== "all" ? 1 : 0) + (stream !== "all" ? 1 : 0) +
    (maxCost ? 1 : 0) + (needsExam ? 1 : 0) + (eligibleOnly ? 1 : 0);

  const reset = () => {
    setQ(""); setGroup("all"); setLevel("all"); setStream("all");
    setMaxCost(0); setNeedsExam(false); setEligibleOnly(false); setSort("relevance");
  };

  return (
    <>
      <PageHeader
        eyebrow="Course explorer"
        title="Every programme, with what it actually costs and leads to"
        lede={`${COURSES.length} courses across ${COURSE_GROUPS.length} groups and 4 levels — duration, eligibility, core subjects, entrance requirements, cost ranges and where it can take you.`}
        actions={
          <Btn href="/explore" variant="secondary">
            Browse by stream instead
          </Btn>
        }
      />

      <Section wide>
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className={`${openFilters ? "block" : "hidden"} lg:block`}>
            <div className="card sticky top-20 p-5">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters
                  {activeCount > 0 && <Badge tone="brand">{activeCount}</Badge>}
                </p>
                <button onClick={reset} className="text-xs font-medium text-navy-600 dark:text-cyan-300">
                  Reset
                </button>
              </div>

              <Group label="Search">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-faint" aria-hidden />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Subject, degree, industry…"
                    className="w-full rounded-xl border border-hairline bg-white py-2 pl-9 pr-3 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  />
                </div>
              </Group>

              <Group label="Group">
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                >
                  <option value="all">All groups</option>
                  {COURSE_GROUPS.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </Group>

              <Group label="Level">
                <div className="flex flex-wrap gap-2">
                  <Chip on={level === "all"} onClick={() => setLevel("all")}>Any</Chip>
                  {ALL_COURSE_LEVELS.map((l) => (
                    <Chip key={l} on={level === l} onClick={() => setLevel(l)}>{LEVEL_LABEL[l]}</Chip>
                  ))}
                </div>
              </Group>

              <Group label="Stream">
                <div className="flex flex-wrap gap-2">
                  <Chip on={stream === "all"} onClick={() => setStream("all")}>Any</Chip>
                  {streamIds().map((s) => (
                    <Chip key={s} on={stream === s} onClick={() => setStream(s)}>
                      {STREAM_MAP.get(s)?.shortName ?? s.toUpperCase()}
                    </Chip>
                  ))}
                </div>
              </Group>

              <Group label="Cost per year">
                <div className="flex flex-wrap gap-2">
                  <Chip on={maxCost === 0} onClick={() => setMaxCost(0)}>Any</Chip>
                  <Chip on={maxCost === 100_000} onClick={() => setMaxCost(100_000)}>≤ ₹1L</Chip>
                  <Chip on={maxCost === 300_000} onClick={() => setMaxCost(300_000)}>≤ ₹3L</Chip>
                  <Chip on={maxCost === 500_000} onClick={() => setMaxCost(500_000)}>≤ ₹5L</Chip>
                  <Chip on={maxCost === 1_000_000} onClick={() => setMaxCost(1_000_000)}>≤ ₹10L</Chip>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-ink-faint">
                  Ranges shown are seed figures with reported confidence — confirm fees on the institution's site.
                </p>
              </Group>

              <Group label="Requirements">
                <label className="flex items-center justify-between text-xs text-ink-muted">
                  Has an entrance exam
                  <input type="checkbox" checked={needsExam} onChange={(e) => setNeedsExam(e.target.checked)} className="h-4 w-4 accent-[#2450c7] dark:accent-[#3ad9ec]" />
                </label>
                <label className="mt-2 flex items-center justify-between text-xs text-ink-muted">
                  Only my likely eligible
                  <input type="checkbox" checked={eligibleOnly} onChange={(e) => setEligibleOnly(e.target.checked)} className="h-4 w-4 accent-[#2450c7] dark:accent-[#3ad9ec]" />
                </label>
              </Group>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink dark:text-slate-100">
                  {results.length} course{results.length === 1 ? "" : "s"}
                </p>
                <p className="text-xs text-ink-muted">Sorted by {SORTS.find((s) => s.id === sort)?.label.toLowerCase()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpenFilters((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3.5 py-2 text-xs font-semibold text-ink-muted lg:hidden dark:border-hairline-dark dark:text-slate-300"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden /> Filters {activeCount > 0 && `(${activeCount})`}
                </button>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  aria-label="Sort courses"
                  className="rounded-full border border-hairline bg-white px-4 py-2 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                >
                  {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {results.length === 0 ? (
              <EmptyState
                title="No course matches all of those"
                body="Try widening the cost band or the level filter. This build ships a curated course set — absence here doesn't mean the programme doesn't exist."
                icon={<BookOpen className="h-6 w-6" aria-hidden />}
                action={<Btn onClick={reset}>Clear all filters</Btn>}
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {results.map((r) => <CourseCard key={r.item.id} ranked={r} />)}
              </div>
            )}

            <div className="mt-8">
              <Note>
                Nothing here is an endorsement. A course is a good choice only if the cost, duration and exit routes
                work for <strong>your</strong> situation — that's what the decision matrix is for.
              </Note>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 border-t border-hairline pt-4 first:mt-0 first:border-0 first:pt-0 dark:border-hairline-dark">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">{label}</p>
      {children}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`chip border ${
        on
          ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950"
          : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

export default function CoursesRoute() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CoursesPage />
    </Suspense>
  );
}
