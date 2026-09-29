import { CAREERS, getCareer } from "@/data/careers";
import { INSTITUTIONS, getInstitution } from "@/data/colleges";
import { COURSES, getCourse } from "@/data/courses";
import { convertToINR } from "@/data/money";
import { getCountry } from "@/data/countries";
import { INDIAN_STATES } from "@/data/india-states";
import { STREAM_MAP } from "@/data/streams";
import { assessCourse, assessInstitution, type EligibilityResult } from "@/lib/eligibility";
import { formatINR } from "@/lib/format";
import type { Career, Course, Institution, StudentProfile, StreamId } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Preferences                                                         */
/* ------------------------------------------------------------------ */

export const LOCATION_PREFERENCES = [
  "Any location",
  "North India",
  "South India",
  "East India",
  "West India",
  "Central India",
  "Northeast India",
  "Abroad",
] as const;

export type LocationPreference = (typeof LOCATION_PREFERENCES)[number];

const REGION_BY_STATE: Record<string, string> = Object.fromEntries(
  INDIAN_STATES.map((s) => [s.id, s.region]),
);

export function stateMatchesRegion(state: string, pref: string): boolean {
  if (pref === "Any location" || pref === "Abroad") return true;
  const entry = INDIAN_STATES.find(
    (s) => s.name.toLowerCase() === state.toLowerCase() || s.id.toLowerCase() === state.toLowerCase(),
  );
  const region = entry?.region ?? REGION_BY_STATE[state.toLowerCase()];
  if (!region) return false;
  const want = pref.replace(" India", "").toUpperCase();
  return region.toUpperCase() === want;
}

/* ------------------------------------------------------------------ */
/* Why you're seeing this                                             */
/* ------------------------------------------------------------------ */

export type WhyKind =
  | "stream"
  | "budget"
  | "location"
  | "type"
  | "eligibility"
  | "interest"
  | "score"
  | "saved"
  | "neutral";

export interface WhyReason {
  kind: WhyKind;
  text: string;
}

export interface Ranked<T> {
  item: T;
  score: number;
  reasons: WhyReason[];
  eligibility: EligibilityResult;
  /** Reasons that count against this option. */
  cautions: WhyReason[];
}

const STATE_LABEL: Record<string, string> = Object.fromEntries(
  INDIAN_STATES.map((s) => [s.name.toLowerCase(), s.region]),
);

function annualTuitionINR(inst: Institution): number {
  return convertToINR(inst.tuition.tuitionAnnual.value, inst.tuition.currency);
}

/* ------------------------------------------------------------------ */
/* Institution recommendations                                        */
/* ------------------------------------------------------------------ */

export interface RecommendOptions {
  limit?: number;
  includeAbroad?: boolean;
}

