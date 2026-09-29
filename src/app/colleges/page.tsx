"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, SlidersHorizontal, X, Building2 } from "lucide-react";
import { Btn, Badge, PageHeader, Section, EmptyState, Note } from "@/components/ui";
import { InstitutionCard, CompareToggle } from "@/components/cards";
import { INSTITUTIONS, INSTITUTION_TYPES } from "@/data/colleges";
import { COURSES } from "@/data/courses";
import { EXAMS } from "@/data/exams";
import { INDIAN_STATES } from "@/data/india-states";
import { useAppStore } from "@/lib/store";
import { useQueryParam } from "@/lib/use-query-param";
import { recommendInstitutions, type Ranked } from "@/lib/recommend";
import { getCourse } from "@/data/courses";
import type { Institution } from "@/lib/types";

type SortKey = "relevance" | "tuition-asc" | "tuition-desc" | "academics" | "career" | "affordability" | "name";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "relevance", label: "Best fit for me" },
  { id: "tuition-asc", label: "Tuition: low → high" },
  { id: "tuition-desc", label: "Tuition: high → low" },
  { id: "academics", label: "Academics score" },
  { id: "career", label: "Career outcomes score" },
  { id: "affordability", label: "Affordability score" },
  { id: "name", label: "Name A–Z" },
];

const TUITION_BANDS = [
  { label: "Any", max: Infinity },
  { label: "Under ₹1 lakh/yr", max: 100_000 },
  { label: "Under ₹3 lakh/yr", max: 300_000 },
  { label: "Under ₹5 lakh/yr", max: 500_000 },
  { label: "Under ₹10 lakh/yr", max: 1_000_000 },
];

const CAMPUS_FILTERS = [
  { id: "hostel", label: "Hostel" },
  { id: "sports", label: "Sports" },
  { id: "labs", label: "Labs" },
  { id: "incubation", label: "Incubation" },
  { id: "library", label: "Library" },
  { id: "medical", label: "Health centre" },
];

const dimScore = (i: Institution, id: string) => i.scorecard.find((d) => d.id === id)?.score ?? 0;

