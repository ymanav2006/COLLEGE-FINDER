"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ChevronDown, Info, ExternalLink, AlertTriangle } from "lucide-react";
import { CONFIDENCE_HELP, getSource, isStale, daysSince, CONFIDENCE_LABEL, SOURCE_TYPE_LABEL } from "@/data/sources";
import type { Confidence, Fact } from "@/lib/types";
import { sourceLine, CONFIDENCE_COLOR, formatDate } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Small primitives                                                    */
/* ------------------------------------------------------------------ */

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "blue" | "brand";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-surface-sunken text-ink-muted dark:bg-white/8 dark:text-slate-300",
    green: "bg-signal-green-soft text-signal-green",
    amber: "bg-signal-amber-soft text-signal-amber",
    red: "bg-signal-red-soft text-signal-red",
    blue: "bg-signal-blue-soft text-signal-blue",
    brand: "bg-navy-50 text-navy-600 dark:bg-navy-500/15 dark:text-navy-200",
  };
  return <span className={`chip ${tones[tone]} ${className}`}>{children}</span>;
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span
      className={`chip ${CONFIDENCE_COLOR[confidence]}`}
      title={CONFIDENCE_HELP[confidence]}
    >
      {CONFIDENCE_LABEL[confidence]}
    </span>
  );
}

