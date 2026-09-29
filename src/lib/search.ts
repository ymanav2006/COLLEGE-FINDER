import { CAREERS } from "@/data/careers";
import { COUNTRIES } from "@/data/countries";
import { COURSES } from "@/data/courses";
import { EXAMS } from "@/data/exams";
import { INSTITUTIONS } from "@/data/colleges";
import { SCHOLARSHIPS } from "@/data/scholarships";
import { SKILLS } from "@/data/skills";
import { STREAMS } from "@/data/streams";
import type { SearchDoc, SearchDocType, StreamId } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Index                                                               */
/* ------------------------------------------------------------------ */

let _index: SearchDoc[] | null = null;

export function buildIndex(): SearchDoc[] {
  if (_index) return _index;

  const docs: SearchDoc[] = [];

  for (const i of INSTITUTIONS) {
    docs.push({
      type: "college",
      id: i.id,
      slug: i.slug,
      title: i.name,
      subtitle: `${i.city}, ${i.state} · ${i.type} ${i.category}`,
      href: `/colleges/${i.slug}`,
      keywords: [
        i.name,
        i.city,
        i.state,
        i.type,
        i.category,
        i.established,
        ...i.departments,
        ...i.entranceExams,
        ...i.courseIds,
      ].map(String),
    });
  }

  for (const c of COURSES) {
    docs.push({
      type: "course",
      id: c.id,
      slug: c.slug,
      title: c.name,
      subtitle: `${c.degreeType} · ${c.durationYears} year${c.durationYears === 1 ? "" : "s"} · ${c.streams.map((s) => s.toUpperCase()).join("/")}`,
      href: `/courses/${c.slug}`,
      keywords: [c.name, c.degreeType, c.tagline, ...c.coreSubjects, ...c.careerIds, ...c.industries, ...c.entranceExams].map(String),
    });
  }

  for (const c of CAREERS) {
    docs.push({
      type: "career",
      id: c.id,
      slug: c.slug,
      title: c.name,
      subtitle: `${c.domain} · ${c.blurb}`,
      href: `/careers/${c.slug}`,
      keywords: [c.name, c.domain, c.blurb, ...c.skills, ...c.industries, ...c.higherStudies].map(String),
    });
  }

  for (const e of EXAMS) {
    docs.push({
      type: "exam",
      id: e.id,
      slug: e.slug,
      title: e.name,
      subtitle: `${e.conductedBy} · ${e.level} · ${e.countryId.toUpperCase()}`,
      href: `/exams/${e.slug}`,
      keywords: [e.name, e.conductedBy, e.whoNeedsIt, ...e.acceptedBy, ...e.subjects].map(String),
    });
  }

  for (const s of SCHOLARSHIPS) {
    docs.push({
      type: "scholarship",
      id: s.id,
      slug: s.slug,
      title: s.name,
      subtitle: `${s.provider} · ${s.countryId.toUpperCase()} · ${s.types.join(", ")}`,
      href: `/scholarships?s=${s.slug}`,
      keywords: [s.name, s.provider, s.eligibility, ...s.types, ...s.streams.map((x) => x.toUpperCase())].map(String),
    });
  }

  for (const s of SKILLS) {
    docs.push({
      type: "skill",
      id: s.id,
      slug: s.slug,
      title: s.name,
      subtitle: `${s.category} · ${s.blurb}`,
      href: `/skills/${s.slug}`,
      keywords: [s.name, s.category, s.blurb, s.why, ...s.certifications].map(String),
    });
  }

  for (const c of COUNTRIES) {
    docs.push({
      type: "country",
      id: c.id,
      slug: c.slug,
      title: c.name,
      subtitle: `${c.flag} ${c.region} · tuition ${c.tuitionRange.value}`,
      href: `/abroad/${c.slug}`,
      keywords: [c.name, c.region, c.currency, ...c.popularFields, ...c.entranceTests].map(String),
    });
  }

  for (const g of GUIDES) {
    docs.push({
      type: "guide",
      id: g.id,
      slug: g.id,
      title: g.title,
      subtitle: g.subtitle,
      href: g.href,
      keywords: g.keywords,
    });
  }

  _index = docs;
  return docs;
}

