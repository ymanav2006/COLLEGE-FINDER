"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, GitBranch, Compass, ExternalLink } from "lucide-react";
import { Btn, Badge, PageHeader, Section, Note } from "@/components/ui";
import { COURSES, COURSE_GROUPS, getCourse } from "@/data/courses";
import { CAREERS, getCareer } from "@/data/careers";
import { EXAMS } from "@/data/exams";
import { STREAMS, CROSS_STREAM_OPTIONS, crossStreamOptions, getStream } from "@/data/streams";
import type { StreamId } from "@/lib/types";

export default function ExplorePage() {
  const [stream, setStream] = useState<StreamId>("pcm");

  const record = getStream(stream);
  const courses = useMemo(
    () => COURSES.filter((c) => c.streams.includes(stream)),
    [stream],
  );
  const careers = useMemo(() => {
    const ids = new Set(courses.flatMap((c) => c.careerIds));
    return Array.from(ids).map(getCareer).filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [courses]);
  const exams = useMemo(() => {
    const names = new Set(courses.flatMap((c) => c.entranceExams));
    return EXAMS.filter((e) => names.has(e.name) || names.has(e.id));
  }, [courses]);
  const cross = useMemo(() => crossStreamOptions(stream), [stream]);
  const groupForStream = COURSE_GROUPS.filter((g) =>
    g.courseIds.some((id) => getCourse(id)?.streams.includes(stream)),
  );

  return (
    <>
      <PageHeader
        eyebrow="Stream → Career Explorer"
        title="Pick a stream. See every door it opens."
        lede="Courses, careers, entrance exams and cross-stream routes for each of the six Class 12 streams. Nothing here assumes a stereotype about what a stream ‘should' do."
        actions={
          <>
            <Btn href="/explore/outside-my-stream">
              <GitBranch className="h-4 w-4" aria-hidden /> What Else Can I Become?
            </Btn>
            <Btn href="/careers" variant="secondary">All careers</Btn>
          </>
        }
      />

      <Section>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose a stream">
          {STREAMS.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={stream === s.id}
              onClick={() => setStream(s.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                stream === s.id
                  ? "bg-navy-600 text-white shadow-[0_8px_24px_-12px_rgba(36,80,199,0.9)] dark:bg-cyan-500 dark:text-navy-950"
                  : "border border-hairline bg-white text-ink-muted hover:border-navy-300 hover:text-ink dark:border-hairline-dark dark:bg-white/5 dark:text-slate-300"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Overview */}
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-ink dark:text-slate-50">{record?.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-slate-400">{record?.description}</p>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Core subjects</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {record?.subjects.map((s) => (
                <span key={s} className="chip bg-surface-sunken text-ink-muted dark:bg-white/8 dark:text-slate-300">{s}</span>
              ))}
            </div>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Career areas</p>
            <ul className="mt-2 space-y-2">
              {record?.careerAreas.map((a) => (
                <li key={a.name} className="text-sm">
                  <span className="font-medium text-ink dark:text-slate-100">{a.name}</span>
                  <span className="text-ink-muted"> — {a.blurb}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <Btn href={`/colleges?stream=${stream}`} size="sm" variant="secondary">Colleges for this stream</Btn>
              <Btn href={`/onboarding`} size="sm" variant="ghost">Set my stream</Btn>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink dark:text-slate-50">Route at a glance</h2>
              <Badge tone="brand">{stream.toUpperCase()}</Badge>
            </div>
            <ol className="mt-5 space-y-4">
              {[
                { t: "Class 12", d: `Study ${record?.subjects.slice(0, 3).join(", ")}` },
                { t: "Entrance", d: exams.length ? exams.slice(0, 3).map((e) => e.name).join(", ") : "Merit-based routes mostly" },
                { t: "Undergraduate", d: `${courses.length} programmes in this stream` },
                { t: "Then", d: `${careers.length} tracked careers and ${courses.filter((c) => c.furtherStudies.length).length} routes to further study` },
              ].map((step, i) => (
                <li key={step.t} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-600 text-xs font-bold text-white dark:bg-cyan-500 dark:text-navy-950">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink dark:text-slate-100">{step.t}</span>
                    <span className="block text-sm text-ink-muted">{step.d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-5">
              <Note>Nothing in this chain guarantees an outcome. Each step depends on that year's competition and your own results.</Note>
            </div>
          </div>
        </div>
      </Section>

      {/* Courses */}
      <Section tone="muted" eyebrow="What you can study" title={`Courses open to ${record?.shortName ?? stream.toUpperCase()} students`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 9).map((c) => (
            <Link key={c.id} href={`/courses/${c.slug}`} className="card interactive-card group p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-500 dark:text-cyan-400">
                {c.degreeType} · {c.durationYears} yr
              </p>
              <h3 className="mt-1.5 font-semibold text-ink group-hover:text-navy-600 dark:text-slate-50 dark:group-hover:text-cyan-300">{c.name}</h3>
              <p className="mt-1.5 text-sm text-ink-muted">{c.tagline}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
                Details <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
        {courses.length > 9 && (
          <div className="mt-5">
            <Btn href="/courses" variant="secondary">See all {courses.length} courses</Btn>
          </div>
        )}
      </Section>

      {/* Careers */}
      <Section eyebrow="Where it can lead" title={`Careers connected to ${record?.shortName ?? stream}`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {careers.slice(0, 9).map((c) => (
            <Link key={c.id} href={`/careers/${c.slug}`} className="card interactive-card group p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-500 dark:text-cyan-400">{c.domain}</p>
              <h3 className="mt-1.5 font-semibold text-ink group-hover:text-navy-600 dark:text-slate-50 dark:group-hover:text-cyan-300">{c.name}</h3>
              <p className="mt-1.5 text-sm text-ink-muted">{c.blurb}</p>
              <p className="mt-3 text-xs text-ink-faint">{c.salary.value}</p>
            </Link>
          ))}
        </div>
        {careers.length > 9 && (
          <div className="mt-5">
            <Btn href="/careers" variant="secondary">See all {careers.length} careers</Btn>
          </div>
        )}
      </Section>

      {/* Cross stream */}
      <Section tone="muted" eyebrow="Cross-stream routes" title="What else can you become from here?">
        {cross.length === 0 ? (
          <Note>No cross-stream routes are seeded for this stream yet — see the full directory instead.</Note>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {cross.slice(0, 6).map((c) => (
              <div key={c.target} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-ink dark:text-slate-50">{c.target}</h3>
                  <Badge tone={c.pathway === "direct" ? "green" : c.pathway === "additional" ? "blue" : "amber"}>
                    {c.pathway === "direct" ? "Direct" : c.pathway === "additional" ? "Additional study" : "Alternate"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{c.eligibility}</p>
                <p className="mt-2 text-xs text-ink-faint">Requirements: {c.requirements.join(" · ") || "None listed"}</p>
                {c.entranceExams.length > 0 && (
                  <p className="mt-1 text-xs text-ink-faint">Entrance: {c.entranceExams.join(", ")}</p>
                )}
                <p className="mt-3 text-xs text-ink-muted">{c.preparation}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <Btn href="/explore/outside-my-stream">
            <Compass className="h-4 w-4" aria-hidden /> All cross-stream routes
          </Btn>
          <Btn href="/pathfinder" variant="secondary" external={false}>
            Ask “can I study X from this stream?”
          </Btn>
        </div>
      </Section>
    </>
  );
}