export function StaleWarning({ verifiedOn, className = "" }: { verifiedOn: string; className?: string }) {
  if (!isStale(verifiedOn)) return null;
  return (
    <p className={`flex items-start gap-2 rounded-xl bg-signal-amber-soft px-3 py-2 text-xs text-signal-amber ${className}`}>
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>
        Last checked {formatDate(verifiedOn)} ({daysSince(verifiedOn)} days ago). Information may have changed —
        verify before applying.
      </span>
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* VALUE → SOURCE → DATE → CONFIDENCE                                  */
/* ------------------------------------------------------------------ */

export interface FactDisplayProps<T> {
  fact: Fact<T>;
  label?: string;
  /** How to render the value. Defaults to String(). */
  render?: (value: T) => string;
  /** Optional inline note shown under the value. */
  note?: string;
  compact?: boolean;
}

/**
 * The canonical evidence affordance: every important number renders as
 * VALUE → SOURCE → DATE → CONFIDENCE with a "How We Know This" expander.
 */
export function FactDisplay<T>({ fact, label, render, note, compact = false }: FactDisplayProps<T>) {
  const line = sourceLine(fact);
  const source = line.source;

  return (
    <div className={compact ? "" : "rounded-2xl border border-hairline bg-surface-muted/60 p-4 dark:border-hairline-dark dark:bg-white/4"}>
      {label && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>}
      <p className="text-xl font-semibold tabular text-ink dark:text-slate-100">
        {render ? render(fact.value) : String(fact.value)}
      </p>
      {note && <p className="mt-1 text-xs text-ink-muted">{note}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="text-ink-faint">Source</span>
        {source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-navy-600 underline decoration-navy-300 underline-offset-2 hover:decoration-navy-600 dark:text-cyan-300"
          >
            {source.name}
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        ) : (
          <span className="font-medium text-ink dark:text-slate-200">{source.name}</span>
        )}
        <span className="text-ink-faint">·</span>
        <span className="text-ink-faint">{SOURCE_TYPE_LABEL[source.type]}</span>
        <span className="text-ink-faint">·</span>
        <span className="text-ink-faint">Checked {formatDate(fact.verifiedOn)}</span>
        <ConfidenceBadge confidence={fact.confidence} />
        {source.demo && <Badge tone="amber">Demo data</Badge>}
      </div>

      <details className="group mt-2">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[11px] font-semibold text-navy-600 dark:text-cyan-300">
          <Info className="h-3.5 w-3.5" aria-hidden />
          How We Know This
          <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="mt-2 space-y-1.5 rounded-xl bg-white/70 p-3 text-xs text-ink-muted dark:bg-white/5 dark:text-slate-300">
          <p>
            <strong className="text-ink dark:text-slate-100">Value:</strong>{" "}
            {render ? render(fact.value) : String(fact.value)}
          </p>
          <p>
            <strong className="text-ink dark:text-slate-100">Source:</strong> {source.name}
            {source.publishedOn ? ` · published ${formatDate(source.publishedOn)}` : ""}
          </p>
          <p>
            <strong className="text-ink dark:text-slate-100">Last verified:</strong> {formatDate(fact.verifiedOn)} (
            {daysSince(fact.verifiedOn)} days ago)
          </p>
          <p>
            <strong className="text-ink dark:text-slate-100">Confidence:</strong> {CONFIDENCE_LABEL[fact.confidence]} —{" "}
            {CONFIDENCE_HELP[fact.confidence]}
          </p>
          <p className="text-ink-faint">{line.isDemo ? "Demo/seed content — not verified production data." : ""}</p>
        </div>
      </details>
    </div>
  );
}

/** Lightweight one-line provenance under a plain value. */
export function Provenance({
  sourceId,
  verifiedOn,
  confidence,
  href,
}: {
  sourceId: string;
  verifiedOn: string;
  confidence: Confidence;
  href?: string;
}) {
  const source = getSource(sourceId);
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-faint">
      <span>Source:</span>
      {source.url || href ? (
        <a
          href={href ?? source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-navy-600 underline underline-offset-2 dark:text-cyan-300"
        >
          {source.name}
        </a>
      ) : (
        <span className="font-medium text-ink-muted dark:text-slate-300">{source.name}</span>
      )}
      <span>·</span>
      <span>{formatDate(verifiedOn)}</span>
      <ConfidenceBadge confidence={confidence} />
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Section / layout                                                    */
/* ------------------------------------------------------------------ */

export function Section({
  id,
  eyebrow,
  title,
  lede,
  actions,
  children,
  tone = "default",
  wide = false,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  tone?: "default" | "muted" | "dark";
  wide?: boolean;
}) {
  const bg =
    tone === "muted"
      ? "bg-surface-muted dark:bg-white/3"
      : tone === "dark"
        ? "bg-navy-900 text-white dark:bg-navy-950"
        : "";
  return (
    <section id={id} className={`section-pad ${bg}`}>
      <div className={`mx-auto px-5 sm:px-8 ${wide ? "max-w-[1440px]" : "max-w-7xl"}`}>
        {(eyebrow || title || lede || actions) && (
          <header className="mb-10 max-w-3xl">
            {eyebrow && (
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-navy-500 dark:text-cyan-400">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                className={`text-2xl font-semibold leading-tight sm:text-3xl ${
                  tone === "dark" ? "text-white" : "text-ink dark:text-slate-50"
                }`}
              >
                {title}
              </h2>
            )}
            {lede && (
              <p
                className={`mt-3 text-base leading-relaxed ${
                  tone === "dark" ? "text-navy-200" : "text-ink-muted dark:text-slate-400"
                }`}
              >
                {lede}
              </p>
            )}
            {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons / links                                                     */
/* ------------------------------------------------------------------ */

type BtnProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  external?: boolean;
  ariaLabel?: string;
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

const BTN_VARIANTS: Record<string, string> = {
  primary:
    "bg-navy-600 text-white shadow-[0_10px_30px_-12px_rgba(36,80,199,0.9)] hover:bg-navy-700 hover:-translate-y-0.5 dark:bg-cyan-500 dark:text-navy-950 dark:hover:bg-cyan-400",
  secondary:
    "border border-hairline bg-white text-ink hover:border-navy-400 hover:text-navy-600 dark:border-hairline-dark dark:bg-white/5 dark:text-slate-100 dark:hover:border-cyan-400 dark:hover:text-cyan-300",
  ghost:
    "text-ink-muted hover:bg-surface-sunken hover:text-ink dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white",
  danger: "bg-signal-red text-white hover:brightness-95",
};

const BTN_SIZES: Record<string, string> = {
  sm: "px-3.5 py-2 text-[13px]",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-[15px]",
};

export function Btn({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled,
  external,
  ariaLabel,
}: BtnProps) {
  const cls = `${BTN_BASE} ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]} ${className}`;
  if (href) {
    if (external || href.startsWith("http")) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={ariaLabel}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Empty / error states                                                */
/* ------------------------------------------------------------------ */

export function EmptyState({
  title,
  body,
  icon,
  action,
  secondaryAction,
}: {
  title: string;
  body?: string;
  icon?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-sunken text-ink-faint dark:bg-white/8">
        {icon ?? <Info className="h-6 w-6" aria-hidden />}
      </div>
      <h3 className="text-lg font-semibold text-ink dark:text-slate-50">{title}</h3>
      {body && <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted dark:text-slate-400">{body}</p>}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

/**
 * Fallback used while a route that reads search params suspends during
 * prerender. Keeps the layout stable instead of flashing a blank page.
 */
export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8" aria-busy="true" aria-live="polite">
      <p className="sr-only">Loading…</p>
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-4 h-9 w-full max-w-xl" />
      <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
      <div className="mt-8 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Explainability: "Why you're seeing this"                            */
/* ------------------------------------------------------------------ */

export function WhyList({
  reasons,
  cautions,
  title = "Why you're seeing this",
  compact = false,
}: {
  reasons: readonly { kind: string; text: string }[];
  cautions?: readonly { kind: string; text: string }[];
  title?: string;
  compact?: boolean;
}) {
  const iconFor = (kind: string) => (kind === "blocker" ? "✕" : kind === "neutral" ? "•" : kind === "uncertain" ? "?" : "✓");
  const toneOf = (kind: string) =>
    kind === "blocker" ? "bg-signal-red-soft text-signal-red" : kind === "uncertain" ? "bg-signal-amber-soft text-signal-amber" : "bg-signal-green-soft text-signal-green";
  if (reasons.length === 0 && (!cautions || cautions.length === 0)) return null;
  return (
    <details open={false} className="group">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1.5 text-[11px] font-semibold text-navy-600 transition hover:border-navy-300 dark:border-hairline-dark dark:bg-white/6 dark:text-cyan-300">
        {title}
        <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <ul className={`mt-3 space-y-2 ${compact ? "text-xs" : "text-[13px]"}`}>
        {reasons.map((r, i) => (
          <li key={`r${i}`} className="flex gap-2 text-ink-muted dark:text-slate-300">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${toneOf(r.kind)}`}
              aria-hidden
            >
              {iconFor(r.kind)}
            </span>
            <span>{r.text}</span>
          </li>
        ))}
        {(cautions ?? []).map((r, i) => (
          <li key={`c${i}`} className="flex gap-2 text-signal-amber">
            <span className="mt-0.5 text-xs" aria-hidden>
              !
            </span>
            <span>{r.text}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
  breadcrumb,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <header className="border-b border-hairline bg-hero-mesh dark:border-hairline-dark">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        {breadcrumb}
        {eyebrow && (
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-navy-500 dark:text-cyan-400">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-ink sm:text-4xl dark:text-slate-50">
          {title}
        </h1>
        {lede && (
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted sm:text-lg dark:text-slate-400">
            {lede}
          </p>
        )}
        {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </header>
  );
}

export function Stat({ value, label, sub }: { value: ReactNode; label: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-5 dark:border-hairline-dark dark:bg-white/5">
      <p className="text-2xl font-semibold tabular text-ink dark:text-slate-50">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}

export function Note({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" | "risk" }) {
  const tones = {
    info: "border-navy-200 bg-navy-50 text-navy-800 dark:border-navy-500/30 dark:bg-navy-500/10 dark:text-navy-100",
    warn: "border-signal-amber/30 bg-signal-amber-soft text-signal-amber",
    risk: "border-signal-red/30 bg-signal-red-soft text-signal-red",
  };
  return (
    <div className={`flex gap-2.5 rounded-2xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