export default function CollegesPage() {
  const courseParam = useQueryParam("course");

  const profile = useAppStore((s) => s.profile);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [country, setCountry] = useState<"all" | "in" | "abroad">("all");
  const [state, setState] = useState<string>("all");
  const [types, setTypes] = useState<string[]>([]);
  const [tuitionBand, setTuitionBand] = useState(0);
  const [exam, setExam] = useState<string>("all");
  const [course, setCourse] = useState<string>("all");

  useEffect(() => {
    if (courseParam) setCourse(courseParam);
  }, [courseParam]);
  const [features, setFeatures] = useState<string[]>([]);
  const [minAcademics, setMinAcademics] = useState(0);
  const [eligibilityOnly, setEligibilityOnly] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);

  const ranked = useMemo(() => recommendInstitutions(profile, { limit: 500, includeAbroad: true }), [profile]);

  const results = useMemo(() => {
    let list: Ranked<Institution>[] = ranked;

    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter((r) =>
        `${r.item.name} ${r.item.city} ${r.item.state} ${r.item.departments.join(" ")} ${r.item.entranceExams.join(" ")}`
          .toLowerCase()
          .includes(t),
      );
    }
    if (country === "in") list = list.filter((r) => r.item.countryId === "in");
    if (country === "abroad") list = list.filter((r) => r.item.countryId !== "in");
    if (state !== "all") list = list.filter((r) => r.item.state === state);
    if (types.length) list = list.filter((r) => types.includes(r.item.type));
    if (exam !== "all") list = list.filter((r) => r.item.entranceExams.includes(exam));
    if (course !== "all") {
      const target = getCourse(course);
      list = list.filter((r) =>
        target ? r.item.courseIds.includes(target.id) : true,
      );
    }
    if (features.length) {
      list = list.filter((r) =>
        features.every((f) => r.item.campusFeatures.some((cf) => cf.id === f && cf.available)),
      );
    }
    if (minAcademics > 0) list = list.filter((r) => dimScore(r.item, "academics") >= minAcademics);

    const maxTuition = TUITION_BANDS[tuitionBand].max;
    if (Number.isFinite(maxTuition)) {
      list = list.filter((r) => tuitionINR(r.item) <= maxTuition);
    }
    if (eligibilityOnly) list = list.filter((r) => r.eligibility.status === "likely");

    const sorted = [...list];
    const tuition = (i: Institution) => tuitionINR(i);
    switch (sort) {
      case "tuition-asc": sorted.sort((a, b) => tuition(a.item) - tuition(b.item)); break;
      case "tuition-desc": sorted.sort((a, b) => tuition(b.item) - tuition(a.item)); break;
      case "academics": sorted.sort((a, b) => dimScore(b.item, "academics") - dimScore(a.item, "academics")); break;
      case "career": sorted.sort((a, b) => dimScore(b.item, "careerOutcomes") - dimScore(a.item, "careerOutcomes")); break;
      case "affordability": sorted.sort((a, b) => dimScore(b.item, "affordability") - dimScore(a.item, "affordability")); break;
      case "name": sorted.sort((a, b) => a.item.name.localeCompare(b.item.name)); break;
      default: sorted.sort((a, b) => b.score - a.score);
    }
    return sorted;
  }, [ranked, q, country, state, types, tuitionBand, exam, course, features, minAcademics, eligibilityOnly, sort]);

  const statesUsed = useMemo(
    () => Array.from(new Set(INSTITUTIONS.map((i) => i.state))).sort(),
    [],
  );

  const reset = () => {
    setQ("");
    setCountry("all");
    setState("all");
    setTypes([]);
    setTuitionBand(0);
    setExam("all");
    setCourse("all");
    setFeatures([]);
    setMinAcademics(0);
    setEligibilityOnly(false);
    setSort("relevance");
  };

  const activeCount =
    (country !== "all" ? 1 : 0) + (state !== "all" ? 1 : 0) + types.length + (tuitionBand ? 1 : 0) +
    (exam !== "all" ? 1 : 0) + (course !== "all" ? 1 : 0) + features.length + (minAcademics ? 1 : 0) +
    (eligibilityOnly ? 1 : 0);

  return (
    <>
      <PageHeader
        eyebrow="College database"
        title="Find institutions — then check them against your profile"
        lede="Filters across location, academics, finances, institution type, career outcomes and campus life. Every card shows eligibility and the reason it's in your list."
        actions={
          <>
            <Btn href="/tools/compare">Compare selected</Btn>
            <Btn href="/maps" variant="secondary">
              View on maps
            </Btn>
          </>
        }
      />

      <Section wide>
        <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
          {/* ------------------------------ Filters ------------------------------ */}
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

              <FilterGroup label="Search">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-faint" aria-hidden />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Name, city, department…"
                    className="w-full rounded-xl border border-hairline bg-white py-2 pl-9 pr-3 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  />
                </div>
              </FilterGroup>

              <FilterGroup label="Location">
                <div className="flex flex-wrap gap-2">
                  {([["all", "Anywhere"], ["in", "India"], ["abroad", "Abroad"]] as const).map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => setCountry(id)}
                      className={`chip border ${country === id ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950" : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                >
                  <option value="all">All states / regions</option>
                  {statesUsed.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-[10px] text-ink-faint">
                  {INDIAN_STATES.length} Indian states and regions are mapped for the India map.
                </p>
              </FilterGroup>

              <FilterGroup label="Financial">
                <div className="flex flex-wrap gap-2">
                  {TUITION_BANDS.map((b, idx) => (
                    <button
                      key={b.label}
                      onClick={() => setTuitionBand(idx)}
                      className={`chip border ${tuitionBand === idx ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950" : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"}`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup label="Academics">
                <label className="text-xs text-ink-muted">Minimum academics dimension score</label>
                <input
                  type="range"
                  min={0}
                  max={95}
                  step={5}
                  value={minAcademics}
                  onChange={(e) => setMinAcademics(Number(e.target.value))}
                  className="mt-2 w-full accent-[#2450c7] dark:accent-[#3ad9ec]"
                />
                <p className="mt-1 text-xs text-ink-muted">{minAcademics === 0 ? "No minimum" : `${minAcademics}+`}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-ink-faint">
                  Dimension scores are a demo index for comparison — not an official ranking.
                </p>
              </FilterGroup>

              <FilterGroup label="Institution type">
                <div className="flex flex-wrap gap-2">
                  {INSTITUTION_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() =>
                        setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
                      }
                      aria-pressed={types.includes(t)}
                      className={`chip border ${types.includes(t) ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950" : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup label="Entrance exam">
                <select
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                  className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                >
                  <option value="all">Any route</option>
                  {EXAMS.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </FilterGroup>

              <FilterGroup label="Programme offered">
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                >
                  <option value="all">Any programme</option>
                  {COURSES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </FilterGroup>

              <FilterGroup label="Campus">
                <div className="flex flex-wrap gap-2">
                  {CAMPUS_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() =>
                        setFeatures((prev) => (prev.includes(f.id) ? prev.filter((x) => x !== f.id) : [...prev, f.id]))
                      }
                      aria-pressed={features.includes(f.id)}
                      className={`chip border ${features.includes(f.id) ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950" : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </FilterGroup>

              <FilterGroup label="Career outcomes">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-ink-muted">Only show my likely eligible options</label>
                  <input
                    type="checkbox"
                    checked={eligibilityOnly}
                    onChange={(e) => setEligibilityOnly(e.target.checked)}
                    className="h-4 w-4 accent-[#2450c7] dark:accent-[#3ad9ec]"
                  />
                </div>
              </FilterGroup>
            </div>
          </aside>

          {/* ------------------------------ Results ------------------------------ */}
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink dark:text-slate-100">
                  {results.length} institution{results.length === 1 ? "" : "s"}
                </p>
                <p className="text-xs text-ink-muted">
                  Sorted by {SORTS.find((s) => s.id === sort)?.label.toLowerCase()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpenFilters((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3.5 py-2 text-xs font-semibold text-ink-muted lg:hidden dark:border-hairline-dark dark:text-slate-300"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                  Filters {activeCount > 0 && `(${activeCount})`}
                </button>
                <label className="sr-only" htmlFor="sort">Sort</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-full border border-hairline bg-white px-4 py-2 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeCount > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-ink-faint">Active:</span>
                {country !== "all" && <Removable label={country === "in" ? "India" : "Abroad"} onRemove={() => setCountry("all")} />}
                {state !== "all" && <Removable label={state} onRemove={() => setState("all")} />}
                {types.map((t) => <Removable key={t} label={t} onRemove={() => setTypes((p) => p.filter((x) => x !== t))} />)}
                {tuitionBand > 0 && <Removable label={TUITION_BANDS[tuitionBand].label} onRemove={() => setTuitionBand(0)} />}
                {exam !== "all" && <Removable label={EXAMS.find((e) => e.id === exam)?.name ?? exam} onRemove={() => setExam("all")} />}
                {course !== "all" && <Removable label={getCourse(course)?.name ?? course} onRemove={() => setCourse("all")} />}
                {features.map((f) => <Removable key={f} label={CAMPUS_FILTERS.find((x) => x.id === f)?.label ?? f} onRemove={() => setFeatures((p) => p.filter((x) => x !== f))} />)}
                {minAcademics > 0 && <Removable label={`Academics ${minAcademics}+`} onRemove={() => setMinAcademics(0)} />}
                {eligibilityOnly && <Removable label="Likely eligible" onRemove={() => setEligibilityOnly(false)} />}
              </div>
            )}

            {results.length === 0 ? (
              <EmptyState
                title="No institution matches all of that"
                body="Loosen one filter at a time — usually the tuition band or the minimum score is what narrows it to zero. Nothing here means an option doesn't exist; this build holds a curated dataset."
                icon={<Building2 className="h-6 w-6" aria-hidden />}
                action={<Btn onClick={reset}>Clear all filters</Btn>}
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {results.map((r) => (
                  <InstitutionCard key={r.item.id} ranked={r} />
                ))}
              </div>
            )}

            <div className="mt-8">
              <Note>
                <strong>No single “best college” appears on this platform.</strong> Sort order is a starting point, not a
                verdict. Open any card's “Why you're seeing this”, then compare two to five institutions side by side
                before deciding what actually matters to you.
              </Note>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function tuitionINR(i: Institution): number {
  const t = i.tuition;
  const rates: Record<string, number> = { USD: 88, EUR: 103, GBP: 116, CAD: 64, AUD: 58, SGD: 69, NZD: 53, CHF: 111, JPY: 0.6, KRW: 0.065, AED: 24 };
  return Math.round(t.tuitionAnnual.value * (rates[t.currency] ?? 1));
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 border-t border-hairline pt-4 first:mt-0 first:border-0 first:pt-0 dark:border-hairline-dark">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">{label}</p>
      {children}
    </div>
  );
}

function Removable({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="chip bg-navy-50 text-navy-700 hover:bg-signal-red-soft hover:text-signal-red dark:bg-cyan-500/12 dark:text-cyan-200"
      title="Remove filter"
    >
      {label} <X className="h-3 w-3" aria-hidden />
    </button>
  );
}
