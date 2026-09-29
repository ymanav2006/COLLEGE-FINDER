"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, Plus, Scale, AlertTriangle, Download } from "lucide-react";
import { Btn, Badge, ConfidenceBadge, PageHeader, Section, EmptyState, Note, WhyList } from "@/components/ui";
import { SaveButton } from "@/components/cards";
import { INSTITUTIONS, getInstitution } from "@/data/colleges";
import { COUNTRIES } from "@/data/countries";
import { getCourse } from "@/data/courses";
import { useAppStore } from "@/lib/store";
import { useQueryParam } from "@/lib/use-query-param";
import { assessInstitution } from "@/lib/eligibility";
import { convertToINR } from "@/data/money";
import { formatINR, formatDate } from "@/lib/format";
import type { ScorecardDimensionId } from "@/lib/types";

const DIMENSIONS: { id: ScorecardDimensionId; label: string; blurb: string }[] = [
  { id: "academics", label: "Academics", blurb: "Teaching, curriculum, rigour" },
  { id: "research", label: "Research", blurb: "Projects, publications, labs" },
  { id: "careerOutcomes", label: "Career outcomes", blurb: "Placement support, recruiters" },
  { id: "campusLife", label: "Campus life", blurb: "Clubs, festivals, peers" },
  { id: "infrastructure", label: "Infrastructure", blurb: "Buildings, labs, network" },
  { id: "studentActivities", label: "Activities", blurb: "Sports and societies" },
  { id: "affordability", label: "Affordability", blurb: "Cost against aid available" },
  { id: "location", label: "Location", blurb: "City access, industry proximity" },
  { id: "internationalExposure", label: "International", blurb: "Exchange and global cohort" },
  { id: "entrepreneurship", label: "Entrepreneurship", blurb: "Incubators, founder support" },
  { id: "diversity", label: "Diversity", blurb: "Intake and representation mix" },
  { id: "accommodation", label: "Accommodation", blurb: "Hostel availability and cost" },
  { id: "studentSupport", label: "Student support", blurb: "Counselling, health, mentoring" },
];

const RATES: Record<string, number> = {
  USD: 88, EUR: 103, GBP: 116, CAD: 64, AUD: 58, SGD: 69, NZD: 53, CHF: 111, JPY: 0.6, KRW: 0.065, AED: 24,
};
const inr = (v: number, c: string) => Math.round(v * (RATES[c] ?? 1));

