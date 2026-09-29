"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, Database, History, AlertTriangle, CheckCircle2, Users, FileText, ExternalLink,
} from "lucide-react";
import { Btn, Badge, PageHeader, Section, Note, ConfidenceBadge } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { INSTITUTIONS } from "@/data/colleges";
import { COURSES } from "@/data/courses";
import { CAREERS } from "@/data/careers";
import { EXAMS } from "@/data/exams";
import { SCHOLARSHIPS } from "@/data/scholarships";
import { SKILLS } from "@/data/skills";
import { COUNTRIES } from "@/data/countries";
import { SOURCES, DATASET_VERIFIED_ON, STALE_AFTER_DAYS, isStale, daysSince, SOURCE_TYPE_LABEL } from "@/data/sources";
import { formatDate } from "@/lib/format";

type Tab = "dataset" | "sources" | "audit" | "records";

export default function AdminPage() {
  const audit = useAppStore((s) => s.audit);
  const profile = useAppStore((s) => s.profile);
  const [tab, setTab] = useState<Tab>("dataset");

  const datasets = useMemo(
    () => [
      { name: "Institutions", count: INSTITUTIONS.length, href: "/colleges" },
      { name: "Courses", count: COURSES.length, href: "/courses" },
      { name: "Careers", count: CAREERS.length, href: "/careers" },
      { name: "Entrance exams", count: EXAMS.length, href: "/exams" },
      { name: "Scholarships", count: SCHOLARSHIPS.length, href: "/scholarships" },
      { name: "Skills", count: SKILLS.length, href: "/skills" },
      { name: "Study destinations", count: COUNTRIES.length, href: "/abroad" },
    ],
    [],
  );

  const totalRecords = datasets.reduce((s, d) => s + d.count, 0);

  const feeFacts = useMemo(
    () =>
      INSTITUTIONS.map((i) => ({
        id: i.id,
        name: i.name,
        verifiedOn: i.tuition.tuitionAnnual.verifiedOn,
        confidence: i.tuition.tuitionAnnual.confidence,
        href: `/colleges/${i.slug}`,
      })),
    [],
  );

  const staleFacts = feeFacts.filter((f) => isStale(f.verifiedOn));
  const confidenceBuckets = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of feeFacts) m.set(f.confidence, (m.get(f.confidence) ?? 0) + 1);
    return Array.from(m.entries());
  }, [feeFacts]);

  const ageDays = daysSince(DATASET_VERIFIED_ON);

  return (
    <>
      <PageHeader
        eyebrow="Admin · data stewardship"
        title="What's in the dataset, how fresh it is, who changed it"
        lede="An internal view of record counts, verification dates, confidence distribution and the audit trail of everything edited in this build. Read-only — there is no destructive action here."
        actions={
          <>
            <Btn href="/methodology" variant="secondary">
              <ShieldCheck className="h-4 w-4" aria-hidden /> Methodology
            </Btn>
            <Btn href="/accessibility" variant="ghost">Accessibility</Btn>
          </>
        }
      />

      <Section wide>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Total records</p>
            <p className="mt-1.5 text-3xl font-semibold tabular text-ink dark:text-slate-50">{totalRecords}</p>
            <p className="mt-1 text-xs text-ink-faint">across {datasets.length} entity types</p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Dataset verified on</p>
            <p className="mt-1.5 text-lg font-semibold tabular text-ink dark:text-slate-50">{formatDate(DATASET_VERIFIED_ON)}</p>
            <p className={`mt-1 text-xs ${ageDays > STALE_AFTER_DAYS ? "text-signal-amber" : "text-ink-faint"}`}>
              {ageDays} days ago (threshold {STALE_AFTER_DAYS})
            </p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Stale fee records</p>
            <p className={`mt-1.5 text-3xl font-semibold tabular ${staleFacts.length ? "text-signal-amber" : "text-ink dark:text-slate-50"}`}>
              {staleFacts.length}
            </p>
            <p className="mt-1 text-xs text-ink-faint">past {STALE_AFTER_DAYS} days since last check</p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Audit entries</p>
            <p className="mt-1.5 text-3xl font-semibold tabular text-ink dark:text-slate-50">{audit.length}</p>
            <p className="mt-1 text-xs text-ink-faint">local to this device</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Admin sections">
          {(
            [
              { id: "dataset" as Tab, label: "Dataset inventory" },
              { id: "sources" as Tab, label: "Sources" },
              { id: "records" as Tab, label: "Freshness & confidence" },
              { id: "audit" as Tab, label: "Audit trail" },
            ]
          ).map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`chip border ${tab === t.id
                ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950"
                : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ------------------------------ Inventory ------------------------------ */}
        {tab === "dataset" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card overflow-hidden">
              <div className="border-b border-hairline px-5 py-4 dark:border-hairline-dark">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <Database className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Record inventory
                </p>
              </div>
              <table className="w-full text-sm">
                <caption className="sr-only">Record counts per dataset</caption>
                <thead>
                  <tr className="border-b border-hairline text-left dark:border-hairline-dark">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Dataset</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-ink-faint">Records</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-ink-faint">View</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((d) => (
                    <tr key={d.name} className="border-b border-hairline last:border-0 dark:border-hairline-dark">
                      <td className="px-5 py-3 font-medium text-ink dark:text-slate-100">{d.name}</td>
                      <td className="px-5 py-3 text-right tabular text-ink-muted">{d.count}</td>
                      <td className="px-5 py-3 text-right">
                        <Link href={d.href} className="text-xs font-semibold text-navy-600 dark:text-cyan-300">Open</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-5">
              <div className="card p-5">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <AlertTriangle className="h-4 w-4 text-signal-amber" aria-hidden /> Editorial rules enforced
                </p>
                <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" aria-hidden /> No composite "best college" score is computed anywhere.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" aria-hidden /> Every salary and fee is a range with population or estimate note.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" aria-hidden /> Placement figures always carry population and methodology.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" aria-hidden /> Missing values render as "Not recorded" rather than an estimate.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" aria-hidden /> Seed records are flagged with a demo source and a verify notice.</li>
                </ul>
              </div>

              <div className="card p-5">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <Users className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Current session
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-faint">Profile</dt>
                    <dd className="font-medium text-ink dark:text-slate-100">{profile ? "Local student" : "Not set"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-faint">Onboarding</dt>
                    <dd className="font-medium text-ink dark:text-slate-100">Step complete</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-faint">Client-side role</dt>
                    <dd className="font-medium text-ink dark:text-slate-100">Data steward (read-only)</dd>
                  </div>
                </dl>
                <p className="mt-3 text-[11px] text-ink-faint">
                  This build has no server, so no privileged action exists to protect. The panel documents what a real
                  admin surface would expose.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------ Sources ------------------------------ */}
        {tab === "sources" && (
          <div className="card overflow-x-auto p-0">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <caption className="sr-only">Source registry</caption>
              <thead>
                <tr className="border-b border-hairline dark:border-hairline-dark">
                  {["Source", "Type", "Kind", "Published", "Confidence", "Link"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SOURCES.map((s) => (
                  <tr key={s.id} className="border-b border-hairline last:border-0 dark:border-hairline-dark">
                    <td className="px-5 py-3.5">
                      <span className="block font-medium text-ink dark:text-slate-100">{s.name}</span>
                      <span className="block text-xs text-ink-faint">{s.id}</span>
                    </td>
                    <td className="px-5 py-3.5 text-ink-muted">{SOURCE_TYPE_LABEL[s.type]}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={s.demo ? "amber" : "green"}>{s.demo ? "Demo" : "Official"}</Badge>
                    </td>
                    <td className="px-5 py-3.5 tabular text-ink-muted">
                      {s.publishedOn ? formatDate(s.publishedOn) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={s.demo ? "amber" : "blue"}>
                        {s.demo ? "Reported" : "Cross-checked"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-navy-600 dark:text-cyan-300">
                          Open <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      ) : (
                        <span className="text-xs text-ink-faint">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ------------------------------ Freshness ------------------------------ */}
        {tab === "records" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-5">
              <p className="font-semibold text-ink dark:text-slate-100">Confidence distribution (tuition facts)</p>
              <div className="mt-4 space-y-3">
                {confidenceBuckets.map(([conf, n]) => (
                  <div key={conf}>
                    <div className="flex items-baseline justify-between text-sm">
                      <ConfidenceBadge confidence={conf as never} />
                      <span className="tabular text-ink dark:text-slate-100">{n}</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-sunken dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-navy-500 via-violet-500 to-cyan-500"
                        style={{ width: `${(n / Math.max(1, feeFacts.length)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-ink-faint">
                Seed records are labelled reported by design — we never inflate a confidence label we can't support.
              </p>
            </div>

            <div className="card overflow-hidden">
              <div className="border-b border-hairline px-5 py-4 dark:border-hairline-dark">
                <p className="font-semibold text-ink dark:text-slate-100">Fee verification dates</p>
              </div>
              <ul className="max-h-[420px] divide-y divide-hairline overflow-y-auto dark:divide-hairline-dark">
                {feeFacts.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <Link href={f.href} className="min-w-0 flex-1 truncate text-sm text-ink hover:text-navy-600 dark:text-slate-100 dark:hover:text-cyan-300">
                      {f.name}
                    </Link>
                    <span className={`shrink-0 text-xs tabular ${isStale(f.verifiedOn) ? "text-signal-amber" : "text-ink-faint"}`}>
                      {formatDate(f.verifiedOn)}
                    </span>
                    {isStale(f.verifiedOn) && <Badge tone="amber">Stale</Badge>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ------------------------------ Audit ------------------------------ */}
        {tab === "audit" && (
          <div className="card overflow-x-auto p-0">
            {audit.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <History className="mx-auto h-6 w-6 text-ink-faint" aria-hidden />
                <p className="mt-3 text-sm font-medium text-ink dark:text-slate-100">No audit entries yet</p>
                <p className="mx-auto mt-1 max-w-md text-xs text-ink-muted">
                  Every document you tick, status you change and record you create gets an entry here with a timestamp,
                  actor and entity. Change something in the application tracker and it will appear.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <caption className="sr-only">Audit trail</caption>
                <thead>
                  <tr className="border-b border-hairline dark:border-hairline-dark">
                    {["Timestamp", "Actor", "Action", "Entity"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...audit].reverse().map((e) => (
                    <tr key={e.id} className="border-b border-hairline last:border-0 dark:border-hairline-dark">
                      <td className="px-5 py-3 tabular text-ink-muted">{formatDate(e.at)}</td>
                      <td className="px-5 py-3 text-ink dark:text-slate-100">{e.actor}</td>
                      <td className="px-5 py-3 text-ink dark:text-slate-100">{e.action}</td>
                      <td className="px-5 py-3 text-ink-muted">{e.entity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <div className="mt-6">
          <Note tone="warn">
            This panel is a transparency surface, not a moderation tool. In a production deployment it would sit behind
            server-side role checks — here, with no server, nothing is hidden because nothing is privileged.
          </Note>
        </div>
      </Section>
    </>
  );
}
