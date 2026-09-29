"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Shuffle, ArrowRight, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { Btn, Badge, PageHeader, Section, Note } from "@/components/ui";
import { INSTITUTIONS } from "@/data/colleges";
import { COURSES } from "@/data/courses";
import { useAppStore, EMPTY_PROFILE } from "@/lib/store";
import { recommendInstitutions, recommendCourses, recommendCareers, type Ranked } from "@/lib/recommend";
import { convertToINR } from "@/data/money";
import { formatINR } from "@/lib/format";
import type { Institution, Course, Career, StreamId } from "@/lib/types";

interface Scenario {
  marks: number;
  budget: number;
  stream: StreamId | "any";
  region: string;
  abroad: boolean;
}

const DEFAULTS: Scenario = { marks: 75, budget: 400_000, stream: "any", region: "Any location", abroad: false };

const STREAMS: { id: StreamId | "any"; label: string }[] = [
  { id: "any", label: "Any" },
  { id: "pcm", label: "PCM" },
  { id: "pcb", label: "PCB" },
  { id: "pcmb", label: "PCMB" },
  { id: "commerce", label: "Commerce" },
  { id: "arts", label: "Arts" },
  { id: "vocational", label: "Vocational" },
];

const REGIONS = [
  "Any location", "North", "South", "East", "West", "Central", "Northeast",
];

