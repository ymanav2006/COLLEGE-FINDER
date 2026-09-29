"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, GitBranch, Search, ExternalLink } from "lucide-react";
import { Btn, Badge, PageHeader, Section, EmptyState, Note } from "@/components/ui";
import { CROSS_STREAM_OPTIONS, STREAMS, getStream, type CrossPathway } from "@/data/streams";
import { useAppStore } from "@/lib/store";
import type { StreamId } from "@/lib/types";

const PATHWAY_META: Record<CrossPathway, { label: string; tone: "green" | "blue" | "amber"; hint: string }> = {
  direct: { label: "Direct route", tone: "green", hint: "No extra qualification needed — you can apply straight away." },
  additional: { label: "Additional study", tone: "blue", hint: "Do a bridge course, diploma or year of prerequisites first." },
  alternate: { label: "Alternate route", tone: "amber", hint: "A different entrance test or institution route gets you there." },
};

export default function OutsideMyStreamPage() {
  const profile = useAppStore((s) => s.profile);
  const [from, setFrom] = useState<StreamId | "all">(profile?.stream ?? "all");
  const [pathway, setPathway] = useState<CrossPathway | "all">("all");
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return CROSS_STREAM_OPTIONS.filter((c) => {
      if (from !== "all" && c.from !== from) return false;
      if (pathway !== "all" && c.pathway !== pathway) return false;
      if (t && !`${c.target} ${c.eligibility} ${c.requirements.join(" ")}`.toLowerCase().includes(t)) return false;
      return true;
    });
  }, [from, pathway, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof results>();
    for (const r of results) {
      const arr = map.get(r.from) ?? [];
      arr.push(r);
      map.set(r.from, arr);
    }
    return Array.from(map.entries());
  }, [results]);

  return (
    <>
      <PageHeader
        eyebrow="What Else Can I Become?"
        title="Your stream is a starting point, not a boundary"
        lede="Routes into psychology, law, design, business, computer science, journalism and more — from streams that aren't usually associated with them, with the real extra requirements spelled out."
        actions={
          <>
            <Btn href="/explore">Stream → Career explorer</Btn>
            <Btn href="/pathfinder" variant="secondary">Ask if a specific route works for you</Btn>
          </>
        }
      />

      <Section wide>
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {Object.entries(PATHWAY_META).map(([key, meta]) => (
            <div key={key} className="card p-5">
              <Badge tone={meta.tone}>{meta.label}</Badge>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{meta.hint}</p>
              <p className="mt-3 text-xs font-semibold text-ink-faint">
                {CROSS_STREAM_OPTIONS.filter((c) => c.pathway === key).length} routes in this build
              </p>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-faint" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Psychology, law, design, data science…"
              className="w-full rounded-full border border-hairline bg-white py-2.5 pl-10 pr-4 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              aria-label="Search cross-stream routes"
            />
          </div>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value as StreamId | "all")}
            aria-label="Coming from stream"
            className="rounded-full border border-hairline bg-white px-4 py-2.5 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
          >
            <option value="all">Coming from any stream</option>
            {STREAMS.map((s) => <option key={s.id} value={s.id}>Coming from {s.shortName}</option>)}
          </select>
          <select
            value={pathway}
            onChange={(e) => setPathway(e.target.value as CrossPathway | "all")}
            aria-label="Filter by pathway"
            className="rounded-full border border-hairline bg-white px-4 py-2.5 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
          >
            <option value="all">Any pathway type</option>
            <option value="direct">Direct route</option>
            <option value="additional">Additional study</option>
            <option value="alternate">Alternate route</option>
          </select>
        </div>

        <div className="mb-6">
          <Note>
            Every route here shows the <strong>extra requirements</strong> rather than pretending switching is free.
            “Direct” means no extra qualification — not that admission is easy.
          </Note>
        </div>

        {results.length === 0 ? (
          <EmptyState
            title="No route matches that"
            body="This build seeds a curated set of cross-stream routes. Try clearing the stream filter, or ask Pathfinder about your specific case."
            icon={<GitBranch className="h-6 w-6" aria-hidden />}
            action={<Btn onClick={() => { setQ(""); setFrom("all"); setPathway("all"); }}>Clear filters</Btn>}
            secondaryAction={<Btn href="/pathfinder" variant="secondary">Ask Pathfinder</Btn>}
          />
        ) : (
          <div className="space-y-10">
            {grouped.map(([streamId, items]) => {
              const s = getStream(streamId as StreamId);
              return (
                <div key={streamId}>
                  <div className="mb-4 flex flex-wrap items-baseline gap-3">
                    <h2 className="text-xl font-semibold text-ink dark:text-slate-50">
                      From {s?.name ?? streamId.toUpperCase()}
                    </h2>
                    <span className="text-sm text-ink-faint">{items.length} route{items.length === 1 ? "" : "s"}</span>
                    <Link href={`/explore#${streamId}`} className="text-sm font-semibold text-navy-600 dark:text-cyan-300">
                      Stream overview →
                    </Link>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {items.map((c) => (
                      <article key={`${c.from}-${c.target}`} className="card flex flex-col p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-semibold text-ink dark:text-slate-50">{c.target}</h3>
                          <Badge tone={PATHWAY_META[c.pathway].tone}>{PATHWAY_META[c.pathway].label}</Badge>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{c.eligibility}</p>

                        <div className="mt-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">What you'll need</p>
                          <ul className="mt-2 space-y-1.5 text-sm text-ink-muted dark:text-slate-300">
                            {c.requirements.map((r) => (
                              <li key={r} className="flex gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-400 dark:bg-cyan-400" aria-hidden />
                                {r}
                              </li>
                            ))}
                            {c.requirements.length === 0 && <li>Nothing extra recorded in this build.</li>}
                          </ul>
                        </div>

                        {c.entranceExams.length > 0 && (
                          <p className="mt-3 text-sm text-ink dark:text-slate-200">
                            <span className="font-semibold">Entrance:</span> {c.entranceExams.join(", ")}
                          </p>
                        )}

                        <div className="mt-3 rounded-xl bg-surface-muted p-3 dark:bg-white/5">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Preparation</p>
                          <p className="mt-1 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{c.preparation}</p>
                        </div>

                        {c.colleges.length > 0 && (
                          <div className="mt-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Where to look</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {c.colleges.slice(0, 4).map((cl) => (
                                <Link
                                  key={cl}
                                  href={`/colleges?search=${encodeURIComponent(cl)}`}
                                  className="chip border border-hairline bg-white text-ink-muted hover:border-navy-400 hover:text-navy-600 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
                                >
                                  {cl}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {c.careers.length > 0 && (
                          <div className="mt-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Leads to</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {c.careers.slice(0, 4).map((cr) => (
                                <span key={cr} className="chip bg-surface-sunken text-ink-muted dark:bg-white/8 dark:text-slate-300">{cr}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-4 dark:border-hairline-dark">
                          <div className="flex flex-wrap gap-2">
                            {c.courseSlug && (
                              <Link href={`/courses/${c.courseSlug}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
                                Related course <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                              </Link>
                            )}
                            <Link href={`/pathfinder?q=${encodeURIComponent(`Can I study ${c.target} from ${s?.name ?? "another stream"}?`)}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-muted dark:text-slate-300">
                              Ask about it <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                            </Link>
                          </div>
                          {c.salaryNote && <span className="text-[11px] text-ink-faint">{c.salaryNote}</span>}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="font-semibold text-ink dark:text-slate-100">Still stuck?</p>
            <p className="mt-2 text-sm text-ink-muted">The Confusion Solver gives you several genuinely different routes.</p>
            <Link href="/confusion-solver" className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
              Open it <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <div className="card p-5">
            <p className="font-semibold text-ink dark:text-slate-100">Money first?</p>
            <p className="mt-2 text-sm text-ink-muted">Filter everything by what you can actually spend per year.</p>
            <Link href="/tools/afford" className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
              Budget check <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <div className="card p-5">
            <p className="font-semibold text-ink dark:text-slate-100">Plan a fallback</p>
            <p className="mt-2 text-sm text-ink-muted">A Plan B costs you nothing to write and everything not to.</p>
            <Link href="/tools/plan-b" className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
              Generate one <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
