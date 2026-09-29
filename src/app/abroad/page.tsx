"use client";

import { useMemo, useState } from "react";
import { Globe2, Search } from "lucide-react";
import { Btn, PageHeader, Section, Note, Badge, EmptyState } from "@/components/ui";
import { CountryCard } from "@/components/cards";
import { COUNTRIES } from "@/data/countries";
import { formatINR, formatDate } from "@/lib/format";

const REGIONS = ["All", "Asia", "Europe", "North America", "Oceania", "Middle East"];

export default function AbroadPage() {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("All");

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return COUNTRIES.filter((c) => {
      if (region !== "All" && c.region !== region) return false;
      if (t && !`${c.name} ${c.region} ${c.popularFields.join(" ")}`.toLowerCase().includes(t)) return false;
      return true;
    });
  }, [q, region]);

  return (
    <>
      <PageHeader
        eyebrow="Study-abroad guide"
        title={`${COUNTRIES.length} countries, each with a last-verified date`}
        lede="Tuition and living ranges, application timelines, English and entrance tests, visa notes, work rights during study and post-study options — with official government and institution links for every claim."
        actions={
          <>
            <Btn href="/tools/compare?kind=country">Compare countries</Btn>
            <Btn href="/scholarships?country=international" variant="secondary">Funding for abroad</Btn>
          </>
        }
      />

      <Section wide>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-faint" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Country or field of study…"
              className="w-full rounded-full border border-hairline bg-white py-2.5 pl-10 pr-4 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              aria-label="Search countries"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                aria-pressed={region === r}
                className={`chip border ${
                  region === r
                    ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950"
                    : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">How to use this</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Treat every figure as a planning range. The exact number depends on the course, city and your lifestyle.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Visa reality</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Rules change with little notice. Always confirm on the official immigration site before booking anything.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Currency</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Ranges are shown in the local currency where possible, with approximate INR equivalents.
            </p>
          </div>
        </div>

        <p className="mb-5 text-xs text-ink-faint">{results.length} countr{results.length === 1 ? "y" : "ies"}</p>

        {results.length === 0 ? (
          <EmptyState
            title="No country matches that"
            body="This build tracks a curated set of 16 destinations. Try another region filter."
            icon={<Globe2 className="h-6 w-6" aria-hidden />}
            action={<Btn onClick={() => { setQ(""); setRegion("All"); }}>Clear filters</Btn>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((c) => <CountryCard key={c.id} c={c} />)}
          </div>
        )}

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="card p-6">
            <p className="font-semibold text-ink dark:text-slate-100">What every country record contains</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
              <li>• Tuition range and living costs, each a range with a source</li>
              <li>• Application timeline for the common intake</li>
              <li>• English tests and entrance tests used</li>
              <li>• Visa notes, work rights during study, post-study options</li>
              <li>• Scholarships commonly used by international students</li>
              <li>• Official sources with a last-verified date</li>
            </ul>
          </div>
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">Freshness</Badge>
              <span className="text-xs text-ink-faint">
                Oldest record in this set: {formatDate([...COUNTRIES].sort((a, b) => a.lastVerified.localeCompare(b.lastVerified))[0].lastVerified)}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Anything older than 180 days gets an automatic “information may have changed — verify before applying”
              warning wherever it appears.
            </p>
            <div className="mt-5">
              <Note tone="warn">
                We never promise a visa, an admission or a job. Immigration decisions rest with the relevant government
                and no platform can influence that.
              </Note>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
