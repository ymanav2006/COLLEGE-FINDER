"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Globe2, Wallet, GraduationCap, Coins, Route } from "lucide-react";
import { Badge, Btn, FactDisplay, Note, Provenance } from "@/components/ui";
import { getExam } from "@/data/exams";
import { getCountry } from "@/data/countries";
import { getSource } from "@/data/sources";
import { convertToINR } from "@/data/money";
import { TWINNING_ROUTES, TWINNING_MODES } from "@/data/twinning";
import { formatINR, formatDate } from "@/lib/format";
import { daysSince, isStale } from "@/data/sources";
import type { Fact, Institution } from "@/lib/types";

type TabId = "apply" | "money" | "life" | "pathways" | "links";

const TABS: { id: TabId; label: string; icon: typeof GraduationCap }[] = [
  { id: "apply", label: "Applying here", icon: GraduationCap },
  { id: "money", label: "Money & funding", icon: Wallet },
  { id: "life", label: "Life, city & campus", icon: Globe2 },
  { id: "pathways", label: "2+2 & other routes in", icon: Route },
  { id: "links", label: "Official links", icon: ExternalLink },
];

/**
 * "Know more about this university" — a deep-dive tab strip that assembles an
 * extended profile out of the record we already have: the admission route,
 * every deadline with its check date, the cost of each leg, the country's own
 * visa and work-right notes, the split-degree pathways that lead into this
 * destination, and the official sources behind all of it.
 *
 * Nothing here is generated prose about the university — it is the same facts,
 * laid out for someone deciding whether to spend a year preparing for it.
 */
