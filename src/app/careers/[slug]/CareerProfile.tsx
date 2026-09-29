"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Briefcase, GraduationCap, TrendingUp, Globe2, Wrench, ArrowRight, Sparkles,
} from "lucide-react";
import { Btn, FactDisplay, Note, PageHeader, WhyList, EmptyState } from "@/components/ui";
import { SaveButton } from "@/components/cards";
import { getCareer } from "@/data/careers";
import { getCourse } from "@/data/courses";
import { recommendCareers } from "@/lib/recommend";
import { useAppStore } from "@/lib/store";

export default function CareerProfile({ careerId }: { careerId: string }) {
  const career = getCareer(careerId);
  const profile = useAppStore((s) => s.profile);

  const rankedSelf = useMemo(
    () => recommendCareers(profile, 500).find((r) => r.item.id === careerId),
    [profile, careerId],
  );

  if (!career) return null;

  const routes = career.educationPaths
    .map(getCourse)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const related = career.relatedCareerIds
    .map(getCareer)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <>
      <PageHeader
        breadcrumb={
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-ink-faint" aria-label="Breadcrumb">
            <Link href="/careers" className="hover:text-navy-600 dark:hover:text-cyan-300">Careers</Link>
            <span aria-hidden>/</span>
            <span className="text-ink-muted">{career.domain}</span>
            <span aria-hidden>/</span>
            <span className="text-ink dark:text-slate-200">{career.name}</span>
          </nav>
        }
        eyebrow={career.domain}
        title={career.name}
        lede={career.blurb}
        actions={
          <>
            <SaveButton kind="career" id={career.id} />
            <Btn href="/explore" variant="secondary">Explore by stream</Btn>
            <Btn href={`/tools/plan-b?career=${career.slug}`} variant="ghost">Plan B for this</Btn>
          </>
        }
      />

      <section className="section-pad">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            <Block title="What the work involves">
              <p className="text-base leading-relaxed text-ink-muted dark:text-slate-400">{career.involves}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="card p-5">
                  <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                    <Briefcase className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Where you'd work
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm text-ink-muted dark:text-slate-300">
                    {career.typicalWork.map((w) => <li key={w}>• {w}</li>)}
                  </ul>
                </div>
                <div className="card p-5">
                  <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                    <Wrench className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Skills that matter
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {career.skills.map((s) => (
                      <span key={s} className="chip bg-surface-sunken text-ink-muted dark:bg-white/8 dark:text-slate-300">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {career.industries.map((i) => (
                  <span key={i} className="chip border border-hairline text-ink-muted dark:border-hairline-dark dark:text-slate-300">{i}</span>
                ))}
              </div>
            </Block>

            <Block title="Routes in" subtitle="These are typical education paths, not requirements. Employers differ, and so do countries.">
              {routes.length === 0 ? (
                <Note>No course routes are linked to this career in this build.</Note>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {routes.map((c) => (
                    <Link
                      key={c.id}
                      href={`/courses/${c.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-hairline p-4 transition hover:border-navy-400 dark:border-hairline-dark"
                    >
                      <span>
                        <span className="block text-sm font-medium text-ink group-hover:text-navy-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                          {c.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-muted">{c.durationYears} yr · {c.degreeType}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint transition group-hover:translate-x-1" aria-hidden />
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-5 card p-5">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <TrendingUp className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Progression
                </p>
                <ol className="mt-4 flex flex-wrap items-center gap-2">
                  {career.progression.map((step, i) => (
                    <li key={step} className="flex items-center gap-2">
                      <span className="rounded-xl bg-surface-muted px-3 py-1.5 text-sm text-ink dark:bg-white/8 dark:text-slate-100">
                        {step}
                      </span>
                      {i < career.progression.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-ink-faint" aria-hidden />}
                    </li>
                  ))}
                </ol>
              </div>
            </Block>

            <Block title="Further study & certifications">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="card p-5">
                  <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                    <GraduationCap className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Further study
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm text-ink-muted dark:text-slate-300">
                    {career.higherStudies.map((h) => <li key={h}>• {h}</li>)}
                  </ul>
                </div>
                <div className="card p-5">
                  <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                    <Sparkles className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Certifications
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm text-ink-muted dark:text-slate-300">
                    {career.certifications.map((c) => <li key={c}>• {c}</li>)}
                  </ul>
                  <p className="mt-3 text-[11px] text-ink-faint">
                    Certifications listed are descriptive; none of them guarantees employment.
                  </p>
                </div>
              </div>
            </Block>

            <Block title="Trends shaping this career">
              <ul className="space-y-2">
                {career.trends.map((t) => (
                  <li key={t} className="flex gap-2 text-sm text-ink-muted dark:text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-400 dark:bg-cyan-400" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <Note tone="warn">
                  Trends are observations from published sources, not forecasts. Markets change faster than any dataset
                  can track.
                </Note>
              </div>
            </Block>

            {related.length > 0 && (
              <Block title="Careers people often consider alongside this">
                <div className="grid gap-3 sm:grid-cols-3">
                  {related.map((c) => (
                    <Link
                      key={c.id}
                      href={`/careers/${c.slug}`}
                      className="rounded-2xl border border-hairline p-4 text-sm transition hover:border-navy-400 dark:border-hairline-dark"
                    >
                      <span className="block font-medium text-ink dark:text-slate-100">{c.name}</span>
                      <span className="mt-0.5 block text-xs text-ink-muted">{c.domain}</span>
                    </Link>
                  ))}
                </div>
              </Block>
            )}

            {routes.length === 0 && career.educationPaths.length === 0 && (
              <EmptyState
                title="No linked course records"
                body="This build ships a curated set of course and career records; cross-links are only drawn where both records exist."
                action={<Btn href="/courses">Browse courses</Btn>}
              />
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <FactDisplay
                fact={career.salary}
                label="Salary band"
                note="Always shown as a range with its population and methodology."
              />
            </div>

            <div className="card p-5">
              <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                <Globe2 className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> International outlook
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{career.international}</p>
            </div>

            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Why this appears for you</p>
              <div className="mt-3">
                <WhyList reasons={rankedSelf?.reasons ?? []} cautions={rankedSelf?.cautions ?? []} />
              </div>
            </div>

            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Next steps</p>
              <div className="mt-3 grid gap-2">
                <Btn href="/skills" size="sm">Skills to start now</Btn>
                <Btn href="/scholarships" variant="secondary" size="sm">Funding options</Btn>
                <Btn href="/roadmap" variant="ghost" size="sm">Add to my 5-Year Map</Btn>
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
