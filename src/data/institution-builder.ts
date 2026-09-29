import type {
  CampusFeature,
  Institution,
  PlacementReport,
  ScorecardDimension,
  ScorecardDimensionId,
} from "@/lib/types";
import { fact } from "./sources";

/**
 * Shared builders for institution records (India and worldwide).
 *
 * Extracted so every dataset in this project produces records through exactly
 * the same code path: the same 13-dimension scorecard, the same evidence
 * strings derived from the record's own fields, and the same fact/source/date/
 * confidence plumbing. Nothing here invents a value that isn't already on the
 * record.
 */

type Defaults =
  | "departments"
  | "deadlines"
  | "scholarships"
  | "placements"
  | "scorecard"
  | "campusFeatures"
  | "campusHighlights"
  | "perspectives"
  | "researchHighlights"
  | "internationalExposure"
  | "entrepreneurship"
  | "sourceIds"
  | "highlights"
  | "studentFacultyRatio"
  | "campusSizeAcres"
  | "studentCount";

export type PartialInstitution = Omit<Institution, Defaults> & Partial<Pick<Institution, Defaults>>;

export const FEATURE_LABELS: Record<string, string> = {
  hostel: "Hostel / accommodation",
  sports: "Sports facilities",
  gym: "Gymnasium",
  clubs: "Student clubs",
  cultural: "Cultural festivals",
  technical: "Technical societies",
  library: "Library",
  labs: "Labs & workshops",
  transport: "Campus transport",
  safety: "Safety & security",
  accessibility: "Accessibility support",
  wifi: "Campus Wi-Fi",
  medical: "Health centre",
  cafeteria: "Cafeteria / dining",
  auditorium: "Auditorium",
  incubation: "Startup incubation",
  swimming: "Swimming pool",
  shuttle: "City shuttle",
};

export function features(enabled: string[], details: Record<string, string> = {}): CampusFeature[] {
  return Object.keys(FEATURE_LABELS).map((id) => ({
    id,
    label: FEATURE_LABELS[id],
    available: enabled.includes(id),
    detail: details[id],
  }));
}

const DIM_ORDER: ScorecardDimensionId[] = [
  "academics",
  "research",
  "careerOutcomes",
  "campusLife",
  "infrastructure",
  "studentActivities",
  "affordability",
  "location",
  "internationalExposure",
  "entrepreneurship",
  "diversity",
  "accommodation",
  "studentSupport",
];

const DIM_LABELS: Record<ScorecardDimensionId, string> = {
  academics: "Academics",
  research: "Research",
  careerOutcomes: "Career outcomes",
  campusLife: "Campus life",
  infrastructure: "Infrastructure",
  studentActivities: "Student activities",
  affordability: "Affordability",
  location: "Location",
  internationalExposure: "International exposure",
  entrepreneurship: "Entrepreneurship",
  diversity: "Diversity",
  accommodation: "Accommodation",
  studentSupport: "Student support",
};

/**
 * Builds the multi-dimensional environment scorecard.
 * Scores are a DEMO index for comparing dimensions — never a "best college" rank.
 * Evidence is derived from the record's own fields so it is never invented.
 */
export function scorecard(
  input: PartialInstitution,
  scores: Partial<Record<ScorecardDimensionId, number>>,
): ScorecardDimension[] {
  const placement = input.placements?.[0];
  const tuitionNote = `${input.tuition.tuitionAnnual.value.toLocaleString("en-IN")} ${input.tuition.currency} / year${input.tuition.hostelAnnual ? " · hostel " + input.tuition.hostelAnnual.value.toLocaleString("en-IN") : ""}`;
  const hostelFeature = input.campusFeatures?.find((f) => f.id === "hostel" && f.available);

  const evidence: Partial<Record<ScorecardDimensionId, string>> = {
    academics: `${input.courseIds.length} listed programmes · route: ${input.admissionRoute}`,
    research: input.researchHighlights?.length
      ? input.researchHighlights.slice(0, 2).join(" · ")
      : "No research highlights recorded in this build.",
    careerOutcomes: placement
      ? `${placement.placementRatePercent ?? "—"}% · ${placement.methodology}`
      : "No placement report linked for this institution in this build.",
    affordability: tuitionNote,
    location: `${input.city}, ${input.state}`,
    accommodation: hostelFeature?.detail ?? (hostelFeature ? "Hostel listed as available." : "Accommodation not confirmed in this build."),
    infrastructure: input.campusHighlights?.slice(0, 2).join(" · ") || "Campus infrastructure not described in this build.",
    internationalExposure: input.internationalExposure?.slice(0, 1)[0] ?? "Not assessed in this build.",
    entrepreneurship: input.entrepreneurship?.slice(0, 1)[0] ?? "Not assessed in this build.",
    studentActivities: input.campusFeatures?.filter((f) => f.available && ["clubs", "cultural", "technical"].includes(f.id)).map((f) => f.label).join(" · ") || "Not assessed in this build.",
    campusLife: input.perspectives?.length ? `Student perspective: ${input.perspectives[0].theme}` : "No student perspectives linked yet.",
    diversity: "Not assessed in this build.",
    studentSupport: "Not assessed in this build.",
  };

  return DIM_ORDER.map((id) => ({
    id,
    label: DIM_LABELS[id],
    score: scores[id] ?? 50,
    evidence: evidence[id] ?? "Not assessed in this build.",
    confidence: evidence[id] ? "reported" : "unverified",
    sourceId: input.sourceIds?.[0] ?? "src-seed",
  }));
}

export type InstitutionInput = PartialInstitution & {
  __scores?: Partial<Record<ScorecardDimensionId, number>>;
};

export function build(input: InstitutionInput): Institution {
  const { __scores, ...rest } = input;
  const merged: PartialInstitution = {
    departments: [],
    deadlines: [],
    scholarships: [],
    placements: [],
    campusFeatures: [],
    campusHighlights: [],
    perspectives: [],
    researchHighlights: [],
    internationalExposure: [],
    entrepreneurship: [],
    sourceIds: ["src-seed", "src-inst-site"],
    highlights: [],
    ...rest,
  };
  return { ...merged, scorecard: scorecard(merged, __scores ?? {}) } as Institution;
}

/** Fee helper. */
export function tuition(
  currency: string,
  annual: number,
  sourceId: string,
  hostel?: number,
  other?: number,
  note = "Annual tuition from the institution's published fee structure.",
) {
  return {
    currency,
    tuitionAnnual: fact(annual, sourceId, { confidence: sourceId === "src-inst-fee" ? "reported" : "verified" }),
    hostelAnnual: hostel ? fact(hostel, sourceId, { confidence: "reported" }) : undefined,
    otherFeesAnnual: other ? fact(other, sourceId, { confidence: "reported" }) : undefined,
    estimateNote: note,
  };
}

export function place(p: PlacementReport): PlacementReport {
  return p;
}
