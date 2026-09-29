import type { Fact } from "@/lib/types";
import { fact } from "./sources";

/**
 * Split-degree and transfer pathways — "2+2", "3+1" and friends.
 *
 * IMPORTANT: these are PATHWAY PATTERNS, not a register of signed partnerships.
 * A 2+2 route exists only where an Indian institution and a foreign
 * institution have a current articulation agreement with matching credit
 * transfer terms. This build describes how each pattern works, what it costs
 * on each leg, what can go wrong, and exactly where to verify the current
 * agreement before you commit money to it.
 *
 * Every cost is an indicative ANNUAL range in INR marked `reported`.
 */

export type TwinningMode = "2+2" | "3+1" | "2+1" | "1+3" | "transfer";

export const TWINNING_MODES: { id: TwinningMode; label: string; blurb: string }[] = [
  { id: "2+2", label: "2+2", blurb: "Two years in India, two years abroad" },
  { id: "3+1", label: "3+1", blurb: "Three years in India, final year abroad" },
  { id: "2+1", label: "2+1", blurb: "Two years in India, one year abroad (top-up)" },
  { id: "1+3", label: "1+3", blurb: "One year in India, then full degree abroad" },
  { id: "transfer", label: "Credit transfer", blurb: "Move between institutions with credits recognised" },
];

export interface TwinningRoute {
  id: string;
  slug: string;
  mode: TwinningMode;
  title: string;
  field: string;
  countryId: string;
  summary: string;
  /** Structure of the home leg. */
  indiaLeg: { years: number; where: string; award: string };
  /** Structure of the abroad leg. */
  abroadLeg: { years: number; where: string; award: string };
  totalYears: number;
  /** Annual cost of the India leg, in INR. */
  indiaCost: Fact<{ minINR: number; maxINR: number; note?: string }>;
  /** Annual cost of the abroad leg, in INR. */
  abroadCost: Fact<{ minINR: number; maxINR: number; note?: string }>;
  creditTransfer: string;
  entryRequirements: string[];
  typicalRisks: string[];
  verifySteps: string[];
  timeline: { label: string; window: string; verifiedOn: string }[];
  officialSources: { label: string; url: string }[];
  outcome: string;
  sourceIds: string[];
}

const V = "2026-08-20";

const cost = (minINR: number, maxINR: number, note: string) =>
  fact({ minINR, maxINR, note }, "src-seed", { confidence: "reported", verifiedOn: V });

