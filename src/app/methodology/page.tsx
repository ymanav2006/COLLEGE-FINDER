import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck, Database, CalendarClock, Scale, Ban, ArrowRight, ExternalLink, GitBranch,
} from "lucide-react";
import { Btn, Badge, PageHeader, Section, Note } from "@/components/ui";
import { SOURCES, DATASET_VERIFIED_ON, STALE_AFTER_DAYS, SOURCE_TYPE_LABEL, CONFIDENCE_LABEL, CONFIDENCE_HELP } from "@/data/sources";
import { INSTITUTIONS } from "@/data/colleges";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Methodology — how facts, sources and confidence work",
  description:
    "How this platform sources every value, labels confidence, warns about stale data, and why it never publishes a single ‘best college' ranking.",
  alternates: { canonical: "/methodology" },
};

const PRINCIPLES = [
  {
    icon: Database,
    title: "Value → Source → Date → Confidence",
    body: "Every important number is rendered with all four parts together. A figure shown without its source and date isn't data, it's decoration.",
  },
  {
    icon: Scale,
    title: "No composite “best” score",
    body: "Thirteen dimensions stay thirteen dimensions. Averaging them would let a strong sports facility cancel out a weak affordability score, which is not how anybody actually decides.",
  },
  {
    icon: CalendarClock,
    title: "Freshness is part of correctness",
    body: `Anything older than ${STALE_AFTER_DAYS} days carries a visible warning. Exam dates and scholarship deadlines change every cycle, so an undated figure is a liability.`,
  },
  {
    icon: Ban,
    title: "We say when we don't know",
    body: "Missing values render as “Not recorded”. We don't interpolate, estimate or smooth a gap into something that looks like a measurement.",
  },
];

