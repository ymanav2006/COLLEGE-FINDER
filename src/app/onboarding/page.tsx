"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Sparkles, AlertTriangle } from "lucide-react";
import { Btn, Badge, Note, Section } from "@/components/ui";
import { STREAMS, streamLabel } from "@/data/streams";
import { LOCATION_PREFERENCES } from "@/lib/recommend";
import { EMPTY_PROFILE, useAppStore } from "@/lib/store";
import type { StudentProfile, StreamId } from "@/lib/types";

const STEPS = [
  { id: "academic", title: "Academic profile", blurb: "Where you are right now." },
  { id: "interests", title: "Interests & abilities", blurb: "What you actually enjoy." },
  { id: "budget", title: "Budget", blurb: "What you can spend per year." },
  { id: "location", title: "Location preferences", blurb: "Where you'd like to study." },
  { id: "confirm", title: "Confirm", blurb: "Check it over and go." },
];

const INTEREST_POOL = [
  "Technology", "Healthcare", "Finance", "Design", "Media", "Education", "Law", "Environment",
  "Business", "Research", "Public policy", "Sports", "Arts", "Engineering", "Psychology",
];

const ACTIVITY_POOL = [
  "Debate / public speaking", "Coding projects", "Volunteering", "Sports", "Writing / blogging",
  "Photography", "Student council", "Music / dance", "Science fairs", "Part-time job",
  "Robotics", "Theatre", "NCC / NSS",
];

const WORK_STYLES = [
  { id: "hands-on", label: "Hands-on and practical", desc: "Building, fixing, doing." },
  { id: "analytical", label: "Analytical and deep-focus", desc: "Long stretches of thinking." },
  { id: "people", label: "People-facing", desc: "Talking, teaching, negotiating." },
  { id: "creative", label: "Creative and open-ended", desc: "No single right answer." },
];

const BOARDS = ["CBSE", "ICSE", "State board", "IB", "Cambridge (IGCSE)", "Other"];

const BUDGETS = [
  { label: "Under ₹1 lakh", value: 100_000 },
  { label: "₹1–3 lakh", value: 300_000 },
  { label: "₹3–5 lakh", value: 500_000 },
  { label: "₹5–10 lakh", value: 1_000_000 },
  { label: "₹10 lakh+ (including loans)", value: 2_000_000 },
];

const COUNTRIES_POOL = ["India", "Germany", "Canada", "United Kingdom", "Australia", "United States", "Singapore", "Netherlands"];

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

