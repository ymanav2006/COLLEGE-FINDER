"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, ArrowRight, SearchX, History } from "lucide-react";
import { Btn, PageHeader, Section, EmptyState, Badge, Note } from "@/components/ui";
import { groupHits, search, parseQuery, SEARCH_SUGGESTIONS } from "@/lib/search";
import { useAppStore } from "@/lib/store";

export default function SearchPage() {
  const rememberSearch = useAppStore((s) => s.rememberSearch);
  const history = useAppStore((s) => s.searchHistory);

  const [input, setInput] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("q");
    if (fromUrl) {
      setInput(fromUrl);
      setQ(fromUrl);
      rememberSearch(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parsed = useMemo(() => (q ? parseQuery(q) : null), [q]);
  const hits = useMemo(() => (q.trim().length > 1 ? search(q, 60) : []), [q]);
  const groups = useMemo(() => groupHits(hits), [hits]);

  const chips = [
    parsed?.budgetLabel && { label: `Budget: ${parsed.budgetLabel}`, active: true },
    parsed?.countryId && { label: `Country: ${parsed.countryId.toUpperCase()}`, active: true },
    parsed?.stream && { label: `Stream: ${parsed.stream.toUpperCase()}`, active: true },
    parsed?.docType && { label: `Type: ${parsed.docType}`, active: true },
    parsed?.wantsAffordable && { label: "Affordable", active: true },
    parsed?.wantsResearch && { label: "Research-oriented", active: true },
    parsed?.wantsNearHome && { label: "Near home", active: true },
    parsed?.wantsAbroad && { label: "Abroad", active: true },
  ].filter(Boolean) as { label: string; active: boolean }[];

  return (
    <>
      <PageHeader
        eyebrow="Search everything"
        title="One box for courses, colleges, careers, exams, funding and countries"
        lede="Natural language works. Include a budget, a country or a stream and the query parser picks it up — then filters the results for you."
      />

      <Section>
        <div className="mx-auto max-w-5xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQ(input);
              if (input.trim()) rememberSearch(input.trim());
              window.history.replaceState(null, "", `/search?q=${encodeURIComponent(input.trim())}`);
            }}
            className="card p-4"
          >
            <label htmlFor="search-input" className="sr-only">Search everything</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-ink-faint" aria-hidden />
                <input
                  id="search-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='Computer Science colleges under ₹3 lakh in India'
                  className="w-full rounded-2xl border border-hairline bg-surface-muted py-3.5 pl-12 pr-4 text-[15px] text-ink outline-none focus:border-navy-400 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  autoFocus
                />
              </div>
              <Btn type="submit" size="lg" disabled={input.trim().length < 2}>Search</Btn>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {SEARCH_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setInput(s); setQ(s); rememberSearch(s); }}
                  className="rounded-full border border-hairline bg-white px-3 py-1.5 text-xs text-ink-muted transition hover:border-navy-300 hover:text-navy-600 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </form>

          {/* Detected filters */}
          {parsed && chips.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Parsed:</span>
              {chips.map((c) => (
                <Badge key={c.label} tone="brand">{c.label}</Badge>
              ))}
              {parsed.mentionsBest && (
                <span className="text-xs text-signal-amber">
                  You used the word “best” — we deliberately don't answer that. Tell us what to weigh instead.
                </span>
              )}
            </div>
          )}

          {/* Recent */}
          {!q && history.length > 0 && (
            <div className="mt-6 card p-5">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                <History className="h-3.5 w-3.5" aria-hidden /> Recent searches
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {history.map((h) => (
                  <button
                    key={h}
                    onClick={() => { setInput(h); setQ(h); }}
                    className="rounded-full bg-surface-sunken px-3.5 py-1.5 text-xs text-ink-muted hover:text-ink dark:bg-white/8 dark:text-slate-300"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {q && hits.length === 0 && (
            <div className="mt-8">
              <EmptyState
                title="Nothing in this build matches that"
                body="We only return records we actually hold. There's no fuzzy guesswork and no invented result — try a course name, an exam, a country or a career instead."
                icon={<SearchX className="h-6 w-6" aria-hidden />}
                action={<Btn href="/pathfinder">Ask Pathfinder instead</Btn>}
                secondaryAction={<Btn href="/colleges" variant="secondary">Browse colleges</Btn>}
              />
            </div>
          )}

          {hits.length > 0 && (
            <div className="mt-8 space-y-8">
              <p className="text-sm text-ink-muted">
                <strong className="text-ink dark:text-slate-100">{hits.length}</strong> result
                {hits.length === 1 ? "" : "s"} for “{q}”
              </p>

              {groups.map((g) => (
                <div key={g.type}>
                  <div className="mb-3 flex items-baseline gap-3">
                    <h2 className="text-lg font-semibold text-ink dark:text-slate-50">{g.label}</h2>
                    <span className="text-xs text-ink-faint">{g.hits.length}</span>
                  </div>
                  <ul className="divide-y divide-hairline rounded-2xl border border-hairline dark:divide-hairline-dark dark:border-hairline-dark">
                    {g.hits.map((h) => (
                      <li key={`${h.doc.type}-${h.doc.id}`}>
                        <Link
                          href={h.doc.href}
                          className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-surface-muted dark:hover:bg-white/5"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-[15px] font-medium text-ink group-hover:text-navy-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                              {h.doc.title}
                            </span>
                            <span className="mt-0.5 block truncate text-sm text-ink-muted">{h.doc.subtitle}</span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint transition group-hover:translate-x-1" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="flex flex-wrap gap-3">
                <Btn href={`/pathfinder?q=${encodeURIComponent(q)}`}>
                  Ask Pathfinder about this <ArrowRight className="h-4 w-4" aria-hidden />
                </Btn>
                <Btn href="/colleges" variant="secondary">Open full database</Btn>
              </div>
            </div>
          )}

          {!q && (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { t: "Colleges", d: "Location, academics, finances, campus life", href: "/colleges" },
                { t: "Careers", d: "Day-to-day work, routes in, salary bands", href: "/careers" },
                { t: "Funding", d: "Government, university, merit and need", href: "/scholarships" },
              ].map((x) => (
                <Link key={x.t} href={x.href} className="card interactive-card p-5">
                  <p className="font-semibold text-ink dark:text-slate-50">{x.t}</p>
                  <p className="mt-1.5 text-sm text-ink-muted">{x.d}</p>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Note>
              Search runs entirely in your browser over this build's dataset. Nothing you type is sent anywhere.
            </Note>
          </div>
        </div>
      </Section>
    </>
  );
}
