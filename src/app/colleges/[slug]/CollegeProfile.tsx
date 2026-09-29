"use client";

import Link from "next/link";
import {
  MapPin, Calendar, GraduationCap, Users, ExternalLink, Building2, ArrowRight,
  Landmark, FlaskConical, Lightbulb, Globe2, HeartHandshake,
} from "lucide-react";
import {
  Btn, Badge, ConfidenceBadge, FactDisplay, Provenance, Note, PageHeader, WhyList,
} from "@/components/ui";
import { CompareToggle, SaveButton } from "@/components/cards";
import { getInstitution } from "@/data/colleges";
import { getCourse } from "@/data/courses";
import { getSource } from "@/data/sources";
import { useAppStore } from "@/lib/store";
import { recommendInstitutions } from "@/lib/recommend";
import { assessInstitution } from "@/lib/eligibility";
import { formatINR, formatDate } from "@/lib/format";
import { convertToINR } from "@/data/money";
import type { ScorecardDimensionId } from "@/lib/types";

const SECTION_ORDER: ScorecardDimensionId[] = [
  "academics",
  "research",
  "careerOutcomes",
  "campusLife",
  "infrastructure",
  "studentActivities",
  "affordability",
  "location",
  "internationalExposure",
  "entrepreneurship",
  "diversity",
  "accommodation",
  "studentSupport",
];

const SECTION_BLURB: Record<string, string> = {
  academics: "Teaching quality, curriculum currency and academic rigour.",
  research: "Funded projects, publications and lab culture.",
  careerOutcomes: "Placement support, recruiter base and reported salaries.",
  campusLife: "Clubs, festivals, peer culture and day-to-day experience.",
  infrastructure: "Buildings, labs, network, transport and facilities.",
  studentActivities: "Sports, societies and extracurricular breadth.",
  affordability: "Tuition against the aid and scholarship support available.",
  location: "City access, industry proximity and commute reality.",
  internationalExposure: "Exchange routes, collaborations and global cohorts.",
  entrepreneurship: "Incubators, funding routes and founder support.",
  diversity: "Intake mix and representation across the student body.",
  accommodation: "Hostel availability, quality and cost.",
  studentSupport: "Counselling, health, mentoring and academic help.",
};

