import type { Course, Institution, StudentProfile } from "@/lib/types";

export type EligibilityStatus = "likely" | "verify" | "not-eligible";

export interface EligibilityReason {
  kind: "match" | "uncertain" | "blocker";
  text: string;
}

export interface EligibilityResult {
  status: EligibilityStatus;
  reasons: EligibilityReason[];
  /** Requirement lines shown verbatim from the record. */
  requirements: string[];
  /** Exams the student still has to sit for this route. */
  pendingExams: string[];
}

const STATUS_LABEL: Record<EligibilityStatus, string> = {
  likely: "Likely eligible",
  verify: "Eligibility needs verification",
  "not-eligible": "Not currently eligible",
};

export function statusLabel(s: EligibilityStatus): string {
  return STATUS_LABEL[s];
}

function hasStream(profile: StudentProfile): profile is StudentProfile & { stream: NonNullable<StudentProfile["stream"]> } {
  return Boolean(profile.stream);
}

/**
 * Compares a student profile against a course requirement set.
 * Never returns "guaranteed" — admissions always stay conditional.
 */
export function assessCourse(course: Course, profile: StudentProfile | null): EligibilityResult {
  const rule = course.eligibility;
  const requirements: string[] = [];

  if (rule.minPercentage) requirements.push(`Minimum ${rule.minPercentage}% in Class 12 (or equivalent)`);
  if (rule.subjects?.length) requirements.push(`Class 12 subjects: ${rule.subjects.join(", ")}`);
  if (rule.entranceExams?.length) requirements.push(`Accepted entrance exams: ${rule.entranceExams.join(", ")}`);
  if (rule.notes?.length) requirements.push(...rule.notes);

  const reasons: EligibilityReason[] = [];
  const pendingExams: string[] = [];
  let blockers = 0;
  let uncertainties = 0;

  if (!profile) {
    return {
      status: "verify",
      reasons: [{ kind: "uncertain", text: "Sign in or complete onboarding to check this against your profile." }],
      requirements,
      pendingExams: rule.entranceExams ?? [],
    };
  }

  /* --- Stream --- */
  if (rule.streams.length > 0) {
    if (!hasStream(profile)) {
      uncertainties += 1;
      reasons.push({ kind: "uncertain", text: "We don't know your Class 12 stream yet, so we can't confirm the stream requirement." });
    } else if (rule.streams.includes(profile.stream)) {
      reasons.push({ kind: "match", text: `Matches your ${profile.stream.toUpperCase()} stream requirement.` });
    } else {
      const accepted = rule.streams.map((s) => s.toUpperCase()).join(", ");
      const open = rule.streams.length >= 5;
      if (open) {
        reasons.push({ kind: "match", text: "Open to every stream — your stream is not a barrier here." });
      } else {
        blockers += 1;
        reasons.push({ kind: "blocker", text: `This programme requires ${accepted}; your recorded stream is ${profile.stream.toUpperCase()}. Check alternate pathways under "What Else Can I Become?"` });
      }
    }
  }

  /* --- Percentage --- */
  const marks = profile.percentage ?? profile.expectedPercentage ?? null;
  if (rule.minPercentage) {
    if (marks === null) {
      uncertainties += 1;
      reasons.push({ kind: "uncertain", text: `Your percentage isn't recorded yet, so we can't check the ${rule.minPercentage}% minimum.` });
    } else if (profile.percentage === null && profile.expectedPercentage !== null) {
      uncertainties += 1;
      reasons.push({ kind: "uncertain", text: `Using your expected ${marks}%, you sit close to the ${rule.minPercentage}% threshold — confirm once final results are out.` });
    } else if (marks >= rule.minPercentage) {
      reasons.push({ kind: "match", text: `Your ${marks}% meets the ${rule.minPercentage}% minimum.` });
    } else {
      blockers += 1;
      reasons.push({ kind: "blocker", text: `Your ${marks}% is below the stated ${rule.minPercentage}% minimum for this programme.` });
    }
  }

  /* --- Subjects --- */
  if (rule.subjects?.length) {
    const profileSubjects = profile.subjects.map((s) => s.toLowerCase());
    if (profileSubjects.length === 0) {
      uncertainties += 1;
      reasons.push({ kind: "uncertain", text: `You haven't recorded your Class 12 subjects — ${rule.subjects.join(", ")} must be verified.` });
    } else {
      const missing = rule.subjects.filter(
        (req) => !profileSubjects.some((p) => p.includes(req.toLowerCase()) || req.toLowerCase().includes(p)),
      );
      const satisfied = missing.length === 0;
      if (satisfied) {
        reasons.push({ kind: "match", text: `You meet the subject requirement (${rule.subjects.join(", ")}).` });
      } else if (rule.allSubjectsRequired) {
        blockers += 1;
        reasons.push({ kind: "blocker", text: `Missing required subject(s): ${missing.join(", ")}.` });
      } else {
        uncertainties += 1;
        reasons.push({ kind: "uncertain", text: `Some preferred subjects aren't recorded (${missing.join(", ")}) — some universities substitute with a bridge requirement.` });
      }
    }
  }

  /* --- Entrance exams --- */
  const examIds = rule.entranceExams ?? [];
  if (examIds.length > 0) {
    const taken = profile.entranceScores.map((e) => e.exam.toLowerCase());
    const matched = examIds.filter((e) => taken.some((t) => t.includes(e.toLowerCase()) || e.toLowerCase().includes(t)));
    if (matched.length > 0) {
      reasons.push({ kind: "match", text: `You have a recorded score for ${matched.join(", ")}.` });
      uncertainties += 1;
      reasons.push({ kind: "uncertain", text: "Meeting the exam requirement doesn't confirm admission — seat allocation depends on that year's cutoffs." });
    } else {
      pendingExams.push(...examIds);
      uncertainties += 1;
      reasons.push({ kind: "uncertain", text: `You'd need to clear ${examIds.join(" / ")} — eligibility depends on that result.` });
    }
  }

  if (rule.notes?.length) {
    for (const note of rule.notes) reasons.push({ kind: "uncertain", text: note });
  }

  const status: EligibilityStatus = blockers > 0 ? "not-eligible" : uncertainties > 0 ? "verify" : "likely";
  return { status, reasons, requirements, pendingExams };
}

