"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Coins, TriangleAlert, ExternalLink, ArrowRight, Route } from "lucide-react";
import { Btn, Badge, PageHeader, Section, EmptyState, Note } from "@/components/ui";
import { getCountry } from "@/data/countries";
import { TWINNING_MODES, TWINNING_ROUTES, type TwinningRoute } from "@/data/twinning";
import { formatINR, formatDate } from "@/lib/format";
import { useQueryParam } from "@/lib/use-query-param";

const COUNTRY_FILTER_ALL = "all";

export function TwinningExplorer() {
  const routeParam = useQueryParam("route");
  const [mode, setMode] = useState<string>("all");
  const [countryId, setCountryId] = useState<string>(COUNTRY_FILTER_ALL);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (routeParam) {
      const match = TWINNING_ROUTES.find((r) => r.slug === routeParam || r.id === routeParam);
      if (match) {
        setOpenId(match.id);
        setMode("all");
        setCountryId(COUNTRY_FILTER_ALL);
        setQ("");
      }
    }
  }, [routeParam]);

  const countriesUsed = useMemo(
    () => Array.from(new Set(TWINNING_ROUTES.map((r) => r.countryId))),
    [],
  );

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return TWINNING_ROUTES.filter((r) => {
      if (mode !== "all" && r.mode !== mode) return false;
      if (countryId !== COUNTRY_FILTER_ALL && r.countryId !== countryId) return false;
      if (t && !`${r.title} ${r.field} ${r.summary} ${getCountry(r.countryId)?.name ?? ""}`.toLowerCase().includes(t)) {
        return false;
      }
      return true;
    });
  }, [mode, countryId, q]);

  const selected = results.find((r) => r.id === openId) ?? null;

  const reset = () => {
    setMode("all");
    setCountryId(COUNTRY_FILTER_ALL);
    setQ("");
  };

  return (
    <>
      <PageHeader
        eyebrow="Split-degree pathways"
        title="2+2 — two years in India, two years abroad"
        lede="A 2+2 route means you complete the first two years at an institution in India, then transfer into the final two years abroad and earn the foreign degree. This page covers how each structure works, what it costs on both legs, how credit transfer really happens, and where to verify the current agreement."
        actions={
          <>
            <Btn href="/universities">Browse universities</Btn>
            <Btn href="/abroad/search" variant="secondary">Search abroad opportunities</Btn>
          </>
        }
      />

      <Section wide>
        {/* ---------------------------- Explainers ---------------------------- */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">What “2+2” means</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
              Two academic years in India, then direct entry to year three of a four-year degree abroad. You graduate
              with the foreign award — the first two years appear as credited study, not as a separate qualification
              unless the Indian institution issues one.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Why students do it</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
              Roughly half the foreign fee and half the foreign living cost, spent in India instead. Same final
              credential on the certificate, about half the exposure in the bank account.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">What can break it</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
              Credit transfer is an institutional decision, not a right. If the modules don't map or your marks fall
              below the threshold in the agreement, you repeat a year instead of transferring into one.
            </p>
          </div>
        </div>

        {/* ------------------------------ Controls ------------------------------ */}
        <div className="card mb-6 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-faint" aria-hidden />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by field, country or structure…"
                aria-label="Search pathways"
                className="w-full rounded-xl border border-hairline bg-white py-2.5 pl-10 pr-4 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
              Destination
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="rounded-full border border-hairline bg-white px-4 py-2 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              >
                <option value={COUNTRY_FILTER_ALL}>Anywhere</option>
                {countriesUsed.map((id) => (
                  <option key={id} value={id}>{getCountry(id)?.name ?? id}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setMode("all")}
              aria-pressed={mode === "all"}
              className={`chip border ${mode === "all" ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950" : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"}`}
            >
              All structures
            </button>
            {TWINNING_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                aria-pressed={mode === m.id}
                title={m.blurb}
                className={`chip border ${mode === m.id ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950" : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"}`}
              >
                {m.label}
              </button>
            ))}
            <span className="self-center text-xs text-ink-faint">
              {mode === "all" ? "Every recorded structure" : TWINNING_MODES.find((m) => m.id === mode)?.blurb}
            </span>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink dark:text-slate-100">
            {results.length} pathway{results.length === 1 ? "" : "s"}
          </p>
          <button onClick={reset} className="text-xs font-medium text-navy-600 dark:text-cyan-300">
            Reset filters
          </button>
        </div>

        {results.length === 0 ? (
          <EmptyState
            title="No pathway matches that"
            body="This build records a curated set of split-degree patterns. Try clearing the structure filter, or search for a country name instead."
            icon={<Route className="h-6 w-6" aria-hidden />}
            action={<Btn onClick={reset}>Clear filters</Btn>}
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {results.map((r) => (
              <PathwayCard
                key={r.id}
                route={r}
                open={selected?.id === r.id}
                onToggle={() => setOpenId((cur) => (cur === r.id ? null : r.id))}
              />
            ))}
          </div>
        )}

        <div className="mt-8">
          <Note tone="warn">
            <strong>These are pathway patterns, not signed partnerships.</strong> A 2+2 exists only where a specific
            Indian institution and a specific foreign institution hold a current articulation agreement for your exact
            programme. Never pay a deposit on the assumption that one exists — ask both institutions for the written
            agreement first.
          </Note>
        </div>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Card + expanded detail                                              */
/* ------------------------------------------------------------------ */

function PathwayCard({ route, open, onToggle }: { route: TwinningRoute; open: boolean; onToggle: () => void }) {
  const country = getCountry(route.countryId);
  const india = rangeTotal(route.indiaCost.value, route.indiaLeg.years);
  const abroad = rangeTotal(route.abroadCost.value, route.abroadLeg.years);
  const fullAbroad = rangeTotal(route.abroadCost.value, route.totalYears);
  const pathway = { min: india.min + abroad.min, max: india.max + abroad.max };
  const saving = { min: Math.max(0, fullAbroad.min - pathway.max), max: Math.max(0, fullAbroad.max - pathway.min) };

  return (
    <div className="card flex flex-col p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{route.mode}</Badge>
        <Badge tone="blue">{country?.flag} {country?.name}</Badge>
        <span className="text-[11px] text-ink-faint">{route.field}</span>
      </div>

      <h2 className="mt-3 text-lg font-semibold text-ink dark:text-slate-50">{route.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{route.summary}</p>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-surface-muted p-3 dark:bg-white/5">
          <p className="text-lg font-semibold tabular text-ink dark:text-slate-50">{route.indiaLeg.years}</p>
          <p className="text-[10px] uppercase tracking-wide text-ink-faint">Years in India</p>
        </div>
        <div className="rounded-xl bg-surface-muted p-3 dark:bg-white/5">
          <p className="text-lg font-semibold tabular text-ink dark:text-slate-50">{route.abroadLeg.years}</p>
          <p className="text-[10px] uppercase tracking-wide text-ink-faint">Years abroad</p>
        </div>
        <div className="rounded-xl bg-surface-muted p-3 dark:bg-white/5">
          <p className="text-lg font-semibold tabular text-ink dark:text-slate-50">{route.totalYears}</p>
          <p className="text-[10px] uppercase tracking-wide text-ink-faint">Total years</p>
        </div>
      </div>

      {/* --------------------------- Cost compare --------------------------- */}
      <div className="mt-4 rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
          <Coins className="h-3.5 w-3.5" aria-hidden /> Cost of both routes (indicative, full programme)
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-muted">
              {route.mode} pathway ({route.indiaLeg.years} yr India + {route.abroadLeg.years} yr {country?.name})
            </dt>
            <dd className="font-semibold tabular text-ink dark:text-slate-100">
              {formatINR(pathway.min)} – {formatINR(pathway.max)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-muted">All {route.totalYears} years abroad instead</dt>
            <dd className="font-semibold tabular text-ink dark:text-slate-100">
              {formatINR(fullAbroad.min)} – {formatINR(fullAbroad.max)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-hairline pt-2 dark:border-hairline-dark">
            <dt className="text-signal-green">Plausible difference</dt>
            <dd className="font-semibold tabular text-signal-green">
              {saving.min === saving.max && saving.min === 0
                ? "No difference at this fee level"
                : `${formatINR(saving.min)} – ${formatINR(saving.max)} less`}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
          Calculated from the annual ranges on this record: {formatINR(route.indiaCost.value.minINR)}–
          {formatINR(route.indiaCost.value.maxINR)}/yr in India versus{" "}
          {formatINR(route.abroadCost.value.minINR)}–{formatINR(route.abroadCost.value.maxINR)}/yr abroad. Tuition and
          fees only unless the record says otherwise; living costs are shown in the detail below.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={onToggle}
          aria-expanded={open}
          className="text-sm font-semibold text-navy-600 dark:text-cyan-300"
        >
          {open ? "Hide pathway detail" : "Know more about this pathway"}
        </button>
        <Btn href="/tools/budget" size="sm" variant="secondary">
          Plan the cost
        </Btn>
      </div>

      {open && <PathwayDetail route={route} />}
    </div>
  );
}

function PathwayDetail({ route }: { route: TwinningRoute }) {
  const country = getCountry(route.countryId);

  return (
    <div className="mt-4 space-y-4 border-t border-hairline pt-4 dark:border-hairline-dark">
      <Detail title={`${route.indiaLeg.years} years in India`}>
        <p>{route.indiaLeg.where}</p>
        <p className="mt-2"><strong>Award:</strong> {route.indiaLeg.award}</p>
        <p className="mt-2 text-xs text-ink-muted">{route.indiaCost.value.note}</p>
        <p className="mt-1 text-xs font-semibold text-ink dark:text-slate-100">
          ≈ {formatINR(route.indiaCost.value.minINR)} – {formatINR(route.indiaCost.value.maxINR)} per year
        </p>
      </Detail>

      <Detail title={`${route.abroadLeg.years} years abroad — ${country?.name ?? "destination"}`}>
        <p>{route.abroadLeg.where}</p>
        <p className="mt-2"><strong>Award:</strong> {route.abroadLeg.award}</p>
        <p className="mt-2 text-xs text-ink-muted">{route.abroadCost.value.note}</p>
        <p className="mt-1 text-xs font-semibold text-ink dark:text-slate-100">
          ≈ {formatINR(route.abroadCost.value.minINR)} – {formatINR(route.abroadCost.value.maxINR)} per year
        </p>
        {country && (
          <p className="mt-2 text-xs text-ink-muted">
            Living cost in {country.name}: {country.livingRange.value} · last checked {formatDate(country.lastVerified)}
          </p>
        )}
      </Detail>

      <Detail title="How credit transfer works here">
        <p>{route.creditTransfer}</p>
      </Detail>

      <Detail title="Entry requirements">
        <ul>{route.entryRequirements.map((r) => <li key={r} className="mb-1.5">• {r}</li>)}</ul>
      </Detail>

      <Detail title="What can go wrong" warn>
        <ul>{route.typicalRisks.map((r) => <li key={r} className="mb-1.5">• {r}</li>)}</ul>
      </Detail>

      <Detail title="Verify before you commit">
        <ul>{route.verifySteps.map((r) => <li key={r} className="mb-1.5">✓ {r}</li>)}</ul>
      </Detail>

      <div className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Typical timeline</p>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
          {route.timeline.map((t) => (
            <li key={t.label} className="flex flex-wrap items-baseline justify-between gap-2">
              <span>{t.label}</span>
              <span className="text-xs font-medium text-ink dark:text-slate-200">{t.window}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-ink-faint">Checked {formatDate(route.timeline[0]?.verifiedOn ?? "2026-08-20")}</p>
      </div>

      <div className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Official sources</p>
        <ul className="mt-3 space-y-2">
          {route.officialSources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:underline dark:text-cyan-300"
              >
                {s.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">{route.outcome}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn href={`/abroad/${country?.slug ?? ""}`} size="sm" variant="secondary">
            {country?.name} country guide
          </Btn>
          <Btn href="/scholarships?country=international" size="sm" variant="secondary">
            Funding for this destination
          </Btn>
          <Link
            href="/universities"
            className="inline-flex items-center gap-1 self-center text-xs font-semibold text-navy-600 dark:text-cyan-300"
          >
            Universities <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Detail({
  title,
  warn,
  children,
}: {
  title: string;
  warn?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${warn ? "border-signal-amber/40 bg-signal-amber-soft" : "border-hairline dark:border-hairline-dark"}`}
    >
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
        {warn && <TriangleAlert className="h-3.5 w-3.5 text-signal-amber" aria-hidden />}
        {title}
      </p>
      <div className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{children}</div>
    </div>
  );
}

function rangeTotal(range: { minINR: number; maxINR: number }, years: number) {
  return { min: range.minINR * years, max: range.maxINR * years };
}