export default function OnboardingPage() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const stepFromStore = useAppStore((s) => s.onboardingStep);
  const setStepFromStore = useAppStore((s) => s.setOnboardingStep);

  const [step, setStep] = useState(stepFromStore);
  const [draft, setDraft] = useState<StudentProfile>({ ...(profile ?? EMPTY_PROFILE) });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) setDraft({ ...profile });
  }, [profile]);

  const patch = (p: Partial<StudentProfile>) => setDraft((d) => ({ ...d, ...p }));

  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return draft.stream !== null && (draft.percentage !== null || draft.expectedPercentage !== null);
      case 1:
        return draft.interests.length > 0;
      case 2:
        return draft.budgetYearlyINR !== null;
      case 3:
        return draft.locationPreference.length > 0;
      default:
        return true;
    }
  }, [step, draft]);

  const go = (next: number) => {
    if (next > step && !canProceed) {
      setError(
        step === 0
          ? "Add your Class 12 stream and either your marks or your expected marks to continue."
          : step === 1
            ? "Pick at least one interest so we can explain why recommendations appear."
            : step === 2
              ? "Choose a yearly budget band — you can change it later."
              : "Pick a location preference.",
      );
      return;
    }
    setError(null);
    setStep(next);
    setStepFromStore(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const finish = () => {
    completeOnboarding(draft);
    router.push("/dashboard");
  };

  return (
    <>
      <div className="border-b border-hairline bg-hero-mesh dark:border-hairline-dark">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-navy-500 dark:text-cyan-400">
            Onboarding · about two minutes
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl dark:text-slate-50">
            Tell us enough to be useful — nothing more.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-ink-muted dark:text-slate-400">
            Everything you enter stays in your browser. You can clear it all from your dashboard, and you can skip to a
            demo profile instead at any time.
          </p>

          {/* Progress */}
          <ol className="mt-8 flex flex-wrap gap-2" aria-label="Onboarding progress">
            {STEPS.map((s, i) => (
              <li key={s.id}>
                <button
                  onClick={() => i < step && go(i)}
                  disabled={i > step}
                  className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition ${
                    i === step
                      ? "bg-navy-600 text-white dark:bg-cyan-500 dark:text-navy-950"
                      : i < step
                        ? "border border-hairline bg-white text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-200"
                        : "border border-hairline bg-white/60 text-ink-faint dark:border-hairline-dark dark:bg-white/3"
                  }`}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" aria-hidden /> : <span>{i + 1}</span>}
                  {s.title}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <Section>
        <div className="mx-auto max-w-3xl">
          {error && (
            <div className="mb-6">
              <Note tone="warn">{error}</Note>
            </div>
          )}

          {/* ---------------- STEP 1: academic ---------------- */}
          {step === 0 && (
            <div className="card p-6 sm:p-8">
              <StepHead n={1} title="Your academic profile" blurb="This decides which eligibility rules we can actually check." />

              <Field label="Class 12 stream">
                <div className="grid gap-2 sm:grid-cols-3">
                  {STREAMS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => patch({ stream: s.id as StreamId })}
                      aria-pressed={draft.stream === s.id}
                      className={`rounded-2xl border p-4 text-left transition ${
                        draft.stream === s.id
                          ? "border-navy-500 bg-navy-50 dark:border-cyan-400 dark:bg-cyan-500/12"
                          : "border-hairline hover:border-navy-300 dark:border-hairline-dark"
                      }`}
                    >
                      <span className="block font-semibold text-ink dark:text-slate-100">{s.name}</span>
                      <span className="mt-1 block text-xs text-ink-muted">
                        {s.subjects.slice(0, 3).join(", ")}
                      </span>
                    </button>
                  ))}
                </div>
              </Field>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Board">
                  <select
                    value={draft.board}
                    onChange={(e) => patch({ board: e.target.value })}
                    className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  >
                    <option value="">Select your board</option>
                    {BOARDS.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Category (for reservation-based eligibility)">
                  <select
                    value={draft.category}
                    onChange={(e) => patch({ category: e.target.value })}
                    className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  >
                    <option value="">Prefer not to say</option>
                    {["General", "OBC", "SC", "ST", "EWS", "PwBD", "Other"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Class 12 percentage (if you have results)">
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={draft.percentage ?? ""}
                      onChange={(e) =>
                        patch({ percentage: e.target.value === "" ? null : Number(e.target.value) })
                      }
                      placeholder="e.g. 85"
                      className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 pr-9 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                    />
                    <span className="absolute right-3 top-2.5 text-sm text-ink-faint">%</span>
                  </div>
                </Field>
                <Field label="Expected percentage (if results aren't out)">
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={draft.expectedPercentage ?? ""}
                      onChange={(e) =>
                        patch({ expectedPercentage: e.target.value === "" ? null : Number(e.target.value) })
                      }
                      placeholder="e.g. 82"
                      className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 pr-9 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                    />
                    <span className="absolute right-3 top-2.5 text-sm text-ink-faint">%</span>
                  </div>
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Subjects studied (add one at a time, press Enter)">
                  <ChipsInput
                    values={draft.subjects}
                    placeholder="Physics, Chemistry, Mathematics…"
                    onAdd={(v) => patch({ subjects: toggle(draft.subjects, v) })}
                    onRemove={(v) => patch({ subjects: draft.subjects.filter((s) => s !== v) })}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Entrance exam scores already in hand (optional)">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={draft.entranceScores[0]?.exam ?? ""}
                      onChange={(e) =>
                        patch({
                          entranceScores: [{ exam: e.target.value, score: draft.entranceScores[0]?.score ?? "" }],
                        })
                      }
                      placeholder="Exam name (e.g. JEE Main)"
                      className="rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                    />
                    <input
                      value={draft.entranceScores[0]?.score ?? ""}
                      onChange={(e) =>
                        patch({
                          entranceScores: [{ exam: draft.entranceScores[0]?.exam ?? "", score: e.target.value }],
                        })
                      }
                      placeholder="Percentile / rank / score"
                      className="rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                    />
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* ---------------- STEP 2: interests ---------------- */}
          {step === 1 && (
            <div className="card p-6 sm:p-8">
              <StepHead n={2} title="Interests & abilities" blurb="These become the visible reasons on your recommendation cards." />

              <Field label="What are you interested in? (pick as many as you like)">
                <Pills pool={INTEREST_POOL} selected={draft.interests} onToggle={(v) => patch({ interests: toggle(draft.interests, v) })} />
              </Field>

              <Field label="Subjects you genuinely enjoy">
                <Pills
                  pool={["Mathematics", "Physics", "Biology", "Chemistry", "Computer Science", "Economics", "Business Studies", "Accountancy", "History", "Political Science", "Psychology", "English", "Art", "Geography"]}
                  selected={draft.favoriteSubjects}
                  onToggle={(v) => patch({ favoriteSubjects: toggle(draft.favoriteSubjects, v) })}
                />
              </Field>

              <Field label="Activities you do outside class">
                <Pills pool={ACTIVITY_POOL} selected={draft.activities} onToggle={(v) => patch({ activities: toggle(draft.activities, v) })} />
              </Field>

              <Field label="How do you like to work?">
                <div className="grid gap-2 sm:grid-cols-2">
                  {WORK_STYLES.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => patch({ workStyle: w.id })}
                      aria-pressed={draft.workStyle === w.id}
                      className={`rounded-2xl border p-4 text-left transition ${
                        draft.workStyle === w.id
                          ? "border-navy-500 bg-navy-50 dark:border-cyan-400 dark:bg-cyan-500/12"
                          : "border-hairline hover:border-navy-300 dark:border-hairline-dark"
                      }`}
                    >
                      <span className="block font-medium text-ink dark:text-slate-100">{w.label}</span>
                      <span className="mt-0.5 block text-xs text-ink-muted">{w.desc}</span>
                    </button>
                  ))}
                </div>
              </Field>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <Slider
                  label="Research interest"
                  hint="How much do you want to investigate, experiment and publish?"
                  value={draft.researchInterest}
                  onChange={(v) => patch({ researchInterest: v })}
                />
                <Slider
                  label="Entrepreneurship interest"
                  hint="How drawn are you to starting something of your own?"
                  value={draft.entrepreneurshipInterest}
                  onChange={(v) => patch({ entrepreneurshipInterest: v })}
                />
              </div>
            </div>
          )}

          {/* ---------------- STEP 3: budget ---------------- */}
          {step === 2 && (
            <div className="card p-6 sm:p-8">
              <StepHead n={3} title="Your yearly budget" blurb="Tuition + typical living costs. We'll flag anything above it." />

              <Field label="Pick a band">
                <div className="grid gap-2 sm:grid-cols-2">
                  {BUDGETS.map((b) => (
                    <button
                      key={b.label}
                      onClick={() => patch({ budgetYearlyINR: b.value, budgetPreset: b.label })}
                      aria-pressed={draft.budgetYearlyINR === b.value}
                      className={`rounded-2xl border p-4 text-left transition ${
                        draft.budgetYearlyINR === b.value
                          ? "border-navy-500 bg-navy-50 dark:border-cyan-400 dark:bg-cyan-500/12"
                          : "border-hairline hover:border-navy-300 dark:border-hairline-dark"
                      }`}
                    >
                      <span className="block font-semibold text-ink dark:text-slate-100">{b.label}</span>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Or type an exact yearly amount (₹)">
                <input
                  type="number"
                  value={draft.budgetYearlyINR ?? ""}
                  onChange={(e) =>
                    patch({ budgetYearlyINR: e.target.value === "" ? null : Number(e.target.value), budgetPreset: "Custom" })
                  }
                  placeholder="e.g. 350000"
                  className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                />
              </Field>

              <div className="mt-6 space-y-3">
                <CheckRow label="I'm dependent on scholarships to make this work" checked={draft.scholarshipDependent} onChange={(v) => patch({ scholarshipDependent: v })} />
                <CheckRow label="Education loans are acceptable to me" checked={draft.loanAcceptable} onChange={(v) => patch({ loanAcceptable: v })} />
                <CheckRow label="I prefer public / government institutions" checked={draft.preferPublic} onChange={(v) => patch({ preferPublic: v })} />
                <CheckRow label="Private institutions are acceptable" checked={draft.privateAcceptable} onChange={(v) => patch({ privateAcceptable: v })} />
              </div>

              <div className="mt-6">
                <Note>
                  Budgets here cover <strong>tuition and typical living costs</strong>, not one-off costs like travel,
                  laptops or entrance fees. The budget planner breaks those out for you afterwards.
                </Note>
              </div>
            </div>
          )}

          {/* ---------------- STEP 4: location ---------------- */}
          {step === 3 && (
            <div className="card p-6 sm:p-8">
              <StepHead n={4} title="Where would you like to study?" blurb="We won't filter out good options — we'll just explain the distance trade-off." />

              <Field label="Region preference">
                <div className="grid gap-2 sm:grid-cols-3">
                  {LOCATION_PREFERENCES.map((p) => (
                    <button
                      key={p}
                      onClick={() => patch({ locationPreference: p })}
                      aria-pressed={draft.locationPreference === p}
                      className={`rounded-2xl border p-3.5 text-left text-sm transition ${
                        draft.locationPreference === p
                          ? "border-navy-500 bg-navy-50 font-medium text-ink dark:border-cyan-400 dark:bg-cyan-500/12 dark:text-slate-100"
                          : "border-hairline text-ink-muted hover:border-navy-300 dark:border-hairline-dark dark:text-slate-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="mt-6 space-y-3">
                <CheckRow
                  label="I'm open to studying abroad"
                  checked={draft.wantAbroad}
                  onChange={(v) => patch({ wantAbroad: v, locationPreference: v && draft.locationPreference === "India" ? "Abroad" : draft.locationPreference })}
                />
                <Field label="Home state / city (optional)">
                  <input
                    value={draft.state}
                    onChange={(e) => patch({ state: e.target.value })}
                    placeholder="e.g. Punjab, or Chandigarh"
                    className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  />
                </Field>
              </div>

              {draft.wantAbroad && (
                <div className="mt-6">
                  <Field label="Countries you're considering">
                    <Pills pool={COUNTRIES_POOL} selected={draft.specificCountries} onToggle={(v) => patch({ specificCountries: toggle(draft.specificCountries, v) })} />
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* ---------------- STEP 5: confirm ---------------- */}
          {step === 4 && (
            <div className="card p-6 sm:p-8">
              <StepHead n={5} title="Check it over" blurb="Nothing here is permanent — change it any time from your dashboard." />

              <dl className="divide-y divide-hairline text-sm dark:divide-hairline-dark">
                <Row label="Stream" value={draft.stream ? streamLabel(draft.stream) : "Not set"} />
                <Row label="Board" value={draft.board || "Not set"} />
                <Row label="Percentage" value={draft.percentage !== null ? `${draft.percentage}%` : draft.expectedPercentage !== null ? `${draft.expectedPercentage}% (expected)` : "Not set"} />
                <Row label="Subjects" value={draft.subjects.join(", ") || "Not set"} />
                <Row label="Interests" value={draft.interests.join(", ") || "None selected"} />
                <Row label="Favourite subjects" value={draft.favoriteSubjects.join(", ") || "None selected"} />
                <Row label="Work style" value={WORK_STYLES.find((w) => w.id === draft.workStyle)?.label ?? "Not set"} />
                <Row label="Yearly budget" value={draft.budgetYearlyINR ? `₹${draft.budgetYearlyINR.toLocaleString("en-IN")}` : "Not set"} />
                <Row label="Scholarship dependent" value={draft.scholarshipDependent ? "Yes" : "No"} />
                <Row label="Location preference" value={draft.locationPreference} />
                <Row label="Open to abroad" value={draft.wantAbroad ? "Yes" : "No"} />
              </dl>

              <div className="mt-6 space-y-3">
                <Note tone="info">
                  Based on this, your dashboard will rank colleges, courses and careers — and each card will show the exact
                  reason it appears. Nothing is guaranteed; admission stays subject to cutoffs and counselling.
                </Note>
                <Note>
                  Your data is stored <strong>only in this browser</strong>. There is no account, no upload and no
                  analytics on your answers.
                </Note>
              </div>
            </div>
          )}

          {/* ---------------- Nav ---------------- */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <Btn variant="ghost" onClick={() => go(Math.max(0, step - 1))} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back
            </Btn>

            {step < STEPS.length - 1 ? (
              <Btn onClick={() => go(step + 1)}>
                Continue <ArrowRight className="h-4 w-4" aria-hidden />
              </Btn>
            ) : (
              <Btn onClick={finish}>
                <Sparkles className="h-4 w-4" aria-hidden /> Build my Education Map
              </Btn>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-ink-faint">
            Rather not answer these?{" "}
            <Link href="/sign-in" className="font-semibold text-navy-600 dark:text-cyan-300">
              Use a demo profile instead
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Small field helpers                                                 */
/* ------------------------------------------------------------------ */

function StepHead({ n, title, blurb }: { n: number; title: string; blurb: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-600 text-xs font-bold text-white dark:bg-cyan-500 dark:text-navy-950">
          {n}
        </span>
        <h2 className="text-xl font-semibold text-ink dark:text-slate-50">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-ink-muted">{blurb}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 first:mt-0">
      <p className="mb-2 text-[13px] font-semibold text-ink dark:text-slate-200">{label}</p>
      {children}
    </div>
  );
}

function Pills({ pool, selected, onToggle }: { pool: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {pool.map((p) => {
        const on = selected.includes(p);
        return (
          <button
            key={p}
            onClick={() => onToggle(p)}
            aria-pressed={on}
            className={`rounded-full border px-3.5 py-2 text-[13px] transition ${
              on
                ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950"
                : "border-hairline bg-white text-ink-muted hover:border-navy-300 hover:text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
            }`}
          >
            {on && <Check className="mr-1 inline h-3 w-3" aria-hidden />}
            {p}
          </button>
        );
      })}
    </div>
  );
}

function ChipsInput({
  values,
  placeholder,
  onAdd,
  onRemove,
}: {
  values: string[];
  placeholder: string;
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div>
      <div className="flex gap-2">
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              onAdd(draft.trim());
              setDraft("");
            }
          }}
          className="w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
        />
        <Btn
          variant="secondary"
          onClick={() => {
            if (draft.trim()) {
              onAdd(draft.trim());
              setDraft("");
            }
          }}
        >
          Add
        </Btn>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((v) => (
            <button
              key={v}
              onClick={() => onRemove(v)}
              className="chip bg-surface-sunken text-ink-muted hover:bg-signal-red-soft hover:text-signal-red dark:bg-white/8"
              title="Remove"
            >
              {v} <span aria-hidden>×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Slider({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const words = ["Not at all", "A little", "Somewhat", "Quite a bit", "A lot"];
  return (
    <div>
      <p className="text-[13px] font-semibold text-ink dark:text-slate-200">{label}</p>
      <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[#2450c7] dark:accent-[#3ad9ec]"
        aria-label={label}
      />
      <div className="mt-1 flex justify-between text-[10px] text-ink-faint">
        {words.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-hairline px-4 py-3 text-sm text-ink dark:border-hairline-dark dark:text-slate-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#2450c7] dark:accent-[#3ad9ec]"
      />
      {label}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-3 py-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-medium text-ink dark:text-slate-100">{value}</dd>
    </div>
  );
}