export default function CollegeProfile({ institutionId }: { institutionId: string }) {
  const institution = getInstitution(institutionId);
  const profile = useAppStore((s) => s.profile);

  if (!institution) return null;

  const eligibility = assessInstitution(institution, profile, getCourse);
  const tuitionINR = convertToINR(institution.tuition.tuitionAnnual.value, institution.tuition.currency);
  const hostelINR = institution.tuition.hostelAnnual
    ? convertToINR(institution.tuition.hostelAnnual.value, institution.tuition.currency)
    : null;

  const ranked = recommendInstitutions(profile, { limit: 500, includeAbroad: true }).find(
    (r) => r.item.id === institution.id,
  );

  const courses = institution.courseIds
    .map((id) => getCourse(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const placements = institution.placements.slice(0, 3);
  const dimBy = (id: ScorecardDimensionId) => institution.scorecard.find((d) => d.id === id);

  return (
    <>
      <PageHeader
        breadcrumb={
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-ink-faint" aria-label="Breadcrumb">
            <Link href="/colleges" className="hover:text-navy-600 dark:hover:text-cyan-300">
              Colleges
            </Link>
            <span aria-hidden>/</span>
            <span className="text-ink-muted">{institution.city}</span>
            <span aria-hidden>/</span>
            <span className="text-ink dark:text-slate-200">{institution.name}</span>
          </nav>
        }
        eyebrow={`${institution.type} ${institution.category} · est. ${institution.established}`}
        title={institution.name}
        lede={`${institution.city}, ${institution.state} — ${institution.eligibilitySummary}`}
        actions={
          <>
            <SaveButton kind="college" id={institution.id} />
            <CompareToggle id={institution.id} label="Add to compare" />
            <Btn href={`/colleges?course=${courses[0]?.slug ?? ""}`} variant="secondary">
              Similar programmes
            </Btn>
          </>
        }
      />

      {/* --------------------------- Quick facts --------------------------- */}
      <section className="border-b border-hairline bg-surface-muted dark:border-hairline-dark dark:bg-white/3">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {[
            { icon: MapPin, label: "Location", value: `${institution.city}, ${institution.state}` },
            { icon: Calendar, label: "Established", value: String(institution.established) },
            { icon: Users, label: "Students", value: institution.studentCount ? institution.studentCount.toLocaleString("en-IN") : "Not published here" },
            { icon: GraduationCap, label: "Programmes tracked", value: `${institution.courseIds.length}` },
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
            {/* ------------------------- Eligibility ------------------------- */}
            <Block title="Can I apply? Eligibility, classified">
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
                <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">{institution.eligibilitySummary}</p>
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
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                      Requirements we track
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {eligibility.requirements.map((r) => (
                        <li key={r} className="chip bg-white text-ink-muted dark:bg-white/10 dark:text-slate-200">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!profile && (
                  <p className="mt-4 text-xs text-ink-muted">
                    <Link href="/onboarding" className="font-semibold text-navy-600 dark:text-cyan-300">
                      Add your marks and stream
                    </Link>{" "}
                    and this becomes a personal verdict instead of a generic one.
                  </p>
                )}
              </div>
            </Block>

            {/* --------------------------- Scorecard --------------------------- */}
            <Block
              title="13-dimension scorecard"
              subtitle="Each dimension carries its own evidence and confidence. There is no composite “best” score — averaging these would hide exactly the trade-offs you need to see."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {SECTION_ORDER.map((id) => {
                  const d = dimBy(id);
                  const notAssessed = !d;
                  return (
                    <div
                      key={id}
                      className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-ink dark:text-slate-100">
                            {d?.label ?? labelFor(id)}
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                            {SECTION_BLURB[id]}
                          </p>
                        </div>
                        <span className="shrink-0 text-2xl font-semibold tabular text-ink dark:text-slate-50">
                          {notAssessed ? <span className="text-ink-faint">—</span> : d.score}
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-sunken dark:bg-white/10">
                        {!notAssessed && (
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-navy-500 via-violet-500 to-cyan-500"
                            style={{ width: `${d.score}%` }}
                          />
                        )}
                      </div>

                      <p className="mt-3 text-xs leading-relaxed text-ink-muted dark:text-slate-300">
                        {notAssessed ? "Not assessed in this build." : d.evidence}
                      </p>

                      {notAssessed ? (
                        <div className="mt-3">
                          <Badge tone="neutral">Unverified</Badge>
                        </div>
                      ) : (
                        <Provenance
                          sourceId={d.sourceId}
                          verifiedOn={institution.tuition.tuitionAnnual.verifiedOn}
                          confidence={d.confidence}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5">
                <Note>
                  <strong>These are demo index values, not an official ranking.</strong> They exist so you can compare
                  two institutions across the same thirteen dimensions. Evidence sits next to every number — a score with
                  no evidence contributes nothing to a decision.
                </Note>
              </div>
            </Block>

            {/* --------------------------- Admissions --------------------------- */}
            <Block
              title="Admission route & deadlines"
              subtitle="Windows shift every cycle. Confirm on the official site before you register."
            >
              <div className="rounded-2xl border border-hairline p-5 dark:border-hairline-dark">
                <p className="text-sm text-ink-muted">{institution.admissionRoute}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {institution.entranceExams.length > 0 ? (
                    institution.entranceExams.map((e) => (
                      <Link
                        key={e}
                        href={`/exams?search=${encodeURIComponent(e)}`}
                        className="chip bg-navy-50 text-navy-700 hover:bg-navy-100 dark:bg-cyan-500/12 dark:text-cyan-200"
                      >
                        {e}
                      </Link>
                    ))
                  ) : (
                    <span className="chip bg-surface-sunken text-ink-muted dark:bg-white/8 dark:text-slate-300">
                      Merit / institute-level selection
                    </span>
                  )}
                </div>

                <table className="mt-5 w-full text-sm">
                  <caption className="sr-only">Application windows</caption>
                  <thead>
                    <tr className="border-b border-hairline text-left dark:border-hairline-dark">
                      <th className="pb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Stage</th>
                      <th className="pb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Window</th>
                      <th className="pb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Checked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institution.deadlines.map((d) => (
                      <tr key={d.label} className="border-b border-hairline last:border-0 dark:border-hairline-dark">
                        <td className="py-2.5 pr-3 font-medium text-ink dark:text-slate-100">{d.label}</td>
                        <td className="py-2.5 pr-3 text-ink-muted">{d.window}</td>
                        <td className="py-2.5 text-xs text-ink-faint">{formatDate(d.verifiedOn)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {institution.deadlines.map((d) => (
                  <div key={d.label} className="rounded-xl bg-surface-muted p-4 dark:bg-white/5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{d.label}</p>
                    <p className="mt-1 text-sm font-medium text-ink dark:text-slate-100">{d.window}</p>
                  </div>
                ))}
              </div>
            </Block>

            {/* --------------------------- Placements --------------------------- */}
            <Block title="Placements — always with population & method">
              {placements.length === 0 ? (
                <Note tone="warn">
                  No placement report is attached to this record in this build. We don't estimate placement statistics.
                </Note>
              ) : (
                <div className="space-y-4">
                  {placements.map((p) => (
                    <div key={p.year} className="rounded-2xl border border-hairline p-5 dark:border-hairline-dark">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-ink dark:text-slate-100">Batch of {p.year}</p>
                        <ConfidenceBadge confidence={p.confidence} />
                      </div>

                      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                        {p.placementRatePercent !== undefined && (
                          <Fact
                            label="Placement rate"
                            value={`${p.placementRatePercent}%`}
                          />
                        )}
                        {p.medianSalaryINR !== undefined && (
                          <Fact label="Median package" value={formatINR(p.medianSalaryINR)} />
                        )}
                        {p.highestSalaryINR !== undefined && (
                          <Fact label="Highest package" value={formatINR(p.highestSalaryINR)} />
                        )}
                      </dl>

                      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
                        <strong className="text-ink dark:text-slate-200">Population:</strong> {p.population}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                        <strong className="text-ink dark:text-slate-200">Method:</strong> {p.methodology}
                      </p>
                      {p.recruiters && p.recruiters.length > 0 && (
                        <p className="mt-2 text-xs text-ink-muted">
                          <strong className="text-ink dark:text-slate-200">Recruiters:</strong>{" "}
                          {p.recruiters.slice(0, 6).join(", ")}
                        </p>
                      )}
                      <Provenance
                        sourceId={p.sourceId}
                        verifiedOn={institution.tuition.tuitionAnnual.verifiedOn}
                        confidence={p.confidence}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Block>

            {/* ------------------------- Campus & life ------------------------- */}
            <Block title="Campus, facilities & highlights">
              <div className="grid gap-4 sm:grid-cols-2">
                <ul className="space-y-2">
                  {institution.campusHighlights.map((h) => (
                    <li key={h} className="flex gap-2 text-sm text-ink-muted dark:text-slate-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-400 dark:bg-cyan-400" aria-hidden />
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {institution.campusFeatures.map((f) => (
                    <span
                      key={f.id}
                      className={`chip border ${
                        f.available
                          ? "border-signal-green/40 bg-signal-green-soft text-signal-green"
                          : "border-hairline bg-white text-ink-faint line-through dark:border-hairline-dark dark:bg-white/6"
                      }`}
                      title={f.detail}
                    >
                      {f.label}
                    </span>
                  ))}
                </div>
              </div>

              {institution.perspectives.length > 0 && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {institution.perspectives.map((p) => (
                    <figure key={p.id} className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
                      <figcaption className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-ink dark:text-slate-200">{p.theme}</span>
                        <span className="text-[11px] text-ink-faint">{p.rating}/5 reported</span>
                      </figcaption>
                      <blockquote className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
                        “{p.text}”
                      </blockquote>
                      <Provenance sourceId={p.sourceId} verifiedOn={institution.tuition.tuitionAnnual.verifiedOn} confidence="reported" />
                    </figure>
                  ))}
                </div>
              )}
            </Block>

            {/* ------------------- Research / intl / entrepreneurship ------------------- */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: FlaskConical, title: "Research", items: institution.researchHighlights },
                { icon: Globe2, title: "International", items: institution.internationalExposure },
                { icon: Lightbulb, title: "Entrepreneurship", items: institution.entrepreneurship },
              ].map((g) => (
                <div key={g.title} className="card p-5">
                  <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                    <g.icon className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden />
                    {g.title}
                  </p>
                  {g.items.length === 0 ? (
                    <p className="mt-3 text-xs text-ink-faint">Not recorded for this institution in this build.</p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
                      {g.items.map((x) => (
                        <li key={x}>• {x}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* --------------------------- Programmes --------------------------- */}
            <Block title="Programmes we track here" subtitle="Each one links to full duration, eligibility and cost.">
              {courses.length === 0 ? (
                <Note>Programme records for this institution aren't linked in this build.</Note>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {courses.map((c) => (
                    <Link
                      key={c.id}
                      href={`/courses/${c.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-hairline p-4 transition hover:border-navy-400 dark:border-hairline-dark"
                    >
                      <span>
                        <span className="block text-sm font-medium text-ink group-hover:text-navy-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                          {c.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          {c.durationYears} yr · {formatINR(c.annualCost.value.minINR)}–{formatINR(c.annualCost.value.maxINR)}/yr
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint transition group-hover:translate-x-1" aria-hidden />
                    </Link>
                  ))}
                </div>
              )}
            </Block>

            {/* ----------------------------- Sources ----------------------------- */}
            <Block title="How we know this" subtitle="Every source behind this profile, with its type and date.">
              <ul className="space-y-3">
                <li className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
                  <p className="text-sm font-medium text-ink dark:text-slate-100">
                    {getSource("src-inst-fee")?.name ?? "Institute fee document"}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">{institution.tuition.estimateNote}</p>
                  <Provenance
                    sourceId="src-inst-fee"
                    verifiedOn={institution.tuition.tuitionAnnual.verifiedOn}
                    confidence={institution.tuition.tuitionAnnual.confidence}
                  />
                </li>
                {institution.sourceIds.map((sid) => {
                  const s = getSource(sid);
                  if (!s) return null;
                  return (
                    <li key={sid} className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-ink dark:text-slate-100">{s.name}</p>
                        <Badge tone={s.demo ? "amber" : "green"}>{s.demo ? "Demo source" : "Official"}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-ink-muted">{s.type}</p>
                      {s.url && (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy-600 dark:text-cyan-300"
                        >
                          Open source <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-5">
                <Note tone="warn">
                  Seed data ships with this prototype. Dates shown are when the record was last checked — always verify
                  on the official site before applying or paying anything.
                </Note>
              </div>
            </Block>
          </div>

          {/* ------------------------------ Sidebar ------------------------------ */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Cost</p>
              <FactDisplay
                fact={institution.tuition.tuitionAnnual}
                label="Annual tuition"
                render={(v) => `${v.toLocaleString("en-IN")} ${institution.tuition.currency}`}
                note={`≈ ${formatINR(tuitionINR)} per year`}
              />
              {institution.tuition.hostelAnnual && (
                <div className="mt-3">
                  <FactDisplay
                    fact={institution.tuition.hostelAnnual}
                    label="Annual hostel"
                    render={(v) => `${v.toLocaleString("en-IN")} ${institution.tuition.currency}`}
                    note={hostelINR ? `≈ ${formatINR(hostelINR)} per year` : undefined}
                    compact
                  />
                </div>
              )}
              <p className="mt-3 text-xs leading-relaxed text-ink-muted">{institution.tuition.estimateNote}</p>
              <div className="mt-4 grid gap-2">
                <Btn href="/tools/afford">Can I afford this?</Btn>
                <Btn href="/tools/budget" variant="secondary">
                  Add to budget planner
                </Btn>
              </div>
            </div>

            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Financial aid</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{institution.financialAid}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {institution.scholarships.slice(0, 4).map((s) => (
                  <span key={s} className="chip bg-surface-sunken text-[10px] text-ink-muted dark:bg-white/8 dark:text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <Btn href="/scholarships" variant="secondary" size="sm">
                  Browse scholarships
                </Btn>
              </div>
            </div>

            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Why this appears for you</p>
              <div className="mt-3">
                <WhyList reasons={ranked?.reasons ?? []} cautions={ranked?.cautions ?? []} />
              </div>
            </div>

            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Accreditation</p>
              <FactDisplay fact={institution.accreditation} label="Status" compact />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function Block({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-ink dark:text-slate-50">{title}</h2>
      {subtitle && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-muted p-3 dark:bg-white/5">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="mt-1 text-sm font-semibold tabular text-ink dark:text-slate-100">{value}</dd>
    </div>
  );
}

function labelFor(id: string): string {
  return id
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}