export const TWINNING_ROUTES: TwinningRoute[] = [
  {
    id: "t22-uk-eng",
    slug: "2-2-engineering-uk",
    mode: "2+2",
    title: "B.Tech-style engineering: 2 years in India + 2 years in the UK",
    field: "Engineering & Technology",
    countryId: "uk",
    summary:
      "Complete the first two years at an Indian college that holds an articulation agreement, then enter year three of a four-year UK degree and graduate with the UK award.",
    indiaLeg: {
      years: 2,
      where: "An Indian institution that has a signed 2+2 / articulation agreement with the partner university",
      award: "Credits towards the partner degree; a diploma may be issued by the Indian institution if the exit is formal",
    },
    abroadLeg: {
      years: 2,
      where: "A UK university, entering at year three of a four-year programme",
      award: "Bachelor's degree awarded by the UK university",
    },
    totalYears: 4,
    indiaCost: cost(200000, 600000, "Annual tuition at the Indian partner institution; government and private colleges both sit in this range for engineering."),
    abroadCost: cost(2400000, 4200000, "Annual international tuition in the UK, converted at approximate rates — plus roughly £12k–£15k of living cost which is not included here."),
    creditTransfer:
      "Credit transfer works only where the agreement maps module-for-module. Ask for the published credit framework and the minimum year-two marks required for progression — many agreements set a 55–60% condition.",
    entryRequirements: [
      "Admission to an Indian institution that already runs the agreement",
      "Year-one and year-two marks meeting the progression threshold in the agreement",
      "IELTS or an accepted equivalent meeting the partner university's English requirement",
      "A valid study visa for the UK, with financial evidence",
    ],
    typicalRisks: [
      "The agreement may be for a specific programme only — a change of branch can void it",
      "Marks below the progression threshold mean you restart year three rather than transfer",
      "UK fee levels rise; budget with a buffer rather than the exact published figure",
      "Time-zone and module mismatch can add a semester if credits don't align",
    ],
    verifySteps: [
      "Ask the Indian institution for the written articulation agreement and its current expiry date",
      "Check the partner university's official articulation list for your exact programme",
      "Confirm the credit tariff and minimum marks in writing before paying year-two fees",
      "Verify the UK study visa and financial evidence requirements on gov.uk",
    ],
    timeline: [
      { label: "Agreement check with Indian partner", window: "Before admission, not after", verifiedOn: V },
      { label: "UCAS / direct application for year-three entry", window: "Typically the autumn before you plan to travel", verifiedOn: V },
      { label: "Visa application", window: "After the offer and CAS, usually a few months before travel", verifiedOn: V },
    ],
    officialSources: [
      { label: "UK student visa — gov.uk", url: "https://www.gov.uk/student-visa" },
      { label: "UKCISA — international student costs", url: "https://www.ukcisa.org.uk" },
    ],
    outcome:
      "The full UK degree, with roughly half the time — and half the fee — spent in India. Employers see the UK award; they don't discount it because of where the first two years happened.",
    sourceIds: ["src-uk-visa", "src-ukcisa", "src-editorial"],
  },
  {
    id: "t22-au-eng",
    slug: "2-2-computer-science-australia",
    mode: "2+2",
    title: "Computer science: 2 years in India + 2 years in Australia",
    field: "Computing & IT",
    countryId: "au",
    summary:
      "Finish the foundational two years in India, then transfer into an Australian bachelor's degree at year three and complete it on an Australian campus.",
    indiaLeg: {
      years: 2,
      where: "An Indian college with a credit-transfer arrangement to the Australian partner",
      award: "Year-one and year-two credits; the Indian institution may confer a diploma on formal exit",
    },
    abroadLeg: {
      years: 2,
      where: "An Australian university, entering the third year of a three-to-four year degree",
      award: "Bachelor's degree awarded by the Australian university",
    },
    totalYears: 4,
    indiaCost: cost(150000, 500000, "Annual tuition at an Indian institution for computing programmes — wide range because public and private fees differ sharply."),
    abroadCost: cost(3200000, 5200000, "Annual international tuition in Australia, converted at approximate rates; living costs sit on top of this."),
    creditTransfer:
      "Australian partners usually publish an advanced-standing statement showing exactly which units are credited. Get that document before you enrol anywhere — a verbal assurance from an agent is not the same thing.",
    entryRequirements: [
      "Completion of year one and two with the required GPA",
      "IELTS, PTE Academic or TOEFL meeting the programme's requirement",
      "Recognition of the Indian qualification for advanced standing",
      "Confirmation of enrolment for the student visa (subclass 500)",
    ],
    typicalRisks: [
      "Advanced standing is capped — some programmes credit only 12 months of prior study",
      "Australian intakes are February/July; missing one costs half a year",
      "Living costs in Sydney and Melbourne are significantly above the national average",
      "Visa genuine-student expectations are assessed, not assumed",
    ],
    verifySteps: [
      "Download the partner's advanced-standing / credit recognition policy for your programme",
      "Ask for the exact units credited and the marks threshold in writing",
      "Confirm intake dates so the transition doesn't leave a gap",
      "Check subclass 500 requirements on the Home Affairs site before paying deposits",
    ],
    timeline: [
      { label: "Advanced standing assessment", window: "Typically 4–8 months before intended entry", verifiedOn: V },
      { label: "Semester 1 intake applications", window: "Often close in December", verifiedOn: V },
      { label: "Student visa (subclass 500)", window: "After confirmation of enrolment", verifiedOn: V },
    ],
    officialSources: [
      { label: "Home Affairs — Student visa (subclass 500)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500" },
      { label: "Study Australia — official guide", url: "https://www.studyaustralia.gov.au" },
    ],
    outcome:
      "An Australian degree with two Indian years' worth of fees already paid off, and access to Australia's post-study work options on the portion completed there.",
    sourceIds: ["src-aus-home", "src-study-au", "src-editorial"],
  },
  {
    id: "t22-ca-bus",
    slug: "2-2-business-canada",
    mode: "2+2",
    title: "Business & management: 2 years in India + 2 years in Canada",
    field: "Business & Management",
    countryId: "ca",
    summary:
      "Two years of business fundamentals in India, then two years at a Canadian institution where the final degree is awarded — a common articulation structure for business diplomas and degrees.",
    indiaLeg: {
      years: 2,
      where: "An Indian institution running a two-year diploma or the first two years of a degree with a transfer agreement",
      award: "Diploma or transferable first-year/second-year credits",
    },
    abroadLeg: {
      years: 2,
      where: "A Canadian university or college with a degree-completion or transfer arrangement",
      award: "Bachelor's degree or a Canadian advanced diploma, depending on the partner",
    },
    totalYears: 4,
    indiaCost: cost(120000, 450000, "Annual tuition for business programmes in India — private business schools sit at the top of this range."),
    abroadCost: cost(2400000, 4200000, "Annual international tuition in Canada, converted at approximate rates; provincial variation is real."),
    creditTransfer:
      "Canadian transfers usually run through institutional credit-transfer agreements rather than a national framework. Ask the receiving institution — not the agent — to confirm what it will credit.",
    entryRequirements: [
      "Two-year Indian qualification with the required grade point average",
      "IELTS or TOEFL meeting the programme requirement",
      "Enough funds evidenced for tuition plus a year of living costs",
      "A study permit with biometrics",
    ],
    typicalRisks: [
      "Provincial rules and institutional policies differ; a national claim means little",
      "Some business programmes have limited seats for transfer entry",
      "Costs vary sharply between provinces — Ontario and British Columbia sit highest",
      "Study permit processing times change; apply early rather than on the deadline",
    ],
    verifySteps: [
      "Check the Canadian institution's published transfer-credit database for your Indian qualification",
      "Confirm the CGPA threshold in writing with the admissions office",
      "Verify the study permit requirements and financial thresholds on the IRCC site",
      "Ask whether the credential is a degree, an advanced diploma or a certificate — employers treat them differently",
    ],
    timeline: [
      { label: "Transfer credit evaluation", window: "Typically opens 8–12 months before entry", verifiedOn: V },
      { label: "Application for the common intake", window: "Often closes 15 January for international applicants", verifiedOn: V },
      { label: "Study permit", window: "Apply as soon as the offer letter arrives", verifiedOn: V },
    ],
    officialSources: [
      { label: "IRCC — study permit", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html" },
      { label: "Statistics Canada — student expenditure surveys", url: "https://www.statcan.gc.ca" },
    ],
    outcome:
      "A Canadian credential for the final two years, with the Canadian study-permit route attached to the portion completed there.",
    sourceIds: ["src-ca-ircc", "src-ca-stats", "src-editorial"],
  },
  {
    id: "t31-de-eng",
    slug: "3-1-engineering-germany",
    mode: "3+1",
    title: "Mechanical engineering: 3 years in India + final year in Germany",
    field: "Engineering & Technology",
    countryId: "de",
    summary:
      "Complete an Indian degree in three years where the structure allows it, then join a German programme for the final year, thesis or a one-year qualifying year.",
    indiaLeg: {
      years: 3,
      where: "An Indian institution whose degree structure and credit load the German partner recognises",
      award: "Three years of credits; the Indian degree may complete later or in parallel",
    },
    abroadLeg: {
      years: 1,
      where: "A German university — final-year project, thesis year or a qualifying academic year",
      award: "Credit towards the German qualification or a recognised certificate of study",
    },
    totalYears: 4,
    indiaCost: cost(150000, 500000, "Annual tuition at an Indian engineering institution."),
    abroadCost: cost(40000, 180000, "German public universities charge no general tuition — students pay a semester contribution of roughly €300. The figure here covers that contribution; living costs are the real expense."),
    creditTransfer:
      "German recognition follows the Anabin/KMK framework for Indian qualifications. A three-year Indian degree is generally recognised for Master's entry, but final-year credit transfer into a bachelor's is a case-by-case institutional decision.",
    entryRequirements: [
      "Documented credit transcript for the three completed years",
      "German (TestDaF/DSH) for German-taught tracks or IELTS/TOEFL for English-taught tracks",
      "uni-assist evaluation of your qualification, which takes weeks — start early",
      "Proof of financial means for the visa",
    ],
    typicalRisks: [
      "Three-year Indian degrees are sometimes accepted for Master's but not for bachelor's year-three entry",
      "uni-assist processing time routinely eats two months of your plan",
      "Language requirements are the most common reason this route stalls",
      "Living costs are the dominant cost even though tuition is low",
    ],
    verifySteps: [
      "Check recognition of your qualification in the anabin database",
      "Ask the German faculty directly which modules they will credit",
      "Confirm the language requirement for your exact programme, not the university average",
      "Verify visa and blocked-account requirements on the official German mission site",
    ],
    timeline: [
      { label: "uni-assist evaluation", window: "Start 6–9 months before intended entry", verifiedOn: V },
      { label: "Winter intake deadline (most programmes)", window: "Typically 15 July for non-EU applicants", verifiedOn: V },
      { label: "Student visa with blocked account", window: "Apply as soon as admission is confirmed", verifiedOn: V },
    ],
    officialSources: [
      { label: "DAAD — study in Germany", url: "https://www.daad.de/en/" },
      { label: "Study in Germany — entry requirements", url: "https://www.study-in-germany.de" },
    ],
    outcome:
      "A German academic year attached to your Indian degree — cheap tuition, real thesis credit, and the entry requirement satisfied for a German Master's if you want to continue.",
    sourceIds: ["src-daad", "src-de-uni", "src-editorial"],
  },
  {
    id: "t21-ie-bus",
    slug: "2-1-business-ireland",
    mode: "2+1",
    title: "Management & marketing: 2 years in India + 1 year in Ireland (top-up degree)",
    field: "Business & Management",
    countryId: "ie",
    summary:
      "Complete two years in India and join the final year of an Irish bachelor's degree — a 'top-up' that converts a diploma or partial degree into a full honours award.",
    indiaLeg: {
      years: 2,
      where: "An Indian institution with a two-year diploma or partial degree the partner accepts",
      award: "Diploma or two years of transferable credit",
    },
    abroadLeg: {
      years: 1,
      where: "An Irish university offering final-year top-up entry",
      award: "Bachelor's (honours) degree from the Irish institution",
    },
    totalYears: 3,
    indiaCost: cost(100000, 400000, "Annual tuition for management programmes in India."),
    abroadCost: cost(1600000, 3200000, "Annual international tuition in Ireland, converted at approximate rates; Dublin rent is the larger variable."),
    creditTransfer:
      "Top-up programmes publish explicit entry-to-final-year rules. Check the required module coverage — a business diploma missing accounting or statistics may not map onto the final year.",
    entryRequirements: [
      "A two-year Indian qualification with the required grade",
      "IELTS or TOEFL at the level the programme specifies",
      "Supporting statement and, sometimes, an interview",
      "Evidence of funds and a study visa",
    ],
    typicalRisks: [
      "One year leaves very little slack — one failed module can extend the stay",
      "Module mismatch is the usual cause of credit not transferring",
      "Dublin accommodation is scarce and expensive; secure it early",
      "Confirm whether the award is an ordinary or honours degree — it changes graduate options",
    ],
    verifySteps: [
      "Ask for the published entry requirements for final-year top-up entry, in writing",
      "Map your Indian modules against the Irish programme's module list",
      "Confirm the exact degree award and classification rules",
      "Check visa and post-study options on the official Irish immigration site",
    ],
    timeline: [
      { label: "Application for autumn entry", window: "1 February early deadline (typical)", verifiedOn: V },
      { label: "Final deadline", window: "Mid-year depending on the programme", verifiedOn: V },
      { label: "Visa and accommodation", window: "Start both immediately after the offer", verifiedOn: V },
    ],
    officialSources: [
      { label: "Education in Ireland — official", url: "https://www.education.ie/en/Study-in-Ireland/" },
    ],
    outcome:
      "A full bachelor's degree in three years instead of four, at roughly one year of foreign fee rather than three.",
    sourceIds: ["src-ireland-edu", "src-editorial"],
  },
  {
    id: "t22-nl-design",
    slug: "2-2-design-netherlands",
    mode: "2+2",
    title: "Design & communication: 2 years in India + 2 years in the Netherlands",
    field: "Design & Media",
    countryId: "nl",
    summary:
      "Two years of foundation and studio practice in India, then two years in a Dutch applied or research university design programme ending in the Dutch award.",
    indiaLeg: {
      years: 2,
      where: "An Indian design or media institution with a portfolio-based credit agreement",
      award: "Two years of credit plus a portfolio reviewed by the partner",
    },
    abroadLeg: {
      years: 2,
      where: "A Dutch university of applied sciences or research university",
      award: "Bachelor's degree from the Dutch institution",
    },
    totalYears: 4,
    indiaCost: cost(150000, 500000, "Annual tuition for design and media programmes in India."),
    abroadCost: cost(1000000, 2000000, "Annual non-EEA tuition in the Netherlands for design programmes, converted at approximate rates; living costs are additional."),
    creditTransfer:
      "Dutch institutions publish ECTS-based transfer tables. Ask for the number of ECTS the partner will credit and whether the minor/major structure still fits in two years.",
    entryRequirements: [
      "A portfolio that meets the partner's review standard",
      "Year-one and year-two credit transcript",
      "IELTS or TOEFL for English-taught programmes",
      "Numerus fixus programmes have a hard 15 January registration deadline",
    ],
    typicalRisks: [
      "Portfolio quality decides entry more than marks do",
      "Numerus fixus registration deadlines are strict and not negotiable",
      "Housing in Dutch student cities is scarce — this is the recurring failure point",
      "Non-EEA tuition rises each year; check the current published figure",
    ],
    verifySteps: [
      "Register the numerus fixus programme by 15 January if it applies",
      "Ask for the ECTS credit transfer table for your Indian qualification",
      "Confirm housing availability before accepting the offer",
      "Check the IND study residence requirements for your nationality",
    ],
    timeline: [
      { label: "Numerus fixus registration", window: "By 15 January (typical)", verifiedOn: "2026-08-14" },
      { label: "Portfolio submission", window: "Alongside the application — check the exact cut-off", verifiedOn: "2026-08-14" },
      { label: "Study residence application", window: "After admission, before travel", verifiedOn: "2026-08-14" },
    ],
    officialSources: [
      { label: "Study in NL — official portal", url: "https://www.studyinnl.org" },
    ],
    outcome:
      "A Dutch design degree with a studio-based final two years, and a portfolio built across two educational systems.",
    sourceIds: ["src-study-nl", "src-editorial"],
  },
  {
    id: "t13-uk-found",
    slug: "1-3-foundation-uk",
    mode: "1+3",
    title: "Foundation year in India, then a full UK degree (1+3)",
    field: "Open to most fields",
    countryId: "uk",
    summary:
      "Spend one year on a foundation or qualifying year in India — often cheaper — then enter year one of a UK degree for the full three years abroad.",
    indiaLeg: {
      years: 1,
      where: "An Indian foundation, bridging or first-year programme accepted by the partner",
      award: "Foundation certificate or first-year credit where the agreement allows",
    },
    abroadLeg: {
      years: 3,
      where: "A UK university entering year one or with the foundation year credited",
      award: "Bachelor's degree from the UK university",
    },
    totalYears: 4,
    indiaCost: cost(80000, 350000, "Annual tuition for a foundation or bridging year in India."),
    abroadCost: cost(2400000, 4200000, "Annual international tuition in the UK for three years, converted at approximate rates; living costs are additional."),
    creditTransfer:
      "Many UK universities run their own international foundation year instead of recognising an external one. If you take the Indian route, confirm in writing that it is credited.",
    entryRequirements: [
      "Class 12 with the subject profile the degree requires",
      "IELTS at the level required for direct entry or for the foundation year",
      "Foundation marks meeting the guarantee threshold, if one exists",
      "Study visa with financial evidence",
    ],
    typicalRisks: [
      "A 'guarantee of progression' usually carries a marks condition — read it",
      "Some degrees (medicine, law) have separate admissions tests that don't change",
      "Three years abroad is a much bigger financial commitment than two",
      "Currency movement between years changes the real cost",
    ],
    verifySteps: [
      "Get the conditional offer letter stating the exact marks and English requirements",
      "Confirm whether the foundation year is the university's own or a third-party one",
      "Check UCAS deadlines for your subject — medicine is much earlier",
      "Verify visa financial requirements on gov.uk before booking anything",
    ],
    timeline: [
      { label: "UCAS application", window: "Mid-January for most subjects", verifiedOn: V },
      { label: "Foundation year application", window: "Often direct, closing earlier than UCAS", verifiedOn: V },
      { label: "Visa", window: "After the CAS is issued", verifiedOn: V },
    ],
    officialSources: [
      { label: "UK student visa — gov.uk", url: "https://www.gov.uk/student-visa" },
    ],
    outcome:
      "Cheaper first year at home, then the full UK degree — useful when Class 12 marks don't yet meet direct-entry thresholds.",
    sourceIds: ["src-uk-visa", "src-ukcisa", "src-editorial"],
  },
  {
    id: "t22-sg-comp",
    slug: "2-2-computer-science-singapore",
    mode: "2+2",
    title: "Applied computing: 2 years in India + 2 years in Singapore",
    field: "Computing & IT",
    countryId: "sg",
    summary:
      "Two years of computing fundamentals in India followed by two years at a Singapore institution — an English-speaking, Asia-located route with a competitive entry bar.",
    indiaLeg: {
      years: 2,
      where: "An Indian institution with a credit-transfer agreement to the Singapore partner",
      award: "Two years of credit toward the Singapore award",
    },
    abroadLeg: {
      years: 2,
      where: "A Singapore university or polytechnic-with-degree pathway",
      award: "Bachelor's degree from the Singapore institution",
    },
    totalYears: 4,
    indiaCost: cost(150000, 500000, "Annual tuition for computing programmes in India."),
    abroadCost: cost(2000000, 3600000, "Annual post-subsidy international tuition in Singapore, converted at approximate rates; the subsidy often carries a service bond — check the terms."),
    creditTransfer:
      "Singapore institutions assess transfer credit case by case and publish minimum GPA expectations. Ask whether the subsidy and any service obligation apply to transfer entrants.",
    entryRequirements: [
      "Strong first-year and second-year results, especially in mathematics",
      "IELTS or TOEFL where the medium of instruction isn't English",
      "Detailed transcript mapping for credit recognition",
      "Student's Pass with the institution as sponsor",
    ],
    typicalRisks: [
      "Entry is highly competitive and seats for transfer are few",
      "Subsidised fees may come with a bonded service period after graduation",
      "Housing allocation is limited for transfer entrants arriving mid-course",
      "Confirm whether the credential is public-sector subsidised for internationals",
    ],
    verifySteps: [
      "Ask the admissions office for the transfer-credit policy and GPA threshold",
      "Confirm the exact fee after subsidy and any service obligation in writing",
      "Check Student's Pass requirements on the ICA site",
      "Verify accommodation availability before accepting the place",
    ],
    timeline: [
      { label: "Transfer application window", window: "Varies by institution — often mid-year", verifiedOn: V },
      { label: "Student's Pass application", window: "After the offer; allow several weeks", verifiedOn: V },
    ],
    officialSources: [
      { label: "ICA — Student's Pass", url: "https://www.ica.gov.sg/enter-transit-depart/coming-to-singapore/student_pass" },
      { label: "Singapore MOE — higher education", url: "https://www.moe.gov.sg" },
    ],
    outcome:
      "A Singapore computing degree with two Indian years' worth of costs already saved, in an English-speaking system close to Asian tech markets.",
    sourceIds: ["src-singapore-ica", "src-singapore-moe", "src-editorial"],
  },
  {
    id: "t22-nz-hosp",
    slug: "2-2-hospitality-new-zealand",
    mode: "2+2",
    title: "Hospitality & tourism: 2 years in India + 2 years in New Zealand",
    field: "Hospitality & Tourism",
    countryId: "nz",
    summary:
      "Two years of hospitality management study in India, then two years at a New Zealand institution where practical placements are part of the degree.",
    indiaLeg: {
      years: 2,
      where: "An Indian hotel management or hospitality institution with a transfer agreement",
      award: "Diploma or two years of transferable credit",
    },
    abroadLeg: {
      years: 2,
      where: "A New Zealand university or polytechnic offering degree completion",
      award: "Bachelor's degree from the New Zealand institution",
    },
    totalYears: 4,
    indiaCost: cost(120000, 450000, "Annual tuition for hospitality programmes in India."),
    abroadCost: cost(2600000, 4400000, "Annual international tuition in New Zealand, converted at approximate rates; living costs are additional."),
    creditTransfer:
      "New Zealand institutions publish credit recognition decisions for overseas qualifications — ask for yours in writing rather than relying on the prospectus.",
    entryRequirements: [
      "Diploma or two-year qualification with the required grades",
      "IELTS or TOEFL at the programme level",
      "Some programmes require a police check or food-safety clearance for placements",
      "Study visa with evidence of funds",
    ],
    typicalRisks: [
      "Work-hour rules for student visa holders change — check the current policy",
      "Placement years depend on the student visa allowing the required hours",
      "New Zealand's smaller job market means fewer graduate roles",
      "Accommodation in Auckland and Queenstown is tight",
    ],
    verifySteps: [
      "Ask for the written credit recognition decision for your Indian qualification",
      "Confirm placement hours are permitted under the current visa settings",
      "Check the immigration site for current work rights during study",
      "Confirm the fee schedule for each of the two years, not just year one",
    ],
    timeline: [
      { label: "Application for semester one", window: "December – February (typical)", verifiedOn: V },
      { label: "Scholarship rounds", window: "Apply with the application — rounds close early", verifiedOn: V },
      { label: "Study visa", window: "After the offer of place", verifiedOn: V },
    ],
    officialSources: [
      { label: "Immigration New Zealand — study options", url: "https://www.immigration.govt.nz/new-zealand-visas/options/study" },
      { label: "Study with New Zealand", url: "https://www.studywithnewzealand.govt.nz" },
    ],
    outcome:
      "A New Zealand degree with practical placement components, at roughly half the foreign-fee exposure of a full four-year stay.",
    sourceIds: ["src-nz-imm", "src-study-nz", "src-editorial"],
  },
  {
    id: "t22-fr-lit",
    slug: "2-2-humanities-france",
    mode: "2+2",
    title: "Humanities & political studies: 2 years in India + 2 years in France",
    field: "Humanities & Social Sciences",
    countryId: "fr",
    summary:
      "Two years of undergraduate study in India, then two years at a French university — typically on an English-taught track or after a French language year.",
    indiaLeg: {
      years: 2,
      where: "An Indian college with an academic agreement or credit recognition with the French partner",
      award: "Two years of credit recognised through the Campus France process",
    },
    abroadLeg: {
      years: 2,
      where: "A French university, Licence final years or an English-taught equivalent",
      award: "Licence (bachelor's equivalent) from the French university",
    },
    totalYears: 4,
    indiaCost: cost(80000, 350000, "Annual tuition for humanities programmes in India — among the lower fee bands in the dataset."),
    abroadCost: cost(300000, 500000, "Annual tuition at a French public university for non-EU students, converted at approximate rates; Paris living costs are the larger figure."),
    creditTransfer:
      "French recognition of Indian credits runs through Campus France and the receiving faculty's equivalency decision — it is a faculty decision, not an automatic one.",
    entryRequirements: [
      "Class 12 plus two years of undergraduate study with a transcript",
      "DELF/DALF or equivalent for French-taught tracks; IELTS/TOEFL for English-taught tracks",
      "Campus France interview and file review",
      "Visa with proof of funds and accommodation",
    ],
    typicalRisks: [
      "Licence structure is three years in France — check which year you enter",
      "French-taught tracks need documented language ability before you arrive",
      "Housing in Paris requires early applications to CROUS or private listings",
      "Some faculties charge differentiated non-EU fees — confirm the exact amount",
    ],
    verifySteps: [
      "Ask the faculty which year of the Licence your Indian credits map onto",
      "Confirm the language requirement and accepted test for your exact programme",
      "Apply for accommodation through CROUS as soon as you have an offer",
      "Follow the Campus France process for India rather than applying informally",
    ],
    timeline: [
      { label: "Campus France file", window: "Typically January – March for autumn entry", verifiedOn: V },
      { label: "Accommodation application", window: "As soon as the offer is confirmed", verifiedOn: V },
      { label: "Student visa", window: "After Campus France validation", verifiedOn: V },
    ],
    officialSources: [{ label: "Campus France", url: "https://www.campusfrance.org" }],
    outcome:
      "A French Licence at public-university fee levels — the cheapest full European degree route in this dataset once living costs are counted.",
    sourceIds: ["src-campus-fr", "src-editorial"],
  },
  {
    id: "t22-it-arch",
    slug: "2-2-architecture-italy",
    mode: "2+2",
    title: "Architecture: 2 years in India + 2 years in Italy",
    field: "Architecture & Built Environment",
    countryId: "it",
    summary:
      "Two years of architectural study in India, then two years at an Italian technical university to complete a programme with a studio and thesis structure.",
    indiaLeg: {
      years: 2,
      where: "An Indian architecture or design institution with a credit arrangement",
      award: "Two years of credit plus a portfolio reviewed for admission",
    },
    abroadLeg: {
      years: 2,
      where: "An Italian technical university (Politecnico or equivalent)",
      award: "Laurea or Laurea Magistrale-track credit, depending on entry year",
    },
    totalYears: 4,
    indiaCost: cost(150000, 550000, "Annual tuition for architecture programmes in India; NATA-qualified entry routes apply."),
    abroadCost: cost(400000, 900000, "Annual tuition at an Italian public technical university for non-EU students, converted at approximate rates; DSU scholarships can reduce this."),
    creditTransfer:
      "Italian universities credit based on ECTS and portfolio review. Architecture studio credits are rarely transferred automatically — expect an interview.",
    entryRequirements: [
      "Portfolio of studio work from the Indian programme",
      "Transcript for two completed years",
      "IELTS or TOEFL for English-taught programmes; Italian for Italian-taught ones",
      "Pre-enforcement (prevalsement) through the Italian embassy for non-EU applicants",
    ],
    typicalRisks: [
      "Italian admission for non-EU students runs through an embassy pre-enrolment step with fixed windows",
      "Studio credits rarely transfer cleanly — budget for possible extra time",
      "Italian-taught programmes require documented language ability",
      "Degree structures changed under the Bologna framework — confirm which year you enter",
    ],
    verifySteps: [
      "Ask the Politecnico's admissions office to map your credits before applying",
      "Confirm whether the programme is taught in English or Italian",
      "Check the embassy pre-enrolment window for your country",
      "Apply for a DSU scholarship if you are eligible — the deadline is separate",
    ],
    timeline: [
      { label: "Pre-enrolment (non-EU)", window: "Through the Italian embassy — fixed annual window", verifiedOn: V },
      { label: "DSU regional scholarship", window: "Separate application; check the regional call", verifiedOn: V },
      { label: "Visa", window: "After pre-enrolment confirmation", verifiedOn: V },
    ],
    officialSources: [{ label: "Italian Ministry of Education — university study", url: "https://www.universitaly.it" }],
    outcome:
      "A studio-based European architecture education for two years rather than five, with a portfolio built across two systems.",
    sourceIds: ["src-seed", "src-editorial"],
  },
  {
    id: "transfer-us-data",
    slug: "credit-transfer-usa-data-science",
    mode: "transfer",
    title: "Credit transfer to a US data science programme",
    field: "Computing & IT",
    countryId: "us",
    summary:
      "Complete a year or two of undergraduate study in India, then apply to a US university as a transfer student with evaluated credit — the US system is built for this.",
    indiaLeg: {
      years: 1,
      where: "An Indian college whose credit is evaluated by a US credential evaluation service",
      award: "Semester credits evaluated for transfer",
    },
    abroadLeg: {
      years: 3,
      where: "A US university admitting transfer students into a data science or computer science degree",
      award: "Bachelor's degree from the US university",
    },
    totalYears: 4,
    indiaCost: cost(100000, 450000, "Annual tuition at an Indian institution before transfer."),
    abroadCost: cost(3300000, 5500000, "Annual non-resident tuition in the US, converted at approximate rates; room and board add substantially."),
    creditTransfer:
      "US institutions decide credit individually after a credential evaluation (WES, ECE or the university's own service). Nothing is automatic — the evaluation takes weeks and the receiving department makes the final call.",
    entryRequirements: [
      "Transcript for completed semesters with a competitive GPA",
      "Credential evaluation of the Indian qualification",
      "IELTS or TOEFL, plus SAT for some institutions",
      "F-1 visa with I-20 issued by the accepting institution",
    ],
    typicalRisks: [
      "Transfer admission is more competitive than first-year admission at selective US universities",
      "Only some credits usually transfer — expect to repeat part of the coursework",
      "Non-resident tuition is the dominant cost and doesn't fall with transfer status",
      "F-1 visa rules restrict work; plan funding before you commit",
    ],
    verifySteps: [
      "Ask each target university how many credits it typically accepts for your qualification",
      "Order the credential evaluation early — it takes weeks",
      "Confirm the transfer GPA cut-off for your specific programme",
      "Check F-1 requirements on the Study in the States site before paying deposits",
    ],
    timeline: [
      { label: "Transfer application deadlines", window: "Often March–April for autumn entry", verifiedOn: V },
      { label: "Credential evaluation", window: "Start 4–6 months before applying", verifiedOn: V },
      { label: "F-1 visa interview", window: "After the I-20 is issued", verifiedOn: V },
    ],
    officialSources: [
      { label: "Study in the States (ICE)", url: "https://studyinthestates.dhs.gov" },
      { label: "F-1 student visa information", url: "https://www.ice.gov/sevis/students" },
    ],
    outcome:
      "The US system's built-in transfer route — realistic, but only after you know exactly how many of your Indian credits will be accepted.",
    sourceIds: ["src-us-ice", "src-editorial"],
  },
];

export const TWINNING_MAP = new Map(TWINNING_ROUTES.map((r) => [r.id, r]));
export const TWINNING_SLUG_MAP = new Map(TWINNING_ROUTES.map((r) => [r.slug, r]));

export function getTwinningRoute(id?: string | null) {
  if (!id) return undefined;
  return TWINNING_MAP.get(id) ?? TWINNING_SLUG_MAP.get(id);
}
