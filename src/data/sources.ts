import type { Confidence, Fact, Source, SourceType } from "@/lib/types";

/**
 * Dataset verification date for this build.
 * Every Fact records the exact date it was last checked so the UI can show
 * VALUE → SOURCE → DATE → CONFIDENCE, plus a staleness warning when old.
 */
export const DATASET_VERIFIED_ON = "2026-09-15";

/** Age (days) after which a time-sensitive field is flagged as "may have changed". */
export const STALE_AFTER_DAYS = 180;

type Seed = [id: string, name: string, type: SourceType, url?: string, publishedOn?: string, demo?: boolean];

const SEEDS: Seed[] = [
  // ---- Regulators / government ------------------------------------------
  ["src-ugc", "University Grants Commission (India)", "government", "https://www.ugc.gov.in", "2026-06-01"],
  ["src-naac", "NAAC — accreditation summaries", "accreditation", "https://www.naac.gov.in", "2026-05-10"],
  ["src-nba", "NBA — programme accreditation", "accreditation", "https://nbaindia.org", "2026-04-22"],
  ["src-nirf", "NIRF — institutional ranking framework", "ranking-body", "https://www.nirfindia.org", "2026-06-30"],
  ["src-aicte", "AICTE — approval & technical education", "regulatory", "https://www.aicte-india.org", "2026-05-02"],
  ["src-moe-india", "Ministry of Education (India)", "government", "https://www.education.gov.in", "2026-07-01"],
  ["src-nsp", "National Scholarship Portal", "government", "https://scholarships.gov.in", "2026-08-01"],
  ["src-nta", "National Testing Agency", "government", "https://www.nta.ac.in", "2026-08-20"],
  ["src-josaa", "JoSAA — joint seat allocation", "admission-portal", "https://www.josaa.nic.in", "2026-07-15"],
  ["src-clat", "CLAT Consortium of NLUs", "official-website", "https://www.clatconsortiumofnlu.ac.in", "2026-06-18"],
  ["src-cuet", "CUET (UG) — NTA information bulletin", "government", "https://cuet.nta.nic.in", "2026-05-30"],

  // ---- Global regulators / official guides ------------------------------
  ["src-uk-visa", "UK Visas & Immigration — Student visa", "government", "https://www.gov.uk/student-visa", "2026-08-01"],
  ["src-ukcisa", "UKCISA — international student costs", "publication", "https://www.ukcisa.org.uk", "2026-07-01"],
  ["src-ca-ircc", "IRCC (Canada) — Study permit", "government", "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html", "2026-08-05"],
  ["src-ca-stats", "Statistics Canada — student expenditure surveys", "public-dataset", "https://www.statcan.gc.ca", "2025-11-01"],
  ["src-us-ice", "U.S. ICE — Study in the States", "government", "https://studyinthestates.dhs.gov", "2026-07-20"],
  ["src-daad", "DAAD — study in Germany", "government", "https://www.daad.de/en/", "2026-08-12"],
  ["src-de-uni", "Study in Germany — higher education entry requirements", "publication", "https://www.study-in-germany.de", "2026-07-10"],
  ["src-aus-home", "Australian Home Affairs — Student visa (subclass 500)", "government", "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500", "2026-08-14"],
  ["src-study-au", "Study Australia — official study guide", "government", "https://www.studyaustralia.gov.au", "2026-07-28"],
  ["src-nz-imm", "Immigration New Zealand — student visas", "government", "https://www.immigration.govt.nz/new-zealand-visas/options/study", "2026-08-09"],
  ["src-study-nz", "Study with New Zealand — official guide", "government", "https://www.studywithnewzealand.govt.nz", "2026-07-19"],
  ["src-campus-fr", "Campus France — study in France", "government", "https://www.campusfrance.org", "2026-06-25"],
  ["src-study-nl", "Study in NL — official portal", "government", "https://www.studyinnl.org", "2026-07-08"],
  ["src-ireland-edu", "Government of Ireland — Education in Ireland", "government", "https://www.education.ie/en/Study-in-Ireland/", "2026-07-02"],
  ["src-singapore-ica", "ICA (Singapore) — Student's Pass", "government", "https://www.ica.gov.sg/enter-transit-depart/coming-to-singapore/student_pass", "2026-07-16"],
  ["src-singapore-moe", "Singapore Ministry of Education — higher education", "government", "https://www.moe.gov.sg", "2026-06-11"],
  ["src-jasso", "JASSO — study in Japan", "government", "https://www.jasso.go.jp/en/", "2026-06-14"],
  ["src-mext", "MEXT (Japan) — scholarship programme", "government", "https://www.mext.go.jp/en/", "2026-05-20"],
  ["src-study-korea", "Study in Korea — official portal", "government", "https://www.studyinkorea.go.kr", "2026-06-30"],
  ["src-nzqa-ir", "Swiss State Secretariat for Education — study options", "government", "https://www.sbfi.admin.ch/sbfi/en/home/education/international-cooperation.html", "2026-05-18"],
  ["src-uae", "u.ae — official UAE government portal", "government", "https://u.ae", "2026-07-12"],

  // ---- Test makers -------------------------------------------------------
  ["src-ielts", "IELTS — official test information", "official-website", "https://www.ielts.org", "2026-08-01"],
  ["src-toefl", "TOEFL iBT — ETS official", "official-website", "https://www.ets.org/toefl", "2026-08-01"],
  ["src-sat", "SAT — College Board", "official-website", "https://sats.collegeboard.org", "2026-07-15"],
  ["src-act", "ACT — official test", "official-website", "https://www.act.org", "2026-07-15"],
  ["src-gre", "GRE — ETS official", "official-website", "https://www.ets.org/gre", "2026-07-22"],
  ["src-gmat", "GMAT — GMAC official", "official-website", "https://www.mba.com", "2026-07-22"],
  ["src-mcat", "MCAT — AAMC official", "official-website", "https://students-residents.aamc.org/mcat", "2026-06-20"],
  ["src-lsat", "LSAT — LSAC official", "official-website", "https://www.lsac.org/lsat", "2026-06-20"],
  ["src-nee", "National entrance bodies (consolidated)", "publication", undefined, "2026-08-20"],

  // ---- Ranking / aggregation -------------------------------------------
  ["src-qs", "QS World University Rankings methodology", "ranking-body", "https://www.topuniversities.com/world-university-rankings", "2026-06-12"],
  ["src-the", "Times Higher Education World University Rankings", "ranking-body", "https://www.timeshighereducation.com/world-university-rankings", "2026-06-12"],

  // ---- Financial aid ------------------------------------------------------
  ["src-fulbright", "Fulbright-Nehru / USIEF scholarships", "government", "https://usief.org.in/for-indian-students/", "2026-06-05"],
  ["src-chevening", "Chevening Scholarships (UK Government)", "government", "https://www.chevening.org", "2026-08-01"],
  ["src-erasmus", "Erasmus Mundus Joint Masters (European Commission)", "government", "https://erasmus-mundus.ec.europa.eu", "2026-07-01"],
  ["src-daad-sch", "DAAD scholarship database", "government", "https://www.daad.de/en/study-and-research-in-germany/scholarships/", "2026-08-12"],
  ["src-aus-awards", "Australia Awards Scholarships", "government", "https://www.dfat.gov.au", "2026-06-01"],
  ["src-hsf", "Hispanic Scholarship Fund — open listings", "publication", "https://www.hsfpro.org", "2026-05-05"],

  // ---- Institutional documents (demo) -------------------------------------
  ["src-inst-fee", "Institute fee document (uploaded)", "institutional-document", undefined, "2026-05-01", true],
  ["src-inst-place", "Institute placement report (uploaded)", "placement-report", undefined, "2026-04-01", true],
  ["src-inst-admit", "Institute admissions page (captured)", "official-website", undefined, "2026-06-01", true],
  ["src-inst-site", "Institutional website (captured)", "official-website", undefined, "2026-06-01", true],

  // ---- Demo / seed --------------------------------------------------------
  ["src-seed", "Seed dataset bundled with this demo build", "public-dataset", undefined, "2026-09-15", true],
  ["src-reviews", "Aggregated student & alumni perspectives (demo)", "student-reviews", undefined, "2026-08-30", true],
  ["src-editorial", "Platform editorial team — course & career guides", "publication", undefined, "2026-09-01", true],
  ["src-unverified", "Community submission — awaiting verification", "publication", undefined, undefined, true],
];

