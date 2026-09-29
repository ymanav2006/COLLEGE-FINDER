import { getCareer, CAREERS } from "@/data/careers";
import { getCountry, COUNTRIES } from "@/data/countries";
import { getCourse, COURSES } from "@/data/courses";
import { EXAMS } from "@/data/exams";
import { SCHOLARSHIPS } from "@/data/scholarships";
import { institutionsForCourse } from "@/data/colleges";
import { getSource } from "@/data/sources";
import { assessCourse } from "@/lib/eligibility";
import { formatINR } from "@/lib/format";
import { parseQuery, search, type ParsedQuery } from "@/lib/search";
import { recommendCourses, recommendInstitutions } from "@/lib/recommend";
import type { Confidence, Course, Career, Country, StudentProfile } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Answer shape                                                        */
/* ------------------------------------------------------------------ */

export interface Citation {
  label: string;
  href?: string;
  sourceId?: string;
  verifiedOn?: string;
  confidence?: Confidence;
}

export interface PathfinderAnswer {
  intent: Intent;
  /** Restates what we understood — shown above the answer. */
  interpretation: string;
  summary: string;
  bullets: string[];
  citations: Citation[];
  nextSteps: { label: string; href: string }[];
  related: { label: string; href: string; subtitle?: string }[];
  /** Always present. Guarantees are never made. */
  disclaimer: string;
}

type Intent =
  | "eligibility"
  | "after-course"
  | "scholarship"
  | "afford"
  | "abroad"
  | "exam"
  | "compare"
  | "confused"
  | "colleges"
  | "search";

const DEFAULT_DISCLAIMER =
  "This is guidance built from the records in this platform — not an admissions decision. Nothing here guarantees admission, employment or a salary. Always verify dates and requirements on the official site before you apply.";

/* ------------------------------------------------------------------ */
/* Detection                                                           */
/* ------------------------------------------------------------------ */

function detectIntent(q: ParsedQuery, raw: string): Intent {
  const t = raw.toLowerCase();
  if (/(confused|don'?t know|no idea|stuck|lost|what should i do|don't know what)/.test(t)) return "confused";
  if (/(scholarship|funding|financial aid|bursary|fee waiver)/.test(t)) return "scholarship";
  if (/(afford|budget|cost|fee|fees|expensive|cheap|how much)/.test(t)) return "afford";
  if (/(compare|versus|vs\.?|better than)/.test(t)) return "compare";
  if (/(can i study|am i eligible|eligibility|do i qualify|admission for)/.test(t)) return "eligibility";
  if (/(after |become|career|job|salary|profession)/.test(t)) return "after-course";
  if (/(abroad|overseas|foreign|which country|study in)/.test(t) && !q.docType) return "abroad";
  if (/(exam|entrance|test date|syllabus)/.test(t)) return "exam";
  if (q.docType === "college" || /(colleges?|universities|institutes|which college)/.test(t)) return "colleges";
  return "search";
}

function cite(sourceId?: string, label?: string, href?: string, verifiedOn?: string, confidence?: Confidence): Citation {
  if (sourceId) {
    const s = getSource(sourceId);
    return {
      label: label ?? s.name,
      href: href ?? s.url,
      sourceId: s.id,
      verifiedOn,
      confidence,
    };
  }
  return { label: label ?? "Platform editorial", href, verifiedOn, confidence };
}

/* ------------------------------------------------------------------ */
/* The engine                                                          */
/* ------------------------------------------------------------------ */

/**
 * Deterministic retrieval over the verified dataset.
 * Every claim in the answer is traceable to a record we hold; when we have
 * nothing, we say so rather than inventing an answer.
 *
 * The function signature is intentionally provider-agnostic: an LLM can be
 * slotted in behind `askPathfinder` later without touching any caller.
 */
