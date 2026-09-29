"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Clock, IndianRupee, Target, ArrowRight, Compass, ExternalLink,
  Building2, Users, BookOpen, Briefcase,
} from "lucide-react";
import {
  Btn, Badge, ConfidenceBadge, FactDisplay, Note, PageHeader, WhyList, EmptyState,
} from "@/components/ui";
import { SaveButton } from "@/components/cards";
import { getCourse, COURSE_GROUPS, LEVEL_LABEL, courseFallbackLabel } from "@/data/courses";
import { getCareer } from "@/data/careers";
import { getExam } from "@/data/exams";
import { institutionsForCourse } from "@/data/colleges";
import { streamLabel } from "@/data/streams";
import { assessCourse } from "@/lib/eligibility";
import { recommendCourses } from "@/lib/recommend";
import { useAppStore } from "@/lib/store";
import { formatINR, formatDate } from "@/lib/format";

export default function CourseProfile({ courseId }: { courseId: string }) {
  const course = getCourse(courseId);
  const profile = useAppStore((s) => s.profile);

  const rankedSelf = useMemo(
    () => recommendCourses(profile, 500).find((r) => r.item.id === courseId),
    [profile, courseId],
  );

  if (!course) return null;

  const eligibility = assessCourse(course, profile);
  const group = COURSE_GROUPS.find((g) => g.courseIds.includes(course.id));
  const careers = course.careerIds.map(getCareer).filter((c): c is NonNullable<typeof c> => Boolean(c));
  const related = course.relatedCourseIds.map(getCourse).filter((c): c is NonNullable<typeof c> => Boolean(c));
  const alternatives = course.alternativeCourseIds.map(getCourse).filter((c): c is NonNullable<typeof c> => Boolean(c));
  const colleges = institutionsForCourse(course.id).slice(0, 6);
  const marks = profile?.percentage ?? profile?.expectedPercentage;

  return (
    <>
      <PageHeader
        breadcrumb={
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-ink-faint" aria-label="Breadcrumb">
            <Link href="/courses" className="hover:text-navy-600 dark:hover:text-cyan-300">Courses</Link>
            <span aria-hidden>/</span>
            <span className="text-ink-muted">{LEVEL_LABEL[course.level]}</span>
            <span aria-hidden>/</span>
            <span className="text-ink dark:text-slate-200">{course.name}</span>
          </nav>
        }
        eyebrow={`${course.degreeType} · ${course.durationYears} year${course.durationYears === 1 ? "" : "s"}${group ? ` · ${group.name}` : ""}`}
        title={course.name}
        lede={course.tagline}
        actions={
          <>
            <SaveButton kind="course" id={course.id} />
            <Btn href={`/tools/compare?kind=course&ids=${course.id}`} variant="secondary">
              Compare with similar
            </Btn>
            <Btn href="/pathfinder" variant="ghost">Ask about this course</Btn>
          </>
        }
      />

      {/* --------------------------- Snapshot --------------------------- */}
      <section className="border-b border-hairline bg-surface-muted dark:border-hairline-dark dark:bg-white/3">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {[
            { icon: Clock, label: "Duration", value: `${course.durationYears} year${course.durationYears === 1 ? "" : "s"}` },
            { icon: IndianRupee, label: "Annual cost range", value: `${formatINR(course.annualCost.value.minINR)} – ${formatINR(course.annualCost.value.maxINR)}` },
            { icon: Target, label: "Streams accepted", value: course.streams.map((s) => s.toUpperCase()).join(" / ") },
            { icon: Briefcase, label: "Careers it connects to", value: `${course.careerIds.length} tracked` },
          ].map((f) => (
            <div key={f.label} className="card flex items-start gap-3 p-4">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600 dark:bg-cyan-500/12 dark:text-cyan-400">
                <f.icon className="h-4.5 w-4.5" aria-hidden />
              </span>
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{f.label}</span>
                <span className="mt-0.5 block text-sm font-medium text-ink dark:text-slate-100">{f.value}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            {/* ----------------------- Eligibility ----------------------- */}
            <Block title="Eligibility — classified for your profile">
              <div
                className={`rounded-2xl border p-5 ${
                  eligibility.status === "likely"
                    ? "border-signal-green/30 bg-signal-green-soft"
                    : eligibility.status === "verify"
                      ? "border-signal-amber/30 bg-signal-amber-soft"
                      : "border-signal-red/30 bg-signal-red-soft"
                }`}
              >
                <p className="text-lg font-semibold text-ink dark:text-slate-50">
                  {eligibility.status === "likely"
                    ? "Likely eligible"
                    : eligibility.status === "verify"
                      ? "Eligibility needs verification"
                      : "Not currently eligible"}
                </p>

                <ul className="mt-4 space-y-2 text-sm">
                  {eligibility.reasons.map((r, i) => (
                    <li key={i} className="flex gap-2 text-ink-muted dark:text-slate-300">
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                          r.kind === "blocker"
                            ? "bg-signal-red text-white"
                            : r.kind === "uncertain"
                              ? "bg-signal-amber text-white"
                              : "bg-signal-green text-white"
                        }`}
                        aria-hidden
                      >
                        {r.kind === "blocker" ? "✕" : r.kind === "uncertain" ? "?" : "✓"}
                      </span>
                      <span>{r.text}</span>
                    </li>
                  ))}
                </ul>

                {eligibility.requirements.length > 0 && (
                  <div className="mt-4 border-t border-hairline pt-4 dark:border-hairline-dark">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Published requirements</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {eligibility.requirements.map((r) => (
                        <li key={r} className="chip bg-white text-ink-muted dark:bg-white/10 dark:text-slate-200">{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {eligibility.pendingExams.length > 0 && (
                  <p className="mt-3 text-sm text-ink dark:text-slate-200">
                    You would still need: <strong>{eligibility.pendingExams.join(", ")}</strong>
                  </p>
                )}

                {!profile && (
                  <p className="mt-4 text-xs text-ink-muted">
                    <Link href="/onboarding" className="font-semibold text-navy-600 dark:text-cyan-300">
                      Add your stream and marks
                    </Link>{" "}
                    to get a personal verdict with the specific requirement that produced it.
                  </p>
                )}
              </div>

              <div className="mt-4">
                <Note tone="warn">
                  Meeting published eligibility never guarantees admission. Cutoffs, seat availability and counselling
                  rounds decide the actual outcome.
                </Note>
              </div>
            </Block>

            {/* ----------------------- What you study ----------------------- */}
            <Block title="What you actually study">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="card p-5">
                  <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                    <BookOpen className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Core subjects
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
                    {course.coreSubjects.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div className="card p-5">
                  <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                    <Target className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Skills you build
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {course.skills.map((s) => (
                      <span key={s} className="chip bg-surface-sunken text-ink-muted dark:bg-white/8 dark:text-slate-300">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="card p-5">
                  <p className="font-semibold text-ink dark:text-slate-100">Where it's used</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {course.industries.map((i) => (
                      <span key={i} className="chip border border-hairline text-ink-muted dark:border-hairline-dark dark:text-slate-300">{i}</span>
                    ))}
                  </div>
                </div>
                <div className="card p-5">
                  <p className="font-semibold text-ink dark:text-slate-100">Typical work environments</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-ink-muted dark:text-slate-300">
                    {course.workEnvironments.map((w) => <li key={w}>• {w}</li>)}
                  </ul>
                </div>
              </div>

              {course.demandAreas.length > 0 && (
                <div className="mt-5 card p-5">
                  <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                    <Compass className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Demand areas
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {course.demandAreas.map((d) => (
                      <span key={d} className="chip bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">{d}</span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-ink-faint">
                    Descriptive, not a prediction. Demand shifts — this is not a job guarantee.
                  </p>
                </div>
              )}
            </Block>

            {/* ----------------------- Pathway ----------------------- */}
            <Block title="The pathway after this degree" subtitle="A typical chain, not a promise. Each step depends on grades, experience and choices you make later.">
              <ol className="flex flex-wrap items-stretch gap-2">
                {course.pathway.map((node, i) => (
                  <li key={node} className="flex items-center gap-2">
                    <span className="rounded-2xl border border-hairline bg-white px-4 py-2.5 text-sm font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100">
                      {node}
                    </span>
                    {i < course.pathway.length - 1 && (
                      <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
                    )}
                  </li>
                ))}
              </ol>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="card p-5">
                  <p className="font-semibold text-ink dark:text-slate-100">Further studies</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-ink-muted dark:text-slate-300">
                    {course.furtherStudies.map((f) => <li key={f}>• {f}</li>)}
                  </ul>
                </div>
                <div className="card p-5">
                  <p className="font-semibold text-ink dark:text-slate-100">Recognised for study abroad in</p>
                  {course.studyAbroad.length === 0 ? (
                    <p className="mt-3 text-xs text-ink-faint">No equivalency notes recorded in this build.</p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
                      {course.studyAbroad.slice(0, 5).map((s) => (
                        <li key={s.country}>
                          <span className="font-medium text-ink dark:text-slate-200">{s.country}:</span> {s.note}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Block>

            {/* ----------------------- Careers ----------------------- */}
            <Block title="Careers this connects to" subtitle="Open a career for day-to-day work, salary bands with methodology, and typical progression.">
              {careers.length === 0 ? (
                <Note>No career links are attached to this course in this build.</Note>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {careers.map((c) => (
                    <Link
                      key={c.id}
                      href={`/careers/${c.slug}`}
                      className="group flex items-start justify-between gap-3 rounded-2xl border border-hairline p-4 transition hover:border-navy-400 dark:border-hairline-dark"
                    >
                      <span>
                        <span className="block text-sm font-medium text-ink group-hover:text-navy-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                          {c.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-muted">{c.domain}</span>
                        <span className="mt-1 block text-xs text-ink-faint">{c.salary.value}</span>
                      </span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-faint transition group-hover:translate-x-1" aria-hidden />
                    </Link>
                  ))}
                </div>
              )}
            </Block>

            {/* ----------------------- Related ----------------------- */}
            {(related.length > 0 || alternatives.length > 0) && (
              <Block title="Related & alternative programmes">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Study alongside</p>
                    <div className="space-y-2">
                      {related.map((c) => (
                        <Link key={c.id} href={`/courses/${c.slug}`} className="block rounded-xl border border-hairline px-4 py-3 text-sm text-ink transition hover:border-navy-400 dark:border-hairline-dark dark:text-slate-100">
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Something else you could do instead</p>
                    <div className="space-y-2">
                      {alternatives.map((c) => (
                        <Link key={c.id} href={`/courses/${c.slug}`} className="block rounded-xl border border-hairline px-4 py-3 text-sm text-ink transition hover:border-navy-400 dark:border-hairline-dark dark:text-slate-100">
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </Block>
            )}

            {/* ----------------------- Colleges ----------------------- */}
            <Block title="Institutions offering this programme">
              {colleges.length === 0 ? (
                <EmptyState
                  title="No institution records linked yet"
                  body="This build holds a curated institution set. Search the database directly for the same programme."
                  icon={<Building2 className="h-6 w-6" aria-hidden />}
                  action={<Btn href="/colleges">Open the college database</Btn>}
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {colleges.map((i) => (
                    <Link key={i.id} href={`/colleges/${i.slug}`} className="group flex items-center justify-between gap-3 rounded-2xl border border-hairline p-4 transition hover:border-navy-400 dark:border-hairline-dark">
                      <span>
                        <span className="block text-sm font-medium text-ink group-hover:text-navy-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                          {i.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-muted">{i.city}, {i.state}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint transition group-hover:translate-x-1" aria-hidden />
                    </Link>
                  ))}
                </div>
              )}
            </Block>
          </div>

          {/* ------------------------------ Sidebar ------------------------------ */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <FactDisplay
                fact={course.annualCost}
                label="Annual cost range"
                render={(v) => `${formatINR(v.minINR)} – ${formatINR(v.maxINR)}`}
                note="Tuition + typical course costs. Hostel and living sit on top."
              />
              <div className="mt-4 grid gap-2">
                <Btn href="/tools/afford">Can I afford this?</Btn>
                <Btn href="/tools/budget" variant="secondary">Plan the four years</Btn>
              </div>
            </div>

            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Entrance requirements</p>
              {course.entranceExams.length === 0 ? (
                <p className="mt-2 text-sm text-ink-muted">No entrance exam listed — selection is typically merit-based or at institution level.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {course.entranceExams.map((name) => {
                    const exam = getExam(name);
                    return (
                      <li key={name}>
                        {exam ? (
                          <Link href={`/exams/${exam.slug}`} className="block rounded-xl border border-hairline px-3 py-2.5 text-sm text-ink transition hover:border-navy-400 dark:border-hairline-dark dark:text-slate-100">
                            {exam.name}
                            <span className="mt-0.5 block text-xs text-ink-muted">{exam.conductedBy}</span>
                          </Link>
                        ) : (
                          <span className="block rounded-xl border border-hairline px-3 py-2.5 text-sm text-ink-muted dark:border-hairline-dark">
                            {name}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Why this appears for you</p>
              <div className="mt-3">
                <WhyList reasons={rankedSelf?.reasons ?? []} cautions={rankedSelf?.cautions ?? []} />
              </div>
            </div>

            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">If you're unsure</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                A degree is a big commitment. Generate a Plan B before you commit to it.
              </p>
              <div className="mt-4 grid gap-2">
                <Btn href={`/tools/plan-b?course=${course.slug}`} size="sm">Generate Plan B</Btn>
                <Btn href="/tools/decision-matrix" variant="secondary" size="sm">Decision matrix</Btn>
                <Btn href="/tools/what-if" variant="ghost" size="sm">What if my marks are lower?</Btn>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Block({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-ink dark:text-slate-50">{title}</h2>
      {subtitle && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}
