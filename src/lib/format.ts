import { daysSince, getSource, isStale, SOURCE_TYPE_LABEL, CONFIDENCE_LABEL } from "@/data/sources";
import type { Confidence, Fact, Source } from "@/lib/types";

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatMoney(value: number, currency = "INR"): string {
  if (currency === "INR") {
    return `₹${value.toLocaleString("en-IN")}`;
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString("en-US")}`;
  }
}

/** Compact INR display used across cards: ₹4.5 lakh / ₹45,000 */
export function formatINR(value: number): string {
  if (value >= 100_000_000) return `₹${(value / 100_000_000).toFixed(value % 100_000_000 === 0 ? 0 : 1)} cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(value % 100_000 === 0 ? 0 : 1)} lakh`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(0)}k`;
  return `₹${value}`;
}

export interface SourceLine {
  source: Source;
  sourceTypeLabel: string;
  verifiedOn: string;
  confidence: Confidence;
  confidenceLabel: string;
  stale: boolean;
  ageDays: number;
  isDemo: boolean;
}

/** VALUE → SOURCE → DATE → CONFIDENCE, ready to render. */
export function sourceLine<T>(fact: Fact<T>): SourceLine {
  const source = getSource(fact.sourceId);
  const ageDays = daysSince(fact.verifiedOn);
  return {
    source,
    sourceTypeLabel: SOURCE_TYPE_LABEL[source.type],
    verifiedOn: fact.verifiedOn,
    confidence: fact.confidence,
    confidenceLabel: CONFIDENCE_LABEL[fact.confidence],
    stale: isStale(fact.verifiedOn),
    ageDays,
    isDemo: Boolean(source.demo),
  };
}

export const CONFIDENCE_COLOR: Record<Confidence, string> = {
  verified: "bg-signal-green-soft text-signal-green",
  "cross-checked": "bg-signal-blue-soft text-signal-blue",
  reported: "bg-signal-amber-soft text-signal-amber",
  unverified: "bg-signal-red-soft text-signal-red",
};

export function classOf(status: "likely" | "verify" | "not-eligible"): string {
  if (status === "likely") return "bg-signal-green-soft text-signal-green";
  if (status === "verify") return "bg-signal-amber-soft text-signal-amber";
  return "bg-signal-red-soft text-signal-red";
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