export function recommendInstitutions(
  profile: StudentProfile | null,
  options: RecommendOptions = {},
): Ranked<Institution>[] {
  const { limit = 24, includeAbroad } = options;
  const pref = profile?.locationPreference ?? "Any location";
  const abroad = includeAbroad ?? profile?.wantAbroad ?? false;

  const ranked = INSTITUTIONS.map((inst): Ranked<Institution> => {
    const reasons: WhyReason[] = [];
    const cautions: WhyReason[] = [];
    let score = 0;
    const eligibility = assessInstitution(inst, profile, getCourse);

    if (profile) {
      /* --- Stream / programme fit --- */
      const offeredCourses = inst.courseIds
        .map((id) => getCourse(id))
        .filter((c): c is Course => Boolean(c));

      if (profile.stream) {
        const matches = offeredCourses.filter(
          (c) => c.eligibility.streams.length === 0 || c.eligibility.streams.includes(profile.stream as StreamId),
        );
        if (matches.length > 0) {
          score += 30;
          reasons.push({
            kind: "stream",
            text: `Offers ${matches.length} programme(s) open to ${STREAM_MAP.get(profile.stream)?.name ?? profile.stream} students — e.g. ${matches
              .slice(0, 2)
              .map((c) => c.name)
              .join(", ")}.`,
          });
        } else {
          cautions.push({
            kind: "stream",
            text: "None of the programmes we track here are listed as open to your stream.",
          });
          score -= 20;
        }
      } else {
        reasons.push({ kind: "neutral", text: "Your stream isn't recorded yet, so stream fit isn't part of the score." });
      }

      /* --- Eligibility --- */
      if (eligibility.status === "likely") {
        score += 20;
        reasons.push({ kind: "eligibility", text: "Your profile meets every published requirement we track for its programmes." });
      } else if (eligibility.status === "verify") {
        score += 6;
        reasons.push({ kind: "eligibility", text: "One or more requirements still need verifying — see the eligibility panel." });
      } else {
        score -= 15;
        cautions.push({ kind: "eligibility", text: "A known requirement isn't currently satisfied by your profile." });
      }

      /* --- Budget --- */
      const budget = profile.budgetYearlyINR;
      const tuitionINR = annualTuitionINR(inst);
      if (budget && budget > 0) {
        if (tuitionINR <= budget) {
          score += 22;
          reasons.push({
            kind: "budget",
            text: `Annual tuition ${formatINR(tuitionINR)} sits inside your ${formatINR(budget)} yearly budget.`,
          });
        } else if (tuitionINR <= budget * 1.25) {
          score += 8;
          reasons.push({
            kind: "budget",
            text: `Annual tuition ${formatINR(tuitionINR)} is close to your ${formatINR(budget)} budget — it may still work with scholarships.`,
          });
          cautions.push({ kind: "budget", text: "Above your stated budget before scholarships or loans." });
        } else {
          score -= 12;
          cautions.push({
            kind: "budget",
            text: `Annual tuition ${formatINR(tuitionINR)} is above your ${formatINR(budget)} budget.`,
          });
        }
      }

      /* --- Institution type --- */
      const isPublic = inst.type === "public" || inst.type === "government" || inst.type === "government-aided";
      if (profile.preferPublic && isPublic) {
        score += 8;
        reasons.push({ kind: "type", text: "Public / government institution — you said you prefer public options." });
      }
      if (profile.privateAcceptable === false && !isPublic) {
        score -= 10;
        cautions.push({ kind: "type", text: "You told us private institutions aren't acceptable to you." });
      }

      /* --- Location --- */
      if (pref !== "Any location") {
        if (pref === "Abroad") {
          if (inst.countryId !== "in") {
            score += 18;
            reasons.push({ kind: "location", text: `Located in ${inst.city} — outside India, as you preferred.` });
          }
        } else if (stateMatchesRegion(inst.state, pref)) {
          score += 18;
          reasons.push({ kind: "location", text: `In ${inst.state}, which matches your ${pref} preference.` });
        } else if (inst.countryId === "in") {
          cautions.push({ kind: "location", text: `In ${inst.state} — outside your ${pref} preference.` });
          score -= 4;
        }
      }

      if (inst.countryId !== "in" && !abroad) {
        score -= 8;
        cautions.push({ kind: "location", text: "Outside India, and you haven't said you want to study abroad." });
      }

      /* --- Interest signals --- */
      if (profile.researchInterest >= 3 && inst.researchHighlights.length > 0) {
        score += 8;
        reasons.push({ kind: "interest", text: "Research highlights recorded — you rated research interest as high." });
      }
      if (profile.entrepreneurshipInterest >= 3 && inst.entrepreneurship.length > 0) {
        score += 6;
        reasons.push({ kind: "interest", text: "Entrepreneurship support on campus — matching your interest." });
      }

      /* --- Dimension evidence --- */
      const best = [...inst.scorecard].sort((a, b) => b.score - a.score).slice(0, 2);
      if (best.length > 0) {
        reasons.push({
          kind: "score",
          text: `Strongest recorded dimensions here: ${best.map((d) => `${d.label} (${d.score}/100)`).join(" and ")}. Evidence is shown beside each dimension on the profile.`,
        });
      }
    } else {
      score += 5;
      reasons.push({ kind: "neutral", text: "Complete onboarding and this card will explain exactly why it appears." });
    }

    return { item: inst, score: clampScore(score), reasons, cautions, eligibility };
  });

  ranked.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
  return ranked.slice(0, limit);
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n + 40)));
}

