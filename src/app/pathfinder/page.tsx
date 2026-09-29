"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles, Send, ArrowRight, ExternalLink, ShieldCheck, MessageCircleQuestion,
  RotateCcw, ChevronRight, Info,
} from "lucide-react";
import { Btn, Badge, ConfidenceBadge, Note, PageHeader, Section, EmptyState } from "@/components/ui";
import { askPathfinder, type PathfinderAnswer } from "@/lib/pathfinder";
import { SEARCH_SUGGESTIONS } from "@/lib/search";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/format";

const INTENT_LABEL: Record<string, string> = {
  eligibility: "Eligibility check",
  "after-course": "Where it leads",
  scholarship: "Funding",
  afford: "Affordability",
  abroad: "Study abroad",
  exam: "Entrance exam",
  compare: "Comparison",
  confused: "Confusion Solver",
  colleges: "College search",
  search: "Database search",
};

export default function PathfinderPage() {
  const profile = useAppStore((s) => s.profile);
  const rememberSearch = useAppStore((s) => s.rememberSearch);
  const searchHistory = useAppStore((s) => s.searchHistory);

  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<PathfinderAnswer | null>(null);
  const [asked, setAsked] = useState("");
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Deep link: /pathfinder?q=…
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("q");
    const initial = fromUrl ?? "";
    if (initial) {
      setInput(initial);
      run(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function run(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    setQ(trimmed);
    setAsked(trimmed);
    setAnswer(askPathfinder(trimmed, profile));
    rememberSearch(trimmed);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const history = useMemo(() => searchHistory.slice(0, 8), [searchHistory]);

  return (
    <>
      <PageHeader
        eyebrow="Pathfinder AI"
        title="Ask in plain language. Get an answer you can check."
        lede="Pathfinder retrieves from this platform's verified records and attaches citations to every claim. If the database has nothing, it says so — it will not invent a fee, a deadline or a placement figure."
        actions={
          <>
            <Btn href="/confusion-solver" variant="secondary">
              <MessageCircleQuestion className="h-4 w-4" aria-hidden /> I don't even know what to ask
            </Btn>
            <Btn href="/methodology" variant="ghost">
              <ShieldCheck className="h-4 w-4" aria-hidden /> How answers are built
            </Btn>
          </>
        }
      />

      <Section>
        <div className="mx-auto max-w-4xl">
          {/* ------------------------------ Composer ------------------------------ */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(input);
            }}
            className="card p-4 sm:p-5"
          >
            <label htmlFor="pathfinder-input" className="sr-only">
              Ask Pathfinder a question
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <textarea
                id="pathfinder-input"
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    run(input);
                  }
                }}
                placeholder='e.g. "Can I study computer science if I took commerce?"'
                className="w-full resize-none rounded-2xl border border-hairline bg-surface-muted px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-faint focus:border-navy-400 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              />
              <Btn type="submit" size="lg" disabled={!input.trim()} className="shrink-0">
                <Send className="h-4 w-4" aria-hidden /> Ask
              </Btn>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Try:</span>
              {SEARCH_SUGGESTIONS.slice(0, 5).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setInput(s); run(s); }}
                  className="rounded-full border border-hairline bg-white px-3 py-1.5 text-xs text-ink-muted transition hover:border-navy-300 hover:text-navy-600 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </form>

          {history.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Recent:</span>
              {history.map((h) => (
                <button
                  key={h}
                  onClick={() => { setInput(h); run(h); }}
                  className="rounded-full bg-surface-sunken px-3 py-1.5 text-xs text-ink-muted hover:text-ink dark:bg-white/8 dark:text-slate-300"
                >
                  {h}
                </button>
              ))}
            </div>
          )}

          {/* ------------------------------ Answer ------------------------------ */}
          {!answer && (
            <div className="mt-8">
              <EmptyState
                title="Ask anything about courses, careers, colleges, exams or funding"
                body="Answers are built from this platform's records with a citation attached. Where we hold no data, you'll be told plainly instead of given a guess."
                icon={<Sparkles className="h-6 w-6" aria-hidden />}
              />
            </div>
          )}

          {answer && (
            <div className="mt-8 space-y-5">
              {/* header */}
              <div className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{INTENT_LABEL[answer.intent] ?? "Answer"}</Badge>
                  <Badge tone="neutral">You asked: “{asked}”</Badge>
                  {profile && <Badge tone="green">Using your profile</Badge>}
                </div>

                <p className="mt-4 text-sm italic text-ink-muted">{answer.interpretation}</p>

                <p className="mt-3 text-lg leading-relaxed text-ink dark:text-slate-100">{answer.summary}</p>

                {answer.bullets.length > 0 && (
                  <ul className="mt-5 space-y-2.5">
                    {answer.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
                        <span
                          className={`mt-1 h-4 w-4 shrink-0 rounded-full text-center text-[9px] font-bold leading-4 ${
                            b.startsWith("✗")
                              ? "bg-signal-red-soft text-signal-red"
                              : b.startsWith("?")
                                ? "bg-signal-amber-soft text-signal-amber"
                                : b.startsWith("✓")
                                  ? "bg-signal-green-soft text-signal-green"
                                  : "bg-surface-sunken text-ink-faint dark:bg-white/10"
                          }`}
                          aria-hidden
                        >
                          {b.startsWith("✗") ? "✕" : b.startsWith("?") ? "?" : b.startsWith("✓") ? "✓" : "•"}
                        </span>
                        <span>{b.replace(/^[✓✗?]?\s*/, "")}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* citations */}
              {answer.citations.length > 0 && (
                <div className="card p-5">
                  <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> How we know this
                  </p>
                  <ul className="mt-4 space-y-3">
                    {answer.citations.map((c, i) => (
                      <li key={i} className="rounded-xl border border-hairline p-3.5 dark:border-hairline-dark">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-medium text-ink dark:text-slate-100">{c.label}</span>
                          {c.confidence && <ConfidenceBadge confidence={c.confidence} />}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
                          {c.verifiedOn && <span>Last checked {formatDate(c.verifiedOn)}</span>}
                          {c.href && (
                            <a
                              href={c.href}
                              target={c.href.startsWith("/") ? undefined : "_blank"}
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-navy-600 dark:text-cyan-300"
                            >
                              {c.href.startsWith("/") ? "Open record" : "Official source"}
                              <ExternalLink className="h-3 w-3" aria-hidden />
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* next steps + related */}
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="card p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Do this next</p>
                  <ul className="mt-3 space-y-2">
                    {answer.nextSteps.map((s) => (
                      <li key={s.href}>
                        <Link
                          href={s.href}
                          className="group flex items-center justify-between gap-3 rounded-xl border border-hairline px-4 py-3 text-sm text-ink transition hover:border-navy-400 dark:border-hairline-dark dark:text-slate-100"
                        >
                          {s.label}
                          <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint transition group-hover:translate-x-1" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Related records</p>
                  {answer.related.length === 0 ? (
                    <p className="mt-3 text-sm text-ink-muted">Nothing else matched closely enough to be useful.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {answer.related.map((r) => (
                        <li key={`${r.href}-${r.label}`}>
                          <Link
                            href={r.href}
                            className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition hover:bg-surface-muted dark:hover:bg-white/6"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-ink dark:text-slate-100">{r.label}</span>
                              {r.subtitle && <span className="block truncate text-xs text-ink-muted">{r.subtitle}</span>}
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint transition group-hover:translate-x-0.5" aria-hidden />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* disclaimer */}
              <div className="rounded-2xl border border-signal-amber/30 bg-signal-amber-soft p-4">
                <p className="flex items-start gap-2 text-sm leading-relaxed text-signal-amber">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{answer.disclaimer}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => { setAnswer(null); setQ(""); setInput(""); inputRef.current?.focus(); }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 dark:text-cyan-300"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden /> Ask something else
                </button>
                <span className="text-xs text-ink-faint">
                  Answers are deterministic retrieval over this build's dataset — no guessing, no fabricated statistics.
                </span>
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
