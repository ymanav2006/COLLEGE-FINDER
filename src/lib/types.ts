/**
 * Core domain model for the College & Career Discovery Platform.
 *
 * Every time-sensitive or consequential value is wrapped in a `Fact<T>` so the
 * UI can always render:  VALUE  →  SOURCE  →  DATE  →  CONFIDENCE
 */

export type Confidence = "verified" | "cross-checked" | "reported" | "unverified";

export type SourceType =
  | "official-website"
  | "government"
  | "accreditation"
  | "ranking-body"
  | "admission-portal"
  | "placement-report"
  | "regulatory"
  | "publication"
  | "student-reviews"
  | "public-dataset"
  | "annual-report"
  | "institutional-document"
  | "seed";

export interface Source {
  id: string;
  /** What the source is, in plain language, e.g. "Institute fee document" */
  name: string;
  type: SourceType;
  /** Official link when one exists. */
  url?: string;
  /** ISO date the source itself was published / last updated. */
  publishedOn?: string;
  /** True for demo content shipped with this prototype. */
  demo?: boolean;
}

export interface Fact<T> {
  value: T;
  sourceId: string;
  /** ISO date this specific value was last checked. */
  verifiedOn: string;
  confidence: Confidence;
}

export const UNAVAILABLE = "Data unavailable" as const;

/* ------------------------------------------------------------------ */
/* Geography                                                           */
/* ------------------------------------------------------------------ */

export interface Country {
  id: string;
  slug: string;
  name: string;
  flag: string;
  region: "Asia" | "Europe" | "North America" | "Oceania" | "Middle East";
  currency: string;
  /** Approximate annual tuition for a typical undergraduate programme. */
  tuitionRange: Fact<string>;
  /** Approximate annual living cost for a single student. */
  livingRange: Fact<string>;
  /** Typical tuition currency used for display. */
  tuitionCurrency: string;
  popularFields: string[];
  englishTests: string[];
  entranceTests: string[];
  applicationTimeline: string;
  visaNotes: Fact<string>;
  workRights: Fact<string>;
  postStudy: Fact<string>;
  scholarships: string[];
  pros: string[];
  considerations: string[];
  officialSources: { label: string; url: string }[];
  lastVerified: string;
  /** Rough map anchor. */
  coords: [number, number];
}

export interface IndianState {
  id: string;
  name: string;
  region: "North" | "South" | "East" | "West" | "Central" | "Northeast";
  capital: string;
  coords: [number, number];
}

/* ------------------------------------------------------------------ */
/* Academics                                                           */
/* ------------------------------------------------------------------ */

export type StreamId = "pcm" | "pcb" | "pcmb" | "commerce" | "arts" | "vocational";

export interface Stream {
  id: StreamId;
  name: string;
  shortName: string;
  subjects: string[];
  description: string;
  /** Broad career areas, deliberately not limited to stereotypes. */
  careerAreas: { name: string; blurb: string }[];
}

export type Level = "certificate" | "diploma" | "undergraduate" | "postgraduate" | "doctoral";

export interface EligibilityRule {
  /** At least one of these streams is required (empty = open to all). */
  streams: StreamId[];
  minPercentage?: number;
  /** Subjects that must have been studied in Class 12 (any-of unless `allSubjectsRequired`). */
  subjects?: string[];
  allSubjectsRequired?: boolean;
  /** Accepted entrance exams (any-of). Empty/undefined = no listed exam. */
  entranceExams?: string[];
  notes?: string[];
}

export interface CostRange {
  /** Annual cost lower bound in INR. */
  minINR: number;
  maxINR: number;
  note?: string;
}

