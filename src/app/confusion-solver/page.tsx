"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, HelpCircle, Wallet, Clock, MapPin, Target, GitBranch, CheckCircle2,
} from "lucide-react";
import { Btn, Badge, PageHeader, Section, Note, EmptyState } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { recommendCourses, recommendInstitutions, recommendCareers } from "@/lib/recommend";
import { formatINR } from "@/lib/format";
import { getCourse } from "@/data/courses";

type Concern = "money" | "marks" | "interest" | "location" | "family" | "unsure";

const CONCERNS: { id: Concern; label: string; blurb: string }[] = [
  { id: "interest", label: "I don't know what I'm interested in", blurb: "Nothing feels obviously right yet." },
  { id: "money", label: "Money is the constraint", blurb: "The budget decides more than taste does." },
  { id: "marks", label: "My marks aren't high enough", blurb: "The route I wanted may be closed." },
  { id: "location", label: "I don't want to leave home", blurb: "Distance is a real cost." },
  { id: "family", label: "My family has a different plan for me", blurb: "Expectations and interests don't match." },
  { id: "unsure", label: "Everything seems the same", blurb: "Options blur together." },
];

const STEPS_BY_CONCERN: Record<Concern, { title: string; body: string; href: string; cta: string }[]> = {
  interest: [
    { title: "Remove instead of choosing", body: "Cross off the subjects and tasks you actively dislike. A shorter list beats a ranked one.", href: "/explore", cta: "Explore by stream" },
    { title: "Test with a real artifact", body: "Spend a weekend on one small project — a script, an essay, a budget. How it felt is better data than any quiz.", href: "/skills", cta: "Pick a starter skill" },
    { title: "Talk to the work, not the degree", body: "Careers have a day-to-day reality that degrees hide. Read what the work actually involves.", href: "/careers", cta: "Read career profiles" },
  ],
  money: [
    { title: "Fix the ceiling first", body: "Set the maximum you can spend per year, then compare only what fits inside that band.", href: "/tools/afford", cta: "Run the affordability check" },
    { title: "Look for aid before ruling things out", body: "Scholarships and fee waivers change the picture materially. Check them while you still have options.", href: "/scholarships", cta: "Browse scholarships" },
    { title: "Price the whole four years", body: "Tuition is one line. Hostel, living, travel and hidden costs decide whether it's survivable.", href: "/tools/budget", cta: "Open the budget planner" },
  ],
  marks: [
    { title: "Find the routes still open", body: "Several strong programmes don't gate on Class 12 marks. We'll show which ones match your actual score.", href: "/courses", cta: "Filter by eligibility" },
    { title: "Change the entry point, not the goal", body: "A diploma, a lateral entry or a different entrance exam can reach the same destination a year later.", href: "/explore/outside-my-stream", cta: "See alternate routes" },
    { title: "Write a Plan B now, not later", body: "A fallback decided calmly is far better than one invented in a panic in May.", href: "/tools/plan-b", cta: "Generate a Plan B" },
  ],
  location: [
    { title: "Search within a region", body: "Filter to your state or region and see what's genuinely available — often more than expected.", href: "/colleges", cta: "Filter by location" },
    { title: "Check commute and accommodation reality", body: "Hostel availability and city access change what 'close to home' actually means.", href: "/maps", cta: "Open the India map" },
    { title: "Consider distance later", body: "Many students do first year close to home and move for a specialisation. Sequencing is a legitimate strategy.", href: "/roadmap", cta: "Plan the five years" },
  ],
  family: [
    { title: "Find the overlap deliberately", body: "List what you want and what they want separately. There is almost always a shared middle.", href: "/tools/decision-matrix", cta: "Build a decision matrix" },
    { title: "Show evidence, not opinions", body: "Cost, outcomes and eligibility with sources carry more weight in a family conversation than 'I read it online'.", href: "/methodology", cta: "See how we source data" },
    { title: "Agree on a checkpoint", body: "Pick a review date — after year one, or after a specific exam — instead of arguing about everything at once.", href: "/roadmap", cta: "Set milestones" },
  ],
  unsure: [
    { title: "Compare two or three concretely", body: "Ambiguity usually disappears once options are side by side on the same thirteen dimensions.", href: "/tools/compare", cta: "Compare institutions" },
    { title: "Change one variable and watch", body: "Lower the budget, move the region, change the stream — see exactly what moves.", href: "/tools/what-if", cta: "Open the What-If Explorer" },
    { title: "Take a structured guess and commit", body: "Waiting for certainty is the one option with a known cost. Pick, then re-evaluate at a set date.", href: "/roadmap", cta: "Build a 5-Year Map" },
  ],
};

