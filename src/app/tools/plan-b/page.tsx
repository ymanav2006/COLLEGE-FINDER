"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GitBranch, ArrowRight, RefreshCw, CheckCircle2, Wallet, MapPin, Clock } from "lucide-react";
import { Btn, Badge, PageHeader, Section, Note, EmptyState } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { COURSES, getCourse } from "@/data/courses";
import { CAREERS } from "@/data/careers";
import { recommendCourses, recommendInstitutions, recommendCareers } from "@/lib/recommend";
import { convertToINR } from "@/data/money";
import { formatINR } from "@/lib/format";
import type { StreamId } from "@/lib/types";

const PLAN_TYPES = [
  { id: "lower-cost", label: "A lower-cost route", icon: Wallet, blurb: "Same destination, less money per year." },
  { id: "nearby", label: "Something close to home", icon: MapPin, blurb: "Cut distance and living costs entirely." },
  { id: "alternate-entry", label: "A different way in", icon: GitBranch, blurb: "Diploma, lateral entry or a different exam." },
  { id: "time-shift", label: "The same goal, one year later", icon: Clock, blurb: "A gap year handled deliberately, not accidentally." },
] as const;

type PlanTypeId = (typeof PLAN_TYPES)[number]["id"];

interface Plan {
  id: string;
  title: string;
  why: string;
  time: string;
  cost: string;
  href: string;
  tradeoff: string;
}

