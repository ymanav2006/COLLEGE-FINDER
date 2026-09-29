"use client";

import Link from "next/link";
import {
  CalendarDays, FileText, ExternalLink, Users, Target, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { Btn, Badge, ConfidenceBadge, Note, PageHeader, StaleWarning } from "@/components/ui";
import { SaveButton } from "@/components/cards";
import { getExam } from "@/data/exams";
import { formatDate } from "@/lib/format";

export default function ExamProfile({ examId }: { examId: string }) {
  const exam = getExam(examId);
  if (!exam) return null;

  return (
    <>
      <PageHeader
        breadcrumb={
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-ink-faint" aria-label="Breadcrumb">
            <Link href="/exams" className="hover:text-navy-600 dark:hover:text-cyan-300">Entrance exams</Link>
            <span aria-hidden>/</span>
            <span className="text-ink-muted">{exam.countryId.toUpperCase()}</span>
            <span aria-hidden>/</span>
            <span className="text-ink dark:text-slate-200">{exam.name}</span>
          </nav>
        }
        eyebrow={`${exam.level} · ${exam.countryId.toUpperCase()}`}
        title={exam.name}
        lede={`Conducted by ${exam.conductedBy}. ${exam.whoNeedsIt}`}
        actions={
          <>
            <SaveButton kind="exam" id={exam.id} />
            <Btn href={exam.officialUrl} external>
              Official site <ExternalLink className="h-4 w-4" aria-hidden />
            </Btn>
            <Btn href="/tools/deadlines" variant="secondary">
              Add dates to tracker
            </Btn>
          </>
        }
      />

      <section className="section-pad">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_330px]">
          <div className="space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <ConfidenceBadge confidence={exam.confidence} />
                <Badge tone="neutral">Last checked {formatDate(exam.lastVerified)}</Badge>
              </div>
              <div className="mt-3">
                <StaleWarning verifiedOn={exam.lastVerified} />
              </div>
            </div>

            <Block title="Important dates">
              <div className="card divide-y divide-hairline p-0 dark:divide-hairline-dark">
                {exam.importantDates.map((d) => (
                  <div key={d.label} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <span className="flex items-center gap-2.5 text-sm font-medium text-ink dark:text-slate-100">
                      <CalendarDays className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden />
                      {d.label}
                    </span>
                    <span className="text-sm text-ink-muted dark:text-slate-300">{d.window}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Note tone="warn">
                  <strong>Windows are indicative.</strong> The conducting body can and does move these. Confirm on{" "}
                  <a href={exam.officialUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    the official site
                  </a>{" "}
                  before you pay a registration fee.
                </Note>
              </div>
            </Block>

            <Block title="Who needs it & eligibility">
              <div className="card p-5">
                <p className="text-sm leading-relaxed text-ink-muted dark:text-slate-300">{exam.eligibility}</p>
              </div>
            </Block>

            <Block title="Pattern">
              <div className="card p-5">
                <p className="text-sm leading-relaxed text-ink-muted dark:text-slate-300">{exam.pattern}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {exam.subjects.map((s) => (
                    <span key={s} className="chip bg-surface-sunken text-ink-muted dark:bg-white/8 dark:text-slate-300">{s}</span>
                  ))}
                </div>
              </div>
            </Block>

            <Block title="Syllabus">
              <div className="card p-5">
                <p className="text-sm leading-relaxed text-ink-muted dark:text-slate-300">{exam.syllabus}</p>
                <p className="mt-3 text-xs text-ink-faint">
                  Always cross-check against the current-year information bulletin.
                </p>
              </div>
            </Block>

            <Block title="Registration">
              <div className="card p-5">
                <p className="text-sm leading-relaxed text-ink-muted dark:text-slate-300">{exam.registration}</p>
                <div className="mt-4">
                  <Btn href={exam.officialUrl} external size="sm">
                    Go to registration <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </Btn>
                </div>
              </div>
            </Block>

            <Block title="Accepted by" subtitle="Institutions and programmes that record this exam in their admission route.">
              <div className="flex flex-wrap gap-2">
                {exam.acceptedBy.length === 0 ? (
                  <span className="text-sm text-ink-muted">No institutions are linked to this exam in this build.</span>
                ) : (
                  exam.acceptedBy.map((a) => (
                    <Link
                      key={a}
                      href={`/colleges?search=${encodeURIComponent(a)}`}
                      className="chip border border-hairline bg-white text-ink-muted transition hover:border-navy-400 hover:text-navy-600 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
                    >
                      {a}
                    </Link>
                  ))
                )}
              </div>
            </Block>

            <Block title="Preparation resources">
              <div className="grid gap-3 sm:grid-cols-2">
                {exam.prepResources.map((r) => (
                  <div key={r.label} className="flex items-start justify-between gap-3 rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
                    <div>
                      <p className="text-sm font-medium text-ink dark:text-slate-100">{r.label}</p>
                      <div className="mt-1.5">
                        <Badge tone={r.type === "free" ? "green" : "amber"}>
                          {r.type === "free" ? "Free" : "Paid"}
                        </Badge>
                      </div>
                    </div>
                    {r.url && (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-navy-600 dark:text-cyan-300"
                      >
                        Open <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-ink-faint">
                Resources are listed because they're official or free — not because anyone pays us. Paid options are
                labelled as paid.
              </p>
            </Block>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">At a glance</p>
              <dl className="mt-3 space-y-3 text-sm">
                <Row label="Conducted by" value={exam.conductedBy} />
                <Row label="Level" value={exam.level} />
                <Row label="Country" value={exam.countryId.toUpperCase()} />
                <Row label="Last verified" value={formatDate(exam.lastVerified)} />
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <ConfidenceBadge confidence={exam.confidence} />
              </div>
            </div>

            <div className="card p-5">
              <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                <AlertTriangle className="h-4 w-4 text-signal-amber" aria-hidden /> Before you register
              </p>
              <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" aria-hidden /> Confirm the date on the official site.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" aria-hidden /> Check the ID proof and photo rules early.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" aria-hidden /> Note the correction window, not just the last date.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" aria-hidden /> Keep the confirmation page as a PDF.</li>
              </ul>
            </div>

            <div className="card p-5">
              <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                <Target className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Related tools
              </p>
              <div className="mt-3 grid gap-2">
                <Btn href="/tools/deadlines" size="sm">Deadline tracker</Btn>
                <Btn href="/courses" variant="secondary" size="sm">Courses needing this</Btn>
                <Btn href="/pathfinder" variant="ghost" size="sm">Ask Pathfinder about it</Btn>
              </div>
            </div>

            <div className="card p-5">
              <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                <FileText className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Sources
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                {exam.conductedBy} information bulletin · checked {formatDate(exam.lastVerified)}
              </p>
              <a
                href={exam.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy-600 dark:text-cyan-300"
              >
                Official source <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right font-medium text-ink dark:text-slate-100">{value}</dd>
    </div>
  );
}
