"use client";

import { useMemo, useState } from "react";
import { Search, Globe2, Sparkles, ArrowRight } from "lucide-react";
import { Btn, Badge, PageHeader, Section, EmptyState, Note } from "@/components/ui";
import { InstitutionCard } from "@/components/cards";
import { ABROAD_INSTITUTIONS, INDIA_INSTITUTIONS, INSTITUTIONS } from "@/data/colleges";
import { COUNTRIES } from "@/data/countries";
import { useAppStore } from "@/lib/store";
import { recommendInstitutions, type Ranked } from "@/lib/recommend";
import {
  ORDER_FORMULA_TEXT,
  ORDER_WEIGHTS,
  SCOPE_OPTIONS,
  SORT_OPTIONS,
  sortedBlocks,
  standingScore,
  type UniversityScope,
  type UniversitySort,
} from "@/lib/university-order";
import type { Institution } from "@/lib/types";

const PAGE_SIZE = 12;

export function UniversitiesExplorer() {
  const profile = useAppStore((s) => s.profile);
  const [scope, setScope] = useState<UniversityScope>("world");
  const [sort, setSort] = useState<UniversitySort>("order");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const ranked = useMemo(
    () => recommendInstitutions(profile, { limit: 500, includeAbroad: true }),
    [profile],
  );
  const rankedById = useMemo(() => new Map(ranked.map((r) => [r.item.id, r])), [ranked]);

  const blocks = useMemo(() => {
    const query = q.trim().toLowerCase();
    return sortedBlocks(scope, sort)
      .map((b) => ({
        ...b,
        items: query
          ? b.items.filter((i) =>
              `${i.name} ${i.city} ${i.state} ${i.departments.join(" ")} ${i.countryId}`.toLowerCase().includes(query),
            )
          : b.items,
      }))
      .filter((b) => b.items.length > 0);
  }, [scope, sort, q]);

  const total = blocks.reduce((n, b) => n + b.items.length, 0);
  // The page-size limit applies INSIDE each block, so the worldwide view always
  // shows universities outside India and institutions in India side by side —
  // abroad first, local after, both from the first screenful.
  const remaining = blocks.reduce((n, b) => n + Math.max(0, b.items.length - limit), 0);

  const countriesCovered = useMemo(
    () => new Set(INSTITUTIONS.map((i) => i.countryId)).size,
    [],
  );

  const reset = () => {
    setScope("world");
    setSort("order");
    setQ("");
    setLimit(PAGE_SIZE);
  };

  return (
    <>
      <PageHeader
        eyebrow="University directory"
        title="Universities — worldwide first, then India"
        lede="Every university in this build, in one list. Universities outside India are shown first, then the Indian institutions — and the default order is a formula we print in full below, not a claim of rank."
        actions={
          <>
            <Btn href="/abroad/2-2">
              2+2 &amp; transfer pathways
            </Btn>
            <Btn href="/abroad/search" variant="secondary">
              Search abroad opportunities
            </Btn>
          </>
        }
      />

      <Section wide>
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <Stat label="Universities outside India" value={`${ABROAD_INSTITUTIONS.length}`} />
          <Stat label="Institutions in India" value={`${INDIA_INSTITUTIONS.length}`} />
          <Stat label="Countries & regions covered" value={`${countriesCovered}`} />
          <Stat label="13-dimension scorecards" value={`${INSTITUTIONS.length}`} />
        </div>

        {/* --------------------------- Controls --------------------------- */}
        <div className="card mb-6 p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-faint" aria-hidden />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setLimit(PAGE_SIZE); }}
                placeholder="Search by name, city, department or country…"
                aria-label="Search universities"
                className="w-full rounded-xl border border-hairline bg-white py-2.5 pl-10 pr-4 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as UniversitySort)}
                className="rounded-full border border-hairline bg-white px-4 py-2 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {SCOPE_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => { setScope(s.id); setLimit(PAGE_SIZE); }}
                aria-pressed={scope === s.id}
                title={s.blurb}
                className={`chip border ${
                  scope === s.id
                    ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950"
                    : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
                }`}
              >
                {s.label}
              </button>
            ))}
            <span className="self-center text-xs text-ink-faint">
              {SCOPE_OPTIONS.find((s) => s.id === scope)?.blurb}
            </span>
          </div>
        </div>

        {/* ------------------------ How the order works ------------------------ */}
        <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="card p-5">
            <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
              <Sparkles className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden />
              How this order is calculated
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
              The default sort — <strong>“Strongest overall (our order)”</strong> — is{" "}
              <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-xs dark:bg-white/10">
                {ORDER_FORMULA_TEXT}
              </code>
              . Every input is a dimension you can open on the university's own scorecard, with its evidence and
              confidence label attached.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {ORDER_WEIGHTS.map((w) => (
                <span key={w.id} className="chip bg-surface-sunken text-ink-muted dark:bg-white/10 dark:text-slate-300">
                  {w.label} × {Math.round(w.weight * 100)}%
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ink-faint">
              Swap the sort and the question changes: affordability-first, tuition-first and name-first all reorder the
              same list. That is the point — one ordering cannot answer every decision.
            </p>
          </div>

          <div className="card p-5">
            <p className="font-semibold text-ink dark:text-slate-100">Read this before you shortlist</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
              <li>• Nothing here is a “best university” verdict — order is a starting point, not a decision.</li>
              <li>• Fees are indicative ranges marked <em>reported</em>; verify before you pay anything.</li>
              <li>• Sort order says nothing about whether you'd be admitted — check the eligibility panel on each profile.</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Btn href="/tools/compare" size="sm">Compare 2–5 universities</Btn>
              <Btn href="/methodology" size="sm" variant="secondary">How we source data</Btn>
            </div>
          </div>
        </div>

        {/* ---------------------------- Results ---------------------------- */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink dark:text-slate-100">
            {total} universit{total === 1 ? "y" : "ies"}
            {q.trim() && <span className="font-normal text-ink-muted"> matching “{q.trim()}”</span>}
          </p>
          <p className="text-xs text-ink-muted">
            Sorted by {SORT_OPTIONS.find((s) => s.id === sort)?.label.toLowerCase()}
            {scope === "world" && " · abroad first, then India"}
          </p>
        </div>

        {total === 0 ? (
          <EmptyState
            title="No university matches that"
            body="Try a country, a city or a department name — the filter is exact-substring, so a partial word usually works where a long phrase doesn't."
            icon={<Globe2 className="h-6 w-6" aria-hidden />}
            action={<Btn onClick={reset}>Clear search</Btn>}
          />
        ) : (
          <div className="space-y-10">
            {blocks.map((block) => {
              const slice = block.items.slice(0, limit);
              if (slice.length === 0) return null;
              return (
                <div key={block.key}>
                  <div className="mb-4 flex items-baseline gap-3">
                    <h2 className="text-lg font-semibold text-ink dark:text-slate-50">{block.label}</h2>
                    <span className="text-xs text-ink-faint">
                      showing {slice.length} of {block.items.length}
                    </span>
                    {block.key === "abroad" && scope === "world" && (
                      <Badge tone="blue">Listed first</Badge>
                    )}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {slice.map((i) => {
                      const r = rankedById.get(i.id) ?? fallbackRanked(i);
                      return <InstitutionCard key={i.id} ranked={r} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {remaining > 0 && (
          <div className="mt-8 flex justify-center">
            <Btn onClick={() => setLimit((l) => l + PAGE_SIZE)} variant="secondary">
              Show {PAGE_SIZE} more in each list ({remaining} left)
            </Btn>
          </div>
        )}

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="card p-5">
            <p className="font-semibold text-ink dark:text-slate-100">Search abroad opportunities</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Universities, country guides, 2+2 pathways, scholarships and language tests — one search box for the
              international side of planning.
            </p>
            <div className="mt-4">
              <Btn href="/abroad/search" size="sm" variant="secondary">
                Open abroad search <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
              </Btn>
            </div>
          </div>
          <div className="card p-5">
            <p className="font-semibold text-ink dark:text-slate-100">2+2 and transfer pathways</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Study two years in India and two abroad — plus 3+1, 2+1, 1+3 and credit-transfer patterns, each with the
              cost of both legs.
            </p>
            <div className="mt-4">
              <Btn href="/abroad/2-2" size="sm" variant="secondary">
                See the pathways <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
              </Btn>
            </div>
          </div>
          <div className="card p-5">
            <p className="font-semibold text-ink dark:text-slate-100">{COUNTRIES.length} country guides</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Tuition and living ranges, visas, work rights and post-study options — each with an official link and a
              last-verified date.
            </p>
            <div className="mt-4">
              <Btn href="/abroad" size="sm" variant="secondary">
                Browse countries <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
              </Btn>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Note>
            <strong>Standing still isn't destiny.</strong> The order above uses published scorecard dimensions, and
            every one of them shows its evidence — open two profiles side by side and compare the trade-offs that
            actually affect your decision: fees, eligibility, location and outcomes.
          </Note>
        </div>
      </Section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-2xl font-semibold tabular text-ink dark:text-slate-50">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{label}</p>
    </div>
  );
}

/** Safety net so a card always renders, even if ranking didn't cover it. */
function fallbackRanked(item: Institution): Ranked<Institution> {
  return {
    item,
    score: standingScore(item),
    reasons: [{ kind: "neutral", text: "Listed in the university directory." }],
    cautions: [],
    eligibility: {
      status: "verify",
      reasons: [{ kind: "uncertain", text: "No profile added yet — requirements shown are the generic ones." }],
      requirements: [],
      pendingExams: [],
    },
  };
}