export default function PlanBPage() {
  const profile = useAppStore((s) => s.profile);

  const [primary, setPrimary] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("course");
      if (p) return p;
    }
    return "";
  });
  const [type, setType] = useState<PlanTypeId>("lower-cost");
  const [regenerate, setRegenerate] = useState(0);

  const primaryCourse = useMemo(
    () => COURSES.find((c) => c.slug === primary) ?? COURSES[0],
    [primary],
  );

  const plans = useMemo<Plan[]>(() => {
    const cheaper = recommendCourses(profile, 60).filter(
      (r) => r.item.id !== primaryCourse?.id,
    );
    const affordable = recommendInstitutions(profile, { limit: 60, includeAbroad: profile?.wantAbroad });
    const near = affordable.filter((r) =>
      profile?.locationPreference && profile.locationPreference !== "Any location"
        ? r.item.state === profile.locationPreference || profile.locationPreference === profile.state
        : true,
    );
    const altCourses = (primaryCourse?.alternativeCourseIds ?? [])
      .map(getCourse)
      .filter((c): c is NonNullable<typeof c> => Boolean(c));

    const lowCost = cheaper.filter(
      (r) => r.item.annualCost.value.maxINR <= (primaryCourse?.annualCost.value.maxINR ?? Infinity),
    ).slice(0, 3);

    const list: Plan[] = [];

    if (type === "lower-cost") {
      lowCost.forEach((r) => {
        list.push({
          id: `low-${r.item.id}`,
          title: `${r.item.name} instead`,
          why: r.reasons[0]?.text ?? "Similar destination at a lower annual cost.",
          time: `${r.item.durationYears} years`,
          cost: `${formatINR(r.item.annualCost.value.minINR)}–${formatINR(r.item.annualCost.value.maxINR)} / yr`,
          href: `/courses/${r.item.slug}`,
          tradeoff: `You give up the specific brand or location of ${primaryCourse?.name ?? "the first choice"} — not the field itself.`,
        });
      });
      if (list.length === 0) {
        list.push({
          id: "low-generic",
          title: "Same field at a public institution",
          why: "Public institutions in this build consistently publish lower tuition than private equivalents in the same city.",
          time: "Same duration",
          cost: "Typically under ₹1 lakh / yr tuition",
          href: "/colleges?type=government",
          tradeoff: "Competitive entry and possibly fewer campus amenities.",
        });
      }
    }

    if (type === "nearby") {
      (near.length ? near : affordable).slice(0, 3).forEach((r) => {
        list.push({
          id: `near-${r.item.id}`,
          title: r.item.name,
          why: r.reasons[0]?.text ?? "Institutions inside your stated location preference.",
          time: `${r.item.established ? `Est. ${r.item.established}` : ""}`,
          cost: `${formatINR(convertToINR(r.item.tuition.tuitionAnnual.value, r.item.tuition.currency))} / yr tuition`,
          href: `/colleges/${r.item.slug}`,
          tradeoff: "You keep the commute; you drop hostel and relocation costs.",
        });
      });
    }

    if (type === "alternate-entry") {
      if (altCourses.length) {
        altCourses.slice(0, 3).forEach((c) => {
          list.push({
            id: `alt-${c.id}`,
            title: `${c.name} — then bridge across`,
            why: `An alternative route to the same destination as ${primaryCourse?.name ?? "your first choice"}.`,
            time: `${c.durationYears} years`,
            cost: `${formatINR(c.annualCost.value.minINR)}–${formatINR(c.annualCost.value.maxINR)} / yr`,
            href: `/courses/${c.slug}`,
            tradeoff: "Extra time or a bridge qualification before you reach the original goal.",
          });
        });
      }
      list.push({
        id: "alt-exam",
        title: "Retake a different entrance exam",
        why: "Many programmes accept more than one exam — a different one may suit your strengths better.",
        time: "One extra attempt cycle",
        cost: "Registration fees only",
        href: "/exams",
        tradeoff: "Months of preparation and no certainty of a better score.",
      });
    }

    if (type === "time-shift") {
      list.push(
        {
          id: "time-skill",
          title: "Six months of buildable skills, then apply",
          why: "A deliberate gap year with a portfolio produces a stronger application than an accidental one.",
          time: "+1 year",
          cost: "Course fees only",
          href: "/skills",
          tradeoff: "You start a year behind your peers — and arrive with something concrete to show.",
        },
        {
          id: "time-work",
          title: "A year of work or internship first",
          why: "Work experience changes what you look for in a degree, and some programmes prefer it.",
          time: "+1 year",
          cost: "You earn instead of spending",
          href: "/careers",
          tradeoff: "Re-entering study afterwards takes discipline.",
        },
        {
          id: "time-plan",
          title: "Write the fallback, keep the original",
          why: "Most students revise their plan once anyway — building the escape route first removes the panic.",
          time: "Immediate",
          cost: "Nothing",
          href: "/roadmap",
          tradeoff: "None. This is the cheapest option on the list.",
        },
      );
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, profile, primaryCourse, regenerate]);

  const careers = useMemo(() => recommendCareers(profile, 3), [profile]);

  return (
    <>
      <PageHeader
        eyebrow="Planning tools · Plan B Generator"
        title="A fallback you write today, not one you invent in a panic"
        lede="Pick what you'd do if your first choice didn't work out, and get real routes in this build's database — each with the time it takes, what it costs and exactly what you'd be giving up."
        actions={
          <>
            <Btn href="/tools/decision-matrix" variant="secondary">Score the alternatives</Btn>
            <Btn href="/confusion-solver" variant="ghost">I don't know what's wrong</Btn>
          </>
        }
      />

      <Section wide>
        {/* --------------------------- Primary --------------------------- */}
        <div className="mb-6 card p-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label htmlFor="plan-primary" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                What is your first choice right now?
              </label>
              <select
                id="plan-primary"
                value={primaryCourse?.slug ?? ""}
                onChange={(e) => setPrimary(e.target.value)}
                className="w-full rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              >
                {COURSES.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
              {primaryCourse && (
                <p className="mt-2 text-sm text-ink-muted">
                  {primaryCourse.tagline} · {primaryCourse.durationYears} yr ·{" "}
                  {formatINR(primaryCourse.annualCost.value.minINR)}–{formatINR(primaryCourse.annualCost.value.maxINR)}/yr
                </p>
              )}
            </div>
            <Btn onClick={() => setRegenerate((v) => v + 1)} variant="secondary">
              <RefreshCw className="h-4 w-4" aria-hidden /> Regenerate
            </Btn>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {PLAN_TYPES.map((p) => (
              <button
                key={p.id}
                onClick={() => setType(p.id)}
                aria-pressed={type === p.id}
                className={`chip border ${type === p.id
                  ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950"
                  : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"}`}
              >
                <p.icon className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
                {p.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            {PLAN_TYPES.find((p) => p.id === type)?.blurb}
          </p>
        </div>

        {/* --------------------------- Plans --------------------------- */}
        {plans.length === 0 ? (
          <EmptyState
            title="No route matched that combination"
            body="This build holds a curated dataset. Try a different fallback type — a different way in is often the most reliable option anyway."
            icon={<GitBranch className="h-6 w-6" aria-hidden />}
            action={<Btn onClick={() => setType("alternate-entry")}>Try alternate entry routes</Btn>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p, i) => (
              <article key={p.id} className="card flex flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-600 text-xs font-bold text-white dark:bg-cyan-500 dark:text-navy-950">
                    {i + 1}
                  </span>
                  <Badge tone="neutral">Plan B</Badge>
                </div>
                <h2 className="mt-3 font-semibold text-ink dark:text-slate-50">{p.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{p.why}</p>

                <dl className="mt-4 space-y-1.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-faint">Time</dt>
                    <dd className="text-right font-medium text-ink dark:text-slate-200">{p.time}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-faint">Cost</dt>
                    <dd className="text-right font-medium text-ink dark:text-slate-200">{p.cost}</dd>
                  </div>
                </dl>

                <div className="mt-4 rounded-xl bg-surface-muted p-3 dark:bg-white/5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">You'd be giving up</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">{p.tradeoff}</p>
                </div>

                <Link href={p.href} className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
                  Open this option <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* --------------------------- Also consider --------------------------- */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="card p-5">
            <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
              <CheckCircle2 className="h-4 w-4 text-signal-green" aria-hidden /> Careers connected to your profile
            </p>
            <div className="mt-4 space-y-3">
              {careers.map((r) => (
                <Link key={r.item.id} href={`/careers/${r.item.slug}`} className="block rounded-xl border border-hairline p-3.5 transition hover:border-navy-400 dark:border-hairline-dark">
                  <span className="block text-sm font-medium text-ink dark:text-slate-100">{r.item.name}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">{r.item.domain} · {r.item.salary.value}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <p className="font-semibold text-ink dark:text-slate-100">The honest part</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
              A Plan B does not lower your chances of Plan A — it removes the fear of it failing. Students who write a
              fallback before applications open are the ones who apply calmly instead of over-aplying to eight
              institutions out of panic.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Btn href="/roadmap" size="sm">Put it on the 5-Year Map</Btn>
              <Btn href="/tools/what-if" variant="secondary" size="sm">Stress-test it</Btn>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Note>
            Nothing here guarantees admission or a job. These are routes that exist in this build's database with the
            stated cost and duration — every one of them still depends on you clearing its own requirements.
          </Note>
        </div>
      </Section>
    </>
  );
}
