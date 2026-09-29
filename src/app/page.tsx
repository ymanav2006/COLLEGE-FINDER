"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight, Sparkles, GraduationCap, Compass, Globe2, Wallet, CalendarDays,
  Scale, Map as MapIcon, GitBranch, HelpCircle, ShieldCheck, Search, Building2,
  BookOpen, Users, TrendingUp, AlertTriangle, Check, ChevronRight, MessageCircleQuestion,
} from "lucide-react";
import { Btn, Section, Badge, ConfidenceBadge, Note, Stat } from "@/components/ui";
import { STREAMS, CROSS_STREAM_OPTIONS } from "@/data/streams";
import { INSTITUTIONS } from "@/data/colleges";
import { COURSES, COURSE_GROUPS } from "@/data/courses";
import { CAREERS } from "@/data/careers";
import { EXAMS } from "@/data/exams";
import { SCHOLARSHIPS } from "@/data/scholarships";
import { COUNTRIES } from "@/data/countries";
import { SKILLS } from "@/data/skills";
import { DATASET_VERIFIED_ON, CONFIDENCE_LABEL } from "@/data/sources";
import { formatDate } from "@/lib/format";

const THREE_CTAS = [
  {
    href: "/onboarding",
    label: "Build my Education Map",
    variant: "primary" as const,
    icon: <Sparkles className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/colleges",
    label: "Explore colleges",
    variant: "secondary" as const,
    icon: <GraduationCap className="h-4 w-4" aria-hidden />,
  },
  {
    href: "/pathfinder",
    label: "Ask Pathfinder AI",
    variant: "secondary" as const,
    icon: <MessageCircleQuestion className="h-4 w-4" aria-hidden />,
  },
];

const FLOW = [
  "Who you are",
  "What you can study",
  "Where you can study",
  "What it costs",
  "What careers it leads to",
  "What you can do next",
];

const FEATURES = [
  {
    icon: GraduationCap,
    title: "College Finder",
    href: "/colleges",
    desc: "A real database — filters, profiles, 13-dimension scorecards, eligibility classification and 2–5 way comparison.",
    tag: "Never “best college”",
  },
  {
    icon: Compass,
    title: "Career Counsellor",
    href: "/careers",
    desc: "Stream → career routes, day-to-day reality, salary ranges with year and methodology, progression and requirements.",
    tag: "55+ careers",
  },
  {
    icon: BookOpen,
    title: "Course Explorer",
    href: "/courses",
    desc: "Duration, eligibility, core subjects, cost ranges, what to do after it, and where it's recognised abroad.",
    tag: `${COURSES.length} courses`,
  },
  {
    icon: Wallet,
    title: "Scholarship Finder",
    href: "/scholarships",
    desc: "Government, university, merit, need, sports and international funding — each with a deadline and last-checked date.",
    tag: `${SCHOLARSHIPS.length} listings`,
  },
  {
    icon: Globe2,
    title: "Study-Abroad Guide",
    href: "/abroad",
    desc: "16 countries with tuition, living costs, visa notes, work rights, post-study options and official links.",
    tag: "16 countries",
  },
  {
    icon: CalendarDays,
    title: "Higher-Ed Planner",
    href: "/dashboard",
    desc: "Budget planner, deadline & application trackers, decision matrix, Plan B generator and your 5-Year Map.",
    tag: "10 planning tools",
  },
];

const CONFUSION_ROUTES = [
  { title: "Follow a subject you actually like", body: "Pick the degree where the coursework itself doesn't feel like a chore. Interest survives harder semesters than motivation does." },
  { title: "Optimise for optionality", body: "Choose a degree that keeps several doors open, then decide in year two. Broad beats premature precision." },
  { title: "Start with the budget", body: "Fix the maximum you can spend per year, then compare only what's inside that band. Constraint narrows the field faster than taste does." },
  { title: "Take the entrance route", body: "If an exam is the gate, work backwards from its date. A clear deadline produces a clear plan." },
];