export default function MethodologyPage() {
  const sourceTypes = Array.from(new Set(SOURCES.map((s) => s.type)));
  const demoSources = SOURCES.filter((s) => s.demo).length;

  return (
    <>
      <PageHeader
        eyebrow="Methodology"
        title="How a number earns its place on this page"
        lede="Every claim here carries a value, a source, a date and a confidence label. This page explains what those labels mean, how staleness is triggered, and the editorial rules the dataset is held to."
        actions={
          <>
            <Btn href="/admin">Open the data-stewardship panel</Btn>
            <Btn href="/faq" variant="secondary">FAQ</Btn>
          </>
        }
      />

      <Section>
        <div className="mx-auto max-w-5xl space-y-10">
          {/* --------------------------- Principles --------------------------- */}
          <div className="grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="card p-5">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <p.icon className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> {p.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{p.body}</p>
              </div>
            ))}
          </div>

          {/* --------------------------- Confidence --------------------------- */}
          <div>
            <h2 className="text-xl font-semibold text-ink dark:text-slate-50">Confidence labels</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
              Labels are assigned conservatively. It is always better to under-claim and be right than to over-claim
              and be caught.
            </p>
            <div className="mt-4 space-y-3">
              {(["verified", "cross-checked", "reported", "unverified"] as const).map((c) => (
                <div key={c} className="card flex flex-wrap items-start justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink dark:text-slate-100">{CONFIDENCE_LABEL[c]}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{CONFIDENCE_HELP[c]}</p>
                  </div>
                  <Badge tone={c === "verified" ? "green" : c === "cross-checked" ? "blue" : c === "reported" ? "amber" : "neutral"}>
                    {CONFIDENCE_LABEL[c]}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* --------------------------- Provenance --------------------------- */}
          <div>
            <h2 className="text-xl font-semibold text-ink dark:text-slate-50">Where facts come from</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
              {SOURCES.length} source records are registered for this build across {sourceTypes.length} source types.{" "}
              {demoSources} of them are explicitly marked as demo or seed sources — you can always tell the difference,
              because we never present bundled sample data as though it were live research.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {sourceTypes.map((t) => (
                <span key={t} className="chip border border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300">
                  {SOURCE_TYPE_LABEL[t]}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="card p-5">
                <p className="font-semibold text-ink dark:text-slate-100">Preferred order</p>
                <ol className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
                  <li>1. Official regulator or government publication</li>
                  <li>2. Institution's own fee, admission or placement document</li>
                  <li>3. Accreditation or statutory body record</li>
                  <li>4. Recognised public dataset or survey</li>
                  <li>5. Editorial writing, clearly attributed as editorial</li>
                  <li>6. Community submission — labelled Unverified until checked</li>
                </ol>
              </div>
              <div className="card p-5">
                <p className="font-semibold text-ink dark:text-slate-100">Population and method</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
                  Placement and salary figures are never shown without the population they apply to and the method used
                  to produce them. A median package for the top 10% of a batch and a median for the whole batch are
                  different statistics that look identical when stripped of context.
                </p>
                <div className="mt-3">
                  <Link href="/colleges" className="text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
                    See it on a profile →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------- Freshness --------------------------- */}
          <div className="rounded-3xl border border-hairline bg-surface-muted p-6 dark:border-hairline-dark dark:bg-white/5">
            <div className="flex flex-wrap items-center gap-2">
              <CalendarClock className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden />
              <h2 className="text-lg font-semibold text-ink dark:text-slate-50">Freshness rules</h2>
            </div>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Dataset verified on</dt>
                <dd className="mt-1 text-lg font-semibold tabular text-ink dark:text-slate-100">{formatDate(DATASET_VERIFIED_ON)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Warning threshold</dt>
                <dd className="mt-1 text-lg font-semibold tabular text-ink dark:text-slate-100">{STALE_AFTER_DAYS} days</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Institutions tracked</dt>
                <dd className="mt-1 text-lg font-semibold tabular text-ink dark:text-slate-100">{INSTITUTIONS.length}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
              Each fact stores its own <code className="rounded bg-white px-1.5 py-0.5 text-xs dark:bg-white/10">verifiedOn</code>{" "}
              date. Past the threshold, a warning appears automatically wherever the value is rendered — profile pages,
              compare tables, search results and country guides alike.
            </p>
          </div>

          {/* --------------------------- Never --------------------------- */}
          <div>
            <h2 className="text-xl font-semibold text-ink dark:text-slate-50">Things this platform will not do</h2>
            <ul className="mt-4 space-y-3">
              {[
                "Publish a single overall ranking of institutions, courses or careers.",
                "Show a salary, placement rate or fee without a date and a source.",
                "Estimate a figure we don't hold, or fill a gap with a plausible-looking number.",
                "Guarantee admission, employment, a scholarship or a visa.",
                "Present bundled demo data as if it were live, verified research.",
                "Place an institution higher because of a commercial relationship.",
              ].map((t) => (
                <li key={t} className="flex gap-3 rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
                  <Ban className="mt-0.5 h-4 w-4 shrink-0 text-signal-red" aria-hidden />
                  <span className="text-sm leading-relaxed text-ink-muted dark:text-slate-300">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* --------------------------- Extensibility --------------------------- */}
          <div className="card p-6">
            <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
              <GitBranch className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> How answers are produced
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
              Pathfinder retrieves from the same typed records this UI renders, then attaches a citation to each claim
              it makes. It has no route to invent a statistic: it composes from retrieved fields, and when a field is
              missing it returns an explicit “not recorded” rather than a guess. The interface is provider-agnostic, so
              a language model can be added behind it later without weakening the citation requirement.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Btn href="/pathfinder" size="sm">Try Pathfinder</Btn>
              <Btn href="/admin" variant="secondary" size="sm">See the source registry</Btn>
            </div>
          </div>

          <Note tone="warn">
            This is a prototype with a curated seed dataset. Before you apply, pay or commit to anything, confirm the
            figure on the official source — the link is always one click away from the fact itself.
          </Note>
        </div>
      </Section>
    </>
  );
}
