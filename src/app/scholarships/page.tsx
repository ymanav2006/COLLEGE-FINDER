"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Wallet, ExternalLink } from "lucide-react";
import { Btn, PageHeader, Section, EmptyState, Note, Badge, ConfidenceBadge, PageSkeleton } from "@/components/ui";
import { ScholarshipRow, SaveButton } from "@/components/cards";
import { SCHOLARSHIPS, SCHOLARSHIP_TYPES } from "@/data/scholarships";
import { STREAMS } from "@/data/streams";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import type { StreamId } from "@/lib/types";

function ScholarshipsPage() {
  const params = useSearchParams();
  const selectedSlug = params.get("s");
  const profile = useAppStore((s) => s.profile);

  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [stream, setStream] = useState<StreamId | "all">("all");
  const [country, setCountry] = useState("all");
  const [matchOnly, setMatchOnly] = useState(false);

  const countries = useMemo(
    () => Array.from(new Set(SCHOLARSHIPS.map((s) => s.countryId))).sort(),
    [],
  );

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return SCHOLARSHIPS.filter((s) => {
      if (t && !`${s.name} ${s.provider} ${s.eligibility} ${s.types.join(" ")}`.toLowerCase().includes(t)) return false;
      if (type !== "all" && !s.types.includes(type as never)) return false;
      if (stream !== "all" && !s.streams.includes(stream)) return false;
      if (country !== "all" && s.countryId !== country) return false;
      if (matchOnly && profile?.stream && !s.streams.includes(profile.stream)) return false;
      return true;
    });
  }, [q, type, stream, country, matchOnly, profile]);

  const featured = selectedSlug ? SCHOLARSHIPS.find((s) => s.slug === selectedSlug) : undefined;

  useEffect(() => {
    if (featured && !document.getElementById(featured.id)) {
      // scroll handled below by anchor
    }
  }, [featured]);

  return (
    <>
      <PageHeader
        eyebrow="Scholarship finder"
        title={`${SCHOLARSHIPS.length} funding options with deadlines you can verify`}
        lede="Government, university, merit, need-based, sports, research, women's and international funding. Each record shows what it covers, who qualifies, the deadline window and when we last checked it."
        actions={
          <>
            <Btn href="https://scholarships.gov.in" external>
              National Scholarship Portal <ExternalLink className="h-4 w-4" aria-hidden />
            </Btn>
            <Btn href="/tools/budget" variant="secondary">Fit it into a budget</Btn>
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
              placeholder="Search by name, provider or eligibility…"
              className="w-full rounded-full border border-hairline bg-white py-2.5 pl-10 pr-4 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              aria-label="Search scholarships"
            />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type" className="rounded-full border border-hairline bg-white px-4 py-2.5 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100">
            <option value="all">All types</option>
            {SCHOLARSHIP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={stream} onChange={(e) => setStream(e.target.value as StreamId | "all")} aria-label="Filter by stream" className="rounded-full border border-hairline bg-white px-4 py-2.5 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100">
            <option value="all">All streams</option>
            {STREAMS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Filter by country" className="rounded-full border border-hairline bg-white px-4 py-2.5 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100">
            <option value="all">All countries</option>
            {countries.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
          <label className="flex items-center gap-2 text-xs font-medium text-ink-muted dark:text-slate-300">
            <input type="checkbox" checked={matchOnly} onChange={(e) => setMatchOnly(e.target.checked)} className="h-4 w-4 accent-[#2450c7] dark:accent-[#3ad9ec]" />
            Only my stream
          </label>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Always apply via</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              An official portal or the institution's own aid office — never through an agent who asks for money.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Have ready before windows open</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Income certificate, mark sheets, bank details, ID and a scanned photograph.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Institutional aid</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Usually closes near your admission deadline, not the national portal's.
            </p>
          </div>
        </div>

        {featured && (
          <div id={featured.id} className="mb-8 rounded-3xl border-2 border-navy-300 bg-navy-50/60 p-5 dark:border-cyan-500/40 dark:bg-cyan-500/8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Badge tone="brand">Selected from your search</Badge>
                <h2 className="mt-2 text-lg font-semibold text-ink dark:text-slate-50">{featured.name}</h2>
                <p className="text-sm text-ink-muted">{featured.provider} · {featured.countryId.toUpperCase()}</p>
              </div>
              <SaveButton kind="scholarship" id={featured.id} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{featured.eligibility}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Mini label="Amount" value={featured.amount.value} />
              <Mini label="Deadline" value={featured.deadline.value} />
              <Mini label="Last checked" value={formatDate(featured.lastVerified)} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <ConfidenceBadge confidence={featured.confidence} />
              <Btn href={featured.applyUrl} external size="sm">
                Apply on the official site <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </Btn>
            </div>
          </div>
        )}

        <p className="mb-5 text-xs text-ink-faint">{results.length} result{results.length === 1 ? "" : "s"}</p>

        {results.length === 0 ? (
          <EmptyState
            title="No scholarship matches those filters"
            body="That doesn't mean funding doesn't exist — this build indexes a curated set. Try the official portal and your institution's aid office."
            icon={<Wallet className="h-6 w-6" aria-hidden />}
            action={<Btn onClick={() => { setQ(""); setType("all"); setStream("all"); setCountry("all"); setMatchOnly(false); }}>Clear filters</Btn>}
            secondaryAction={
              <Btn href="https://scholarships.gov.in" variant="secondary" external>
                Open NSP <ExternalLink className="h-4 w-4" aria-hidden />
              </Btn>
            }
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {results.map((s) => <ScholarshipRow key={s.id} s={s} />)}
          </div>
        )}

        <div className="mt-8">
          <Note tone="warn">
            Deadlines change every cycle and some schemes close without much notice. Treat every date here as a
            starting point and confirm it on the provider's official page before you start the application.
          </Note>
        </div>
      </Section>
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3 dark:bg-white/8">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink dark:text-slate-100">{value}</p>
    </div>
  );
}

export default function ScholarshipsRoute() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ScholarshipsPage />
    </Suspense>
  );
}