/* ------------------------------------------------------------------ */
/* Course recommendations                                             */
/* ------------------------------------------------------------------ */

export function recommendCourses(profile: StudentProfile | null, limit = 24): Ranked<Course>[] {
  const ranked = COURSES.map((course): Ranked<Course> => {
    const reasons: WhyReason[] = [];
    const cautions: WhyReason[] = [];
    let score = 0;
    const eligibility = assessCourse(course, profile);

    if (profile) {
      if (profile.stream && course.eligibility.streams.includes(profile.stream)) {
        score += 30;
        reasons.push({
          kind: "stream",
          text: `Designed for your ${STREAM_MAP.get(profile.stream)?.name ?? profile.stream} stream — you already meet the stream requirement.`,
        });
      } else if (profile.stream && course.eligibility.streams.length === 0) {
        score += 24;
        reasons.push({ kind: "stream", text: "Open to every stream, including yours." });
      } else if (profile.stream) {
        score -= 6;
        cautions.push({
          kind: "stream",
          text: `Listed for ${course.eligibility.streams.map((s) => s.toUpperCase()).join(", ")} — outside your stream, so you'd need the alternate pathway.`,
        });
      }

      if (eligibility.status === "likely") {
        score += 20;
        reasons.push({ kind: "eligibility", text: "All published eligibility requirements are satisfied by your profile." });
      } else if (eligibility.status === "verify") {
        score += 6;
        reasons.push({ kind: "eligibility", text: "Requirements mostly check out but one item needs verification." });
      } else {
        score -= 12;
        cautions.push({ kind: "eligibility", text: "A stated requirement isn't currently met — check alternate routes." });
      }

      const budget = profile.budgetYearlyINR;
      const costMid = (course.annualCost.value.minINR + course.annualCost.value.maxINR) / 2;
      if (budget && budget > 0) {
        if (course.annualCost.value.minINR <= budget) {
          score += 16;
          reasons.push({
            kind: "budget",
            text: `Annual cost starts at ${formatINR(course.annualCost.value.minINR)} — within your ${formatINR(budget)} budget.`,
          });
        } else {
          score -= 8;
          cautions.push({
            kind: "budget",
            text: `Annual cost starts at ${formatINR(course.annualCost.value.minINR)}, above your ${formatINR(budget)} budget.`,
          });
        }
        if (costMid > budget) {
          cautions.push({ kind: "budget", text: "The mid-point of the cost range exceeds your budget." });
        }
      }

      for (const interest of profile.interests) {
        if (course.industries.some((i) => i.toLowerCase().includes(interest.toLowerCase())) ||
            course.careerIds.some((c) => getCareer(c)?.name.toLowerCase().includes(interest.toLowerCase()))) {
          score += 8;
          reasons.push({ kind: "interest", text: `Connects to an interest you listed (${interest}).` });
          break;
        }
      }

      for (const fav of profile.favoriteSubjects) {
        if (course.coreSubjects.some((s) => s.toLowerCase().includes(fav.toLowerCase()))) {
          score += 6;
          reasons.push({ kind: "interest", text: `Includes ${fav}, one of your favourite subjects.` });
          break;
        }
      }

      if (profile.wantAbroad && course.studyAbroad.length > 0) {
        score += 6;
        reasons.push({ kind: "location", text: `Recognised for further study abroad in ${course.studyAbroad.map((s) => getCountry(s.country)?.name ?? s.country).slice(0, 3).join(", ")}.` });
      }
    } else {
      score += 5;
      reasons.push({ kind: "neutral", text: "Add your Class 12 stream and marks to see a personalised match." });
    }

    return { item: course, score: clampScore(score), reasons, cautions, eligibility };
  });

  ranked.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
  return ranked.slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Career recommendations                                             */
/* ------------------------------------------------------------------ */

export function recommendCareers(profile: StudentProfile | null, limit = 24): Ranked<Career>[] {
  const ranked = CAREERS.map((career): Ranked<Career> => {
    const reasons: WhyReason[] = [];
    const cautions: WhyReason[] = [];
    let score = 0;

    const eligibility: EligibilityResult = profile
      ? {
          status: "verify",
          reasons: [{ kind: "uncertain", text: "Career entry depends on the route you choose — every path here is conditional." }],
          requirements: career.higherStudies.length ? [`Typical route: ${career.higherStudies.slice(0, 3).join(" → ")}`] : [],
          pendingExams: [],
        }
      : {
          status: "verify",
          reasons: [{ kind: "uncertain", text: "Complete onboarding for a personalised route into this career." }],
          requirements: [],
          pendingExams: [],
        };

    if (profile) {
      for (const interest of profile.careerInterests) {
        if (career.domain.toLowerCase().includes(interest.toLowerCase()) || career.name.toLowerCase().includes(interest.toLowerCase())) {
          score += 30;
          reasons.push({ kind: "interest", text: `Matches a career interest you selected (${interest}).` });
          break;
        }
      }

      for (const i of profile.interests) {
        if (career.industries.some((ind) => ind.toLowerCase().includes(i.toLowerCase()))) {
          score += 14;
          reasons.push({ kind: "interest", text: `Sits in an industry you're interested in (${i}).` });
          break;
        }
      }

      for (const s of profile.skills) {
        if (career.skills.some((cs) => cs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(cs.toLowerCase()))) {
          score += 10;
          reasons.push({ kind: "interest", text: `Uses a skill you already have (${s}).` });
          break;
        }
      }

      for (const subj of profile.favoriteSubjects) {
        if (career.domain.toLowerCase().includes(subj.toLowerCase()) || career.involves.toLowerCase().includes(subj.toLowerCase())) {
          score += 8;
          reasons.push({ kind: "interest", text: `Built around ${subj}, one of your favourite subjects.` });
          break;
        }
      }

      if (profile.researchInterest >= 4 && /research/i.test(career.involves + career.progression.join(" "))) {
        score += 8;
        reasons.push({ kind: "interest", text: "Involves significant research — you rated research interest highly." });
      }
      if (profile.entrepreneurshipInterest >= 4 && /founder|freelance|practice|consult|independent/i.test(career.progression.join(" "))) {
        score += 6;
        reasons.push({ kind: "interest", text: "Has an independent-practice track — matching your entrepreneurship interest." });
      }

      if (profile.wantAbroad && /international|global|abroad/i.test(career.international)) {
        score += 6;
        reasons.push({ kind: "location", text: `International mobility: ${career.international}` });
      }

      if (reasons.length === 0) {
        reasons.push({ kind: "neutral", text: "Nothing in your profile points here yet — listed because it's in your stream's orbit." });
        score += 4;
      }
    } else {
      score += 5;
      reasons.push({ kind: "neutral", text: "Complete onboarding to see how this career connects to your interests." });
    }

    if (profile && cautions.length === 0 && score < 60) {
      cautions.push({ kind: "neutral", text: "Only weakly connected to your current profile — explore it if you're curious." });
    }

    return { item: career, score: clampScore(score), reasons, cautions, eligibility };
  });

  ranked.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
  return ranked.slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Saved helpers                                                      */
/* ------------------------------------------------------------------ */

export function findInstitution(id: string): Institution | undefined {
  return getInstitution(id);
}

export { assessCourse, assessInstitution };
