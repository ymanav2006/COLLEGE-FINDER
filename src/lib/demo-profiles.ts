import type { StudentProfile, StreamId } from "@/lib/types";

export type DemoProfileId = "A" | "B" | "C" | "D";

export interface DemoProfile {
  id: DemoProfileId;
  name: string;
  summary: string;
  tags: string[];
  /** Fictional — clearly labelled as demo data wherever it appears. */
  profile: StudentProfile;
}

function make(
  id: DemoProfileId,
  name: string,
  summary: string,
  tags: string[],
  patch: Partial<StudentProfile>,
): DemoProfile {
  return {
    id,
    name,
    summary,
    tags,
    profile: {
      id: `demo-${id.toLowerCase()}`,
      name,
      country: "India",
      state: "",
      board: "CBSE",
      stream: null,
      subjects: [],
      percentage: null,
      grade: "",
      entranceScores: [],
      expectedPercentage: null,
      category: "",
      admissionRoute: "",
      interests: [],
      favoriteSubjects: [],
      skills: [],
      activities: [],
      careerInterests: [],
      workStyle: "",
      researchInterest: 3,
      entrepreneurshipInterest: 3,
      sectorPreference: "",
      wantAbroad: false,
      budgetYearlyINR: null,
      budgetPreset: "",
      scholarshipDependent: false,
      loanAcceptable: false,
      preferPublic: true,
      privateAcceptable: true,
      locationPreference: "Any location",
      specificCountries: [],
      ...patch,
    },
  };
}

export const DEMO_PROFILES: DemoProfile[] = [
  make(
    "A",
    "Student A",
    "PCM student with 85%, a ₹4 lakh yearly budget and a technology focus — comfortable budget, research-oriented, happy in a metro.",
    ["PCM", "85%", "₹4 lakh/yr", "Technology"],
    {
      state: "Maharashtra",
      board: "CBSE",
      stream: "pcm" as StreamId,
      subjects: ["Physics", "Chemistry", "Mathematics", "Computer Science"],
      percentage: 85,
      expectedPercentage: 85,
      interests: ["Technology", "Problem solving", "Research"],
      favoriteSubjects: ["Mathematics", "Physics", "Computer Science"],
      skills: ["Python", "Maths", "Problem solving"],
      activities: ["Robotics club", "Hackathon"],
      careerInterests: ["Engineering", "Research", "Data"],
      workStyle: "Team-based with deep-work blocks",
      researchInterest: 4,
      entrepreneurshipInterest: 3,
      sectorPreference: "Technology",
      budgetYearlyINR: 400_000,
      budgetPreset: "Moderate",
      locationPreference: "West",
      loanAcceptable: false,
      preferPublic: true,
      privateAcceptable: true,
    },
  ),
  make(
    "B",
    "Student B",
    "PCB student with 90% aiming at medicine, a ₹6 lakh yearly budget and openness to studying abroad.",
    ["PCB", "90%", "₹6 lakh/yr", "Medicine"],
    {
      state: "Karnataka",
      board: "CBSE",
      stream: "pcb" as StreamId,
      subjects: ["Physics", "Chemistry", "Biology", "Psychology"],
      percentage: 90,
      expectedPercentage: 90,
      interests: ["Health", "Human biology", "Helping people"],
      favoriteSubjects: ["Biology", "Chemistry"],
      skills: ["Memorisation", "Writing", "Communication"],
      activities: ["Volunteering at a clinic", "Science olympiad"],
      careerInterests: ["Medicine", "Research", "Psychology"],
      workStyle: "People-facing",
      researchInterest: 5,
      entrepreneurshipInterest: 2,
      sectorPreference: "Healthcare",
      wantAbroad: true,
      specificCountries: ["United Kingdom", "Canada"],
      budgetYearlyINR: 600_000,
      budgetPreset: "Comfortable",
      scholarshipDependent: false,
      loanAcceptable: true,
      locationPreference: "Any location",
    },
  ),
  make(
    "C",
    "Student C",
    "Commerce student with 78%, a ₹3 lakh yearly budget and a finance focus — wants value and stays flexible on location.",
    ["Commerce", "78%", "₹3 lakh/yr", "Finance"],
    {
      state: "Rajasthan",
      board: "RBSE",
      stream: "commerce" as StreamId,
      subjects: ["Accountancy", "Business Studies", "Economics", "Mathematics"],
      percentage: 78,
      expectedPercentage: 78,
      interests: ["Business", "Finance", "Markets"],
      favoriteSubjects: ["Accountancy", "Economics"],
      skills: ["Excel", "Accounting", "Writing"],
      activities: ["School newspaper", "Stock-market club"],
      careerInterests: ["Finance", "Business", "Government"],
      workStyle: "Structured with clear goals",
      researchInterest: 2,
      entrepreneurshipInterest: 4,
      sectorPreference: "Finance",
      budgetYearlyINR: 300_000,
      budgetPreset: "Moderate",
      scholarshipDependent: false,
      loanAcceptable: true,
      preferPublic: true,
      privateAcceptable: true,
      locationPreference: "North",
    },
  ),
  make(
    "D",
    "Student D",
    "Humanities student with 88%, a ₹2.5 lakh yearly budget and a psychology interest — scholarship-dependent and planning a cross-stream move.",
    ["Humanities", "88%", "₹2.5 lakh/yr", "Psychology"],
    {
      state: "West Bengal",
      board: "CBSE",
      stream: "arts" as StreamId,
      subjects: ["History", "Political Science", "English", "Psychology"],
      percentage: 88,
      expectedPercentage: 88,
      interests: ["Psychology", "People", "Writing"],
      favoriteSubjects: ["Psychology", "English"],
      skills: ["Writing", "Communication", "Design"],
      activities: ["School magazine", "Counselling volunteer"],
      careerInterests: ["Psychology", "Education", "Media"],
      workStyle: "Creative with flexible hours",
      researchInterest: 4,
      entrepreneurshipInterest: 3,
      sectorPreference: "Education",
      budgetYearlyINR: 250_000,
      budgetPreset: "Tight",
      scholarshipDependent: true,
      loanAcceptable: true,
      preferPublic: true,
      privateAcceptable: true,
      locationPreference: "East",
    },
  ),
];

export function getDemoProfile(id: DemoProfileId): DemoProfile | undefined {
  return DEMO_PROFILES.find((p) => p.id === id);
}

export function isDemoProfileId(value: string | null | undefined): value is DemoProfileId {
  return value === "A" || value === "B" || value === "C" || value === "D";
}