/**
 * Institution-level assessment: combines the route the institution publishes
 * with the assessments of the courses it actually offers.
 */
export function assessInstitution(
  inst: Institution,
  profile: StudentProfile | null,
  getCourse: (id: string) => Course | undefined,
): EligibilityResult {
  const requirements: string[] = [inst.eligibilitySummary];
  const reasons: EligibilityReason[] = [];
  const pendingExams: string[] = [...inst.entranceExams];

  if (!profile) {
    return {
      status: "verify",
      reasons: [{ kind: "uncertain", text: "Complete onboarding to compare this institution against your profile." }],
      requirements,
      pendingExams,
    };
  }

  const offered = inst.courseIds
    .map((id) => getCourse(id))
    .filter((c): c is Course => Boolean(c));

  const results = offered.map((c) => ({ course: c, result: assessCourse(c, profile) }));

  if (results.length === 0) {
    reasons.push({ kind: "uncertain", text: "We haven't mapped this institution's programmes to eligibility rules yet — treat every figure as unverified." });
    return { status: "verify", reasons, requirements, pendingExams };
  }

  const likely = results.filter((r) => r.result.status === "likely");
  const blocked = results.filter((r) => r.result.status === "not-eligible");
  const uncertain = results.filter((r) => r.result.status === "verify");

  if (likely.length > 0) {
    reasons.push({
      kind: "match",
      text: `You currently look eligible for ${likely.length} of the ${results.length} programmes we track here — for example ${likely
        .slice(0, 2)
        .map((r) => r.course.name)
        .join(", ")}.`,
    });
  }
  if (uncertain.length > 0) {
    reasons.push({
      kind: "uncertain",
      text: `${uncertain.length} programme(s) need verification: a subject, mark or exam requirement is still unresolved.`,
    });
  }
  if (blocked.length > 0 && likely.length === 0 && uncertain.length === 0) {
    reasons.push({ kind: "blocker", text: "None of the programmes we track here currently match your recorded profile." });
  }

  const examNames = Array.from(new Set(results.flatMap((r) => r.result.pendingExams)));
  pendingExams.splice(0, pendingExams.length, ...examNames);

  reasons.push({ kind: "uncertain", text: "Admission is always conditional on that year's cutoffs, seat availability and counselling." });

  const status: EligibilityStatus =
    blocked.length > 0 && likely.length === 0 && uncertain.length === 0
      ? "not-eligible"
      : likely.length > 0 && uncertain.length === 0
        ? "likely"
        : "verify";

  return { status, reasons, requirements, pendingExams };
}
