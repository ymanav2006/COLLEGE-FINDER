"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  GraduationCap, Route, ArrowRight, Search, Clock, Wallet, Landmark, Microscope,
  Stethoscope, Scale, BookOpenCheck,
} from "lucide-react";
import {
  Btn, Badge, PageHeader, Section, Note, FactDisplay, StaleWarning, EmptyState, WhyList,
} from "@/components/ui";
import { HIGHER_STUDY_OPTIONS, HIGHER_FAMILIES, PATHWAY_SPINE, type HigherStudyOption } from "@/data/higher-studies";
import { fact, STALE_AFTER_DAYS } from "@/data/sources";
import { useAppStore } from "@/lib/store";
import { recommendCareers } from "@/lib/recommend";

const FAMILY_META: Record<HigherStudyOption["family"], { icon: typeof Landmark; tone: "brand" | "blue" | "green" | "amber" | "neutral" }> = {
  masters: { icon: Landmark, tone: "brand" },
  professional: { icon: Wallet, tone: "amber" },
  research: { icon: Microscope, tone: "blue" },
  medical: { icon: Stethoscope, tone: "green" },
  law: { icon: Scale, tone: "neutral" },
  education: { icon: BookOpenCheck, tone: "blue" },
};

export function HigherStudiesExplorer() {
  const profile = useAppStore((s) => s.profile);
  const careers = useMemo(() => recommendCareers(profile, 3), [profile]);

  const [family, setFamily] = useState<string>("all");
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return HIGHER_STUDY_OPTIONS.filter((o) => {
      if (family !== "all" && o.family !== family) return false;
      if (!needle) return true;
      return `${o.name} ${o.entrance} ${o.outcome} ${o.whoFor}`.toLowerCase().includes(needle);
    });
  }, [family, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, HigherStudyOption[]>();
    for (const o of visible) {
      const list = map.get(o.family) ?? [];
      list.push(o);
      map.set(o.family, list);
    }
    return HIGHER_FAMILIES.filter((f) => map.has(f.id)).map((f) => ({
      family: f,
      items: map.get(f.id) ?? [],
    }));
  }, [visible]);

  const staleCount = HIGHER_STUDY_OPTIONS.filter((o) => {
    const days = (Date.now() - Date.parse(o.lastVerified)) / 86_400_000;
    return days > STALE_AFTER_DAYS;
  }).length;

  return (
    <>
      <PageHeader
        eyebrow="Higher-education planner"
        title="What comes after the bachelor's degree"
        lede="Master's routes, professional credentials, research, medical, legal and teaching pathways — with the entrance exam each one asks for, what it costs, and the date each row was last checked."
        actions={
          <>
            <Btn href="/roadmap">Put it on the 5-Year Map</Btn>
            <Btn href="/pathfinder" variant="secondary">Ask about a specific route</Btn>
          </>
        }
      />

      <Section wide>
        {/* ------------------------------ Pathway spine ------------------------------ */}
        <div className="mb-8 card p-5 sm:p-6">
          <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
            <Route className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden />
            The spine most routes follow
          </p>
          <ol className="mt-4 flex flex-wrap items-center gap-2">
            {PATHWAY_SPINE.map((step, i) => (
              <li key={step.id} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-muted px-4 py-2 text-sm font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100">
                  <span className="text-[10px] font-bold text-ink-faint">{i + 1}</span>
                  {step.label}
                </span>
                {i < PATHWAY_SPINE.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-ink-faint" aria-hidden />
                )}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Plenty of people leave this spine and rejoin it later — a diploma, a gap year, work first. The order is
            conventional, not mandatory.
          </p>
        </div>

        {/* ------------------------------ Controls ------------------------------ */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-faint" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search routes or entrance exams"
              aria-label="Search higher study routes"
              className="w-full rounded-full border border-hairline bg-white py-2 pl-9 pr-4 text-sm text-ink outline-none focus:border-navy-400 sm:w-80 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFamily("all")}
              aria-pressed={family === "all"}
              className={`chip border ${family === "all"
                ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950"
                : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"}`}
            >
              All ({HIGHER_STUDY_OPTIONS.length})
            </button>
            {HIGHER_FAMILIES.map((f) => {
              const n = HIGHER_STUDY_OPTIONS.filter((o) => o.family === f.id).length;
              const Icon = FAMILY_META[f.id].icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setFamily(f.id)}
                  aria-pressed={family === f.id}
                  className={`chip border ${family === f.id
                    ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950"
                    : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"}`}
                >
                  <Icon className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
                  {f.label} ({n})
                </button>
              );
            })}
          </div>
        </div>

        {staleCount > 0 && (
          <div className="mb-6">
            <StaleWarning verifiedOn={HIGHER_STUDY_OPTIONS[0]?.lastVerified ?? ""} />
          </div>
        )}

        {/* ------------------------------ Results ------------------------------ */}
        {grouped.length === 0 ? (
          <EmptyState
            title="No route matches that search"
            body="This planner holds the common routes in this build's dataset. Try a broader term — or ask Pathfinder what it does know."
            icon={<GraduationCap className="h-6 w-6" aria-hidden />}
            action={<Btn onClick={() => { setQ(""); setFamily("all"); }}>Clear filters</Btn>}
          />
        ) : (
          <div className="space-y-10">
            {grouped.map((g) => {
              const Icon = FAMILY_META[g.family.id].icon;
              return (
                <div key={g.family.id}>
                  <div className="mb-4 flex flex-wrap items-baseline gap-3 border-b border-hairline pb-3 dark:border-hairline-dark">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-ink dark:text-slate-50">
                      <Icon className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden />
                      {g.family.label}
                    </h2>
                    <span className="text-xs text-ink-faint">{g.items.length} route{g.items.length === 1 ? "" : "s"}</span>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    {g.items.map((o) => (
                      <article key={o.id} className="card flex flex-col p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-ink dark:text-slate-50">{o.name}</h3>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
                              <Clock className="h-3 w-3" aria-hidden /> {o.duration}
                            </p>
                          </div>
                          <Badge tone={FAMILY_META[o.family].tone}>PG route</Badge>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{o.whoFor}</p>

                        <dl className="mt-4 space-y-2.5 text-sm">
                          <Row label="Entry requirement" value={o.requirement} />
                          <Row label="Cost note" value={o.costNote} />
                          <Row label="Where it leads" value={o.outcome} />
                        </dl>

                        <div className="mt-4">
                          <FactDisplay
                            compact
                            label="Entrance route"
                            fact={fact(o.entrance, o.sourceId, {
                              verifiedOn: o.lastVerified,
                              confidence: "reported",
                            })}
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <Badge tone="amber">Editorial synthesis</Badge>
                          <StaleWarning verifiedOn={o.lastVerified} className="text-[11px]" />
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ------------------------------ Connected ------------------------------ */}
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="card p-5">
            <p className="font-semibold text-ink dark:text-slate-100">Routes connected to your profile</p>
            <div className="mt-4 space-y-3">
              {careers.map((r) => (
                <div key={r.item.id} className="rounded-xl border border-hairline p-4 dark:border-hairline-dark">
                  <Link href={`/careers/${r.item.slug}`} className="text-sm font-medium text-ink dark:text-slate-100">
                    {r.item.name}
                  </Link>
                  <p className="mt-1 text-xs text-ink-muted">After graduation: {r.item.higherStudies.slice(0, 4).join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <WhyList
              reasons={[
                { kind: "neutral", text: "Routes are grouped by family, never ranked — there is no “best” postgraduate option." },
                { kind: "match", text: "Entrance exams shown are the commonly used ones, not a complete list of every institute test." },
                { kind: "uncertain", text: "Cost notes are ranges written by our editorial layer and labelled Reported — confirm on the institution's own fee document." },
              ]}
              cautions={[
                { kind: "blocker", text: "Passing an entrance exam is not the same as admission. Cut-offs move every cycle." },
              ]}
              title="How to read this page"
            />
          </div>
        </div>

        <div className="mt-8">
          <Note tone="warn">
            This planner describes possible routes. Nothing here guarantees a seat, a qualification, a job or a salary —
            each route still depends on you clearing its own requirements, and every requirement changes between cycles.
          </Note>
        </div>
      </Section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
      <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-faint sm:min-w-[140px]">
        {label}
      </dt>
      <dd className="flex-1 text-right text-sm text-ink dark:text-slate-200">{value}</dd>
    </div>
  );
}
