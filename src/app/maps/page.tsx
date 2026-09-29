"use client";

import { useState } from "react";
import Link from "next/link";
import { Map as MapIcon, Globe2, ArrowRight, ExternalLink, Info } from "lucide-react";
import { Btn, Badge, PageHeader, Section, Note, EmptyState } from "@/components/ui";
import WorldMap from "@/components/WorldMap";
import IndiaMap from "@/components/IndiaMap";
import { COUNTRIES } from "@/data/countries";
import { INSTITUTIONS } from "@/data/colleges";
import { INDIAN_STATES, STATE_REGIONS } from "@/data/india-states";

type Tab = "world" | "india";

export default function MapsPage() {
  const [tab, setTab] = useState<Tab>("world");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const activeCountry = COUNTRIES.find((c) => c.slug === activeSlug);
  const stateInstitutions = selectedState
    ? INSTITUTIONS.filter(
        (i) => i.state === (INDIAN_STATES.find((s) => s.id === selectedState)?.name ?? ""),
      )
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Maps"
        title="See where your options actually are"
        lede="Two views: the study destinations this build tracks across the world, and where in India the tracked institutions sit. Distance is a real cost — better to see it early."
        actions={
          <>
            <Btn href="/colleges">Filter by location</Btn>
            <Btn href="/abroad" variant="secondary">Country guides</Btn>
          </>
        }
      />

      <Section wide>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex gap-2" role="tablist" aria-label="Choose a map view">
            {(
              [
                { id: "world" as Tab, label: "World destinations", icon: Globe2 },
                { id: "india" as Tab, label: "India", icon: MapIcon },
              ]
            ).map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-navy-600 text-white dark:bg-cyan-500 dark:text-navy-950"
                    : "border border-hairline bg-white text-ink-muted hover:border-navy-300 dark:border-hairline-dark dark:bg-white/5 dark:text-slate-300"
                }`}
              >
                <t.icon className="h-4 w-4" aria-hidden /> {t.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex flex-wrap gap-2">
            <Badge tone="brand">{COUNTRIES.length} destinations</Badge>
            <Badge tone="blue">{INSTITUTIONS.length} institutions</Badge>
            <Badge tone="neutral">{INDIAN_STATES.length} Indian states mapped</Badge>
          </div>
        </div>

        {tab === "world" ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="card overflow-hidden p-4 sm:p-6">
              <WorldMap activeSlug={activeSlug ?? undefined} onSelect={(s) => setActiveSlug(s)} showIndiaMarkers />
            </div>

            <aside className="space-y-5">
              {!activeCountry ? (
                <div className="card p-5">
                  <p className="font-semibold text-ink dark:text-slate-100">Pick a destination</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    Click any highlighted country or marker to see its tuition range, living costs, visa notes, work
                    rights and post-study options.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {COUNTRIES.slice(0, 6).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveSlug(c.slug)}
                        className="chip border border-hairline bg-white text-ink-muted hover:border-navy-400 hover:text-navy-600 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
                      >
                        <span aria-hidden className="mr-1">{c.flag}</span>
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-2xl" aria-hidden>{activeCountry.flag}</p>
                    <button
                      onClick={() => setActiveSlug(null)}
                      className="text-xs font-semibold text-navy-600 dark:text-cyan-300"
                    >
                      Clear
                    </button>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-ink dark:text-slate-50">{activeCountry.name}</h2>
                  <p className="text-sm text-ink-muted">{activeCountry.region}</p>

                  <dl className="mt-4 space-y-3 text-sm">
                    <Row label="Tuition" value={activeCountry.tuitionRange.value} />
                    <Row label="Living" value={activeCountry.livingRange.value} />
                    <Row label="Timeline" value={activeCountry.applicationTimeline} />
                    <Row label="Last checked" value={activeCountry.lastVerified} />
                  </dl>

                  <div className="mt-4 grid gap-2">
                    <Btn href={`/abroad/${activeCountry.slug}`} size="sm">Full country guide</Btn>
                    {activeCountry.officialSources[0] && (
                      <a
                        href={activeCountry.officialSources[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-hairline px-4 py-2 text-xs font-semibold text-ink-muted transition hover:border-navy-400 hover:text-navy-600 dark:border-hairline-dark dark:text-slate-300"
                      >
                        Official source <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="card p-5">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <Info className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> About this projection
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Natural Earth I 110m geometry — accurate enough for orientation, not for measuring distances. Country
                  positions on a flat map always distort area the further you move from the equator.
                </p>
              </div>
            </aside>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="card overflow-hidden p-4 sm:p-6">
              <IndiaMap selectedState={selectedState} onSelect={(s) => setSelectedState(s)} />
            </div>

            <aside className="space-y-5">
              {!selectedState ? (
                <>
                  <div className="card p-5">
                    <p className="font-semibold text-ink dark:text-slate-100">Pick a state</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      Marker size shows how many institutions from this build sit in that state. Click one to filter the
                      database to it.
                    </p>
                  </div>
                  <div className="card p-5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">By region</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {STATE_REGIONS.map((r) => {
                        const states = INDIAN_STATES.filter((s) => s.region === r);
                        const inst = INSTITUTIONS.filter((i) =>
                          states.some((s) => s.name === i.state),
                        ).length;
                        return (
                          <li key={r} className="flex items-center justify-between gap-3">
                            <span className="text-ink-muted dark:text-slate-300">{r}</span>
                            <span className="font-medium tabular text-ink dark:text-slate-100">{inst}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-3 text-[11px] text-ink-faint">
                      Counts reflect this curated dataset, not every institution in the country.
                    </p>
                  </div>
                </>
              ) : (
                <div className="card p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-lg font-semibold text-ink dark:text-slate-50">
                      {INDIAN_STATES.find((s) => s.id === selectedState)?.name}
                    </p>
                    <button onClick={() => setSelectedState(null)} className="text-xs font-semibold text-navy-600 dark:text-cyan-300">
                      Clear
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    {INDIAN_STATES.find((s) => s.id === selectedState)?.region} · capital{" "}
                    {INDIAN_STATES.find((s) => s.id === selectedState)?.capital}
                  </p>

                  <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                    {stateInstitutions.length} tracked here
                  </p>
                  {stateInstitutions.length === 0 ? (
                    <p className="mt-2 text-sm text-ink-muted">
                      Nothing from this state is in the curated set — absence here doesn't mean nothing exists.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {stateInstitutions.map((i) => (
                        <li key={i.id}>
                          <Link
                            href={`/colleges/${i.slug}`}
                            className="block rounded-xl border border-hairline px-4 py-3 text-sm transition hover:border-navy-400 dark:border-hairline-dark"
                          >
                            <span className="font-medium text-ink dark:text-slate-100">{i.name}</span>
                            <span className="mt-0.5 block text-xs text-ink-muted">{i.city}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4">
                    <Btn href={`/colleges?state=${encodeURIComponent(INDIAN_STATES.find((s) => s.id === selectedState)?.name ?? "")}`} size="sm">
                      Open filtered database <ArrowRight className="h-4 w-4" aria-hidden />
                    </Btn>
                  </div>
                </div>
              )}

              <div className="card p-5">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <Info className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Honest limits
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  This is a locator, not a boundary map. No state borders are drawn and no territorial claims are
                  implied. If you need accurate geography, use an official survey map.
                </p>
              </div>

              <Note>
                Distance matters in two ways: travel cost during the programme, and whether you can get home when
                something happens. Neither shows up in a tuition figure.
              </Note>
            </aside>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { t: "Filter colleges by state", d: "Apply this geography to the full database.", href: "/colleges" },
            { t: "Compare destinations", d: "Six country columns, same rows.", href: "/tools/compare?kind=country" },
            { t: "Study-abroad guides", d: "Visa, work rights and post-study options.", href: "/abroad" },
          ].map((x) => (
            <Link key={x.t} href={x.href} className="card interactive-card p-5">
              <p className="flex items-center gap-1 font-semibold text-ink dark:text-slate-100">
                {x.t} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </p>
              <p className="mt-1.5 text-sm text-ink-muted">{x.d}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
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