/** Static planning guides and tool pages, so global search reaches them too. */
const GUIDES: { id: string; title: string; subtitle: string; href: string; keywords: string[] }[] = [
  {
    id: "universities",
    title: "Universities worldwide — abroad first",
    subtitle: "Every tracked university, ordered with the formula shown in full",
    href: "/universities",
    keywords: ["university", "universities", "worldwide", "global", "abroad first", "international universities", "order", "ranking", "best to worst"],
  },
  {
    id: "twinning-2-2",
    title: "2+2 & transfer pathways",
    subtitle: "Two years in India, two years abroad — costs, credit transfer and risks",
    href: "/abroad/2-2",
    keywords: ["2+2", "2 2", "two plus two", "transfer", "articulation", "twinning", "split degree", "3+1", "1+3", "credit transfer", "study abroad pathway"],
  },
  {
    id: "abroad-search",
    title: "Search abroad opportunities",
    subtitle: "Universities, pathways, countries, funding and tests in one search",
    href: "/abroad/search",
    keywords: ["abroad search", "international search", "overseas", "opportunities abroad", "study abroad options"],
  },
  {
    id: "higher-studies",
    title: "Higher studies planner",
    subtitle: "Master's, professional and research routes after a bachelor's degree",
    href: "/higher-studies",
    keywords: ["masters", "mba", "mtech", "phd", "gate", "cat", "research", "postgraduate", "pg", "ca", "cfa", "b.ed", "llm", "md"],
  },
  {
    id: "roadmap",
    title: "5-Year Map",
    subtitle: "Year-by-year milestones from Class 12 to career or further study",
    href: "/roadmap",
    keywords: ["roadmap", "timeline", "milestones", "plan", "year by year", "5 year"],
  },
  {
    id: "methodology",
    title: "Methodology & sources",
    subtitle: "How every value, source, date and confidence label is produced",
    href: "/methodology",
    keywords: ["methodology", "sources", "confidence", "verified", "stale", "ranking", "how we know"],
  },
  {
    id: "confusion-solver",
    title: "Confusion Solver",
    subtitle: "When you don't know what to do after Class 12",
    href: "/confusion-solver",
    keywords: ["confused", "don't know", "unsure", "lost", "what to do", "decision"],
  },
  {
    id: "compare",
    title: "Compare colleges",
    subtitle: "Two to five institutions across thirteen dimensions",
    href: "/tools/compare",
    keywords: ["compare", "side by side", "scorecard", "13 dimensions", "versus"],
  },
  {
    id: "budget",
    title: "Budget planner",
    subtitle: "Plan what the four years actually cost, year by year",
    href: "/tools/budget",
    keywords: ["budget", "cost", "fees", "expenses", "afford", "money"],
  },
  {
    id: "maps",
    title: "India & world maps",
    subtitle: "Where the tracked institutions and destinations actually are",
    href: "/maps",
    keywords: ["map", "maps", "location", "where", "state", "distance"],
  },
  {
    id: "faq",
    title: "Frequently asked questions",
    subtitle: "About the data, the tools and what this platform will never do",
    href: "/faq",
    keywords: ["faq", "questions", "help", "trust", "privacy"],
  },
];

/* ------------------------------------------------------------------ */
/* Natural-language query parsing                                      */
/* ------------------------------------------------------------------ */

const STOPWORDS = new Set([
  "a", "an", "the", "in", "on", "at", "of", "for", "to", "and", "or", "my", "i", "me", "you", "we",
  "is", "are", "was", "be", "with", "about", "after", "from", "that", "this", "these", "those",
  "what", "which", "who", "how", "do", "does", "can", "could", "should", "would", "please", "show",
  "find", "get", "need", "want", "looking", "look", "some", "any", "all", "more", "most", "also",
  "than", "then", "there", "here", "it", "its", "not", "no", "yes", "just", "very", "much", "many",
  "near", "nearby", "around", "under", "over", "within", "by", "as", "but", "if", "into", "out",
  "up", "down", "well", "best", "good", "great", "top", "nice", "right", "now", "today",
]);