export interface Course {
  id: string;
  slug: string;
  name: string;
  degreeType: string;
  level: Level;
  durationYears: number;
  /** One-line explanation shown on cards. */
  tagline: string;
  streams: StreamId[];
  eligibility: EligibilityRule;
  entranceExams: string[];
  coreSubjects: string[];
  skills: string[];
  careerIds: string[];
  industries: string[];
  furtherStudies: string[];
  workEnvironments: string[];
  relatedCourseIds: string[];
  alternativeCourseIds: string[];
  /** Route after the degree: a short chain of nodes. */
  pathway: string[];
  annualCost: Fact<CostRange>;
  studyAbroad: { country: string; note: string }[];
  demandAreas: string[];
  collegeIds: string[];
}

export interface CourseGroup {
  id: string;
  name: string;
  blurb: string;
  courseIds: string[];
}

/* ------------------------------------------------------------------ */
/* Careers                                                             */
/* ------------------------------------------------------------------ */

export interface Career {
  id: string;
  slug: string;
  name: string;
  domain: string;
  blurb: string;
  involves: string;
  educationPaths: string[];
  skills: string[];
  typicalWork: string[];
  industries: string[];
  progression: string[];
  higherStudies: string[];
  certifications: string[];
  international: string;
  trends: string[];
  relatedCareerIds: string[];
  /** Salary is always a range with a source + year. */
  salary: Fact<string>;
}

/* ------------------------------------------------------------------ */
/* Institutions                                                        */
/* ------------------------------------------------------------------ */

export type InstitutionType = "public" | "private" | "deemed" | "autonomous" | "government-aided";

export type ScorecardDimensionId =
  | "academics"
  | "research"
  | "careerOutcomes"
  | "campusLife"
  | "infrastructure"
  | "studentActivities"
  | "affordability"
  | "location"
  | "internationalExposure"
  | "entrepreneurship"
  | "diversity"
  | "accommodation"
  | "studentSupport";

export interface ScorecardDimension {
  id: ScorecardDimensionId;
  label: string;
  /** 0–100 display index. */
  score: number;
  evidence: string;
  confidence: Confidence;
  sourceId: string;
}

export interface PlacementReport {
  year: number;
  /** Population the statistic applies to — never shown without this. */
  population: string;
  medianSalaryINR?: number;
  averageSalaryINR?: number;
  highestSalaryINR?: number;
  placementRatePercent?: number;
  recruiters: string[];
  methodology: string;
  sourceId: string;
  confidence: Confidence;
}

export interface TuitionInfo {
  currency: string;
  /** Annual tuition in the given currency. */
  tuitionAnnual: Fact<number>;
  hostelAnnual?: Fact<number>;
  otherFeesAnnual?: Fact<number>;
  estimateNote: string;
}

export interface CampusFeature {
  id: string;
  label: string;
  available: boolean;
  detail?: string;
}

export interface StudentPerspective {
  id: string;
  theme: string;
  text: string;
  rating: number;
  sourceId: string;
}

export interface Institution {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  countryId: string;
  established: number;
  type: InstitutionType;
  category: "university" | "college" | "institute";
  accreditation: Fact<string>;
  campusSizeAcres?: number;
  studentCount?: number;
  studentFacultyRatio?: string;
  departments: string[];
  courseIds: string[];
  admissionRoute: string;
  entranceExams: string[];
  eligibilitySummary: string;
  deadlines: { label: string; window: string; verifiedOn: string }[];
  tuition: TuitionInfo;
  scholarships: string[];
  financialAid: string;
  placements: PlacementReport[];
  scorecard: ScorecardDimension[];
  campusFeatures: CampusFeature[];
  campusHighlights: string[];
  perspectives: StudentPerspective[];
  researchHighlights: string[];
  internationalExposure: string[];
  entrepreneurship: string[];
  sourceIds: string[];
  /** Short card copy. */
  highlights: string[];
}

/* ------------------------------------------------------------------ */
/* Exams, scholarships, skills                                         */
/* ------------------------------------------------------------------ */

export interface ExamDate {
  label: string;
  window: string;
}

