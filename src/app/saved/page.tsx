"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Bookmark, ArrowRight, Trash2, GraduationCap, BookOpen, Briefcase, Wallet, CalendarDays, Wrench, Globe2 } from "lucide-react";
import { Btn, Badge, PageHeader, Section, EmptyState, Note } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { getInstitution } from "@/data/colleges";
import { getCourse } from "@/data/courses";
import { getCareer } from "@/data/careers";
import { getScholarship } from "@/data/scholarships";
import { getExam } from "@/data/exams";
import { getSkill } from "@/data/skills";
import { COUNTRIES } from "@/data/countries";
import { formatDate } from "@/lib/format";
import type { SavedItem } from "@/lib/types";

const KIND_META: Record<
  SavedItem["kind"],
  { label: string; href: (id: string) => string; title: (id: string) => string; sub: (id: string) => string | null; icon: typeof GraduationCap }
> = {
  college: {
    label: "Institutions",
    href: (id) => {
      const i = getInstitution(id);
      return i ? `/colleges/${i.slug}` : "/colleges";
    },
    title: (id) => getInstitution(id)?.name ?? "Unknown institution",
    sub: (id) => {
      const i = getInstitution(id);
      return i ? `${i.city}, ${i.state}` : null;
    },
    icon: GraduationCap,
  },
  course: {
    label: "Courses",
    href: (id) => {
      const c = getCourse(id);
      return c ? `/courses/${c.slug}` : "/courses";
    },
    title: (id) => getCourse(id)?.name ?? "Unknown course",
    sub: (id) => {
      const c = getCourse(id);
      return c ? `${c.durationYears} yr · ${c.degreeType}` : null;
    },
    icon: BookOpen,
  },
  career: {
    label: "Careers",
    href: (id) => {
      const c = getCareer(id);
      return c ? `/careers/${c.slug}` : "/careers";
    },
    title: (id) => getCareer(id)?.name ?? "Unknown career",
    sub: (id) => getCareer(id)?.domain ?? null,
    icon: Briefcase,
  },
  scholarship: {
    label: "Scholarships",
    href: (id) => {
      const s = getScholarship(id);
      return s ? `/scholarships?s=${s.slug}` : "/scholarships";
    },
    title: (id) => getScholarship(id)?.name ?? "Unknown scholarship",
    sub: (id) => getScholarship(id)?.provider ?? null,
    icon: Wallet,
  },
  exam: {
    label: "Entrance exams",
    href: (id) => {
      const e = getExam(id);
      return e ? `/exams/${e.slug}` : "/exams";
    },
    title: (id) => getExam(id)?.name ?? "Unknown exam",
    sub: (id) => getExam(id)?.conductedBy ?? null,
    icon: CalendarDays,
  },
  skill: {
    label: "Skills",
    href: (id) => {
      const s = getSkill(id);
      return s ? `/skills/${s.slug}` : "/skills";
    },
    title: (id) => getSkill(id)?.name ?? "Unknown skill",
    sub: (id) => getSkill(id)?.category ?? null,
    icon: Wrench,
  },
  country: {
    label: "Destinations",
    href: (id) => {
      const c = COUNTRIES.find((x) => x.id === id);
      return c ? `/abroad/${c.slug}` : "/abroad";
    },
    title: (id) => COUNTRIES.find((x) => x.id === id)?.name ?? "Unknown destination",
    sub: (id) => COUNTRIES.find((x) => x.id === id)?.region ?? null,
    icon: Globe2,
  },
};

const KINDS = Object.keys(KIND_META) as SavedItem["kind"][];

export default function SavedPage() {
  const saved = useAppStore((s) => s.saved);
  const toggleSaved = useAppStore((s) => s.toggleSaved);

  const grouped = useMemo(() => {
    const m = new Map<SavedItem["kind"], SavedItem[]>();
    for (const k of KINDS) m.set(k, []);
    for (const item of saved) m.get(item.kind)?.push(item);
    return Array.from(m.entries()).filter(([, v]) => v.length > 0);
  }, [saved]);

  return (
    <>
      <PageHeader
        eyebrow="Your library"
        title="Everything you've saved"
        lede="Shortlists decay quickly — a scholarship saved in September and still unread in March is a liability, not an asset. This page exists so you can see what's gone stale."
        actions={
          <>
            <Btn href="/colleges">Keep browsing</Btn>
            <Btn href="/tools/decision-matrix" variant="secondary">Compare what you saved</Btn>
          </>
        }
      />

      <Section wide>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Saved items</p>
            <p className="mt-1.5 text-3xl font-semibold tabular text-ink dark:text-slate-50">{saved.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Categories used</p>
            <p className="mt-1.5 text-3xl font-semibold tabular text-ink dark:text-slate-50">{grouped.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Stored</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              On this device only. Nothing is synced or shared.
            </p>
          </div>
        </div>

        {saved.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            body="Use the bookmark on any college, course, career, exam, scholarship, skill or destination and it lands here with the date you saved it."
            icon={<Bookmark className="h-6 w-6" aria-hidden />}
            action={<Btn href="/colleges">Browse institutions</Btn>}
            secondaryAction={<Btn href="/dashboard" variant="secondary">Open my dashboard</Btn>}
          />
        ) : (
          <div className="space-y-8">
            {grouped.map(([kind, items]) => {
              const meta = KIND_META[kind];
              const Icon = meta.icon;
              return (
                <div key={kind}>
                  <div className="mb-3 flex items-baseline gap-3">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-ink dark:text-slate-50">
                      <Icon className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden />
                      {meta.label}
                    </h2>
                    <span className="text-xs text-ink-faint">{items.length}</span>
                  </div>

                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => {
                      const title = meta.title(item.id);
                      const sub = meta.sub(item.id);
                      return (
                        <li key={`${item.kind}-${item.id}`} className="card flex items-start justify-between gap-3 p-4">
                          <Link href={meta.href(item.id)} className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-ink dark:text-slate-100">{title}</span>
                            {sub && <span className="mt-0.5 block truncate text-xs text-ink-muted">{sub}</span>}
                            <span className="mt-1.5 block text-[11px] text-ink-faint">Saved {formatDate(item.savedAt)}</span>
                          </Link>
                          <button
                            onClick={() => toggleSaved(item.kind, item.id)}
                            aria-label={`Remove ${title} from saved`}
                            className="rounded-full p-1.5 text-ink-faint transition hover:bg-signal-red-soft hover:text-signal-red"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { t: "Compare two saved colleges", d: "Side by side on thirteen dimensions.", href: "/tools/compare" },
            { t: "Put them on a timeline", d: "Turn your shortlist into dated milestones.", href: "/roadmap" },
            { t: "Track the applications", d: "Documents, fees and status per institution.", href: "/tools/applications" },
          ].map((x) => (
            <Link key={x.t} href={x.href} className="card interactive-card p-5">
              <p className="flex items-center gap-1 font-semibold text-ink dark:text-slate-100">
                {x.t} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </p>
              <p className="mt-1.5 text-sm text-ink-muted">{x.d}</p>
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <Note>
            Saving something is not a commitment. The point of this list is to keep options visible long enough to
            reject them properly — not to grow forever.
          </Note>
        </div>
      </Section>
    </>
  );
}