export default function ConfusionSolverPage() {
  const profile = useAppStore((s) => s.profile);
  const [concern, setConcern] = useState<Concern | null>(null);

  const courses = useMemo(() => recommendCourses(profile, 3), [profile]);
  const institutions = useMemo(
    () => recommendInstitutions(profile, { limit: 3, includeAbroad: profile?.wantAbroad }),
    [profile],
  );
  const careers = useMemo(() => recommendCareers(profile, 3), [profile]);

  return (
    <>
      <PageHeader
        eyebrow="Confusion Solver"
        title="Start where you actually are: stuck"
        lede="No personality quiz, no single answer. Pick the constraint that's really bothering you and we'll show several genuinely different routes — each with what it costs in time and money."
        actions={
          <>
            <Btn href="/tools/plan-b" variant="secondary">
              <GitBranch className="h-4 w-4" aria-hidden /> Just give me a Plan B
            </Btn>
            <Btn href="/pathfinder" variant="ghost">Ask a specific question</Btn>
          </>
        }
      />

      <Section>
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">What's actually blocking you?</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CONCERNS.map((c) => (
              <button
                key={c.id}
                onClick={() => setConcern(c.id)}
                aria-pressed={concern === c.id}
                className={`rounded-2xl border p-5 text-left transition ${
                  concern === c.id
                    ? "border-navy-500 bg-navy-50 dark:border-cyan-400 dark:bg-cyan-500/12"
                    : "border-hairline bg-white hover:border-navy-300 dark:border-hairline-dark dark:bg-white/5"
                }`}
              >
                <span className="block font-semibold text-ink dark:text-slate-100">{c.label}</span>
                <span className="mt-1 block text-sm text-ink-muted">{c.blurb}</span>
              </button>
            ))}
          </div>

          {concern && (
            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-ink dark:text-slate-50">
                  Three routes out of “{CONCERNS.find((c) => c.id === concern)?.label}”
                </h2>
                <button onClick={() => setConcern(null)} className="text-sm font-semibold text-navy-600 dark:text-cyan-300">
                  Change concern
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {STEPS_BY_CONCERN[concern].map((s, i) => (
                  <div key={s.title} className="card flex flex-col p-5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                      {i + 1}
                    </span>
                    <h3 className="mt-3 font-semibold text-ink dark:text-slate-50">{s.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{s.body}</p>
                    <Link href={s.href} className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
                      {s.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concrete options from the profile */}
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <OptionColumn
              icon={<Target className="h-4 w-4" aria-hidden />}
              title="Courses to look at first"
              href="/courses"
              items={courses.map((r) => ({
                label: r.item.name,
                sub: `${r.item.durationYears} yr · ${formatINR(r.item.annualCost.value.minINR)}–${formatINR(r.item.annualCost.value.maxINR)}/yr`,
                href: `/courses/${r.item.slug}`,
                why: r.reasons[0]?.text ?? "",
              }))}
            />
            <OptionColumn
              icon={<MapPin className="h-4 w-4" aria-hidden />}
              title="Institutions that fit"
              href="/colleges"
              items={institutions.map((r) => ({
                label: r.item.name,
                sub: `${r.item.city}, ${r.item.state}`,
                href: `/colleges/${r.item.slug}`,
                why: r.reasons[0]?.text ?? "",
              }))}
            />
            <OptionColumn
              icon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
              title="Careers connected to you"
              href="/careers"
              items={careers.map((r) => ({
                label: r.item.name,
                sub: r.item.domain,
                href: `/careers/${r.item.slug}`,
                why: r.reasons[0]?.text ?? "",
              }))}
            />
          </div>

          {/* Principles */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              { icon: Clock, t: "Choose by a date, not by certainty", d: "Decide what you'll do on a set date if nothing changes. A deadline beats waiting for a feeling." },
              { icon: Wallet, t: "Constraint narrows faster than taste", d: "Fix budget or distance first. Removing options is more productive than adding them." },
              { icon: HelpCircle, t: "Nobody has it fully figured out", d: "Most students revise their plan at least once. Build in the ability to change course rather than pretending you won't." },
              { icon: Target, t: "A good-enough decision now beats a perfect one later", d: "The cost of a year spent waiting is real and rarely discussed." },
            ].map((p) => (
              <div key={p.t} className="card p-5">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <p.icon className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> {p.t}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{p.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Note>
              We deliberately do <strong>not</strong> hand you a single answer. A one-line recommendation from a
              website is how people end up in the wrong course — the reasoning matters more than the result.
            </Note>
          </div>

          {!profile && (
            <div className="mt-6">
              <EmptyState
                title="These options aren't personalised yet"
                body="Add your stream, marks and budget and every suggestion above comes with the specific reason it's there."
                icon={<Target className="h-6 w-6" aria-hidden />}
                action={<Btn href="/onboarding">Start onboarding</Btn>}
                secondaryAction={<Btn href="/sign-in" variant="secondary">Use a demo profile</Btn>}
              />
            </div>
          )}
        </div>
      </Section>
    </>
  );
}

function OptionColumn({
  icon,
  title,
  href,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  items: { label: string; sub: string; href: string; why: string }[];
}) {
  return (
    <div className="card p-5">
      <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
        {icon} {title}
      </p>
      <div className="mt-4 space-y-3">
        {items.length === 0 && <p className="text-sm text-ink-muted">Nothing available yet.</p>}
        {items.map((i) => (
          <Link key={i.href} href={i.href} className="block rounded-xl border border-hairline p-3.5 transition hover:border-navy-400 dark:border-hairline-dark">
            <span className="block text-sm font-medium text-ink dark:text-slate-100">{i.label}</span>
            <span className="mt-0.5 block text-xs text-ink-muted">{i.sub}</span>
            {i.why && <span className="mt-1.5 block text-xs leading-relaxed text-ink-faint">{i.why}</span>}
          </Link>
        ))}
      </div>
      <Link href={href} className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
        See all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}