export function askPathfinder(question: string, profile: StudentProfile | null): PathfinderAnswer {
  const parsed = parseQuery(question);
  const intent = detectIntent(parsed, question);
  const citations: Citation[] = [];
  const nextSteps: { label: string; href: string }[] = [];
  const related: { label: string; href: string; subtitle?: string }[] = [];
  const bullets: string[] = [];

  const interpretation = buildInterpretation(parsed, intent);

  switch (intent) {
    /* ------------------------------------------------------------ */
    case "eligibility": {
      const course = findBestCourse(question, parsed);
      if (!course) {
        return {
          intent,
          interpretation,
          summary:
            "I couldn't identify a specific programme in that question. Ask it as a course name — for example \"Am I eligible for BSc Computer Science with 78% in commerce?\"",
          bullets: [],
          citations: [],
          nextSteps: [{ label: "Browse all courses", href: "/courses" }],
          related: [],
          disclaimer: DEFAULT_DISCLAIMER,
        };
      }
      const result = assessCourse(course, profile);
      const marks = profile?.percentage ?? profile?.expectedPercentage;

      citations.push(
        cite(undefined, `${course.name} eligibility record`, `/courses/${course.slug}`, undefined, "reported"),
      );

      return {
        intent,
        interpretation: `You're asking whether you can study ${course.name}.`,
        summary:
          result.status === "likely"
            ? `Based on what you've told us, you satisfy the published requirements for ${course.name}. That is not an admission guarantee — cutoffs, seat counts and counselling still decide the outcome.`
            : result.status === "verify"
              ? `There isn't enough confirmed information to call you eligible for ${course.name} yet. ${profile ? "One or more requirements below are unresolved." : "Add your Class 12 details and we can check properly."}`
              : `As your profile stands, a stated requirement for ${course.name} is not satisfied. There may still be an alternate route.`,
        bullets: [
          ...result.reasons.map((r) => (r.kind === "blocker" ? "✗ " : r.kind === "match" ? "✓ " : "? ") + r.text),
          ...(result.requirements.length ? [`Published requirements: ${result.requirements.join(" · ")}`] : []),
          ...(result.pendingExams.length ? [`You would still need: ${result.pendingExams.join(", ")}`] : []),
          ...(marks === null && profile ? ["Your percentage isn't recorded, so mark-based checks are unresolved."] : []),
        ],
        citations,
        nextSteps: [
          { label: `Open ${course.name}`, href: `/courses/${course.slug}` },
          { label: "Check colleges that offer this", href: `/colleges?course=${course.slug}` },
        ],
        related: institutionsForCourse(course.id)
          .slice(0, 5)
          .map((i) => ({ label: i.name, href: `/colleges/${i.slug}`, subtitle: `${i.city}, ${i.state}` })),
        disclaimer: DEFAULT_DISCLAIMER,
      };
    }

    /* ------------------------------------------------------------ */
    case "after-course": {
      const course = findBestCourse(question, parsed) ?? findBestCareer(question);
      if (course && "careerIds" in course) {
        const careers = course.careerIds.map(getCareer).filter((c): c is Career => Boolean(c));
        citations.push(cite("src-editorial", "Course → career mapping", `/courses/${course.slug}`, undefined, "reported"));
        return {
          intent,
          interpretation: `You're asking where ${course.name} can lead.`,
          summary: `${course.name} opens onto several routes — ${course.pathway.slice(0, 3).join(" → ")}. Which one you end up on depends on grades, entrance results and what you choose to do alongside the degree.`,
          bullets: [
            `Typical pathway: ${course.pathway.join(" → ")}`,
            `Common industries: ${course.industries.slice(0, 5).join(", ")}`,
            `After graduation: ${course.furtherStudies.slice(0, 3).join(" · ")}`,
            `Skills employers look for: ${course.skills.slice(0, 6).join(", ")}`,
            `Annual cost range: ${formatINR(course.annualCost.value.minINR)}–${formatINR(course.annualCost.value.maxINR)} (seed figure, reported confidence)`,
          ],
          citations,
          nextSteps: [
            { label: `Open ${course.name}`, href: `/courses/${course.slug}` },
            { label: "See every career this leads to", href: "/careers" },
            { label: "Plan the next 5 years", href: "/roadmap" },
          ],
          related: careers
            .filter((c): c is NonNullable<typeof c> => Boolean(c))
            .slice(0, 5)
            .map((c) => ({ label: c.name, href: `/careers/${c.slug}`, subtitle: c.domain })),
          disclaimer: DEFAULT_DISCLAIMER,
        };
      }
      const career = findBestCareer(question);
      if (career) {
        citations.push(cite("src-editorial", "Career record", `/careers/${career.slug}`, undefined, "reported"));
        return {
          intent,
          interpretation: `You're asking about becoming a ${career.name}.`,
          summary: career.blurb,
          bullets: [
            `It involves: ${career.involves}`,
            `Common routes in: ${career.educationPaths.slice(0, 3).join(" · ") || "varies by employer and country"}`,
            `Salary band (reported): ${career.salary.value}`,
            `Progression: ${career.progression.join(" → ")}`,
            `International outlook: ${career.international}`,
          ],
          citations,
          nextSteps: [
            { label: `Open ${career.name}`, href: `/careers/${career.slug}` },
            { label: "What else can I become?", href: "/explore/outside-my-stream" },
          ],
          related: career.relatedCareerIds
            .map(getCareer)
            .filter(Boolean)
            .slice(0, 5)
            .map((c) => ({ label: c!.name, href: `/careers/${c!.slug}`, subtitle: c!.domain })),
          disclaimer: DEFAULT_DISCLAIMER,
        };
      }
      return fallbackAnswer(question, parsed, interpretation, intent);
    }

    /* ------------------------------------------------------------ */
    case "scholarship": {
      const matches = SCHOLARSHIPS.filter((s) => {
        const hay = `${s.name} ${s.provider} ${s.eligibility} ${s.types.join(" ")}`.toLowerCase();
        return parsed.terms.some((t) => hay.includes(t)) ||
          (profile?.stream && s.streams.includes(profile.stream)) ||
          (parsed.countryId && s.countryId === parsed.countryId);
      }).slice(0, 6);

      citations.push(cite("src-nsp", "National Scholarship Portal", "https://scholarships.gov.in", "2026-08-01", "verified"));

      if (matches.length === 0) {
        return {
          intent,
          interpretation,
          summary:
            "No scholarship in our database matches that query. That does not none exist — it means this build hasn't indexed it. Start with the official portal and your institution's own aid page.",
          bullets: [
            "Always apply through an official portal, never through a paid agent.",
            "Keep income certificates, mark sheets and bank details scanned before windows open.",
            "Institutional aid usually closes near the admission deadline, not the scholarship portal's.",
          ],
          citations,
          nextSteps: [
            { label: "Browse all scholarships", href: "/scholarships" },
            { label: "Open National Scholarship Portal", href: "https://scholarships.gov.in" },
          ],
          related: [],
          disclaimer: DEFAULT_DISCLAIMER,
        };
      }

      return {
        intent,
        interpretation: `You're asking about scholarships${parsed.countryId ? ` for ${parsed.countryId.toUpperCase()}` : ""}.`,
        summary: `I found ${matches.length} scholarship record(s) in this platform that relate to your query. Deadlines and amounts change every cycle — treat each as a starting point to verify.`,
        bullets: matches.map(
          (s) =>
            `${s.name} — ${s.provider}. Deadline: ${s.deadline.value} (${s.deadline.confidence}). Last checked ${s.lastVerified}.`,
        ),
        citations: matches.slice(0, 3).map((s) => cite(s.sourceId, s.name, s.applyUrl, s.lastVerified, s.confidence)),
        nextSteps: [
          { label: "Browse all scholarships", href: "/scholarships" },
          { label: "Add deadlines to your tracker", href: "/tools/deadlines" },
        ],
        related: matches.map((s) => ({ label: s.name, href: `/scholarships?s=${s.slug}`, subtitle: s.provider })),
        disclaimer: DEFAULT_DISCLAIMER,
      };
    }

    /* ------------------------------------------------------------ */
    case "afford": {
      const budget = profile?.budgetYearlyINR ?? parsed.budgetINR;
      const list = recommendInstitutions(profile, { limit: 6, includeAbroad: profile?.wantAbroad });
      const affordable = list.filter((r) => {
        const t = r.item.tuition;
        return budget ? toINR(t.tuitionAnnual.value, t.currency) <= budget : true;
      });
      const sample = (affordable.length ? affordable : list).slice(0, 4);

      if (!budget) {
        return {
          intent,
          interpretation,
          summary:
            "I don't have a budget figure to work with. Tell me a yearly number — for example \"under ₹3 lakh a year\" — or set it during onboarding, and I'll match institutions against it.",
          bullets: [
            "Tuition is only part of it: add hostel, mess, travel, books and application fees.",
            "Scholarships and fee waivers can change the picture materially — check aid before ruling a college out.",
          ],
          citations: [cite("src-inst-fee", "Institute fee documents", undefined, "2026-05-01", "reported")],
          nextSteps: [{ label: "Open the budget planner", href: "/tools/budget" }],
          related: [],
          disclaimer: DEFAULT_DISCLAIMER,
        };
      }

      citations.push(cite("src-inst-fee", "Institute fee documents (uploaded, demo)", undefined, "2026-05-01", "reported"));

      return {
        intent,
        interpretation: `You're asking what you can afford on ${formatINR(budget)} a year.`,
        summary:
          affordable.length > 0
            ? `${affordable.length} of the institutions we track fit that annual tuition figure${profile ? " with your profile" : ""}. Remember this is tuition only — living costs sit on top.`
            : `No institution in this build's dataset comes in under ${formatINR(budget)} in tuition alone. Widen the budget, consider public institutions, or look at scholarships.`,
        bullets: [
          ...sample.map(
            (r) =>
              `${r.item.name} — tuition ${formatINR(toINR(r.item.tuition.tuitionAnnual.value, r.item.tuition.currency))}/yr in ${r.item.tuition.currency}. ${r.reasons[0]?.text ?? ""}`,
          ),
          profile?.scholarshipDependent
            ? "You told us aid matters — the scholarship list below is the next thing to check."
            : "Check scholarships before ruling anything out.",
        ],
        citations,
        nextSteps: [
          { label: "Open the budget planner", href: "/tools/budget" },
          { label: "Run \"Can I afford this?\"", href: "/tools/afford" },
          { label: "Search scholarships", href: "/scholarships" },
        ],
        related: sample.map((r) => ({ label: r.item.name, href: `/colleges/${r.item.slug}`, subtitle: `${r.item.city}, ${r.item.state}` })),
        disclaimer: DEFAULT_DISCLAIMER,
      };
    }

    /* ------------------------------------------------------------ */
    case "abroad": {
      const country = parsed.countryId
        ? getCountry(parsed.countryId)
        : findCountryByTerms(parsed.terms);
      if (!country) {
        return {
          intent,
          interpretation,
          summary:
            "Tell me a country and I'll pull its tuition range, living costs, visa notes, work rights and last-verified dates from our study-abroad records.",
          bullets: [],
          citations: [],
          nextSteps: [{ label: "Open the study-abroad guide", href: "/abroad" }],
          related: [],
          disclaimer: DEFAULT_DISCLAIMER,
        };
      }
      citations.push(cite(country.officialSources[0]?.url ? "src-seed" : "src-seed", `${country.name} official sources`, country.officialSources[0]?.url, country.lastVerified, "reported"));
      return {
        intent,
        interpretation: `You're asking about studying in ${country.name}.`,
        summary: `${country.name}: typical undergraduate tuition is ${country.tuitionRange.value} and living costs ${country.livingRange.value} per year. Figures were last checked on ${country.lastVerified}.`,
        bullets: [
          `Application timeline: ${country.applicationTimeline}`,
          `English tests: ${country.englishTests.join(", ")}`,
          `Entrance tests used: ${country.entranceTests.join(", ") || "varies by institution"}`,
          `Visa: ${country.visaNotes.value}`,
          `Work rights during study: ${country.workRights.value}`,
          `After study: ${country.postStudy.value}`,
          `Scholarships commonly used: ${country.scholarships.slice(0, 4).join(", ")}`,
        ],
        citations,
        nextSteps: [
          { label: `Open ${country.name} guide`, href: `/abroad/${country.slug}` },
          { label: "Compare countries", href: "/tools/compare?kind=country" },
        ],
        related: country.officialSources.map((s) => ({ label: s.label, href: s.url })),
        disclaimer: DEFAULT_DISCLAIMER,
      };
    }

    /* ------------------------------------------------------------ */
    case "exam": {
      const term = parsed.terms.join(" ");
      const match =
        EXAMS.find((e) => term.split(/\s+/).some((t) => e.name.toLowerCase().includes(t))) ??
        EXAMS.find((e) => question.toLowerCase().includes(e.name.toLowerCase()));
      if (match) {
        citations.push(cite(undefined, match.name, match.officialUrl, match.lastVerified, match.confidence));
        return {
          intent,
          interpretation: `You're asking about ${match.name}.`,
          summary: `${match.name} — conducted by ${match.conductedBy}. ${match.whoNeedsIt}`,
          bullets: [
            `Eligibility: ${match.eligibility}`,
            `Pattern: ${match.pattern}`,
            `Important dates: ${match.importantDates.map((d) => `${d.label} (${d.window})`).join(" · ")}`,
            `Accepted by: ${match.acceptedBy.slice(0, 4).join(", ")}`,
            `Registration: ${match.registration}`,
          ],
          citations,
          nextSteps: [
            { label: `Open ${match.name}`, href: `/exams/${match.slug}` },
            { label: "All entrance exams", href: "/exams" },
          ],
          related: match.prepResources
            .filter((r) => r.url)
            .map((r) => ({ label: r.label, href: r.url! })),
          disclaimer: "Exam dates move. Confirm every date on the official conducting body's website before you register.",
        };
      }
      return {
        intent,
        interpretation,
        summary: "Which exam are you asking about? I hold records for JEE, NEET, CUET, CLAT, CAT, GATE, board exams, study-abroad tests and more.",
        bullets: [],
        citations: [],
        nextSteps: [{ label: "Browse all entrance exams", href: "/exams" }],
        related: EXAMS.slice(0, 6).map((e) => ({ label: e.name, href: `/exams/${e.slug}`, subtitle: e.conductedBy })),
        disclaimer: "Exam dates move. Confirm every date on the official conducting body's website before you register.",
      };
    }

    /* ------------------------------------------------------------ */
    case "compare": {
      const picks = recommendInstitutions(profile, { limit: 3 }).map((r) => r.item);
      citations.push(cite("src-seed", "Multi-dimensional scorecard (demo index)", "/tools/compare", undefined, "reported"));
      return {
        intent,
        interpretation,
        summary:
          "Comparing colleges means comparing trade-offs, not finding a single \"best\" one. Pick two to five institutions and we'll lay their scores side by side with the evidence behind each number.",
        bullets: [
          "Every dimension shows evidence and a confidence label — a score with no evidence contributes nothing.",
          "A higher score on one dimension never cancels a low score on another that matters to you.",
          "These indices are demo values for comparison, not an official ranking.",
        ],
        citations,
        nextSteps: [{ label: "Open the comparison tool", href: "/tools/compare" }],
        related: picks.map((i) => ({ label: i.name, href: `/colleges/${i.slug}`, subtitle: `${i.city}, ${i.state}` })),
        disclaimer: DEFAULT_DISCLAIMER,
      };
    }

    /* ------------------------------------------------------------ */
    case "confused": {
      const routes = recommendCourses(profile, 4);
      citations.push(cite("src-editorial", "Confusion Solver methodology", "/confusion-solver", undefined, "reported"));
      return {
        intent,
        interpretation: "You're not sure what to do next — that's a normal place to start.",
        summary:
          "We won't hand you a single answer. Instead, here are several genuinely different routes you could take from where you are, each with what it costs in time and money.",
        bullets: [
          profile
            ? `Based on your ${profile.stream ?? "recorded"} stream: start with the courses below and remove any that don't excite you.`
            : "Add your Class 12 stream and marks first — the routes below get much sharper.",
          "If you're drawn to a subject but not a job, pick the degree that keeps the most doors open and decide later.",
          "If money is the constraint, filter by annual cost first and compare within a budget band.",
          "If nothing stands out, the decision matrix and Plan B generator are built for exactly this.",
        ],
        citations,
        nextSteps: [
          { label: "Open the Confusion Solver", href: "/confusion-solver" },
          { label: "Build a decision matrix", href: "/tools/decision-matrix" },
          { label: "Generate a Plan B", href: "/tools/plan-b" },
        ],
        related: routes.map((r) => ({
          label: r.item.name,
          href: `/courses/${r.item.slug}`,
          subtitle: `${r.item.durationYears} yr · ${r.item.degreeType}`,
        })),
        disclaimer: DEFAULT_DISCLAIMER,
      };
    }

    /* ------------------------------------------------------------ */
    case "colleges": {
      const ranked = recommendInstitutions(profile, { limit: 5, includeAbroad: profile?.wantAbroad });
      citations.push(cite("src-seed", "Institution records (seed dataset)", "/colleges", undefined, "reported"));
      return {
        intent,
        interpretation,
        summary: profile
          ? `Here are the institutions that currently fit your profile best — each with the specific reason it's on the list.`
          : "Here are institutions we hold records for. Add your profile and every card will explain exactly why it appears.",
        bullets: ranked.map(
          (r) => `${r.item.name} (${r.item.city}) — ${r.reasons[0]?.text ?? "No reason recorded yet."}`,
        ),
        citations,
        nextSteps: [
          { label: "Open the college database", href: "/colleges" },
          { label: "Your Education Map", href: "/dashboard" },
        ],
        related: ranked.map((r) => ({ label: r.item.name, href: `/colleges/${r.item.slug}`, subtitle: `${r.item.city}, ${r.item.state}` })),
        disclaimer: DEFAULT_DISCLAIMER,
      };
    }

    /* ------------------------------------------------------------ */
    default:
      return fallbackAnswer(question, parsed, interpretation, intent);
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function buildInterpretation(parsed: ParsedQuery, intent: string): string {
  const bits: string[] = [];
  if (parsed.budgetLabel) bits.push(`budget ${parsed.budgetLabel}`);
  if (parsed.countryId) bits.push(`country ${parsed.countryId.toUpperCase()}`);
  if (parsed.stream) bits.push(`stream ${parsed.stream.toUpperCase()}`);
  if (parsed.mentionsBest) bits.push(`the word "best" (we don't rank that way — tell us what to weigh)`);
  return bits.length
    ? `I read this as: ${intent} — ${bits.join(", ")}.`
    : `I read this as a ${intent} question.`;
}

function toINR(value: number, currency: string): number {
  if (currency === "INR") return value;
  // Local import avoids a cycle: money.ts has no dependency on this module.
  const rates: Record<string, number> = {
    USD: 88, EUR: 103, GBP: 116, CAD: 64, AUD: 58, SGD: 69, NZD: 53, CHF: 111, JPY: 0.6, KRW: 0.065, AED: 24,
  };
  return Math.round(value * (rates[currency] ?? 1));
}

/** Longest-name-first phrase match, then a keyword search over the index. */
function findBestCourse(question: string, _parsed: ParsedQuery): Course | undefined {
  const lower = question.toLowerCase();

  const direct = [...COURSES]
    .sort((a, b) => b.name.length - a.name.length)
    .find((c) => lower.includes(c.name.toLowerCase()));
  if (direct) return direct;

  const hits = search(question, 12).filter((h) => h.doc.type === "course");
  for (const h of hits) {
    const c = getCourse(h.doc.id);
    if (c) return c;
  }
  return undefined;
}

function findBestCareer(question: string): Career | undefined {
  const lower = question.toLowerCase();
  const direct = [...CAREERS]
    .sort((a, b) => b.name.length - a.name.length)
    .find((c) => lower.includes(c.name.toLowerCase()));
  if (direct) return direct;

  const hits = search(question, 12).filter((h) => h.doc.type === "career");
  for (const h of hits) {
    const c = getCareer(h.doc.id);
    if (c) return c;
  }
  return undefined;
}

function findCountryByTerms(terms: string[]): Country | undefined {
  return COUNTRIES.find((c) =>
    terms.some((t) => c.name.toLowerCase().includes(t) || t === c.id),
  );
}

function fallbackAnswer(
  question: string,
  parsed: ParsedQuery,
  interpretation: string,
  intent: Intent,
): PathfinderAnswer {
  const hits = search(question, 8);
  const best = hits.filter((h) => h.score > 10).slice(0, 6);

  if (best.length === 0) {
    return {
      intent,
      interpretation,
      summary:
        "I don't have a record that answers that — and I'd rather say so than invent something. Try naming a course, career, exam, country or scholarship, or browse the databases directly.",
      bullets: [],
      citations: [],
      nextSteps: [
        { label: "Search everything", href: "/search" },
        { label: "Browse colleges", href: "/colleges" },
        { label: "Browse courses", href: "/courses" },
      ],
      related: [],
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }

  return {
    intent,
    interpretation,
    summary: parsed.mentionsBest
      ? `You used the word "best", which we deliberately don't answer — there is no single best institution, only the best fit for your constraints. Here's what matched, with each record's source and date.`
      : `Here's what matched in this platform's database. Each result links to the record it came from, with its source, date and confidence shown.`,
    bullets: best.map((h) => `${h.doc.title} — ${h.doc.subtitle}`),
    citations: best.slice(0, 3).map((h) => ({ label: h.doc.title, href: h.doc.href })),
    nextSteps: [
      { label: "Open full search", href: `/search?q=${encodeURIComponent(question)}` },
      { label: "Ask differently", href: "/pathfinder" },
    ],
    related: best.map((h) => ({ label: h.doc.title, href: h.doc.href, subtitle: h.doc.subtitle })),
    disclaimer: DEFAULT_DISCLAIMER,
  };
}