export interface EntranceExam {
  id: string;
  slug: string;
  name: string;
  countryId: string;
  level: "undergraduate" | "postgraduate" | "english" | "school";
  conductedBy: string;
  whoNeedsIt: string;
  eligibility: string;
  subjects: string[];
  pattern: string;
  importantDates: ExamDate[];
  registration: string;
  syllabus: string;
  prepResources: { label: string; url?: string; type: "free" | "paid" }[];
  acceptedBy: string[];
  officialUrl: string;
  lastVerified: string;
  confidence: Confidence;
}

export type ScholarshipType =
  | "government"
  | "university"
  | "merit"
  | "need-based"
  | "sports"
  | "research"
  | "women"
  | "international";

export interface Scholarship {
  id: string;
  slug: string;
  name: string;
  provider: string;
  countryId: string;
  degreeLevels: Level[];
  streams: StreamId[];
  types: ScholarshipType[];
  amount: Fact<string>;
  eligibility: string;
  deadline: Fact<string>;
  documents: string[];
  applyUrl: string;
  sourceId: string;
  lastVerified: string;
  confidence: Confidence;
}

export interface SkillLevel {
  level: "Beginner" | "Intermediate" | "Advanced";
  outcome: string;
  topics: string[];
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  category: "Technical" | "Analytical" | "Creative" | "Communication" | "Business";
  blurb: string;
  why: string;
  levels: SkillLevel[];
  freeResources: { label: string; url?: string }[];
  paidResources: { label: string; url?: string }[];
  projects: string[];
  certifications: string[];
  approxTime: string;
  relatedCourseIds: string[];
  disclaimer: string;
}

/* ------------------------------------------------------------------ */
/* Student                                                             */
/* ------------------------------------------------------------------ */

export interface StudentProfile {
  id: string;
  name: string;
  country: string;
  state: string;
  board: string;
  stream: StreamId | null;
  subjects: string[];
  percentage: number | null;
  grade: string;
  entranceScores: { exam: string; score: string }[];
  expectedPercentage: number | null;
  category: string;
  admissionRoute: string;
  interests: string[];
  favoriteSubjects: string[];
  skills: string[];
  activities: string[];
  careerInterests: string[];
  workStyle: string;
  researchInterest: number;
  entrepreneurshipInterest: number;
  sectorPreference: string;
  wantAbroad: boolean;
  budgetYearlyINR: number | null;
  budgetPreset: string;
  scholarshipDependent: boolean;
  loanAcceptable: boolean;
  preferPublic: boolean;
  privateAcceptable: boolean;
  locationPreference: string;
  specificCountries: string[];
}

/* ------------------------------------------------------------------ */
/* Personal planning records (persisted locally)                       */
/* ------------------------------------------------------------------ */

export type ApplicationStatus =
  | "Interested"
  | "Researching"
  | "Preparing"
  | "Applied"
  | "Exam completed"
  | "Shortlisted"
  | "Accepted"
  | "Rejected"
  | "Waitlisted"
  | "Final choice";

export interface ApplicationRecord {
  id: string;
  institutionId: string;
  course: string;
  status: ApplicationStatus;
  examRequired: string;
  deadline: string;
  fee: string;
  documents: string[];
  scholarship: string;
  result: string;
  notes: string;
  updatedAt: string;
}

export interface DeadlineRecord {
  id: string;
  title: string;
  category: "College" | "Entrance exam" | "Scholarship" | "Document" | "Counselling" | "Admission round" | "Visa" | "Hostel";
  date: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  notes?: string;
}

export interface SavedItem {
  kind: "college" | "course" | "career" | "scholarship" | "exam" | "skill" | "country";
  id: string;
  savedAt: string;
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

export type SearchDocType =
  | "college"
  | "course"
  | "career"
  | "exam"
  | "scholarship"
  | "skill"
  | "country"
  | "guide";

export interface SearchDoc {
  type: SearchDocType;
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
}