const FAQS = [
  {
    q: "Do you tell me which college is the best?",
    a: "No. There is no single best institution — only the best fit for your marks, budget, location and goals. We give you 13 independent dimensions with the evidence behind each one, and you decide which dimensions matter to you.",
  },
  {
    q: "How do I know a number on this site is true?",
    a: "Every important value renders as VALUE → SOURCE → DATE → CONFIDENCE, with a “How We Know This” expander. Confidence is one of Verified, Cross-checked, Reported or Unverified. Anything we haven't confirmed is labelled accordingly — never quietly rounded up.",
  },
  {
    q: "Do you guarantee admission or a job?",
    a: "Never. Admission depends on that year's cutoffs, seat availability and counselling; employment depends on far more than a degree. We give you information and routes, not promises.",
  },
  {
    q: "What happens to my data?",
    a: "Your profile, saved items, applications and deadlines are stored locally in your browser. Nothing is uploaded. You can clear everything from your dashboard at any time.",
  },
  {
    q: "Is this only for engineering aspirants?",
    a: "No. Six streams are covered — PCM, PCB, PCMB, Commerce, Arts and Vocational — plus a cross-stream module that shows what you can become from outside your stream.",
  },
  {
    q: "What if the data is old?",
    a: "Time-sensitive fields carry a last-checked date. Past 180 days the interface shows an “information may have changed — verify before applying” warning automatically.",
  },
];

const DEMO_PROFILES = [
  { id: "A", name: "Student A", stream: "PCM", marks: "85%", budget: "₹4 lakh/yr", focus: "Technology" },
  { id: "B", name: "Student B", stream: "PCB", marks: "90%", budget: "₹6 lakh/yr", focus: "Medicine" },
  { id: "C", name: "Student C", stream: "Commerce", marks: "78%", budget: "₹3 lakh/yr", focus: "Finance" },
  { id: "D", name: "Student D", stream: "Humanities", marks: "88%", budget: "₹2.5 lakh/yr", focus: "Psychology" },
];

