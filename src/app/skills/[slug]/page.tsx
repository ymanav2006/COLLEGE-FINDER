import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, CheckCircle2, ArrowRight } from "lucide-react";
import { Btn, Badge, PageHeader, Section, Note } from "@/components/ui";
import { SaveButton } from "@/components/cards";
import { SKILL_SLUG_MAP, SKILLS } from "@/data/skills";
import { COURSE_MAP } from "@/data/courses";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = SKILL_SLUG_MAP.get(slug);
  if (!s) return { title: "Skill not found" };
  return {
    title: `${s.name} — levels, free resources & projects`,
    description: `${s.name}: ${s.blurb} Beginner to advanced levels with outcomes, free and paid resources, project ideas and recognised certifications.`,
    alternates: { canonical: `/skills/${s.slug}` },
  };
}

export default async function SkillPage({ params }: Props) {
  const { slug } = await params;
  const skill = SKILL_SLUG_MAP.get(slug);
  if (!skill) notFound();

  const relatedCourses = skill.relatedCourseIds
    .map((id) => COURSE_MAP.get(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const siblings = SKILLS.filter((s) => s.category === skill.category && s.id !== skill.id).slice(0, 4);

  return (
    <>
      <PageHeader
        breadcrumb={
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-ink-faint" aria-label="Breadcrumb">
            <Link href="/skills" className="hover:text-navy-600 dark:hover:text-cyan-300">Skills</Link>
            <span aria-hidden>/</span>
            <span className="text-ink-muted">{skill.category}</span>
            <span aria-hidden>/</span>
            <span className="text-ink dark:text-slate-200">{skill.name}</span>
          </nav>
        }
        eyebrow={`${skill.category} skill · about ${skill.approxTime}`}
        title={skill.name}
        lede={skill.blurb}
        actions={
          <>
            <SaveButton kind="skill" id={skill.id} />
            <Btn href="/roadmap" variant="secondary">Add to my roadmap</Btn>
          </>
        }
      />

      <Section>
        <div className="mx-auto grid max-w-7xl gap-8 px-0 sm:px-0 lg:grid-cols-[1fr_330px]">
          <div className="space-y-8">
            <div className="card p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Why it matters</p>
              <p className="mt-3 text-base leading-relaxed text-ink-muted dark:text-slate-300">{skill.why}</p>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">{skill.blurb}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink dark:text-slate-50">Learning path</h2>
              <p className="mt-2 text-sm text-ink-muted">Three levels, each with a concrete outcome you can point to.</p>
              <div className="mt-4 space-y-4">
                {skill.levels.map((l, i) => (
                  <div key={l.level} className="card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-600 text-[11px] font-bold text-white dark:bg-cyan-500 dark:text-navy-950">
                          {i + 1}
                        </span>
                        {l.level}
                      </p>
                      {i === 0 && <Badge tone="green">Start here</Badge>}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
                      <strong className="text-ink dark:text-slate-200">Outcome:</strong> {l.outcome}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {l.topics.map((t) => (
                        <span key={t} className="chip bg-surface-sunken text-ink-muted dark:bg-white/8 dark:text-slate-300">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="card p-5">
                <p className="font-semibold text-ink dark:text-slate-100">Free resources</p>
                <ul className="mt-3 space-y-2.5">
                  {skill.freeResources.map((r) => (
                    <li key={r.label} className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-ink-muted dark:text-slate-300">{r.label}</span>
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-navy-600 dark:text-cyan-300">
                          Open <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-5">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  Paid resources <Badge tone="amber">labelled</Badge>
                </p>
                <ul className="mt-3 space-y-2.5">
                  {skill.paidResources.map((r) => (
                    <li key={r.label} className="flex items-start justify-between gap-3 text-sm">
                      <span className="text-ink-muted dark:text-slate-300">{r.label}</span>
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-navy-600 dark:text-cyan-300">
                          Open <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      )}
                    </li>
                  ))}
                  {skill.paidResources.length === 0 && (
                    <li className="text-sm text-ink-muted">No paid resources listed — the free route is enough to start.</li>
                  )}
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink dark:text-slate-50">Projects to prove it</h2>
              <ul className="mt-4 space-y-2">
                {skill.projects.map((p) => (
                  <li key={p} className="flex gap-2 text-sm text-ink-muted dark:text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal-green" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink dark:text-slate-50">Certifications people ask about</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {skill.certifications.map((c) => (
                  <span key={c} className="chip border border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300">
                    {c}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink-faint">
                Certificates open doors in some hiring processes and are irrelevant in others. Check whether the role
                you want actually lists them before paying.
              </p>
            </div>

            <div className="card p-6">
              <p className="font-semibold text-ink dark:text-slate-100">Where this shows up in a degree</p>
              {relatedCourses.length === 0 ? (
                <p className="mt-2 text-sm text-ink-muted">No course links recorded in this build.</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {relatedCourses.map((c) => (
                    <Link key={c.id} href={`/courses/${c.slug}`} className="chip bg-navy-50 text-navy-700 hover:bg-navy-100 dark:bg-cyan-500/12 dark:text-cyan-200">
                      {c.name} <ArrowRight className="h-3 w-3" aria-hidden />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">At a glance</p>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-faint">Category</dt>
                  <dd className="font-medium text-ink dark:text-slate-100">{skill.category}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-faint">Approx. time</dt>
                  <dd className="font-medium text-ink dark:text-slate-100">{skill.approxTime}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-faint">Levels</dt>
                  <dd className="font-medium text-ink dark:text-slate-100">{skill.levels.length}</dd>
                </div>
              </dl>
            </div>

            <div className="card p-5">
              <p className="font-semibold text-ink dark:text-slate-100">Honest note</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{skill.disclaimer}</p>
            </div>

            {siblings.length > 0 && (
              <div className="card p-5">
                <p className="font-semibold text-ink dark:text-slate-100">Learn next</p>
                <ul className="mt-3 space-y-2">
                  {siblings.map((s) => (
                    <li key={s.id}>
                      <Link href={`/skills/${s.slug}`} className="text-sm text-ink-muted hover:text-navy-600 dark:text-slate-300 dark:hover:text-cyan-300">
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Note>No skill guarantees employment — but a portfolio does most of the heavy lifting a CV can't.</Note>
          </aside>
        </div>
      </Section>
    </>
  );
}
