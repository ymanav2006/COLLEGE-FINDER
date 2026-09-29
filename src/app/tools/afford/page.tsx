"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Wallet, ArrowRight, AlertTriangle, CheckCircle2, XCircle, GraduationCap,
} from "lucide-react";
import {
  Btn, Badge, PageHeader, Section, Note, FactDisplay, ConfidenceBadge, EmptyState,
} from "@/components/ui";
import { INSTITUTIONS, getInstitution } from "@/data/colleges";
import { COURSES, getCourse } from "@/data/courses";
import { SCHOLARSHIPS } from "@/data/scholarships";
import { useAppStore } from "@/lib/store";
import { convertToINR } from "@/data/money";
import { formatINR, formatDate } from "@/lib/format";

export default function AffordPage() {
  const profile = useAppStore((s) => s.profile);

  const [institutionId, setInstitutionId] = useState<string>(INSTITUTIONS[0]?.id ?? "none");
  const [courseId, setCourseId] = useState<string>("none");
  const [savings, setSavings] = useState(0);
  const [ownBudget, setOwnBudget] = useState<number>(
    Math.round((profile?.budgetYearlyINR ?? 0) || 0),
  );
  const [years, setYears] = useState(4);

  const inst = getInstitution(institutionId === "none" ? undefined : institutionId);
  const course = getCourse(courseId === "none" ? undefined : courseId);

  const annualTuition = inst
    ? convertToINR(inst.tuition.tuitionAnnual.value, inst.tuition.currency)
    : course
      ? Math.round((course.annualCost.value.minINR + course.annualCost.value.maxINR) / 2)
      : 0;

  const annualHostel = inst?.tuition.hostelAnnual
    ? convertToINR(inst.tuition.hostelAnnual.value, inst.tuition.currency)
    : 0;

  const annualOther = Math.round(annualTuition * 0.18); // living, books, travel estimate
  const annualTotal = annualTuition + annualHostel + annualOther;
  const duration = inst ? years : course?.durationYears ?? years;
  const grandTotal = annualTotal * duration;
  const perYearBudget = ownBudget || profile?.budgetYearlyINR || 0;

  const verdict = useMemo(() => {
    if (perYearBudget <= 0) {
      return {
        status: "unknown" as const,
        headline: "Set a yearly budget to get a verdict",
        body: "We refuse to guess what you can afford. Enter the maximum you can spend each year and we'll classify the gap.",
      };
    }
    const within = annualTotal <= perYearBudget;
    const tight = within && annualTotal > perYearBudget * 0.9;
    const gap = annualTotal - perYearBudget;
    if (within && !tight) {
      return {
        status: "yes" as const,
        headline: `Yes — with ${formatINR(perYearBudget - annualTotal)} a year to spare`,
        body: `The estimated ${formatINR(annualTotal)} per year sits inside your stated budget of ${formatINR(perYearBudget)}. That leaves room for the surprises.`,
      };
    }
    if (tight) {
      return {
        status: "tight" as const,
        headline: "It fits — but there is almost no margin",
        body: `Estimated ${formatINR(annualTotal)} against a budget of ${formatINR(perYearBudget)}. One extra year, a fee revision or a relocation would push it over.`,
      };
    }
    return {
      status: "no" as const,
      headline: `Not at ${formatINR(perYearBudget)} a year — you're ${formatINR(gap)} short`,
      body: `That gap can come from aid, a cheaper institution, an alternate route or a longer savings runway. None of those are failures — they're the actual levers.`,
    };
  }, [annualTotal, perYearBudget]);

  const relevantAid = useMemo(() => {
    const stream = profile?.stream;
    const scored = SCHOLARSHIPS.map((s) => {
      let score = 0;
      if (stream && s.streams.includes(stream)) score += 3;
      if (profile?.category && s.eligibility.toLowerCase().includes(profile.category.toLowerCase())) score += 2;
      if (profile?.scholarshipDependent) score += 1;
      if (s.types.includes("need-based")) score += 2;
      return { s, score };
    }).sort((a, b) => b.score - a.score);
    return scored.slice(0, 4).map((x) => x.s);
  }, [profile]);

  const fallbacks = useMemo(() => {
    const cheaper = INSTITUTIONS.filter((i) => {
      const t = convertToINR(i.tuition.tuitionAnnual.value, i.tuition.currency);
      return perYearBudget > 0 && t + annualHostel + annualOther <= perYearBudget && i.id !== inst?.id;
    }).slice(0, 3);
    const lowerCostCourses = COURSES.filter(
      (c) =>
        perYearBudget > 0 &&
        Math.round((c.annualCost.value.minINR + c.annualCost.value.maxINR) / 2) <= perYearBudget * 0.7,
    ).slice(0, 3);
    return { cheaper, lowerCostCourses };
  }, [perYearBudget, inst, annualHostel, annualOther]);

  return (
    <>
      <PageHeader
        eyebrow="Planning tools · Affordability"
        title="Can I afford this?"
        lede="Pick an institution or a course, tell us what you can actually spend a year, and get an honest classification of the gap — with the aid and alternatives that would close it."
        actions={
          <>
            <Btn href="/tools/budget" variant="secondary">Open the full budget planner</Btn>
            <Btn href="/scholarships" variant="ghost">Find funding</Btn>
          </>
        }
      />

      <Section wide>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* --------------------------- Inputs --------------------------- */}
            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">What are we checking?</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="aff-inst" className="mb-1.5 block text-xs font-medium text-ink-muted">
                    Institution
                  </label>
                  <select
                    id="aff-inst"
                    value={institutionId}
                    onChange={(e) => setInstitutionId(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  >
                    <option value="none">No specific institution</option>
                    {INSTITUTIONS.map((i) => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="aff-course" className="mb-1.5 block text-xs font-medium text-ink-muted">
                    Course (used if no institution chosen)
                  </label>
                  <select
                    id="aff-course"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  >
                    <option value="none">No specific course</option>
                    {COURSES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="aff-budget" className="mb-1.5 block text-xs font-medium text-ink-muted">
                    Maximum you can spend per year (₹)
                  </label>
                  <input
                    id="aff-budget"
                    type="number"
                    value={ownBudget}
                    onChange={(e) => setOwnBudget(Math.max(0, Number(e.target.value)))}
                    placeholder="e.g. 300000"
                    className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm tabular text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="aff-savings" className="mb-1.5 block text-xs font-medium text-ink-muted">
                      Savings available (₹)
                    </label>
                    <input
                      id="aff-savings"
                      type="number"
                      value={savings}
                      onChange={(e) => setSavings(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm tabular text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="aff-years" className="mb-1.5 block text-xs font-medium text-ink-muted">
                      Years
                    </label>
                    <input
                      id="aff-years"
                      type="number"
                      min={1}
                      max={8}
                      value={years}
                      onChange={(e) => setYears(Math.min(8, Math.max(1, Number(e.target.value))))}
                      className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm tabular text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {!profile && (
                <p className="mt-4 text-xs text-ink-muted">
                  <Link href="/onboarding" className="font-semibold text-navy-600 dark:text-cyan-300">
                    Complete onboarding
                  </Link>{" "}
                  and we'll prefill this from your stated budget and location preference.
                </p>
              )}
            </div>

            {/* --------------------------- Verdict --------------------------- */}
            <div
              className={`rounded-3xl border p-6 ${
                verdict.status === "yes"
                  ? "border-signal-green/30 bg-signal-green-soft"
                  : verdict.status === "tight"
                    ? "border-signal-amber/30 bg-signal-amber-soft"
                    : verdict.status === "no"
                      ? "border-signal-red/30 bg-signal-red-soft"
                      : "border-hairline bg-surface-muted dark:border-hairline-dark dark:bg-white/5"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={verdict.status === "yes" ? "green" : verdict.status === "unknown" ? "neutral" : "amber"}>
                  {verdict.status === "yes"
                    ? "Fits your budget"
                    : verdict.status === "tight"
                      ? "Fits with no margin"
                      : verdict.status === "no"
                        ? "Doesn't fit yet"
                        : "Not enough information"}
                </Badge>
                <ConfidenceBadge confidence="reported" />
              </div>
              <p className="mt-3 text-xl font-semibold text-ink dark:text-slate-50">{verdict.headline}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{verdict.body}</p>
              <p className="mt-4 text-xs text-ink-faint">
                Estimates include tuition, hostel where applicable, and a living/equipment allowance of about 18% of
                tuition. These are planning figures with reported confidence — verify every fee on the official document.
              </p>
            </div>

            {/* --------------------------- Breakdown --------------------------- */}
            <div className="card overflow-hidden">
              <div className="border-b border-hairline px-5 py-4 dark:border-hairline-dark">
                <p className="font-semibold text-ink dark:text-slate-100">Where the money goes</p>
              </div>
              <ul className="divide-y divide-hairline dark:divide-hairline-dark">
                {[
                  { label: "Tuition (annual)", value: annualTuition, detail: inst ? `Fee document checked ${inst.tuition.tuitionAnnual.verifiedOn}` : course ? "Course cost midpoint" : "—" },
                  { label: "Hostel (annual)", value: annualHostel, detail: inst?.tuition.hostelAnnual ? "Published hostel fee" : "Not applicable / not published" },
                  { label: "Living, books, travel (annual)", value: annualOther, detail: "Indicative allowance, not a measured figure" },
                  { label: "Total (annual)", value: annualTotal, detail: `Over ${duration} year${duration === 1 ? "" : "s"}: ${formatINR(grandTotal)}` },
                ].map((row) => (
                  <li key={row.label} className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-4">
                    <span>
                      <span className="block text-sm font-medium text-ink dark:text-slate-100">{row.label}</span>
                      <span className="mt-0.5 block text-xs text-ink-faint">{row.detail}</span>
                    </span>
                    <span className="text-base font-semibold tabular text-ink dark:text-slate-100">
                      {row.value ? formatINR(row.value) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
              {savings > 0 && (
                <div className="border-t border-hairline bg-surface-muted px-5 py-4 dark:border-hairline-dark dark:bg-white/5">
                  <p className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-ink-muted">Savings applied to the total</span>
                    <span className="font-semibold tabular text-ink dark:text-slate-100">− {formatINR(savings)}</span>
                  </p>
                  <p className="mt-1 text-xs text-ink-faint">Remaining to fund: {formatINR(Math.max(0, grandTotal - savings))}</p>
                </div>
              )}
            </div>

            {/* --------------------------- Aid --------------------------- */}
            <div className="card p-5">
              <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                <GraduationCap className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden />
                Funding that could change the answer
              </p>
              <div className="mt-4 space-y-3">
                {relevantAid.map((s) => (
                  <Link
                    key={s.id}
                    href={`/scholarships?s=${s.slug}`}
                    className="block rounded-2xl border border-hairline p-4 transition hover:border-navy-400 dark:border-hairline-dark"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ink dark:text-slate-100">{s.name}</span>
                      <span className="text-xs text-ink-muted">{s.amount.value}</span>
                    </div>
                    <span className="mt-1 block text-xs text-ink-faint">
                      {s.provider} · deadline {s.deadline.value} · last checked {formatDate(s.lastVerified)}
                    </span>
                  </Link>
                ))}
                {relevantAid.length === 0 && (
                  <p className="text-sm text-ink-muted">No funding records loaded in this build.</p>
                )}
              </div>
            </div>

            {/* --------------------------- Fallbacks --------------------------- */}
            {(fallbacks.cheaper.length > 0 || fallbacks.lowerCostCourses.length > 0) && (
              <div className="card p-5">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-signal-green" aria-hidden /> Cheaper options that fit this budget
                </p>

                {fallbacks.cheaper.length > 0 && (
                  <>
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Institutions</p>
                    <div className="mt-2 space-y-2">
                      {fallbacks.cheaper.map((i) => (
                        <Link
                          key={i.id}
                          href={`/colleges/${i.slug}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-hairline px-4 py-3 text-sm transition hover:border-navy-400 dark:border-hairline-dark"
                        >
                          <span className="text-ink dark:text-slate-100">{i.name}</span>
                          <span className="text-xs text-ink-muted">
                            {formatINR(convertToINR(i.tuition.tuitionAnnual.value, i.tuition.currency))}/yr
                          </span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {fallbacks.lowerCostCourses.length > 0 && (
                  <>
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Programmes</p>
                    <div className="mt-2 space-y-2">
                      {fallbacks.lowerCostCourses.map((c) => (
                        <Link
                          key={c.id}
                          href={`/courses/${c.slug}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-hairline px-4 py-3 text-sm transition hover:border-navy-400 dark:border-hairline-dark"
                        >
                          <span className="text-ink dark:text-slate-100">{c.name}</span>
                          <span className="text-xs text-ink-muted">
                            {formatINR(c.annualCost.value.minINR)}–{formatINR(c.annualCost.value.maxINR)}/yr
                          </span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {perYearBudget > 0 && verdict.status === "no" && (
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Wallet, t: "Add aid", d: "A single scholarship can close the whole gap.", href: "/scholarships" },
                  { icon: GraduationCap, t: "Change the entry point", d: "A diploma or lateral route often costs less.", href: "/explore/outside-my-stream" },
                  { icon: AlertTriangle, t: "Write a fallback", d: "A Plan B costs nothing to write now.", href: "/tools/plan-b" },
                ].map((x) => (
                  <Link key={x.t} href={x.href} className="card interactive-card p-5">
                    <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                      <x.icon className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> {x.t}
                    </p>
                    <p className="mt-2 text-sm text-ink-muted">{x.d}</p>
                  </Link>
                ))}
              </div>
            )}

            {perYearBudget === 0 && (
              <EmptyState
                title="No budget set, no verdict"
                body="We don't assume your finances. Set a yearly ceiling above — or run onboarding and we'll use the budget you already gave us."
                icon={<Wallet className="h-6 w-6" aria-hidden />}
                action={<Btn href="/onboarding">Set my budget</Btn>}
              />
            )}
          </div>

          {/* --------------------------- Sidebar --------------------------- */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Your numbers</p>
              <dl className="mt-3 space-y-3">
                {[
                  ["Stated yearly budget", profile?.budgetYearlyINR ? formatINR(profile.budgetYearlyINR) : "Not set"],
                  ["This check uses", perYearBudget ? formatINR(perYearBudget) : "Not set"],
                  ["Estimated annual cost", annualTotal ? formatINR(annualTotal) : "—"],
                  ["Programme total", formatINR(grandTotal)],
                  ["Savings applied", formatINR(savings)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 text-sm">
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className="font-medium tabular text-ink dark:text-slate-100">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 grid gap-2">
                <Btn href="/tools/budget" size="sm">Full budget planner</Btn>
                <Btn href="/tools/what-if" variant="secondary" size="sm">What if I lower it?</Btn>
              </div>
            </div>

            <div className="card p-5">
              <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                <XCircle className="h-4 w-4 text-signal-amber" aria-hidden /> Costs that don't show up here
              </p>
              <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
                <li>• Exam registration, often taken twice</li>
                <li>• Counselling and seat-locking fees</li>
                <li>• Hostel deposit at the start of year one</li>
                <li>• Fee revisions between cycles</li>
                <li>• Travel home twice a year</li>
              </ul>
            </div>

            <Note tone="warn">
              Affordability now ≠ affordability later. Ask the institution whether fees are fixed for the whole
              programme or revised annually — that single answer can change the total by a lot.
            </Note>
          </aside>
        </div>
      </Section>
    </>
  );
}
