"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Sparkles, GraduationCap, BookOpen, Compass, Wallet, CalendarDays, Bookmark,
  ArrowRight, AlertTriangle, MapIcon, Target, CheckCircle2, Users, RefreshCcw,
} from "lucide-react";
import { Btn, Badge, PageHeader, Section, EmptyState, WhyList, ConfidenceBadge, Note, Stat } from "@/components/ui";
import { InstitutionCard, CourseCard, CareerCard } from "@/components/cards";
import { useAppStore } from "@/lib/store";
import { recommendInstitutions, recommendCourses, recommendCareers } from "@/lib/recommend";
import { getCourse } from "@/data/courses";
import { getScholarship } from "@/data/scholarships";
import { getExam } from "@/data/exams";
import { EXAMS } from "@/data/exams";
import { SCHOLARSHIPS } from "@/data/scholarships";
import { streamLabel } from "@/data/streams";
import { formatDate, formatINR } from "@/lib/format";
import { EMPTY_PROFILE } from "@/lib/store";
import type { StudentProfile } from "@/lib/types";

export default function DashboardPage() {
  const profile = useAppStore((s) => s.profile);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const saved = useAppStore((s) => s.saved);
  const applications = useAppStore((s) => s.applications);
  const deadlines = useAppStore((s) => s.deadlines);

  const p = (profile ?? EMPTY_PROFILE) as StudentProfile;

  const colleges = useMemo(() => recommendInstitutions(profile, { limit: 6, includeAbroad: p.wantAbroad }), [profile, p.wantAbroad]);
  const courses = useMemo(() => recommendCourses(profile, 6), [profile]);
  const careers = useMemo(() => recommendCareers(profile, 6), [profile]);

  const scholarships = useMemo(
    () =>
      SCHOLARSHIPS.filter(
        (s) => (profile?.stream && s.streams.includes(profile.stream)) || (profile?.scholarshipDependent && s.types.includes("need-based")),
      ).slice(0, 3),
    [profile],
  );

  const examIds = useMemo(
    () => Array.from(new Set(courses.flatMap((c) => c.item.entranceExams))).slice(0, 6),
    [courses],
  );

  const upcoming = useMemo(
    () =>
      deadlines
        .filter((d) => !d.completed)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [deadlines],
  );

  const eligibleCount = colleges.filter((c) => c.eligibility.status === "likely").length;
  const inBudget = colleges.filter((c) => {
    const t = c.item.tuition;
    const inr = t.currency === "INR" ? t.tuitionAnnual.value : t.tuitionAnnual.value * 88;
    return p.budgetYearlyINR ? inr <= p.budgetYearlyINR : true;
  }).length;

  if (!onboardingComplete && !profile) {
    return (
      <>
        <PageHeader
          eyebrow="Your Education Map"
          title="Start with two minutes of honest answers"
          lede="Your dashboard ranks colleges, courses and careers against your stream, marks, budget and interests — and every card explains its reasoning."
        />
        <Section>
          <div className="mx-auto max-w-2xl">
            <EmptyState
              title="No profile yet"
              body="Answer five short steps and we'll build your map. Or explore as a demo profile first — nothing is uploaded either way."
              icon={<Target className="h-6 w-6" aria-hidden />}
              action={<Btn href="/onboarding">Start onboarding</Btn>}
              secondaryAction={
                <Btn href="/sign-in" variant="secondary">
                  Use a demo profile
                </Btn>
              }
            />
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Your Education Map"
        title={p.name ? `Welcome back, ${p.name.split(" ")[0]}` : "Your personalised map"}
        lede="Ten sections, all built from what you told us. Open any card's “Why you're seeing this” panel to check our reasoning — then disagree with it."
        actions={
          <>
            <Btn href="/onboarding">
              <RefreshCcw className="h-4 w-4" aria-hidden /> Edit my profile
            </Btn>
            <Btn href="/roadmap" variant="secondary">
              <MapIcon className="h-4 w-4" aria-hidden /> 5-Year Map
            </Btn>
          </>
        }
      />

      {/* 1 — Profile summary */}
      <Section tone="muted">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            value={p.stream ? streamLabel(p.stream) : "—"}
            label="Stream"
            sub={`${p.percentage !== null ? `${p.percentage}%` : p.expectedPercentage !== null ? `${p.expectedPercentage}% expected` : "Marks not set"}${p.board ? ` · ${p.board}` : ""}`}
          />
          <Stat
            value={p.budgetYearlyINR ? formatINR(p.budgetYearlyINR) : "—"}
            label="Yearly budget"
            sub={p.scholarshipDependent ? "Scholarship dependent" : p.loanAcceptable ? "Loans acceptable" : "Self-funded"}
          />
          <Stat value={p.locationPreference} label="Location preference" sub={p.wantAbroad ? "Open to studying abroad" : "Preferring India"} />
          <Stat value={`${p.interests.length} interests`} label="Signals" sub={`${p.favoriteSubjects.length} favourite subjects · ${p.activities.length} activities`} />
        </div>

        <div className="mt-5">
          <Note>
            These inputs are the <strong>only</strong> things your ranking is based on. Change any of them and the whole
            map moves — that's exactly what the What-If Explorer is for.
          </Note>
        </div>
      </Section>

      {/* 2 — Snapshot */}
      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={eligibleCount} label="Likely eligible" sub="Out of the institutions shown below" />
          <Stat value={inBudget} label="Inside your budget" sub="Tuition-only comparison" />
          <Stat value={applications.length} label="Applications tracked" sub="Open the tracker to update" />
          <Stat value={saved.length} label="Saved items" sub="Stored in this browser only" />
        </div>
      </Section>

      {/* 3 — Recommended colleges */}
      <Section
        tone="muted"
        eyebrow="Recommended for you"
        title="Colleges worth a look"
        actions={
          <>
            <Btn href="/colleges" variant="secondary">
              See all {colleges.length}+ <ArrowRight className="h-4 w-4" aria-hidden />
            </Btn>
            <Btn href="/tools/compare" variant="ghost">
              Compare selected
            </Btn>
          </>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.slice(0, 6).map((r) => (
            <InstitutionCard key={r.item.id} ranked={r} />
          ))}
        </div>
      </Section>

      {/* 4 — Recommended courses */}
      <Section
        eyebrow="What you can study"
        title="Courses that fit your profile"
        actions={<Btn href="/courses" variant="secondary">All courses</Btn>}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 6).map((r) => (
            <CourseCard key={r.item.id} ranked={r} />
          ))}
        </div>
      </Section>

      {/* 5 — Recommended careers */}
      <Section
        tone="muted"
        eyebrow="Where it can lead"
        title="Careers connected to your interests"
        actions={<Btn href="/careers" variant="secondary">All careers</Btn>}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {careers.slice(0, 6).map((r) => (
            <CareerCard key={r.item.id} ranked={r} />
          ))}
        </div>
      </Section>

      {/* 6 — Exams */}
      <Section eyebrow="Entrance exams" title="Exams on your likely path">
        {examIds.length === 0 ? (
          <EmptyState
            title="No entrance exams attached to your top courses"
            body="Several routes are merit-based. Open a course profile to see whether an exam applies."
            icon={<CheckCircle2 className="h-6 w-6" aria-hidden />}
            action={<Btn href="/exams">Browse all exams</Btn>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examIds.map((id) => {
              const e = EXAMS.find((x) => x.id === id);
              if (!e) return null;
              return (
                <Link key={id} href={`/exams/${e.slug}`} className="card interactive-card p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-500 dark:text-cyan-400">
                    {e.level} · {e.conductedBy}
                  </p>
                  <h3 className="mt-1.5 font-semibold text-ink dark:text-slate-50">{e.name}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{e.whoNeedsIt}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <ConfidenceBadge confidence={e.confidence} />
                    <span className="text-[11px] text-ink-faint">Checked {formatDate(e.lastVerified)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <div className="mt-5">
          <Note tone="warn">
            Exam dates move. Confirm every date on the conducting body's official site before you register.
          </Note>
        </div>
      </Section>

      {/* 7 — Scholarships */}
      <Section tone="muted" eyebrow="Funding" title="Scholarships that may apply">
        {scholarships.length === 0 ? (
          <EmptyState
            title="No direct matches in this build"
            body="We list funding by stream and need-type. Set your stream or mark yourself as scholarship-dependent to see matches."
            icon={<Wallet className="h-6 w-6" aria-hidden />}
            action={<Btn href="/scholarships">Browse all scholarships</Btn>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((s) => (
              <Link key={s.id} href={`/scholarships?s=${s.slug}`} className="card interactive-card p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-500 dark:text-cyan-400">
                  {s.provider}
                </p>
                <h3 className="mt-1.5 font-semibold text-ink dark:text-slate-50">{s.name}</h3>
                <p className="mt-2 text-sm text-ink-muted">{s.amount.value}</p>
                <p className="mt-3 text-xs text-ink-faint">Deadline: {s.deadline.value}</p>
                <div className="mt-3">
                  <ConfidenceBadge confidence={s.confidence} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* 8 — Applications */}
      <Section
        eyebrow="Applications"
        title="Where your applications stand"
        actions={<Btn href="/tools/applications" variant="secondary">Open application tracker</Btn>}
      >
        {applications.length === 0 ? (
          <EmptyState
            title="No applications tracked yet"
            body="Add a college once you're seriously considering it. We'll keep status, required documents, fees, deadlines and results in one place."
            icon={<GraduationCap className="h-6 w-6" aria-hidden />}
            action={<Btn href="/tools/applications">Add an application</Btn>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.slice(0, 6).map((a) => {
              const inst = a.institutionId;
              return (
                <div key={a.id} className="card p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone="blue">{a.status}</Badge>
                    <span className="text-[11px] text-ink-faint">{formatDate(a.updatedAt)}</span>
                  </div>
                  <p className="mt-3 font-semibold text-ink dark:text-slate-50">{inst}</p>
                  <p className="text-sm text-ink-muted">{a.course}</p>
                  {a.deadline && <p className="mt-2 text-xs text-ink-faint">Deadline: {a.deadline}</p>}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* 9 — Deadlines */}
      <Section
        tone="muted"
        eyebrow="Deadlines"
        title="Coming up"
        actions={<Btn href="/tools/deadlines" variant="secondary">Open deadline tracker</Btn>}
      >
        {upcoming.length === 0 ? (
          <EmptyState
            title="Nothing on the calendar"
            body="Add exam, application, counselling and document deadlines so nothing sneaks up on you."
            icon={<CalendarDays className="h-6 w-6" aria-hidden />}
            action={<Btn href="/tools/deadlines">Add a deadline</Btn>}
          />
        ) : (
          <div className="card divide-y divide-hairline dark:divide-hairline-dark">
            {upcoming.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium text-ink dark:text-slate-100">{d.title}</p>
                  <p className="text-xs text-ink-muted">
                    {d.category} · {d.priority} priority
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={d.priority === "High" ? "red" : d.priority === "Medium" ? "amber" : "neutral"}>
                    {formatDate(d.date)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 10 — Saved + next steps */}
      <Section eyebrow="Next steps" title="Keep moving">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Bookmark, t: "Saved items", d: `${saved.length} saved for later`, href: "/saved" },
            { icon: Users, t: "Compare colleges", d: "2–5 way, 13 dimensions each", href: "/tools/compare" },
            { icon: Wallet, t: "Can I afford this?", d: "Check any institution against your budget", href: "/tools/afford" },
            { icon: AlertTriangle, t: "Plan B Generator", d: "Alternatives if the first route fails", href: "/tools/plan-b" },
            { icon: Sparkles, t: "What-If Explorer", d: "Change a variable, watch the options move", href: "/tools/what-if" },
            { icon: Compass, t: "Confusion Solver", d: "If none of this is clicking yet", href: "/confusion-solver" },
          ].map((x) => (
            <Link key={x.t} href={x.href} className="card interactive-card group flex gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600 dark:bg-cyan-500/12 dark:text-cyan-400">
                <x.icon className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="flex items-center gap-1 font-semibold text-ink dark:text-slate-50">
                  {x.t}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" aria-hidden />
                </span>
                <span className="mt-1 block text-sm text-ink-muted">{x.d}</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="card p-6">
            <h3 className="font-semibold text-ink dark:text-slate-50">Your top institution right now</h3>
            <p className="mt-1 text-sm text-ink-muted">{colleges[0]?.item.name}</p>
            <div className="mt-4">
              <WhyList reasons={colleges[0]?.reasons ?? []} cautions={colleges[0]?.cautions ?? []} />
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-ink dark:slate-50 dark:text-slate-50">What we couldn't work out</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              {(!p.board || p.board === "") && <li>• Your board — some cut-offs differ by board.</li>}
              {p.percentage === null && <li>• Your final marks — eligibility checks currently use expected marks.</li>}
              {p.entranceScores.length === 0 && <li>• Entrance scores — exam-based checks are pending.</li>}
              {p.locationPreference === "Any location" && <li>• Location preference — distance isn't weighted yet.</li>}
              {p.budgetYearlyINR === null && <li>• Budget — affordability isn't part of your ranking.</li>}
            </ul>
            <div className="mt-4">
              <Btn href="/onboarding" variant="secondary" size="sm">
                Fill these in
              </Btn>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