export const SOURCES: Source[] = SEEDS.map(([id, name, type, url, publishedOn, demo]) => ({
  id,
  name,
  type,
  url,
  publishedOn,
  demo,
}));

const SOURCE_MAP = new Map(SOURCES.map((s) => [s.id, s]));

export function getSource(id: string): Source {
  return (
    SOURCE_MAP.get(id) ?? {
      id: "src-unverified",
      name: "Community submission — awaiting verification",
      type: "publication",
      demo: true,
    }
  );
}

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  "official-website": "Official website",
  government: "Government source",
  accreditation: "Accreditation body",
  "ranking-body": "Ranking organisation",
  "admission-portal": "Admission portal",
  "placement-report": "Placement report",
  regulatory: "Regulatory body",
  publication: "Reputable publication",
  "student-reviews": "Student review aggregation",
  "public-dataset": "Public dataset",
  "annual-report": "Annual report",
  "institutional-document": "Institutional document",
  seed: "Seed data",
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  verified: "Verified",
  "cross-checked": "Cross-checked",
  reported: "Reported",
  unverified: "Unverified",
};

export const CONFIDENCE_HELP: Record<Confidence, string> = {
  verified: "Supported by an authoritative source.",
  "cross-checked": "Supported by multiple reliable sources.",
  reported: "Information comes from a reputable secondary source.",
  unverified: "Requires confirmation before you rely on it.",
};

/** Build a Fact with sensible defaults for this dataset. */
export function fact<T>(
  value: T,
  sourceId: string,
  overrides: Partial<Fact<T>> = {},
): Fact<T> {
  return {
    value,
    sourceId,
    verifiedOn: DATASET_VERIFIED_ON,
    confidence: sourceId === "src-seed" || sourceId === "src-unverified" ? "reported" : "verified",
    ...overrides,
  };
}

/** True when a fact is old enough that we nudge the user to re-check it. */
export function isStale(verifiedOn: string, now: Date = new Date()): boolean {
  const t = Date.parse(verifiedOn);
  if (Number.isNaN(t)) return true;
  const days = (now.getTime() - t) / 86_400_000;
  return days > STALE_AFTER_DAYS;
}

export function daysSince(verifiedOn: string, now: Date = new Date()): number {
  const t = Date.parse(verifiedOn);
  if (Number.isNaN(t)) return Infinity;
  return Math.round((now.getTime() - t) / 86_400_000);
}