export default function ComparePage() {
  const kind = useQueryParam("kind") === "country" ? "country" : "college";

  const compare = useAppStore((s) => s.compare);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const profile = useAppStore((s) => s.profile);

  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(false);

  const selected = useMemo(
    () => compare.map((id) => getInstitution(id)).filter((i): i is NonNullable<typeof i> => Boolean(i)),
    [compare],
  );

  const candidates = useMemo(() => {
    const t = q.trim().toLowerCase();
    return INSTITUTIONS.filter((i) => !compare.includes(i.id))
      .filter((i) => !t || `${i.name} ${i.city} ${i.state}`.toLowerCase().includes(t))
      .slice(0, 40);
  }, [q, compare]);

  const showPicker = editing || selected.length < 2;

  if (kind === "country") return <CountryCompare />;

  return (
    <>
      <PageHeader
        eyebrow="Comparison tool · 2–5 institutions"
        title="Compare trade-offs, not rankings"
        lede="Same thirteen dimensions for every institution, each with its own evidence and confidence. The highest number in a row is highlighted — that is a fact about the numbers, not a verdict about the institution."
        actions={
          <>
            <Btn href="/colleges">Add from the database</Btn>
            <Btn variant="ghost" onClick={() => { clearCompare(); setEditing(true); }}>Start over</Btn>
          </>
        }
      />

      <Section wide>
        {/* ------------------------------ Picker ------------------------------ */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {selected.map((i) => (
              <span
                key={i.id}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white py-1.5 pl-3.5 pr-1.5 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              >
                <Link href={`/colleges/${i.slug}`} className="hover:text-navy-600 dark:hover:text-cyan-300">
                  {i.name}
                </Link>
                <button
                  onClick={() => toggleCompare(i.id)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-sunken text-ink-faint hover:bg-signal-red-soft hover:text-signal-red dark:bg-white/10"
                  aria-label={`Remove ${i.name} from comparison`}
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            ))}
            {selected.length < 5 && (
              <button
                onClick={() => setEditing((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-navy-300 px-3.5 py-1.5 text-sm font-medium text-navy-600 dark:border-cyan-500/50 dark:text-cyan-300"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden /> Add institution
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Badge tone="brand">{selected.length}/5 selected</Badge>
            {selected.length >= 2 && (
              <Btn size="sm" variant="secondary" onClick={() => window.print()}>
                <Download className="h-3.5 w-3.5" aria-hidden /> Print / save
              </Btn>
            )}
          </div>
        </div>

        {showPicker && (
          <div className="mb-8 card p-5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-faint" aria-hidden />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search institutions to add (2–5)…"
                className="w-full rounded-xl border border-hairline bg-white py-2.5 pl-10 pr-4 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                aria-label="Search institutions to add"
              />
            </div>
            <div className="mt-4 grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              {candidates.map((i) => {
                const full = selected.length >= 5;
                return (
                  <button
                    key={i.id}
                    disabled={full}
                    onClick={() => toggleCompare(i.id)}
                    className="rounded-xl border border-hairline px-4 py-3 text-left transition hover:border-navy-400 disabled:cursor-not-allowed disabled:opacity-45 dark:border-hairline-dark"
                  >
                    <span className="block text-sm font-medium text-ink dark:text-slate-100">{i.name}</span>
                    <span className="mt-0.5 block text-xs text-ink-muted">{i.city}, {i.state}</span>
                  </button>
                );
              })}
              {candidates.length === 0 && (
                <p className="text-sm text-ink-muted">Nothing else matches that search.</p>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------ Table ------------------------------ */}
        {selected.length < 2 ? (
          <EmptyState
            title="Pick at least two institutions"
            body="Comparison needs two to five institutions. Use the search above, or add them from any college card using the Compare button."
            icon={<Scale className="h-6 w-6" aria-hidden />}
            action={<Btn href="/colleges">Browse the database</Btn>}
            secondaryAction={<Btn variant="secondary" onClick={() => setEditing(true)}>Add here</Btn>}
          />
        ) : (
          <>
            <div className="card overflow-x-auto p-0">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <caption className="sr-only">Side-by-side comparison of {selected.length} institutions</caption>
                <thead>
                  <tr className="border-b border-hairline dark:border-hairline-dark">
                    <th scope="col" className="w-56 px-5 py-4 text-left align-bottom">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Dimension</span>
                    </th>
                    {selected.map((i) => (
                      <th key={i.id} scope="col" className="px-4 py-4 text-left align-bottom">
                        <Link href={`/colleges/${i.slug}`} className="block text-sm font-semibold text-ink hover:text-navy-600 dark:text-slate-50 dark:hover:text-cyan-300">
                          {i.name}
                        </Link>
                        <span className="mt-0.5 block text-xs font-normal text-ink-muted">{i.city}, {i.state}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* --- identity rows --- */}
                  <RowGroup label="Basics">
                    <CellRow
                      label="Type"
                      values={selected.map((i) => `${i.type} · ${i.category}`)}
                    />
                    <CellRow
                      label="Established"
                      values={selected.map((i) => String(i.established))}
                    />
                    <CellRow
                      label="Annual tuition"
                      values={selected.map((i) => {
                        const v = inr(i.tuition.tuitionAnnual.value, i.tuition.currency);
                        return `${formatINR(v)}${i.tuition.currency !== "INR" ? ` (${i.tuition.currency})` : ""}`;
                      })}
                      highlight={selected.length > 1 ? selected.map((i) => inr(i.tuition.tuitionAnnual.value, i.tuition.currency)) : undefined}
                      preferLow
                    />
                    <CellRow
                      label="Annual hostel"
                      values={selected.map((i) =>
                        i.tuition.hostelAnnual
                          ? `${formatINR(inr(i.tuition.hostelAnnual.value, i.tuition.currency))}`
                          : "Not published",
                      )}
                    />
                    <CellRow
                      label="Entrance route"
                      values={selected.map((i) => i.entranceExams.join(", ") || "Merit / institute")}
                    />
                  </RowGroup>

                  {/* --- eligibility --- */}
                  <RowGroup label="Your eligibility">
                    {(() => {
                      const statuses = selected.map((i) => assessInstitution(i, profile, getCourse));
                      return (
                        <tr className="border-b border-hairline dark:border-hairline-dark">
                          <th scope="row" className="px-5 py-3 text-left align-top">
                            <span className="text-sm font-medium text-ink dark:text-slate-100">Verdict</span>
                            <span className="mt-0.5 block text-xs text-ink-faint">Against your profile</span>
                          </th>
                          {statuses.map((s, idx) => (
                            <td key={selected[idx].id} className="px-4 py-3 align-top">
                              <Badge tone={s.status === "likely" ? "green" : s.status === "verify" ? "amber" : "red"}>
                                {s.status === "likely" ? "Likely eligible" : s.status === "verify" ? "Needs verification" : "Not eligible"}
                              </Badge>
                              <ul className="mt-2 space-y-1 text-xs text-ink-muted">
                                {s.reasons.slice(0, 3).map((r, i) => (
                                  <li key={i}>{r.text}</li>
                                ))}
                              </ul>
                            </td>
                          ))}
                        </tr>
                      );
                    })()}
                  </RowGroup>

                  {/* --- 13 dimensions --- */}
                  <RowGroup label="13-dimension scorecard (demo index — not a ranking)">
                    {DIMENSIONS.map((d) => {
                      const scores = selected.map((i) => i.scorecard.find((s) => s.id === d.id)?.score);
                      const present = scores.filter((s): s is number => typeof s === "number");
                      const best = present.length > 1 ? Math.max(...present) : undefined;
                      return (
                        <tr key={d.id} className="border-b border-hairline last:border-0 dark:border-hairline-dark">
                          <th scope="row" className="px-5 py-3.5 text-left align-top">
                            <span className="text-sm font-medium text-ink dark:text-slate-100">{d.label}</span>
                            <span className="mt-0.5 block text-xs text-ink-faint">{d.blurb}</span>
                          </th>
                          {selected.map((i, idx) => {
                            const s = i.scorecard.find((x) => x.id === d.id);
                            const score = scores[idx];
                            const isBest = typeof score === "number" && typeof best === "number" && score === best;
                            return (
                              <td key={i.id} className="px-4 py-3.5 align-top">
                                {s ? (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xl font-semibold tabular ${isBest ? "text-navy-600 dark:text-cyan-300" : "text-ink dark:text-slate-100"}`}>
                                        {s.score}
                                      </span>
                                      {isBest && <Badge tone="brand">highest here</Badge>}
                                    </div>
                                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-sunken dark:bg-white/10">
                                      <div
                                        className="h-full rounded-full bg-gradient-to-r from-navy-500 via-violet-500 to-cyan-500"
                                        style={{ width: `${s.score}%` }}
                                      />
                                    </div>
                                    <p className="mt-2 text-xs leading-relaxed text-ink-muted">{s.evidence}</p>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-ink-faint">
                                      <ConfidenceBadge confidence={s.confidence} />
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-xs text-ink-faint">Not assessed in this build.</p>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </RowGroup>

                  {/* --- placements --- */}
                  <RowGroup label="Placement reporting">
                    <tr className="border-b border-hairline dark:border-hairline-dark">
                      <th scope="row" className="px-5 py-3.5 text-left align-top">
                        <span className="text-sm font-medium text-ink dark:text-slate-100">Latest reported batch</span>
                        <span className="mt-0.5 block text-xs text-ink-faint">Population + method are always shown</span>
                      </th>
                      {selected.map((i) => {
                        const p = i.placements[0];
                        if (!p) {
                          return (
                            <td key={i.id} className="px-4 py-3.5 align-top text-xs text-ink-faint">
                              No placement report attached in this build.
                            </td>
                          );
                        }
                        return (
                          <td key={i.id} className="px-4 py-3.5 align-top">
                            <p className="text-sm font-semibold text-ink dark:text-slate-100">
                              {p.placementRatePercent !== undefined ? `${p.placementRatePercent}% placed` : "—"}
                            </p>
                            {p.medianSalaryINR !== undefined && (
                              <p className="mt-0.5 text-sm text-ink-muted">Median {formatINR(p.medianSalaryINR)}</p>
                            )}
                            <p className="mt-1.5 text-xs text-ink-faint">{p.population}</p>
                            <p className="mt-1 text-xs text-ink-muted">{p.methodology}</p>
                            <div className="mt-1.5">
                              <ConfidenceBadge confidence={p.confidence} />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </RowGroup>

                  {/* --- dates --- */}
                  <RowGroup label="Data freshness">
                    <CellRow
                      label="Tuition last checked"
                      values={selected.map((i) => formatDate(i.tuition.tuitionAnnual.verifiedOn))}
                    />
                    <CellRow
                      label="Source count"
                      values={selected.map((i) => `${i.sourceIds.length + 1} sources`)}
                    />
                  </RowGroup>
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="card p-5">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <AlertTriangle className="h-4 w-4 text-signal-amber" aria-hidden /> How to read this
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
                  <li>• A higher score in one row never cancels a lower score in another.</li>
                  <li>• “Highest here” describes the displayed numbers only — it is not a recommendation.</li>
                  <li>• Every number shows its evidence and confidence. A score with no evidence contributes nothing.</li>
                  <li>• These indices are demo values for comparison, never an official ranking.</li>
                </ul>
              </div>
              <div className="card p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Your comparison notes</p>
                <div className="mt-3">
                <p className="text-sm leading-relaxed text-ink-muted dark:text-slate-300">
                    Your profile is <strong>{profile?.stream ?? "not set"}</strong>, budget{" "}
                    <strong>{profile?.budgetYearlyINR ? formatINR(profile.budgetYearlyINR) : "not set"}</strong> and preference{" "}
                    <strong>{profile?.locationPreference ?? "Any location"}</strong>. Anything that conflicts with those
                    shows up as a caution on each institution's own profile page.
                  </p>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Btn href="/onboarding" variant="secondary" size="sm">Adjust my profile</Btn>
                  <Btn href="/tools/decision-matrix" variant="ghost" size="sm">Weight what matters</Btn>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Note>
                <strong>Never a single “best” result.</strong> If two institutions are close overall, the deciding factor
                is usually cost, location or a specific dimension — not the aggregate. Decide which one of those you
                actually care about, then re-read that row only.
              </Note>
            </div>
          </>
        )}
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Table helpers                                                       */
/* ------------------------------------------------------------------ */

function RowGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <tr className="bg-surface-muted dark:bg-white/5">
        <th colSpan={6} scope="rowgroup" className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-ink-faint">
          {label}
        </th>
      </tr>
      {children}
    </>
  );
}

function CellRow({
  label,
  values,
  highlight,
  preferLow = false,
}: {
  label: string;
  values: string[];
  highlight?: number[];
  preferLow?: boolean;
}) {
  let bestIdx: number | undefined;
  if (highlight && highlight.length > 1 && highlight.every((h) => Number.isFinite(h))) {
    const target = preferLow ? Math.min(...highlight) : Math.max(...highlight);
    bestIdx = highlight.indexOf(target);
  }

  return (
    <tr className="border-b border-hairline dark:border-hairline-dark">
      <th scope="row" className="px-5 py-3 text-left align-top text-sm font-medium text-ink dark:text-slate-100">
        {label}
      </th>
      {values.map((v, idx) => (
        <td key={idx} className="px-4 py-3 align-top">
          <span className={idx === bestIdx ? "font-semibold text-navy-600 dark:text-cyan-300" : "text-ink dark:text-slate-200"}>
            {v}
          </span>
        </td>
      ))}
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/* Country comparison (?kind=country)                                  */
/* ------------------------------------------------------------------ */

function CountryCompare() {
  return (
    <>
      <PageHeader
        eyebrow="Study abroad · country comparison"
        title="Compare study destinations side by side"
        lede="Tuition, living costs, visa posture, work rights and post-study options — each with its last-verified date."
        actions={
          <Btn href="/abroad">All 16 country guides</Btn>
        }
      />

      <Section wide>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <caption className="sr-only">Country comparison</caption>
            <thead>
              <tr className="border-b border-hairline dark:border-hairline-dark">
                <th scope="col" className="w-48 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                  Factor
                </th>
                {COUNTRIES.slice(0, 6).map((c) => (
                  <th key={c.id} scope="col" className="px-4 py-4 text-left align-bottom">
                    <Link href={`/abroad/${c.slug}`} className="block text-sm font-semibold text-ink hover:text-navy-600 dark:text-slate-50 dark:hover:text-cyan-300">
                      <span className="mr-1.5" aria-hidden>{c.flag}</span>
                      {c.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CellRow label="Tuition range" values={COUNTRIES.slice(0, 6).map((c) => c.tuitionRange.value)} />
              <CellRow label="Living costs" values={COUNTRIES.slice(0, 6).map((c) => c.livingRange.value)} />
              <CellRow label="Application timeline" values={COUNTRIES.slice(0, 6).map((c) => c.applicationTimeline)} />
              <CellRow label="English tests" values={COUNTRIES.slice(0, 6).map((c) => c.englishTests.join(", "))} />
              <CellRow label="Work during study" values={COUNTRIES.slice(0, 6).map((c) => c.workRights.value)} />
              <CellRow label="After study" values={COUNTRIES.slice(0, 6).map((c) => c.postStudy.value)} />
              <CellRow label="Last verified" values={COUNTRIES.slice(0, 6).map((c) => formatDate(c.lastVerified))} />
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Note tone="warn">
            Visa rules and work rights change with little notice. Treat every row here as a starting point and confirm
            on the official government site before you apply.
          </Note>
        </div>
      </Section>
    </>
  );
}