export default function WhatIfPage() {
  const profile = useAppStore((s) => s.profile);

  const [scenario, setScenario] = useState<Scenario>(() => ({
    ...DEFAULTS,
    marks: profile?.percentage ?? profile?.expectedPercentage ?? DEFAULTS.marks,
    budget: profile?.budgetYearlyINR ?? DEFAULTS.budget,
    stream: (profile?.stream as StreamId | null) ?? "any",
    region: profile?.locationPreference ?? DEFAULTS.region,
    abroad: profile?.wantAbroad ?? false,
  }));
  const [baseline, setBaseline] = useState<Scenario>(() => ({
    ...DEFAULTS,
    marks: profile?.percentage ?? profile?.expectedPercentage ?? DEFAULTS.marks,
    budget: profile?.budgetYearlyINR ?? DEFAULTS.budget,
    stream: (profile?.stream as StreamId | null) ?? "any",
    region: profile?.locationPreference ?? DEFAULTS.region,
    abroad: profile?.wantAbroad ?? false,
  }));

  const toProfile = (s: Scenario) => ({
    ...(profile ?? EMPTY_PROFILE),
    percentage: s.marks,
    expectedPercentage: s.marks,
    budgetYearlyINR: s.budget,
    stream: s.stream === "any" ? null : s.stream,
    locationPreference: s.region,
    wantAbroad: s.abroad,
  } as typeof profile);

  const base = useMemo(() => toProfile(baseline), [baseline, profile]);
  const now = useMemo(() => toProfile(scenario), [scenario, profile]);

  const baseInst = useMemo(() => recommendInstitutions(base, { limit: 300, includeAbroad: true }), [base]);
  const nowInst = useMemo(() => recommendInstitutions(now, { limit: 300, includeAbroad: true }), [now]);
  const baseCourses = useMemo(() => recommendCourses(base, 300), [base]);
  const nowCourses = useMemo(() => recommendCourses(now, 300), [now]);
  const baseCareers = useMemo(() => recommendCareers(base, 300), [base]);
  const nowCareers = useMemo(() => recommendCareers(now, 300), [now]);

  const delta = (a: string[], b: string[]) => ({
    gained: b.filter((x) => !a.includes(x)),
    lost: a.filter((x) => !b.includes(x)),
  });

  const instDelta = useMemo(
    () =>
      delta(
        baseInst.map((r) => r.item.id),
        nowInst.map((r) => r.item.id),
      ),
    [baseInst, nowInst],
  );
  const courseDelta = useMemo(
    () =>
      delta(
        baseCourses.map((r) => r.item.id),
        nowCourses.map((r) => r.item.id),
      ),
    [baseCourses, nowCourses],
  );

  const instName = (id: string) => INSTITUTIONS.find((i) => i.id === id);
  const courseName = (id: string) => COURSES.find((c) => c.id === id);

  const affordableCount = nowInst.filter((r) => {
    const t = convertToINR(r.item.tuition.tuitionAnnual.value, r.item.tuition.currency);
    return t <= scenario.budget;
  }).length;

  const changed =
    scenario.marks !== baseline.marks ||
    scenario.budget !== baseline.budget ||
    scenario.stream !== baseline.stream ||
    scenario.region !== baseline.region ||
    scenario.abroad !== baseline.abroad;

  const name: Record<string, string> = {
    marks: "Class 12 percentage",
    budget: "Yearly budget",
    stream: "Stream",
    region: "Location preference",
    abroad: "Study abroad",
  };

  const changedFields = (Object.keys(scenario) as (keyof Scenario)[]).filter(
    (k) => scenario[k] !== baseline[k],
  );

  return (
    <>
      <PageHeader
        eyebrow="Planning tools · What-If Explorer"
        title="Change one assumption. Watch what moves."
        lede="Move your marks, budget, stream or location and see exactly which options appear and disappear. No recommendation engine — just the same rules, re-run against a different you."
        actions={
          <>
            <Btn onClick={() => setBaseline(scenario)} disabled={!changed}>
              Make this the new baseline
            </Btn>
            <Btn href="/tools/decision-matrix" variant="secondary">Weight what matters</Btn>
          </>
        }
      />

      <Section wide>
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* --------------------------- Controls --------------------------- */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Scenario</p>

              <div className="mt-4 space-y-5">
                <div>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="wi-marks" className="text-sm text-ink-muted">Class 12 marks</label>
                    <span className="text-sm font-semibold tabular text-ink dark:text-slate-100">{scenario.marks}%</span>
                  </div>
                  <input
                    id="wi-marks"
                    type="range"
                    min={40}
                    max={100}
                    value={scenario.marks}
                    onChange={(e) => setScenario((s) => ({ ...s, marks: Number(e.target.value) }))}
                    className="mt-2 w-full accent-[#2450c7] dark:accent-[#3ad9ec]"
                  />
                  <p className="mt-1 text-[11px] text-ink-faint">baseline {baseline.marks}%</p>
                </div>

                <div>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="wi-budget" className="text-sm text-ink-muted">Budget per year</label>
                    <span className="text-sm font-semibold tabular text-ink dark:text-slate-100">{formatINR(scenario.budget)}</span>
                  </div>
                  <input
                    id="wi-budget"
                    type="range"
                    min={0}
                    max={2_500_000}
                    step={50_000}
                    value={scenario.budget}
                    onChange={(e) => setScenario((s) => ({ ...s, budget: Number(e.target.value) }))}
                    className="mt-2 w-full accent-[#2450c7] dark:accent-[#3ad9ec]"
                  />
                  <p className="mt-1 text-[11px] text-ink-faint">baseline {formatINR(baseline.budget)}</p>
                </div>

                <div>
                  <label htmlFor="wi-stream" className="mb-1.5 block text-sm text-ink-muted">Stream</label>
                  <select
                    id="wi-stream"
                    value={scenario.stream}
                    onChange={(e) => setScenario((s) => ({ ...s, stream: e.target.value as Scenario["stream"] }))}
                    className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  >
                    {STREAMS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="wi-region" className="mb-1.5 block text-sm text-ink-muted">Location preference</label>
                  <select
                    id="wi-region"
                    value={scenario.region}
                    onChange={(e) => setScenario((s) => ({ ...s, region: e.target.value }))}
                    className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  >
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <label className="flex items-center justify-between text-sm text-ink-muted">
                  Open to studying abroad
                  <input
                    type="checkbox"
                    checked={scenario.abroad}
                    onChange={(e) => setScenario((s) => ({ ...s, abroad: e.target.checked }))}
                    className="h-4 w-4 accent-[#2450c7] dark:accent-[#3ad9ec]"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-hairline pt-4 dark:border-hairline-dark">
                <Btn size="sm" variant="secondary" onClick={() => setScenario(DEFAULTS)}>Reset</Btn>
                <Btn size="sm" variant="ghost" onClick={() => setBaseline(scenario)} disabled={!changed}>
                  Adopt scenario
                </Btn>
              </div>
            </div>

            <div className="card p-5">
              <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                <Info className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> What's varying
              </p>
              {changedFields.length === 0 ? (
                <p className="mt-2 text-sm text-ink-muted">Nothing — the scenario matches the baseline.</p>
              ) : (
                <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
                  {changedFields.map((f) => <li key={f}>• {name[f]}</li>)}
                </ul>
              )}
              <p className="mt-3 text-[11px] text-ink-faint">
                Change one field at a time. Moving several at once makes it impossible to tell which caused the shift.
              </p>
            </div>
          </aside>

          {/* --------------------------- Results --------------------------- */}
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat
                label="Institutions available"
                before={baseInst.length}
                after={nowInst.length}
              />
              <Stat
                label="Courses available"
                before={baseCourses.length}
                after={nowCourses.length}
              />
              <Stat
                label="Inside your yearly budget"
                before={baseInst.filter((r) => convertToINR(r.item.tuition.tuitionAnnual.value, r.item.tuition.currency) <= baseline.budget).length}
                after={affordableCount}
              />
            </div>

            {!changed ? (
              <div className="rounded-3xl border border-hairline bg-surface-muted p-6 dark:border-hairline-dark dark:bg-white/5">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <Shuffle className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden />
                  Move a control and the differences appear here
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  The baseline is your current profile (or sensible defaults if you haven't onboarded yet). Every change
                  is compared against it — nothing is predicted, only re-run.
                </p>
              </div>
            ) : (
              <>
                <div className="card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">Scenario vs baseline</Badge>
                    <span className="text-xs text-ink-faint">
                      {changedFields.map((f) => name[f]).join(", ")}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-signal-green">
                        <TrendingUp className="h-3.5 w-3.5" aria-hidden /> Newly available
                      </p>
                      {instDelta.gained.length === 0 ? (
                        <p className="mt-2 text-sm text-ink-muted">No new institutions unlock with this change.</p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {instDelta.gained.slice(0, 6).map((id) => {
                            const i = instName(id);
                            if (!i) return null;
                            return (
                              <li key={id}>
                                <Link href={`/colleges/${i.slug}`} className="block rounded-xl border border-signal-green/30 bg-signal-green-soft px-4 py-3 text-sm transition hover:border-signal-green">
                                  <span className="font-medium text-ink dark:text-slate-100">{i.name}</span>
                                  <span className="mt-0.5 block text-xs text-ink-muted">{i.city}, {i.state}</span>
                                </Link>
                              </li>
                            );
                          })}
                          {instDelta.gained.length > 6 && (
                            <li className="text-xs text-ink-faint">+{instDelta.gained.length - 6} more</li>
                          )}
                        </ul>
                      )}

                      {courseDelta.gained.length > 0 && (
                        <>
                          <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-signal-green">Courses</p>
                          <ul className="mt-2 space-y-2">
                            {courseDelta.gained.slice(0, 4).map((id) => {
                              const c = courseName(id);
                              if (!c) return null;
                              return (
                                <li key={id}>
                                  <Link href={`/courses/${c.slug}`} className="block rounded-xl border border-signal-green/30 bg-signal-green-soft px-4 py-2.5 text-sm">
                                    {c.name}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      )}
                    </div>

                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-signal-red">
                        <TrendingDown className="h-3.5 w-3.5" aria-hidden /> No longer available
                      </p>
                      {instDelta.lost.length === 0 ? (
                        <p className="mt-2 text-sm text-ink-muted">Nothing dropped out — this change costs you nothing.</p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {instDelta.lost.slice(0, 6).map((id) => {
                            const i = instName(id);
                            if (!i) return null;
                            return (
                              <li key={id}>
                                <Link href={`/colleges/${i.slug}`} className="block rounded-xl border border-signal-red/30 bg-signal-red-soft px-4 py-3 text-sm">
                                  <span className="font-medium text-ink dark:text-slate-100">{i.name}</span>
                                  <span className="mt-0.5 block text-xs text-ink-muted">{i.city}, {i.state}</span>
                                </Link>
                              </li>
                            );
                          })}
                          {instDelta.lost.length > 6 && (
                            <li className="text-xs text-ink-faint">+{instDelta.lost.length - 6} more</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>

                  {instDelta.gained.length === 0 && instDelta.lost.length === 0 && (
                    <p className="mt-4 text-sm text-ink-muted">
                      No institutional change from this particular move — try the budget slider, which shifts the set
                      the most.
                    </p>
                  )}
                </div>

                <div className="card p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Top matches in this scenario</p>
                  <ul className="mt-3 space-y-2">
                    {nowInst.slice(0, 5).map((r) => (
                      <li key={r.item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline px-4 py-3">
                        <Link href={`/colleges/${r.item.slug}`} className="text-sm font-medium text-ink dark:text-slate-100">
                          {r.item.name}
                        </Link>
                        <span className="flex flex-wrap gap-1.5">
                          {r.reasons.slice(0, 2).map((reason, i) => (
                            <span key={i} className="chip bg-surface-sunken text-[10px] text-ink-muted dark:bg-white/8 dark:text-slate-300">
                              {reason.text}
                            </span>
                          ))}
                        </span>
                      </li>
                    ))}
                    {nowInst.length === 0 && (
                      <li className="text-sm text-ink-muted">
                        No institution matches this exact combination. Loosen one constraint — that's the point of the
                        tool.
                      </li>
                    )}
                  </ul>
                </div>
              </>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { t: "Test a lower budget", d: "See how many options survive ₹1 lakh a year.", href: "/tools/afford" },
                { t: "Test a lower score", d: "Find what stays open below 60%.", href: "/courses" },
                { t: "Test a different plan", d: "Compare two full routes side by side.", href: "/tools/decision-matrix" },
              ].map((x) => (
                <Link key={x.t} href={x.href} className="card interactive-card p-5">
                  <p className="flex items-center gap-1 font-semibold text-ink dark:text-slate-100">
                    {x.t} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </p>
                  <p className="mt-1.5 text-sm text-ink-muted">{x.d}</p>
                </Link>
              ))}
            </div>

            <Note tone="warn">
              This explorer re-runs the same eligibility and filtering rules on a hypothetical profile. It shows which
              records would match — it never predicts an admission outcome, a cutoff or a salary.
            </Note>
          </div>
        </div>
      </Section>
    </>
  );
}

function Stat({ label, before, after }: { label: string; before: number; after: number }) {
  const diff = after - before;
  return (
    <div className="card p-5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">{label}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular text-ink dark:text-slate-50">{after}</span>
        <span className="text-xs text-ink-faint">vs {before} baseline</span>
      </div>
      <p className={`mt-1 flex items-center gap-1 text-xs ${diff > 0 ? "text-signal-green" : diff < 0 ? "text-signal-red" : "text-ink-faint"}`}>
        {diff === 0 ? <Minus className="h-3 w-3" aria-hidden /> : diff > 0 ? <TrendingUp className="h-3 w-3" aria-hidden /> : <TrendingDown className="h-3 w-3" aria-hidden />}
        {diff === 0 ? "no change" : `${diff > 0 ? "+" : ""}${diff} option${Math.abs(diff) === 1 ? "" : "s"}`}
      </p>
    </div>
  );
}
