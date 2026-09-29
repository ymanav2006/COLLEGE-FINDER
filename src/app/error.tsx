"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RefreshCw, Home, MessageCircleQuestion, ArrowRight } from "lucide-react";
import { Btn } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a production build this is where an error reporter would go.
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-5 py-16 sm:px-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-signal-red-soft text-signal-red">
        <AlertOctagon className="h-6 w-6" aria-hidden />
      </span>

      <p className="mt-6 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Something broke</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink dark:text-slate-50">
        This page hit an error
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-muted dark:text-slate-400">
        Your saved items, deadlines and applications are stored separately in this browser, so nothing has been lost.
        Retrying usually clears a rendering fault; if it doesn't, the sections below are good places to pick back up.
      </p>

      {error.digest && (
        <p className="mt-3 text-xs text-ink-faint">
          Reference: <code className="rounded bg-surface-muted px-1.5 py-0.5 dark:bg-white/10">{error.digest}</code>
        </p>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        <Btn onClick={reset}>
          <RefreshCw className="h-4 w-4" aria-hidden /> Try again
        </Btn>
        <Btn href="/" variant="secondary">
          <Home className="h-4 w-4" aria-hidden /> Back home
        </Btn>
        <Btn href="/pathfinder" variant="ghost">
          <MessageCircleQuestion className="h-4 w-4" aria-hidden /> Ask Pathfinder
        </Btn>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { t: "Your dashboard", d: "Everything you've set up so far.", href: "/dashboard" },
          { t: "Saved items", d: "Your shortlist, untouched.", href: "/saved" },
          { t: "Deadline tracker", d: "Dates you're tracking.", href: "/tools/deadlines" },
        ].map((x) => (
          <Link key={x.t} href={x.href} className="card interactive-card p-5">
            <p className="flex items-center gap-1 font-semibold text-ink dark:text-slate-100">
              {x.t} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </p>
            <p className="mt-1.5 text-sm text-ink-muted">{x.d}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