const COUNTRY_ALIASES: Record<string, string> = {
  india: "in",
  "united states": "us",
  usa: "us",
  "us": "us",
  "america": "us",
  canada: "ca",
  "united kingdom": "uk",
  "uk": "uk",
  britain: "uk",
  england: "uk",
  germany: "de",
  france: "fr",
  australia: "au",
  "new zealand": "nz",
  singapore: "sg",
  japan: "jp",
  korea: "kr",
  "south korea": "kr",
  netherlands: "nl",
  holland: "nl",
  switzerland: "ch",
  ireland: "ie",
  italy: "it",
  "uae": "ae",
  "emirates": "ae",
  "dubai": "ae",
};

const TYPE_HINTS: { type: SearchDocType; words: string[] }[] = [
  { type: "college", words: ["college", "colleges", "university", "universities", "institute", "institutes", "institution", "campus", "school"] },
  { type: "course", words: ["course", "courses", "degree", "degrees", "programme", "program", "programmes", "bachelor", "bachelors", "masters", "diploma", "btech", "bca", "bba", "bsc", "ba", "mbbs"] },
  { type: "career", words: ["career", "careers", "job", "jobs", "profession", "occupations", "salary", "work"] },
  { type: "exam", words: ["exam", "exams", "entrance", "test", "tests", "jee", "neet", "cuet", "clat", "cat", "gate", "sat", "gre"] },
  { type: "scholarship", words: ["scholarship", "scholarships", "funding", "aid", "fee", "waiver", "bursary"] },
  { type: "skill", words: ["skill", "skills", "learn", "learning", "certificate", "certification"] },
  { type: "country", words: ["abroad", "country", "countries", "overseas", "international", "foreign"] },
];

const STREAM_HINTS: { stream: StreamId; words: string[] }[] = [
  { stream: "pcm", words: ["pcm", "maths", "mathematics"] },
  { stream: "pcb", words: ["pcb", "biology"] },
  { stream: "pcmb", words: ["pcmb"] },
  { stream: "commerce", words: ["commerce", "accountancy"] },
  { stream: "arts", words: ["arts", "humanities"] },
  { stream: "vocational", words: ["vocational", "iti", "polytechnic"] },
];

export interface ParsedQuery {
  raw: string;
  terms: string[];
  budgetINR?: number;
  budgetLabel?: string;
  countryId?: string;
  stream?: StreamId;
  docType?: SearchDocType;
  mentionsBest: boolean;
  wantsAffordable: boolean;
  wantsResearch: boolean;
  wantsNearHome: boolean;
  wantsAbroad: boolean;
}

const LAKH_INR = 100_000;

function parseMoney(text: string): { inr: number; label: string } | undefined {
  const crore = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:crore|cr)/i);
  if (crore) {
    const v = parseFloat(crore[1]) * 10_000_000;
    return { inr: v, label: `₹${crore[1]} crore` };
  }
  const lakh = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|lakhs)/i);
  if (lakh) {
    const v = parseFloat(lakh[1]) * LAKH_INR;
    return { inr: v, label: `₹${lakh[1]} lakh` };
  }
  const thousand = text.match(/(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)\s*k/i);
  if (thousand) {
    const v = parseFloat(thousand[1]) * 1_000;
    return { inr: v, label: `₹${thousand[1]}k` };
  }
  const plain = text.match(/(?:₹|rs\.?)\s*(\d{4,9})/i);
  if (plain) {
    const v = parseInt(plain[1], 10);
    return { inr: v, label: `₹${v.toLocaleString("en-IN")}` };
  }
  const usd = text.match(/\$\s*(\d+(?:\.\d+)?)/);
  if (usd) {
    const v = parseFloat(usd[1]) * 88;
    return { inr: v, label: `~$${usd[1]}` };
  }
  return undefined;
}

