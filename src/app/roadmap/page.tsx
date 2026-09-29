"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarRange, Plus, Trash2, CheckCircle2, Circle, ArrowRight, Target, Flag } from "lucide-react";
import { Btn, Badge, PageHeader, Section, Note, EmptyState } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { recommendCourses, recommendCareers } from "@/lib/recommend";
import { SKILLS } from "@/data/skills";
import { formatDate } from "@/lib/format";

interface Milestone {
  id: string;
  year: number;
  title: string;
  detail: string;
  kind: "exam" | "application" | "study" | "skill" | "money" | "decision";
  done: boolean;
}

const KIND_META: Record<Milestone["kind"], { label: string; tone: "brand" | "blue" | "green" | "amber" | "neutral" }> = {
  exam: { label: "Entrance exam", tone: "blue" },
  application: { label: "Application", tone: "brand" },
  study: { label: "Study", tone: "green" },
  skill: { label: "Skill", tone: "neutral" },
  money: { label: "Money", tone: "amber" },
  decision: { label: "Decision checkpoint", tone: "brand" },
};

const uid = () => Math.random().toString(36).slice(2, 9);

const START_YEAR = new Date().getFullYear();

function seedPlan(): Milestone[] {
  return [
    { id: uid(), year: 0, title: "Shortlist 8–10 institutions", detail: "Cover three budget bands and two locations so nothing is decided by default.", kind: "decision", done: false },
    { id: uid(), year: 0, title: "Register for entrance exams", detail: "Check each official site for the current cycle's registration window — not last year's dates.", kind: "exam", done: false },
    { id: uid(), year: 0, title: "Build one portfolio-worthy project", detail: "Anything concrete beats a claim on a CV. Two weeks of focused work is enough.", kind: "skill", done: false },
    { id: uid(), year: 1, title: "Submit applications", detail: "Apply to at least one reach, one realistic and one safety option.", kind: "application", done: false },
    { id: uid(), year: 1, title: "Apply for scholarships", detail: "Institutional aid often closes near admission, not with the national portal.", kind: "money", done: false },
    { id: uid(), year: 2, title: "First-year checkpoint", detail: "Does the course still match what you expected? Revise the map rather than sticking to a plan that stopped fitting.", kind: "decision", done: false },
    { id: uid(), year: 3, title: "Internship or project with real stakes", detail: "Industry exposure changes what you want from year four far more than another elective does.", kind: "skill", done: false },
    { id: uid(), year: 4, title: "Decide: work, study further or both", detail: "Entrance exams for postgraduate study need roughly a year of preparation.", kind: "decision", done: false },
    { id: uid(), year: 5, title: "Fallback reviewed", detail: "If Plan A stalled, execute the Plan B you wrote earlier instead of improvising.", kind: "decision", done: false },
  ];
}

