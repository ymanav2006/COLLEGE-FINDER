"use client";

import { useMemo, useState } from "react";
import { Search, Briefcase } from "lucide-react";
import { Btn, PageHeader, Section, EmptyState, Note } from "@/components/ui";
import { CareerCard } from "@/components/cards";
import { CAREERS } from "@/data/careers";
import { useAppStore } from "@/lib/store";
import { recommendCareers, type Ranked } from "@/lib/recommend";
import type { Career } from "@/lib/types";

export default function CareersPage() {
  const profile = useAppStore((s) => s.profile);
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("all");
  const [sort, setSort] = useState<"relevance" | "name">("relevance");

  const domains = useMemo(() => Array.from(new Set(CAREERS.map((c) => c.domain))).sort(), []);
  const ranked = useMemo(() => recommendCareers(profile, 500), [profile]);

  const results = useMemo(() => {
    let list: Ranked<Career>[] = ranked;
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((r) =>
        `${r.item.name} ${r.item.domain} ${r.item.blurb} ${r.item.skills.join(" ")} ${r.item.industries.join(" ")}`
          .toLowerCase()
          .includes(t),
      );
    }
    if (domain !== "all") list = list.filter((r) => r.item.domain === domain);
    const sorted = [...list];
    if (sort === "name") sorted.sort((a, b) => a.item.name.localeCompare(b.item.name));
    return sorted;
  }, [ranked, q, domain, sort]);

  return (
    <>
      <PageHeader
        eyebrow="Career counsellor"
        title={`${CAREERS.length} careers — what the work is actually like`}
        lede="Day-to-day responsibilities, entry routes, salary bands with methodology, progression, certification routes and international outlook. Salary is always a range, never a headline number."
        actions={
          <>
            <Btn href="/explore">Stream → Career explorer</Btn>
            <Btn href="/explore/outside-my-stream" variant="secondary">Outside my stream</Btn>
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
              placeholder="Search by role, skill or industry…"
              className="w-full rounded-full border border-hairline bg-white py-2.5 pl-10 pr-4 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              aria-label="Search careers"
            />
          </div>

          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            aria-label="Filter by domain"
            className="rounded-full border border-hairline bg-white px-4 py-2.5 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
          >
            <option value="all">All domains</option>
            {domains.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "relevance" | "name")}
            aria-label="Sort careers"
            className="rounded-full border border-hairline bg-white px-4 py-2.5 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
          >
            <option value="relevance">Best fit for me</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        <p className="mb-5 text-xs text-ink-faint">
          {results.length} result{results.length === 1 ? "" : "s"}
          {!profile && " — complete onboarding and each card shows the specific reason it appears"}
        </p>

        {results.length === 0 ? (
          <EmptyState
            title="Nothing matches that"
            body="Try a broader term — a domain like “Technology”, or a skill like “writing”."
            icon={<Briefcase className="h-6 w-6" aria-hidden />}
            action={<Btn onClick={() => { setQ(""); setDomain("all"); }}>Clear filters</Btn>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => <CareerCard key={r.item.id} ranked={r} />)}
          </div>
        )}

        <div className="mt-8">
          <Note>
            <strong>Salary figures are ranges with a stated methodology and population</strong> — never a guaranteed
            outcome, and never shown without a date. Where we don't hold reliable data, we say so instead of estimating.
          </Note>
        </div>
      </Section>
    </>
  );
}