export function KnowMore({ institution }: { institution: Institution }) {
  const [tab, setTab] = useState<TabId>("apply");
  const country = getCountry(institution.countryId);
  const isAbroad = institution.countryId !== "in";
  const verifiedOn = institution.tuition.tuitionAnnual.verifiedOn;
  const stale = isStale(verifiedOn);

  const pathways = isAbroad
    ? TWINNING_ROUTES.filter((r) => r.countryId === institution.countryId)
    : TWINNING_ROUTES;

  const exams = institution.entranceExams.map((id) => getExam(id)).filter((e): e is NonNullable<typeof e> => Boolean(e));

  return (
    <div className="rounded-2xl border border-hairline bg-white p-5 dark:border-hairline-dark dark:bg-white/4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink dark:text-slate-50">
            Know more about {institution.name}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Five deeper views of this record — application, money, life, routes in, and every official link we hold.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isAbroad ? "blue" : "green"}>{isAbroad ? "Outside India" : "In India"}</Badge>
          <Badge tone={stale ? "amber" : "neutral"}>
            {stale ? "May have changed" : "Checked"} {formatDate(verifiedOn)}
          </Badge>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Know more sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`chip border px-3.5 py-2 text-xs font-semibold ${
              tab === t.id
                ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950"
                : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
            }`}
          >
            <t.icon className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5" role="tabpanel">
        {tab === "apply" && (
          <ApplyTab
            institution={institution}
            countryName={country?.name}
            timeline={country?.applicationTimeline}
            visaNotes={country?.visaNotes}
            workRights={country?.workRights}
            verifiedOn={verifiedOn}
            exams={exams}
          />
        )}
        {tab === "money" && <MoneyTab institution={institution} countryName={country?.name} />}
        {tab === "life" && <LifeTab institution={institution} />}
        {tab === "pathways" && <PathwaysTab routes={pathways} isAbroad={isAbroad} countryName={country?.name} />}
        {tab === "links" && <LinksTab institution={institution} countryName={country?.name} countrySources={country?.officialSources ?? []} />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 1 — Applying here                                               */
/* ------------------------------------------------------------------ */

function ApplyTab({
  institution,
  countryName,
  timeline,
  visaNotes,
  workRights,
  verifiedOn,
  exams,
}: {
  institution: Institution;
  countryName?: string;
  timeline?: string;
  visaNotes?: Fact<string>;
  workRights?: Fact<string>;
  verifiedOn: string;
  exams: ReturnType<typeof getExam>[];
}) {
  const steps = [
    {
      title: "1 · Check the route, not just the name",
      body: institution.admissionRoute,
    },
    {
      title: "2 · Confirm you clear the published requirements",
      body: institution.eligibilitySummary,
    },
    {
      title: "3 · Sit the required tests",
      body: exams.length
        ? `${exams.map((e) => e?.name).join(", ")} — each has its own registration window and score validity.`
        : "No standardised test is listed for this record; admission is based on the route described above.",
    },
    {
      title: `4 · Work backwards from the dates`,
      body: timeline ?? "Application windows for this destination are recorded in its country guide.",
    },
  ];

  return (
    <div className="space-y-5">
      <ol className="grid gap-3 sm:grid-cols-2">
        {steps.map((s) => (
          <li key={s.title} className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
            <p className="text-sm font-semibold text-ink dark:text-slate-100">{s.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{s.body}</p>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Tracked dates for this record</p>
        <table className="mt-3 w-full text-sm">
          <caption className="sr-only">Application windows</caption>
          <thead>
            <tr className="border-b border-hairline text-left dark:border-hairline-dark">
              <th className="pb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Stage</th>
              <th className="pb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Window</th>
              <th className="pb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Checked</th>
            </tr>
          </thead>
          <tbody>
            {institution.deadlines.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-3 text-ink-muted">
                  No dates are recorded for this institution in this build — check the official admissions page.
                </td>
              </tr>
            ) : (
              institution.deadlines.map((d) => (
                <tr key={d.label} className="border-b border-hairline last:border-0 dark:border-hairline-dark">
                  <td className="py-2.5 pr-3 font-medium text-ink dark:text-slate-100">{d.label}</td>
                  <td className="py-2.5 pr-3 text-ink-muted">{d.window}</td>
                  <td className="py-2.5 text-xs text-ink-faint">{formatDate(d.verifiedOn)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="mt-3">
          <Provenance sourceId="src-inst-admit" verifiedOn={verifiedOn} confidence="reported" />
        </div>
      </div>

      {exams.length > 0 && (
        <div className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
            Tests named on this record
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {exams.map(
              (e) =>
                e && (
                  <Link
                    key={e.id}
                    href={`/exams/${e.slug}`}
                    className="group flex items-start justify-between gap-3 rounded-xl border border-hairline p-3 transition hover:border-navy-400 dark:border-hairline-dark"
                  >
                    <span>
                      <span className="block text-sm font-medium text-ink group-hover:text-navy-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                        {e.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-muted">{e.conductedBy}</span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-faint transition group-hover:translate-x-1" aria-hidden />
                  </Link>
                ),
            )}
          </div>
        </div>
      )}

      {(visaNotes || workRights) && (
        <div className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
            Visa &amp; work rights{countryName ? ` — ${countryName}` : ""}
          </p>
          <div className="mt-3 space-y-3">
            {visaNotes && <FactDisplay fact={visaNotes} label="Student visa" compact />}
            {workRights && <FactDisplay fact={workRights} label="Working while studying" compact />}
          </div>
          <div className="mt-3">
            <Note tone="warn">
              Immigration rules change with little notice. Confirm on the official government site before booking
              flights or paying a deposit — no platform can influence a visa decision.
            </Note>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 2 — Money                                                       */
/* ------------------------------------------------------------------ */

function MoneyTab({ institution, countryName }: { institution: Institution; countryName?: string }) {
  const t = institution.tuition;
  const toINR = (v: number) => convertToINR(v, t.currency);
  const years = 4;
  const totalTuition = toINR(t.tuitionAnnual.value) * years;
  const totalWithLiving =
    totalTuition +
    (t.hostelAnnual ? toINR(t.hostelAnnual.value) * years : 0) +
    (t.otherFeesAnnual ? toINR(t.otherFeesAnnual.value) * years : 0);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Recorded costs</p>
        <div className="mt-3 space-y-3">
          <FactDisplay
            fact={t.tuitionAnnual}
            label="Annual tuition"
            render={(v) => `${v.toLocaleString("en-IN")} ${t.currency}`}
            note={`≈ ${formatINR(toINR(t.tuitionAnnual.value))} per year`}
          />
          {t.hostelAnnual && (
            <FactDisplay
              fact={t.hostelAnnual}
              label="Annual accommodation"
              render={(v) => `${v.toLocaleString("en-IN")} ${t.currency}`}
              note={`≈ ${formatINR(toINR(t.hostelAnnual.value))} per year`}
              compact
            />
          )}
          {t.otherFeesAnnual && (
            <FactDisplay
              fact={t.otherFeesAnnual}
              label="Other fees"
              render={(v) => `${v.toLocaleString("en-IN")} ${t.currency}`}
              note={`≈ ${formatINR(toINR(t.otherFeesAnnual.value))} per year`}
              compact
            />
          )}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">{t.estimateNote}</p>
      </div>

      <div className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
          <Coins className="h-3.5 w-3.5" aria-hidden /> What {years} years plausibly adds up to
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-muted">Tuition only, {years} years</dt>
            <dd className="font-semibold tabular text-ink dark:text-slate-100">≈ {formatINR(totalTuition)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-muted">Tuition + accommodation + other fees</dt>
            <dd className="font-semibold tabular text-ink dark:text-slate-100">≈ {formatINR(totalWithLiving)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          Straight-line arithmetic on the recorded annual figures — no inflation, no exchange-rate movement, no
          scholarship applied. Treat it as an order of magnitude, not a quote.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn href="/tools/afford" size="sm">Can I afford this?</Btn>
          <Btn href="/tools/budget" size="sm" variant="secondary">Add to budget planner</Btn>
        </div>
      </div>

      <div className="rounded-2xl border border-hairline p-4 lg:col-span-2 dark:border-hairline-dark">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
          Funding attached to this record
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-ink dark:text-slate-100">Scholarships & aid listed</p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink-muted dark:text-slate-300">
              {institution.scholarships.length ? (
                institution.scholarships.map((s) => <li key={s}>• {s}</li>)
              ) : (
                <li>None recorded in this build.</li>
              )}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-ink dark:text-slate-100">Financial aid note</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{institution.financialAid}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn href="/scholarships" size="sm" variant="secondary">Browse scholarships</Btn>
          <Btn href="/scholarships?country=international" size="sm" variant="secondary">Funding for {countryName ?? "abroad"}</Btn>
        </div>
        <div className="mt-4">
          <Note tone="warn">
            We never quote a guaranteed fee or a guaranteed award. Fee tables and scholarship budgets change each cycle
            — confirm the exact figure with the institution before you commit.
          </Note>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 3 — Life, city & campus                                         */
/* ------------------------------------------------------------------ */

function LifeTab({ institution }: { institution: Institution }) {
  const country = getCountry(institution.countryId);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">On campus</p>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
          {institution.campusHighlights.length ? (
            institution.campusHighlights.map((h) => <li key={h}>• {h}</li>)
          ) : (
            <li>No campus highlights recorded in this build.</li>
          )}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {institution.campusFeatures
            .filter((f) => f.available)
            .slice(0, 12)
            .map((f) => (
              <span key={f.id} className="chip border border-signal-green/40 bg-signal-green-soft text-signal-green" title={f.detail}>
                {f.label}
              </span>
            ))}
        </div>
      </div>

      <div className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
          {country ? `Studying in ${country.name}` : "Location notes"}
        </p>
        {country ? (
          <div className="mt-3 space-y-4">
            <div>
              <p className="text-sm font-semibold text-signal-green">Why students choose it</p>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-muted dark:text-slate-300">
                {country.pros.map((p) => <li key={p}>• {p}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-signal-amber">What to weigh up</p>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-muted dark:text-slate-300">
                {country.considerations.map((c) => <li key={c}>• {c}</li>)}
              </ul>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-hairline pt-3 dark:border-hairline-dark">
              <span className="text-xs text-ink-faint">Country record last checked {formatDate(country.lastVerified)}</span>
              <Link href={`/abroad/${country.slug}`} className="text-xs font-semibold text-navy-600 dark:text-cyan-300">
                Full {country.name} guide →
              </Link>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">No country record linked for this location in this build.</p>
        )}
      </div>

      {institution.perspectives.length > 0 && (
        <div className="lg:col-span-2">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
            Student perspectives (reported, not verified)
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {institution.perspectives.map((p) => (
              <figure key={p.id} className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
                <figcaption className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-ink dark:text-slate-200">{p.theme}</span>
                  <span className="text-[11px] text-ink-faint">{p.rating}/5 reported</span>
                </figcaption>
                <blockquote className="mt-2 text-sm leading-relaxed text-ink-muted">“{p.text}”</blockquote>
                <div className="mt-3">
                  <Provenance sourceId={p.sourceId} verifiedOn={institution.tuition.tuitionAnnual.verifiedOn} confidence="reported" />
                </div>
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 4 — 2+2 and other routes in                                     */
/* ------------------------------------------------------------------ */

function PathwaysTab({
  routes,
  isAbroad,
  countryName,
}: {
  routes: typeof TWINNING_ROUTES;
  isAbroad: boolean;
  countryName?: string;
}) {
  return (
    <div className="space-y-4">
      <Note>
        {isAbroad ? (
          <>
            Split-degree pathways that end at <strong>{countryName ?? "this destination"}</strong> — spend the first
            one to three years in India, then transfer into the final years here. Agreements are per-institution and
            per-programme, so verify the current one before you enrol anywhere.
          </>
        ) : (
          <>
            Split-degree pathways that start in India — two or three years at home, then the final years abroad at
            lower total cost than a full degree overseas.
          </>
        )}
      </Note>

      {routes.length === 0 ? (
        <div className="rounded-2xl border border-hairline p-5 text-sm text-ink-muted dark:border-hairline-dark">
          No split-degree pattern for this destination is recorded in this build — the full list is on the pathways
          page.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {routes.map((r) => (
            <Link
              key={r.id}
              href={`/abroad/2-2?route=${r.slug}`}
              className="group rounded-2xl border border-hairline p-4 transition hover:border-navy-400 dark:border-hairline-dark"
            >
              <div className="flex items-center gap-2">
                <Badge tone="brand">{r.mode}</Badge>
                <span className="text-[11px] text-ink-faint">{r.field}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-ink group-hover:text-navy-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                {r.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                {r.indiaLeg.years} yr in India → {r.abroadLeg.years} yr abroad · {r.totalYears} years total
              </p>
              <p className="mt-3 text-xs font-semibold text-navy-600 dark:text-cyan-300">
                Open pathway detail <ArrowRight className="ml-1 inline h-3 w-3" aria-hidden />
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
        <span>Pathway structures:</span>
        {TWINNING_MODES.map((m) => (
          <span key={m.id} className="chip bg-surface-sunken dark:bg-white/10" title={m.blurb}>
            {m.label}
          </span>
        ))}
        <Link href="/abroad/2-2" className="font-semibold text-navy-600 dark:text-cyan-300">
          See all pathways →
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab 5 — Official links                                              */
/* ------------------------------------------------------------------ */

function LinksTab({
  institution,
  countryName,
  countrySources,
}: {
  institution: Institution;
  countryName?: string;
  countrySources: { label: string; url: string }[];
}) {
  const verifiedOn = institution.tuition.tuitionAnnual.verifiedOn;
  const age = daysSince(verifiedOn);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
          Official sources for this record
        </p>
        <ul className="mt-3 space-y-3">
          {institution.sourceIds.map((sid) => {
            const s = getSource(sid);
            if (!s) return null;
            return (
              <li key={sid} className="rounded-xl border border-hairline p-3 dark:border-hairline-dark">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink dark:text-slate-100">{s.name}</p>
                  <Badge tone={s.demo ? "amber" : "green"}>{s.demo ? "Demo source" : s.type}</Badge>
                </div>
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy-600 dark:text-cyan-300"
                  >
                    Open official source <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-ink-faint">Bundled with this build — no public URL.</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
            Government & official links{countryName ? ` — ${countryName}` : ""}
          </p>
          <ul className="mt-3 space-y-2">
            {countrySources.map((src) => (
              <li key={src.url}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:underline dark:text-cyan-300"
                >
                  {src.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Freshness</p>
          <div className="mt-2">
            <Provenance
              sourceId={institution.sourceIds[0] ?? "src-seed"}
              verifiedOn={verifiedOn}
              confidence={institution.tuition.tuitionAnnual.confidence}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-muted">
            Last checked {formatDate(verifiedOn)} — {age === Infinity ? "unknown age" : `${age} days ago`}. Anything
            older than 180 days is flagged wherever it appears.
          </p>
        </div>

        <div className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Related pages</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn href="/universities" size="sm" variant="secondary">All universities</Btn>
            <Btn href="/abroad/search" size="sm" variant="secondary">Search abroad</Btn>
            <Btn href="/methodology" size="sm" variant="secondary">How we source data</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
