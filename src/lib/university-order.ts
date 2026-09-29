import { ABROAD_INSTITUTIONS, INDIA_INSTITUTIONS, INSTITUTIONS } from "@/data/colleges";
import { convertToINR } from "@/data/money";
import type { Institution, ScorecardDimensionId } from "@/lib/types";

/**
 * Ordering for the universities directory.
 *
 * The platform deliberately publishes no "best university" verdict. What it
 * does publish is a TRANSPARENT ordering: the arithmetic is written out below
 * and shown on the page itself, and every input is a scorecard dimension you
 * can open and read the evidence for. Change the sort and you change the
 * question being answered — which is the point.
 */

/** Weights used by the default "strongest overall" ordering. */
export const ORDER_WEIGHTS: { id: ScorecardDimensionId; weight: number; label: string }[] = [
  { id: "academics", weight: 0.4, label: "Academics" },
  { id: "research", weight: 0.3, label: "Research" },
  { id: "careerOutcomes", weight: 0.3, label: "Career outcomes" },
];

export type UniversityScope = "world" | "abroad" | "india";
export type UniversitySort =
  | "order"
  | "academics"
  | "research"
  | "career"
  | "affordability"
  | "tuition-asc"
  | "tuition-desc"
  | "name"
  | "country";

export const SCOPE_OPTIONS: { id: UniversityScope; label: string; blurb: string }[] = [
  { id: "world", label: "Worldwide", blurb: "Universities outside India first, then those in India" },
  { id: "abroad", label: "Abroad only", blurb: "Every tracked university outside India" },
  { id: "india", label: "India only", blurb: "The Indian institutions in this dataset" },
];

export const SORT_OPTIONS: { id: UniversitySort; label: string }[] = [
  { id: "order", label: "Strongest overall (our order)" },
  { id: "academics", label: "Academics dimension" },
  { id: "research", label: "Research dimension" },
  { id: "career", label: "Career outcomes dimension" },
  { id: "affordability", label: "Affordability dimension" },
  { id: "tuition-asc", label: "Tuition: low → high" },
  { id: "tuition-desc", label: "Tuition: high → low" },
  { id: "country", label: "Country A–Z" },
  { id: "name", label: "Name A–Z" },
];

/** The default ordering key, rounded to a whole number for display. */
export function standingScore(i: Institution): number {
  const dim = (id: ScorecardDimensionId) => i.scorecard.find((d) => d.id === id)?.score ?? 50;
  const total = ORDER_WEIGHTS.reduce((sum, w) => sum + w.weight * dim(w.id), 0);
  return Math.round(total);
}

/** Plain-language description of the formula, rendered next to the list. */
export const ORDER_FORMULA_TEXT = ORDER_WEIGHTS.map(
  (w) => `${Math.round(w.weight * 100)}% ${w.label.toLowerCase()}`,
).join(" + ");

export function tuitionINR(i: Institution): number {
  return convertToINR(i.tuition.tuitionAnnual.value, i.tuition.currency);
}

function dimScore(i: Institution, id: ScorecardDimensionId): number {
  return i.scorecard.find((d) => d.id === id)?.score ?? 0;
}

/** Scope → the two blocks, always abroad-first in the worldwide view. */
export function scopeBlocks(scope: UniversityScope): { key: "abroad" | "india"; label: string; items: Institution[] }[] {
  if (scope === "abroad") return [{ key: "abroad", label: "Universities outside India", items: ABROAD_INSTITUTIONS }];
  if (scope === "india") return [{ key: "india", label: "Institutions in India", items: INDIA_INSTITUTIONS }];
  return [
    { key: "abroad", label: "Universities outside India", items: ABROAD_INSTITUTIONS },
    { key: "india", label: "Institutions in India", items: INDIA_INSTITUTIONS },
  ];
}

function compareBy(sort: UniversitySort, a: Institution, b: Institution): number {
  switch (sort) {
    case "academics":
      return dimScore(b, "academics") - dimScore(a, "academics");
    case "research":
      return dimScore(b, "research") - dimScore(a, "research");
    case "career":
      return dimScore(b, "careerOutcomes") - dimScore(a, "careerOutcomes");
    case "affordability":
      return dimScore(b, "affordability") - dimScore(a, "affordability");
    case "tuition-asc":
      return tuitionINR(a) - tuitionINR(b);
    case "tuition-desc":
      return tuitionINR(b) - tuitionINR(a);
    case "country":
      return a.state.localeCompare(b.state) || a.name.localeCompare(b.name);
    case "name":
      return a.name.localeCompare(b.name);
    case "order":
    default: {
      const byStanding = standingScore(b) - standingScore(a);
      return byStanding !== 0 ? byStanding : a.name.localeCompare(b.name);
    }
  }
}

/**
 * Applies the selected sort inside each scope block. Blocks stay in dataset
 * order (abroad first) so the worldwide view always leads with universities
 * outside India, then local options — which is what the page promises.
 */
export function sortedBlocks(scope: UniversityScope, sort: UniversitySort): {
  key: "abroad" | "india";
  label: string;
  items: Institution[];
}[] {
  return scopeBlocks(scope).map((block) => ({
    ...block,
    items: [...block.items].sort((a, b) => compareBy(sort, a, b)),
  }));
}

/** Every tracked institution, in the default order — used by pickers and maps. */
export function universitiesDefaultOrder(): Institution[] {
  return [...INSTITUTIONS].sort((a, b) => compareBy("order", a, b));
}
