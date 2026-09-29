"use client";

import Link from "next/link";
import {
  Bookmark, BookmarkCheck, Scale, MapPin, Clock, IndianRupee, ExternalLink,
  Building2, ArrowRight,
} from "lucide-react";
import { Badge, ConfidenceBadge, WhyList, Btn } from "@/components/ui";
import { formatINR, formatDate } from "@/lib/format";
import { useAppStore } from "@/lib/store";
import { getCourse } from "@/data/courses";
import { convertToINR } from "@/data/money";
import type { Career, Course, EntranceExam, Institution, Scholarship, Skill, Country } from "@/lib/types";
import type { Ranked } from "@/lib/recommend";

/* ------------------------------------------------------------------ */
/* Save + compare controls                                             */
/* ------------------------------------------------------------------ */

export function SaveButton({ kind, id, className = "" }: { kind: "college" | "course" | "career" | "scholarship" | "exam" | "skill" | "country"; id: string; className?: string }) {
  const saved = useAppStore((s) => s.saved.some((x) => x.kind === kind && x.id === id));
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(kind, id);
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save for later"}
      title={saved ? "Remove from saved" : "Save for later"}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
        saved
          ? "border-navy-400 bg-navy-50 text-navy-600 dark:border-cyan-400 dark:bg-cyan-500/15 dark:text-cyan-300"
          : "border-hairline bg-white text-ink-faint hover:border-navy-300 hover:text-navy-600 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-400"
      } ${className}`}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
    </button>
  );
}

export function CompareToggle({ id, label = "Compare" }: { id: string; label?: string }) {
  const selected = useAppStore((s) => s.compare.includes(id));
  const toggle = useAppStore((s) => s.toggleCompare);
  const full = useAppStore((s) => s.compare.length >= 5);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      disabled={!selected && full}
      aria-pressed={selected}
      title={selected ? "Remove from comparison" : full ? "You can compare up to 5 at once" : "Add to comparison"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${
        selected
          ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950"
          : "border-hairline bg-white text-ink-muted hover:border-navy-300 hover:text-navy-600 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
      }`}
    >
      <Scale className="h-3.5 w-3.5" aria-hidden />
      {selected ? "Selected" : label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Institution card                                                    */
/* ------------------------------------------------------------------ */

export function InstitutionCard({ ranked, compact = false }: { ranked: Ranked<Institution>; compact?: boolean }) {
  const i = ranked.item;
  const tuitionINR = convertToINR(i.tuition.tuitionAnnual.value, i.tuition.currency);
  const offered = i.courseIds.map(getCourse).filter(Boolean).slice(0, 3) as Course[];

  return (
    <article className="card interactive-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-navy-500 dark:text-cyan-400">
            <Building2 className="h-3.5 w-3.5" aria-hidden />
            {i.type} · {i.category}
          </div>
          <h3 className="mt-2 text-base font-semibold leading-snug text-ink dark:text-slate-50">
            <Link href={`/colleges/${i.slug}`} className="hover:text-navy-600 dark:hover:text-cyan-300">
              {i.name}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
            <MapPin className="h-3 w-3" aria-hidden />
            {i.city}, {i.state}
          </p>
        </div>
        <SaveButton kind="college" id={i.id} />
      </div>

      {!compact && (
        <p className="mt-3 text-[13px] leading-relaxed text-ink-muted dark:text-slate-400">
          {i.highlights[0] ?? i.admissionRoute}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl bg-surface-muted p-3 dark:bg-white/5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Tuition / year</p>
          <p className="mt-1 font-semibold tabular text-ink dark:text-slate-100">
            {i.tuition.currency === "INR" ? formatINR(tuitionINR) : `${i.tuition.tuitionAnnual.value.toLocaleString("en-IN")} ${i.tuition.currency}`}
          </p>
          <p className="mt-0.5 text-[10px] text-ink-faint">~{formatINR(tuitionINR)} equivalent</p>
        </div>
        <div className="rounded-xl bg-surface-muted p-3 dark:bg-white/5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Entrance</p>
          <p className="mt-1 font-semibold text-ink dark:text-slate-100">
            {i.entranceExams.length > 0 ? i.entranceExams.slice(0, 2).join(", ") : "Merit / institute"}
          </p>
          <p className="mt-0.5 text-[10px] text-ink-faint">{i.courseIds.length} programmes</p>
        </div>
      </div>

      {offered.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {offered.map((c) => (
            <Link key={c.id} href={`/courses/${c.slug}`} className="chip bg-surface-sunken text-[10px] text-ink-muted hover:text-navy-600 dark:bg-white/8 dark:text-slate-300">
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone={ranked.eligibility.status === "likely" ? "green" : ranked.eligibility.status === "verify" ? "amber" : "red"}>
          {ranked.eligibility.status === "likely"
            ? "Likely eligible"
            : ranked.eligibility.status === "verify"
              ? "Needs verification"
              : "Not currently eligible"}
        </Badge>
        <ConfidenceBadge confidence={i.tuition.tuitionAnnual.confidence} />
      </div>

      <div className="mt-4 flex-1">
        <WhyList reasons={ranked.reasons} cautions={ranked.cautions} compact />
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-hairline pt-4 dark:border-hairline-dark">
        <CompareToggle id={i.id} />
        <Link
          href={`/colleges/${i.slug}`}
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 hover:gap-2 dark:text-cyan-300"
        >
          Full profile <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Course card                                                         */
/* ------------------------------------------------------------------ */

export function CourseCard({ ranked }: { ranked: Ranked<Course> }) {
  const c = ranked.item;
  const mid = (c.annualCost.value.minINR + c.annualCost.value.maxINR) / 2;

  return (
    <article className="card interactive-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-500 dark:text-cyan-400">
            {c.degreeType} · {c.durationYears} year{c.durationYears === 1 ? "" : "s"}
          </p>
          <h3 className="mt-1.5 text-base font-semibold leading-snug text-ink dark:text-slate-50">
            <Link href={`/courses/${c.slug}`} className="hover:text-navy-600 dark:hover:text-cyan-300">
              {c.name}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-ink-muted">{c.tagline}</p>
        </div>
        <SaveButton kind="course" id={c.id} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="chip bg-surface-sunken text-[10px] text-ink-muted dark:bg-white/8 dark:text-slate-300">
          <Clock className="h-3 w-3" aria-hidden /> {c.durationYears} yr
        </span>
        <span className="chip bg-surface-sunken text-[10px] text-ink-muted dark:bg-white/8 dark:text-slate-300">
          <IndianRupee className="h-3 w-3" aria-hidden /> {formatINR(c.annualCost.value.minINR)}–{formatINR(c.annualCost.value.maxINR)}/yr
        </span>
        <span className="chip bg-surface-sunken text-[10px] text-ink-muted dark:bg-white/8 dark:text-slate-300">
          {c.streams.map((s) => s.toUpperCase()).join(" / ")}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {c.entranceExams.slice(0, 3).map((e) => (
          <span key={e} className="chip border border-hairline text-[10px] text-ink-muted dark:border-hairline-dark dark:text-slate-300">
            {e}
          </span>
        ))}
        {c.entranceExams.length === 0 && (
          <span className="chip border border-hairline text-[10px] text-ink-muted dark:border-hairline-dark dark:text-slate-300">
            No listed entrance exam
          </span>
        )}
      </div>

      <div className="mt-4 flex-1">
        <WhyList reasons={ranked.reasons} cautions={ranked.cautions} compact />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-4 dark:border-hairline-dark">
        <span className="text-[11px] text-ink-faint">Mid-point ~{formatINR(mid)}/yr</span>
        <Link href={`/courses/${c.slug}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
          Course profile <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Career card                                                         */
/* ------------------------------------------------------------------ */

export function CareerCard({ ranked }: { ranked: Ranked<Career> }) {
  const c = ranked.item;
  return (
    <article className="card interactive-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-500 dark:text-cyan-400">{c.domain}</p>
          <h3 className="mt-1.5 text-base font-semibold text-ink dark:text-slate-50">
            <Link href={`/careers/${c.slug}`} className="hover:text-navy-600 dark:hover:text-cyan-300">
              {c.name}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-ink-muted">{c.blurb}</p>
        </div>
        <SaveButton kind="career" id={c.id} />
      </div>

      <div className="mt-4 rounded-xl bg-surface-muted p-3 dark:bg-white/5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Salary range (reported)</p>
        <p className="mt-1 text-sm font-medium text-ink dark:text-slate-100">{c.salary.value}</p>
      </div>

      <div className="mt-4 flex-1">
        <WhyList reasons={ranked.reasons} cautions={ranked.cautions} compact />
      </div>

      <div className="mt-4 border-t border-hairline pt-4 dark:border-hairline-dark">
        <Link href={`/careers/${c.slug}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
          What the work is like <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Compact list rows                                                   */
/* ------------------------------------------------------------------ */

export function ScholarshipRow({ s }: { s: Scholarship }) {
  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-ink dark:text-slate-50">{s.name}</h3>
          <p className="mt-0.5 text-xs text-ink-muted">{s.provider}</p>
        </div>
        <SaveButton kind="scholarship" id={s.id} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {s.types.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
        <Badge tone="blue">{s.countryId.toUpperCase()}</Badge>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{s.eligibility}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-surface-muted p-3 dark:bg-white/5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">What it covers</p>
          <p className="mt-1 text-sm text-ink dark:text-slate-100">{s.amount.value}</p>
        </div>
        <div className="rounded-xl bg-surface-muted p-3 dark:bg-white/5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Deadline</p>
          <p className="mt-1 text-sm text-ink dark:text-slate-100">{s.deadline.value}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-ink-faint">
        <ConfidenceBadge confidence={s.confidence} />
        <span>Last checked {formatDate(s.lastVerified)}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Btn href={s.applyUrl} variant="secondary" size="sm" external>
          Apply on official site <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Btn>
        <Btn href={`/scholarships?s=${s.slug}`} variant="ghost" size="sm">
          Details
        </Btn>
      </div>
    </article>
  );
}

export function ExamCard({ e }: { e: EntranceExam }) {
  return (
    <article className="card interactive-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-500 dark:text-cyan-400">
            {e.level} · {e.countryId.toUpperCase()}
          </p>
          <h3 className="mt-1.5 text-base font-semibold text-ink dark:text-slate-50">
            <Link href={`/exams/${e.slug}`}>{e.name}</Link>
          </h3>
          <p className="mt-0.5 text-xs text-ink-muted">{e.conductedBy}</p>
        </div>
        <SaveButton kind="exam" id={e.id} />
      </div>

      <p className="mt-3 text-sm text-ink-muted">{e.whoNeedsIt}</p>

      <ul className="mt-3 space-y-1.5 text-xs text-ink-muted">
        {e.importantDates.slice(0, 2).map((d) => (
          <li key={d.label} className="flex items-start gap-1.5">
            <CalendarDot />
            <span>
              <strong className="font-medium text-ink dark:text-slate-200">{d.label}:</strong> {d.window}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between">
          <ConfidenceBadge confidence={e.confidence} />
          <Link href={`/exams/${e.slug}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
            Full details <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <p className="mt-2 text-[10px] text-ink-faint">Last checked {formatDate(e.lastVerified)}</p>
      </div>
    </article>
  );
}

function CalendarDot() {
  return <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-400 dark:bg-cyan-400" aria-hidden />;
}

export function SkillCard({ s }: { s: Skill }) {
  return (
    <article className="card interactive-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-500 dark:text-cyan-400">{s.category}</p>
          <h3 className="mt-1.5 text-base font-semibold text-ink dark:text-slate-50">
            <Link href={`/skills/${s.slug}`}>{s.name}</Link>
          </h3>
        </div>
        <SaveButton kind="skill" id={s.id} />
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">{s.why}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-4 dark:border-hairline-dark">
        <span className="chip bg-surface-sunken text-[10px] text-ink-muted dark:bg-white/8 dark:text-slate-300">{s.approxTime}</span>
        <Link href={`/skills/${s.slug}`} className="text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
          Learning path →
        </Link>
      </div>
    </article>
  );
}

export function CountryCard({ c }: { c: Country }) {
  return (
    <article className="card interactive-card flex h-full flex-col p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>{c.flag}</span>
          <div>
            <h3 className="font-semibold text-ink dark:text-slate-50">
              <Link href={`/abroad/${c.slug}`}>{c.name}</Link>
            </h3>
            <p className="text-xs text-ink-muted">{c.region}</p>
          </div>
        </div>
        <SaveButton kind="country" id={c.id} />
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-faint">Tuition</dt>
          <dd className="text-right font-medium text-ink dark:text-slate-100">{c.tuitionRange.value}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-faint">Living</dt>
          <dd className="text-right font-medium text-ink dark:text-slate-100">{c.livingRange.value}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {c.popularFields.slice(0, 3).map((f) => (
          <span key={f} className="chip bg-surface-sunken text-[10px] text-ink-muted dark:bg-white/8 dark:text-slate-300">
            {f}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-4 text-[11px] text-ink-faint">
        Last verified {formatDate(c.lastVerified)}
      </div>
    </article>
  );
}