export default function RoadmapPage() {
  const profile = useAppStore((s) => s.profile);

  const [milestones, setMilestones] = useState<Milestone[]>(seedPlan);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(0);
  const [kind, setKind] = useState<Milestone["kind"]>("decision");
  const [detail, setDetail] = useState("");

  const courses = useMemo(() => recommendCourses(profile, 3), [profile]);
  const careers = useMemo(() => recommendCareers(profile, 3), [profile]);

  const years = useMemo(() => {
    const ys = Array.from(new Set(milestones.map((m) => m.year))).sort((a, b) => a - b);
    const base = ys.length ? ys : [0, 1, 2, 3, 4];
    return base;
  }, [milestones]);

  const add = () => {
    if (!title.trim()) return;
    setMilestones((prev) => [
      ...prev,
      { id: uid(), year, title: title.trim(), detail: detail.trim(), kind, done: false },
    ].sort((a, b) => a.year - b.year));
    setTitle("");
    setDetail("");
  };

  const completed = milestones.filter((m) => m.done).length;

  return (
    <>
      <PageHeader
        eyebrow="Planning tools · 5-Year Map"
        title="Five years, one page, honest checkpoints"
        lede="A route you can actually revisit: entrance exams, applications, skills, money milestones and — most importantly — the points where you're meant to stop and re-decide rather than plough on."
        actions={
          <>
            <Btn href="/tools/plan-b" variant="secondary">Keep a Plan B attached</Btn>
            <Btn href="/tools/deadlines" variant="ghost">Deadline tracker</Btn>
          </>
        }
      />

      <Section wide>
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Milestones</p>
            <p className="mt-1.5 text-3xl font-semibold tabular text-ink dark:text-slate-50">{milestones.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Completed</p>
            <p className="mt-1.5 text-3xl font-semibold tabular text-ink dark:text-slate-50">{completed}</p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Years covered</p>
            <p className="mt-1.5 text-3xl font-semibold tabular text-ink dark:text-slate-50">{years.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Starts</p>
            <p className="mt-1.5 text-3xl font-semibold tabular text-ink dark:text-slate-50">{START_YEAR}</p>
          </div>
        </div>

        {/* ------------------------------ Timeline ------------------------------ */}
        <div className="relative space-y-8 border-l-2 border-hairline pl-6 dark:border-hairline-dark sm:pl-8">
          {years.map((y) => {
            const items = milestones.filter((m) => m.year === y);
            return (
              <div key={y} className="relative">
                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-navy-600 text-[11px] font-bold text-white ring-4 ring-white dark:bg-cyan-500 dark:text-navy-950 dark:ring-[#0b1224] sm:-left-[39px]">
                  {y}
                </span>

                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-lg font-semibold text-ink dark:text-slate-50">
                    {y === 0 ? "Now" : `Year ${y}`}
                  </h2>
                  <span className="text-sm text-ink-faint">{START_YEAR + y}</span>
                  <span className="text-xs text-ink-faint">
                    {items.filter((i) => i.done).length}/{items.length} done
                  </span>
                </div>

                <ul className="mt-3 space-y-3">
                  {items.map((m) => (
                    <li key={m.id} className="card flex flex-wrap items-start gap-4 p-4">
                      <button
                        onClick={() =>
                          setMilestones((prev) => prev.map((x) => (x.id === m.id ? { ...x, done: !x.done } : x)))
                        }
                        aria-label={m.done ? `Mark ${m.title} incomplete` : `Mark ${m.title} complete`}
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                          m.done
                            ? "border-signal-green bg-signal-green text-white"
                            : "border-hairline text-ink-faint hover:border-navy-400 hover:text-navy-600 dark:border-hairline-dark"
                        }`}
                      >
                        {m.done ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
                      </button>

                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-medium ${m.done ? "text-ink-faint line-through" : "text-ink dark:text-slate-100"}`}>
                          {m.title}
                        </span>
                        {m.detail && <span className="mt-1 block text-xs leading-relaxed text-ink-muted">{m.detail}</span>}
                      </span>

                      <Badge tone={KIND_META[m.kind].tone}>{KIND_META[m.kind].label}</Badge>

                      <button
                        onClick={() => setMilestones((prev) => prev.filter((x) => x.id !== m.id))}
                        aria-label={`Remove ${m.title}`}
                        className="rounded-full p-1.5 text-ink-faint transition hover:bg-signal-red-soft hover:text-signal-red"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                  {items.length === 0 && (
                    <li className="rounded-2xl border border-dashed border-hairline px-4 py-5 text-sm text-ink-faint dark:border-hairline-dark">
                      Nothing planned for this year yet.
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>

        {/* ------------------------------ Add ------------------------------ */}
        <div className="mt-8 card p-5">
          <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
            <Plus className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Add a milestone
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_130px_170px_auto]">
            <div>
              <label htmlFor="rm-title" className="sr-only">Milestone title</label>
              <input
                id="rm-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Book CLAT coaching trial"
                className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="rm-year" className="sr-only">Year</label>
              <select
                id="rm-year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              >
                {[0, 1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>{y === 0 ? "Now" : `Year ${y}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rm-kind" className="sr-only">Type</label>
              <select
                id="rm-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as Milestone["kind"])}
                className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              >
                {Object.entries(KIND_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <Btn onClick={add} disabled={!title.trim()}>Add</Btn>
          </div>
          <label htmlFor="rm-detail" className="sr-only">Detail</label>
          <input
            id="rm-detail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Optional detail — what 'done' actually looks like"
            className="mt-3 w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
          />
        </div>

        {/* ------------------------------ Personalised ------------------------------ */}
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="card p-5">
            <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
              <Target className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Courses you're tracking
            </p>
            <div className="mt-3 space-y-2">
              {courses.map((r) => (
                <Link key={r.item.id} href={`/courses/${r.item.slug}`} className="block rounded-xl border border-hairline px-4 py-3 text-sm transition hover:border-navy-400 dark:border-hairline-dark">
                  <span className="font-medium text-ink dark:text-slate-100">{r.item.name}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">{r.item.durationYears} yr · {r.reasons[0]?.text}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
              <Flag className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Skills worth starting now
            </p>
            <div className="mt-3 space-y-2">
              {SKILLS.slice(0, 4).map((s) => (
                <Link key={s.id} href={`/skills/${s.slug}`} className="block rounded-xl border border-hairline px-4 py-3 text-sm transition hover:border-navy-400 dark:border-hairline-dark">
                  <span className="font-medium text-ink dark:text-slate-100">{s.name}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">~{s.approxTime}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <p className="font-semibold text-ink dark:text-slate-100">Careers you're aiming at</p>
            <div className="mt-3 space-y-2">
              {careers.map((r) => (
                <Link key={r.item.id} href={`/careers/${r.item.slug}`} className="block rounded-xl border border-hairline px-4 py-3 text-sm transition hover:border-navy-400 dark:border-hairline-dark">
                  <span className="font-medium text-ink dark:text-slate-100">{r.item.name}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">{r.item.domain}</span>
                </Link>
              ))}
            </div>
            <Link href="/pathfinder" className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
              Ask what should go first <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <Note>
            Five years is long enough for the plan to be wrong. That's why checkpoint milestones are in here by
            default — re-deciding is the plan, not a failure of it.
          </Note>
        </div>
      </Section>
    </>
  );
}