export default function HomePage() {
  const [stream, setStream] = useState<string>("pcm");
  const crossRoutes = useMemo(() => CROSS_STREAM_OPTIONS.filter((c) => c.from === stream).slice(0, 4), [stream]);
  const streamRecord = STREAMS.find((s) => s.id === stream);

  return (
    <>
      {/* ============================== HERO ============================== */}
      <section className="relative overflow-hidden bg-hero-mesh">
        <div className="pointer-events-none absolute inset-0 hairline-grid opacity-[0.55]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <div className="max-w-3xl">
            <span className="chip bg-white/80 text-navy-700 shadow-sm dark:bg-white/10 dark:text-cyan-200">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Sources & confidence on every claim
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-6xl dark:text-slate-50">
              Your Future Has <span className="text-gradient-brand">More Than One Path</span>.
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-ink-muted sm:text-xl dark:text-slate-400">
              Explore. Compare. Plan. Move Forward.
            </p>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted dark:text-slate-400">
              A college finder, career counsellor, course explorer, scholarship finder, study-abroad guide and
              higher-education planner — built for students who have just finished Class 12 and don't want to guess.
              Every recommendation tells you <em>why</em> you're seeing it.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              {THREE_CTAS.map((cta) => (
                <Btn key={cta.href} href={cta.href} variant={cta.variant} size="lg">
                  {cta.icon}
                  {cta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Btn>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-faint">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-signal-green" aria-hidden /> No sign-in required to explore
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-signal-green" aria-hidden /> 4 demo profiles to try instantly
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-signal-green" aria-hidden /> Stored in your browser only
              </span>
            </div>
          </div>

          {/* The honest pipeline */}
          <div className="mt-14 rounded-3xl border border-hairline bg-white/80 p-6 backdrop-blur dark:border-hairline-dark dark:bg-surface-dark/70">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-navy-500 dark:text-cyan-400">
              How every answer on this platform is built
            </p>
            <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {FLOW.map((step, i) => (
                <li key={step} className="relative rounded-2xl border border-hairline bg-white p-4 dark:border-hairline-dark dark:bg-white/5">
                  <span className="text-[11px] font-bold text-navy-500 dark:text-cyan-400">{`0${i + 1}`}</span>
                  <p className="mt-1 text-sm font-medium leading-snug text-ink dark:text-slate-100">{step}</p>
                  {i < FLOW.length - 1 && (
                    <ChevronRight className="absolute -right-2.5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-ink-faint lg:block" aria-hidden />
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-ink-muted">
              At no point does this platform tell you “this is the best one.” It shows trade-offs and gets out of the way.
            </p>
          </div>
        </div>
      </section>

      {/* ======================= VALUE→SOURCE→DATE ======================== */}
      <Section
        tone="muted"
        eyebrow="Transparency by default"
        title="VALUE → SOURCE → DATE → CONFIDENCE"
        lede="Fees, deadlines, admission requirements, placement data, scholarships and visa rules are all time-sensitive. So each one carries the source it came from, the date we checked it, and how confident we are."
        actions={
          <>
            <Btn href="/methodology" variant="secondary">
              <ShieldCheck className="h-4 w-4" aria-hidden /> How we know this
            </Btn>
            <Btn href="/admin" variant="ghost">
              See the audit trail
            </Btn>
          </>
        }
      >
        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">Example record</Badge>
              <ConfidenceBadge confidence="reported" />
              <Badge tone="amber">Demo data</Badge>
            </div>
            <p className="mt-4 text-sm text-ink-muted">Annual tuition at a seeded institution</p>
            <p className="mt-1 text-3xl font-semibold tabular text-ink dark:text-slate-50">₹2,00,000 / year</p>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl bg-surface-muted p-3 dark:bg-white/5">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Source</dt>
                <dd className="mt-1 text-ink dark:text-slate-200">Institute fee document (uploaded)</dd>
              </div>
              <div className="rounded-xl bg-surface-muted p-3 dark:bg-white/5">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Last verified</dt>
                <dd className="mt-1 text-ink dark:text-slate-200">{formatDate(DATASET_VERIFIED_ON)}</dd>
              </div>
              <div className="rounded-xl bg-surface-muted p-3 dark:bg-white/5">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Confidence</dt>
                <dd className="mt-1 text-ink dark:text-slate-200">{CONFIDENCE_LABEL.reported}</dd>
              </div>
            </dl>

            <p className="mt-4 text-xs leading-relaxed text-ink-muted">
              Open any value's <strong>“How We Know This”</strong> panel to see the value, source, verification date and
              what each confidence label means. Past 180 days, a staleness warning appears automatically:
              <em> “Information may have changed — verify before applying.”</em>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Verified", tone: "green", desc: "Supported by an authoritative source." },
              { label: "Cross-checked", tone: "blue", desc: "Supported by multiple reliable sources." },
              { label: "Reported", tone: "amber", desc: "A reputable secondary source — read with care." },
              { label: "Unverified", tone: "red", desc: "Needs confirmation before you rely on it." },
            ].map((c) => (
              <div key={c.label} className="card p-5">
                <Badge tone={c.tone as "green" | "blue" | "amber" | "red"}>{c.label}</Badge>
                <p className="mt-3 text-sm text-ink-muted">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat value={INSTITUTIONS.length} label="Institutions" sub="India + worldwide, with scorecards" />
          <Stat value={COURSES.length} label="Courses" sub="Across 6 streams and 4 levels" />
          <Stat value={EXAMS.length + SCHOLARSHIPS.length + SKILLS.length} label="Exams · scholarships · skills" sub="Each with source + date" />
        </div>
      </Section>

      {/* ============================ FEATURES =========================== */}
      <Section
        eyebrow="One platform, six jobs"
        title="Everything a student needs after Class 12"
        lede="Most students stitch this together from ten websites, a coaching counsellor and three WhatsApp forwards. Here it is in one place, with the same evidence rules applied everywhere."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="card interactive-card group flex flex-col p-6"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-50 text-navy-600 transition group-hover:bg-navy-600 group-hover:text-white dark:bg-cyan-500/12 dark:text-cyan-400">
                  <f.icon className="h-5 w-5" aria-hidden />
                </span>
                <Badge>{f.tag}</Badge>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink dark:text-slate-50">{f.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{f.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
                Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ==================== STREAM → CAREER EXPLORER ==================== */}
      <Section
        tone="muted"
        eyebrow="Stream → Career Explorer"
        title="Six streams. Real routes. No stereotypes."
        lede="Pick a stream to see where it leads — and, more usefully, what else it can lead to."
        actions={<Btn href="/explore" variant="secondary">Open the full explorer</Btn>}
      >
        <div className="flex flex-wrap gap-2">
          {STREAMS.map((s) => (
            <button
              key={s.id}
              onClick={() => setStream(s.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                stream === s.id
                  ? "bg-navy-600 text-white shadow-[0_8px_24px_-12px_rgba(36,80,199,0.9)] dark:bg-cyan-500 dark:text-navy-950"
                  : "border border-hairline bg-white text-ink-muted hover:border-navy-300 hover:text-ink dark:border-hairline-dark dark:bg-white/5 dark:text-slate-300"
              }`}
              aria-pressed={stream === s.id}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.25fr]">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-ink dark:text-slate-50">{streamRecord?.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{streamRecord?.description}</p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Core subjects</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {streamRecord?.subjects.map((sub) => (
                <span key={sub} className="chip bg-surface-sunken text-ink-muted dark:bg-white/8 dark:text-slate-300">
                  {sub}
                </span>
              ))}
            </div>
            <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Career areas</p>
            <ul className="mt-2 space-y-2">
              {streamRecord?.careerAreas.map((a) => (
                <li key={a.name} className="text-sm">
                  <span className="font-medium text-ink dark:text-slate-100">{a.name}</span>
                  <span className="text-ink-muted"> — {a.blurb}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Btn href={`/explore#${stream}`} variant="secondary" size="sm">
                Explore {streamRecord?.shortName} routes <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Btn>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-violet-600" aria-hidden />
              <h3 className="text-lg font-semibold text-ink dark:text-slate-50">What Else Can I Become?</h3>
            </div>
            <p className="mt-2 text-sm text-ink-muted">
              Your stream doesn't lock you in. Here are {crossRoutes.length} routes{" "}
              {streamRecord ? `available to ${streamRecord.shortName} students` : "that don't require a specific stream"} —
              each with the extra requirements and entrance exams involved.
            </p>
            <div className="mt-5 space-y-3">
              {crossRoutes.map((c) => (
                <div key={c.target} className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink dark:text-slate-100">{c.target}</span>
                    <Badge tone={c.pathway === "direct" ? "green" : c.pathway === "additional" ? "blue" : "amber"}>
                      {c.pathway === "direct" ? "Direct route" : c.pathway === "additional" ? "Additional study" : "Alternate route"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">{c.eligibility}</p>
                  {c.entranceExams.length > 0 && (
                    <p className="mt-2 text-xs text-ink-faint">Entrance: {c.entranceExams.join(" · ")}</p>
                  )}
                </div>
              ))}
              {crossRoutes.length === 0 && (
                <p className="text-sm text-ink-muted">No cross-stream routes are seeded for this stream yet.</p>
              )}
            </div>
            <div className="mt-5">
              <Btn href="/explore/outside-my-stream" variant="secondary" size="sm">
                All cross-stream routes <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Btn>
            </div>
          </div>
        </div>
      </Section>

      {/* ========================== COLLEGES ============================= */}
      <Section
        eyebrow="College database"
        title="Compare on what actually matters to you"
        lede="Filters across location, academics, finances, institution type, career outcomes and campus life — plus a scorecard with 13 independent dimensions. No composite “best” score, because hiding the trade-offs inside one number is how bad decisions get made."
        actions={
          <>
            <Btn href="/colleges">Browse {INSTITUTIONS.length} institutions</Btn>
            <Btn href="/tools/compare" variant="secondary">
              <Scale className="h-4 w-4" aria-hidden /> Compare 2–5 colleges
            </Btn>
          </>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {INSTITUTIONS.slice(0, 4).map((i) => (
            <Link key={i.id} href={`/colleges/${i.slug}`} className="card interactive-card p-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-navy-500 dark:text-cyan-400">
                <Building2 className="h-3.5 w-3.5" aria-hidden />
                {i.type}
              </div>
              <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug text-ink dark:text-slate-50">
                {i.name}
              </h3>
              <p className="mt-1 text-xs text-ink-muted">
                {i.city}, {i.state}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {i.highlights.slice(0, 2).map((h) => (
                  <span key={h} className="chip bg-surface-sunken text-[10px] text-ink-muted dark:bg-white/8 dark:text-slate-300">
                    {h}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-ink-faint">
                Tuition from {i.tuition.tuitionAnnual.value.toLocaleString("en-IN")} {i.tuition.currency}/yr ·{" "}
                {i.courseIds.length} programmes
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "13 dimensions, 0 rankings", d: "Academics, research, career outcomes, campus life, infrastructure, activities, affordability, location, international exposure, entrepreneurship, diversity, accommodation and student support — each with its own evidence." },
            { t: "Eligibility, classified", d: "Likely eligible · Eligibility needs verification · Not currently eligible — with the exact requirement that produced each verdict." },
            { t: "Affordability, checked", d: "Your yearly budget against real tuition, hostel and other fees, with scholarships surfaced before you rule anything out." },
          ].map((x) => (
            <div key={x.t} className="card p-5">
              <p className="font-semibold text-ink dark:text-slate-50">{x.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{x.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ========================= PATHFINDER AI ========================= */}
      <Section tone="dark" eyebrow="Pathfinder AI" title="Ask in plain language. Get an answer with citations.">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="max-w-xl text-navy-200">
              Pathfinder retrieves from this platform's records rather than guessing. If the database has nothing, it
              says so — it will not invent a fee, a deadline or a placement figure.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Can I study computer science if I took commerce?",
                "Scholarships for engineering students in Germany",
                "What can I do after BCom?",
                "Medical colleges abroad under ₹20 lakh a year",
                "I don't know what to do after Class 12",
              ].map((q) => (
                <Link
                  key={q}
                  href={`/pathfinder?q=${encodeURIComponent(q)}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/6 px-4 py-3.5 transition hover:border-cyan-400/50 hover:bg-white/10"
                >
                  <span className="text-sm text-navy-100">{q}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-cyan-300 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              ))}
            </div>
            <div className="mt-7">
              <Btn href="/pathfinder" className="dark:bg-cyan-500 dark:text-navy-950">
                <Sparkles className="h-4 w-4" aria-hidden /> Open Pathfinder AI
              </Btn>
            </div>
          </div>

          <div className="rounded-3xl border border-white/12 bg-white/6 p-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">What an answer looks like</p>
            <p className="mt-4 text-sm leading-relaxed text-navy-100">
              “Based on what you've told us, you satisfy the published requirements for BSc Computer Science. That is not
              an admission guarantee — cutoffs, seat counts and counselling still decide the outcome.”
            </p>
            <ul className="mt-5 space-y-2 text-sm text-navy-200">
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden /> Your 85% meets the 60% minimum.</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden /> Matches your PCM stream requirement.</li>
              <li className="flex gap-2 text-signal-amber"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> CUET (UG) result still pending.</li>
            </ul>
            <div className="mt-5 rounded-2xl bg-navy-950/50 p-4 text-xs text-navy-200">
              <p className="font-semibold text-white">Citations attached</p>
              <p className="mt-1">CUET (UG) information bulletin · checked 30 May 2026 · Verified</p>
              <p className="mt-1">Institution eligibility record · reported confidence</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ======================= PLANNING TOOL SUITE ===================== */}
      <Section
        tone="muted"
        eyebrow="Planning tools"
        title="From “maybe” to a plan with dates on it"
        lede="Research is only half the job. These tools turn what you find into something you can act on this week."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Wallet, t: "Budget planner", href: "/tools/budget", d: "Four years of tuition, hostel, living and hidden costs — built from ranges, not single numbers." },
            { icon: Scale, t: "“Can I afford this?”", href: "/tools/afford", d: "Check any institution against your actual yearly budget, with scholarship options surfaced." },
            { icon: CalendarDays, t: "Deadline tracker", href: "/tools/deadlines", d: "Exams, applications, counselling rounds and documents in one timeline with reminders." },
            { icon: Users, t: "Application tracker", href: "/tools/applications", d: "Status from Interested to Final choice, plus required documents, fees and results." },
            { icon: Check, t: "Decision matrix", href: "/tools/decision-matrix", d: "Weight what matters to you and let the math show the trade-offs — not a hidden ranking." },
            { icon: GitBranch, t: "Plan B Generator", href: "/tools/plan-b", d: "Realistic alternative routes for when the first choice doesn't work out." },
            { icon: TrendingUp, t: "What-If Explorer", href: "/tools/what-if", d: "Change one variable — marks, budget, location — and watch the options move." },
            { icon: MapIcon, t: "5-Year Map", href: "/roadmap", d: "Year-by-year milestones from Class 12 to career, master's or research." },
            { icon: BookOpen, t: "Higher studies planner", href: "/higher-studies", d: "What comes after the bachelor's — master's, professional, research, medical and law routes." },
            { icon: HelpCircle, t: "Confusion Solver", href: "/confusion-solver", d: "For the days where you genuinely don't know what to do. Several routes, not one answer." },
          ].map((t) => (
            <Link key={t.t} href={t.href} className="card interactive-card group flex gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600 dark:bg-cyan-500/12 dark:text-cyan-400">
                <t.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 font-semibold text-ink dark:text-slate-50">
                  {t.t}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" aria-hidden />
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-ink-muted">{t.d}</span>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ======================== CONFUSION SOLVER ======================= */}
      <Section
        eyebrow="Confusion Solver"
        title="“I don't know what to do.”"
        lede="That's not a failure — it's the actual starting point for most students. We won't hand you a single answer. We'll hand you several genuinely different routes and what each one costs."
        actions={<Btn href="/confusion-solver">Open the Confusion Solver</Btn>}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {CONFUSION_ROUTES.map((r, i) => (
            <div key={r.title} className="card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-ink dark:text-slate-50">{r.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{r.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Note>
            We deliberately avoid saying “just follow your passion.” Passion without a feasibility check is how students
            end up mid-way through a course they can't afford — so every route here also shows cost, duration and
            entrance requirements.
          </Note>
        </div>
      </Section>

      {/* ============================== MAPS ============================= */}
      <Section
        tone="muted"
        eyebrow="Global coverage"
        title="World map and India map"
        lede="Every institution and every country guide is plotted. Click a marker to jump straight to the record — with its source and last-verified date."
        actions={
          <>
            <Btn href="/maps">
              <MapIcon className="h-4 w-4" aria-hidden /> Open the maps
            </Btn>
            <Btn href="/abroad" variant="secondary">
              <Globe2 className="h-4 w-4" aria-hidden /> 16 country guides
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COUNTRIES.slice(0, 8).map((c) => (
            <Link key={c.id} href={`/abroad/${c.slug}`} className="card interactive-card p-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>{c.flag}</span>
                <span className="font-semibold text-ink dark:text-slate-50">{c.name}</span>
              </div>
              <p className="mt-3 text-xs text-ink-muted">Tuition {c.tuitionRange.value}</p>
              <p className="mt-1 text-xs text-ink-muted">Living {c.livingRange.value}</p>
              <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] text-ink-faint">
                Checked {formatDate(c.lastVerified)}
                <ConfidenceBadge confidence="reported" />
              </p>
            </Link>
          ))}
        </div>
      </Section>

      {/* ======================== WHY YOU'RE SEEING ====================== */}
      <Section
        eyebrow="Explainable recommendations"
        title="Every recommendation shows its reasoning"
        lede="No black box. Open “Why you're seeing this” on any card and you'll get the specific, checkable reason it's there — stream fit, budget fit, location match, eligibility status, or a signal from your interests."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            { kind: "match", label: "Match", tone: "green" as const, text: "Offers 3 programmes open to PCM students — e.g. B.Tech Computer Science, B.Sc Data Science." },
            { kind: "match", label: "Match", tone: "green" as const, text: "Annual tuition ₹1.75 lakh sits inside your ₹4 lakh yearly budget." },
            { kind: "uncertain", label: "Uncertain", tone: "amber" as const, text: "You'd need to clear CUET (UG) — eligibility depends on that result." },
            { kind: "blocker", label: "Blocker", tone: "red" as const, text: "Your 58% is below the stated 75% minimum for this programme." },
            { kind: "match", label: "Match", tone: "green" as const, text: "In Tamil Nadu, which matches your South India preference." },
            { kind: "neutral", label: "Context", tone: "blue" as const, text: "Strongest recorded dimensions: Academics (89/100) and Affordability (84/100)." },
          ].map((r, i) => (
            <div key={i} className="card flex gap-3 p-5">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  r.tone === "green"
                    ? "bg-signal-green-soft text-signal-green"
                    : r.tone === "amber"
                      ? "bg-signal-amber-soft text-signal-amber"
                      : r.tone === "red"
                        ? "bg-signal-red-soft text-signal-red"
                        : "bg-signal-blue-soft text-signal-blue"
                }`}
                aria-hidden
              >
                {r.tone === "red" ? "✕" : r.tone === "amber" ? "?" : "✓"}
              </span>
              <div>
                <Badge tone={r.tone}>{r.label}</Badge>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* =========================== COURSES/EXAMS ======================= */}
      <Section tone="muted" eyebrow="Databases" title="Courses, entrance exams, careers and skills">
        <div className="grid gap-5 lg:grid-cols-4">
          {[
            {
              title: "Courses",
              href: "/courses",
              count: `${COURSES.length} courses`,
              items: COURSE_GROUPS.slice(0, 5).map((g) => g.name),
            },
            {
              title: "Entrance exams",
              href: "/exams",
              count: `${EXAMS.length} exams`,
              items: EXAMS.slice(0, 5).map((e) => e.name),
            },
            {
              title: "Careers",
              href: "/careers",
              count: `${CAREERS.length} careers`,
              items: CAREERS.slice(0, 5).map((c) => c.name),
            },
            {
              title: "Skills",
              href: "/skills",
              count: `${SKILLS.length} skills`,
              items: SKILLS.slice(0, 5).map((s) => s.name),
            },
          ].map((g) => (
            <div key={g.title} className="card p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold text-ink dark:text-slate-50">{g.title}</h3>
                <span className="text-[11px] text-ink-faint">{g.count}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {g.items.map((i) => (
                  <li key={i} className="flex items-center gap-1.5 text-sm text-ink-muted">
                    <ChevronRight className="h-3 w-3 shrink-0 text-ink-faint" aria-hidden />
                    {i}
                  </li>
                ))}
              </ul>
              <Link href={g.href} className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
                View all <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* =========================== DEMO PROFILES ======================= */}
      <Section
        eyebrow="Try it immediately"
        title="Four demo profiles — no sign-up needed"
        lede="Explore the platform as a real student would, or create your own profile in about two minutes. Everything stays in your browser."
        actions={
          <>
            <Btn href="/sign-in">Start onboarding</Btn>
            <Btn href="/sign-in" variant="secondary">
              Use a demo profile
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_PROFILES.map((p) => (
            <Link key={p.id} href={`/sign-in?demo=${p.id}`} className="card interactive-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-navy-500 to-violet-500 text-sm font-bold text-white">
                  {p.id}
                </span>
                <div>
                  <p className="font-semibold text-ink dark:text-slate-50">{p.name}</p>
                  <p className="text-xs text-ink-muted">{p.stream} · {p.marks}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-ink-muted">
                <p>Budget: {p.budget}</p>
                <p>Leans towards: {p.focus}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ============================== FAQ ============================== */}
      <Section
        tone="muted"
        eyebrow="Straight answers"
        title="Questions students actually ask"
        actions={<Btn href="/faq" variant="secondary">Read the full FAQ</Btn>}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {FAQS.map((f) => (
            <details key={f.q} className="card group p-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium text-ink dark:text-slate-100">
                {f.q}
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint transition-transform group-open:rotate-90" aria-hidden />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* ============================ FINAL CTA ========================== */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="pointer-events-none absolute inset-0 hairline-grid opacity-20" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">Ready when you are</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">
            Your Future Has More Than One Path.
          </h2>
          <p className="mt-4 text-lg text-navy-200">Explore. Compare. Plan. Move Forward.</p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {THREE_CTAS.map((cta) => (
              <Btn
                key={cta.href}
                href={cta.href}
                variant={cta.variant === "primary" ? "primary" : "secondary"}
                size="lg"
                className={cta.variant === "secondary" ? "border-white/25 bg-white/10 text-white hover:border-white/60 hover:text-white dark:border-white/25 dark:bg-white/10 dark:text-white" : ""}
              >
                {cta.icon}
                {cta.label}
              </Btn>
            ))}
          </div>

          <p className="mt-8 text-xs text-navy-300">
            No guarantees of admission, employment or salary — ever. Just better-informed decisions.
          </p>
        </div>
      </section>
    </>
  );
}