export function parseQuery(raw: string): ParsedQuery {
  const q = raw.trim();
  const lower = q.toLowerCase();

  const money = parseMoney(q);
  const countryEntry = Object.entries(COUNTRY_ALIASES).find(([alias]) => lower.includes(alias));

  let docType: SearchDocType | undefined;
  for (const hint of TYPE_HINTS) {
    if (hint.words.some((w) => new RegExp(`\\b${w}\\b`, "i").test(lower))) {
      docType = hint.type;
      break;
    }
  }

  let stream: StreamId | undefined;
  for (const hint of STREAM_HINTS) {
    if (hint.words.some((w) => lower.includes(w))) {
      stream = hint.stream;
      break;
    }
  }

  const mentionsBest = /\bbest\b|\btop\s*\d|\branked\b|\bnumber one\b/.test(lower);
  const wantsAffordable = /(affordable|cheap|budget|low cost|inexpensive|under|less than|below|economical)/.test(lower);
  const wantsResearch = /(research|phd|academic|laborator|publications)/.test(lower);
  const wantsNearHome = /(near me|nearby|close to home|my state|my city|distance)/.test(lower);
  const wantsAbroad = /(abroad|overseas|international|foreign|outside india)/.test(lower);

  const terms = lower
    .replace(/[₹$€£]/g, " ")
    .replace(/\d+(?:\.\d+)?\s*(?:lakh|lakhs|lac|crore|cr|k)/gi, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));

  return {
    raw: q,
    terms,
    budgetINR: money?.inr,
    budgetLabel: money?.label,
    countryId: countryEntry?.[1],
    stream,
    docType,
    mentionsBest,
    wantsAffordable,
    wantsResearch,
    wantsNearHome,
    wantsAbroad,
  };
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

export interface SearchHit {
  doc: SearchDoc;
  score: number;
}

export function search(query: string, limit = 40): SearchHit[] {
  const parsed = parseQuery(query);
  const docs = buildIndex();
  const terms = parsed.terms.length > 0 ? parsed.terms : [query.toLowerCase()];

  const hits: SearchHit[] = [];

  for (const doc of docs) {
    const hay = (doc.title + " " + doc.subtitle + " " + doc.keywords.join(" ")).toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (doc.title.toLowerCase().includes(term)) score += 12;
      else if (hay.includes(term)) score += 5;
      else if (term.length > 4 && hay.includes(term.slice(0, term.length - 3))) score += 2;
    }
    if (score === 0) continue;
    if (parsed.docType && doc.type === parsed.docType) score += 8;
    if (parsed.countryId) {
      const isCountryDoc = doc.type === "country" && doc.id === parsed.countryId;
      const countryName = COUNTRIES.find((c) => c.id === parsed.countryId)?.name.toLowerCase() ?? " ";
      const mentionsCountry = hay.includes(parsed.countryId) || hay.includes(countryName);
      if (isCountryDoc) score += 10;
      else if (mentionsCountry) score += 4;
    }
    if (parsed.wantsAbroad && doc.type === "country") score += 6;
    if (parsed.wantsResearch && ["career", "course"].includes(doc.type) && hay.includes("research")) score += 5;
    hits.push({ doc, score });
  }

  hits.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));
  return hits.slice(0, limit);
}

/** Group hits by document type in a stable display order. */
export function groupHits(hits: SearchHit[]): { type: SearchDocType; label: string; hits: SearchHit[] }[] {
  const order: SearchDocType[] = ["college", "course", "career", "exam", "scholarship", "skill", "country", "guide"];
  const labels: Record<SearchDocType, string> = {
    college: "Colleges",
    course: "Courses",
    career: "Careers",
    exam: "Entrance exams",
    scholarship: "Scholarships",
    skill: "Skills",
    country: "Study abroad",
    guide: "Guides",
  };
  const map = new Map<SearchDocType, SearchHit[]>();
  for (const h of hits) {
    const arr = map.get(h.doc.type) ?? [];
    arr.push(h);
    map.set(h.doc.type, arr);
  }
  const out: { type: SearchDocType; label: string; hits: SearchHit[] }[] = [];
  for (const t of order) {
    const arr = map.get(t);
    if (arr?.length) out.push({ type: t, label: labels[t], hits: arr });
  }
  return out;
}

export const SEARCH_SUGGESTIONS = [
  "Computer Science colleges under ₹3 lakh in India",
  "Affordable engineering colleges near Chandigarh",
  "Medical colleges abroad under my budget",
  "Courses after commerce without maths",
  "Best research opportunities after BSc Physics",
  "Can I study computer science if I took commerce?",
  "Scholarships for engineering students in Germany",
  "What can I do after BCom?",
];

export const STREAM_LABELS: Record<string, string> = Object.fromEntries(
  STREAMS.map((s) => [s.id, s.shortName]),
);
