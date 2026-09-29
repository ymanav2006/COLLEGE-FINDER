"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Globe2, ArrowRight, Sparkles } from "lucide-react";
import { Btn, Badge, PageHeader, Section, EmptyState, Note } from "@/components/ui";
import { ABROAD_INSTITUTIONS } from "@/data/colleges";
import { COUNTRIES, getCountry } from "@/data/countries";
import { SCHOLARSHIPS } from "@/data/scholarships";
import { EXAMS } from "@/data/exams";
import { COURSES } from "@/data/courses";
import { TWINNING_ROUTES } from "@/data/twinning";
import { formatINR, formatDate } from "@/lib/format";
import { convertToINR } from "@/data/money";

type Kind = "university" | "pathway" | "country" | "scholarship" | "test" | "course";

const KINDS: { id: Kind | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "university", label: "Universities" },
  { id: "pathway", label: "2+2 & transfer" },
  { id: "country", label: "Countries" },
  { id: "scholarship", label: "Scholarships" },
  { id: "test", label: "Tests & language" },
  { id: "course", label: "Courses" },
];

const KIND_LABEL: Record<Kind, string> = {
  university: "Universities outside India",
  pathway: "2+2 & transfer pathways",
  country: "Country guides",
  scholarship: "Scholarships & funding",
  test: "Language & entrance tests",
  course: "Courses with an abroad route",
};

const KIND_ORDER: Kind[] = ["university", "pathway", "country", "scholarship", "test", "course"];

const ABROAD_TESTS = new Set([
  "ielts", "toefl", "pte", "det", "gre", "gmat", "sat", "act", "lsat", "mcat",
  "testdaf", "delfdalf", "jlpt", "eju", "topik",
]);

const SUGGESTIONS = [
  "2+2 engineering",
  "scholarships in Germany",
  "IELTS",
  "Canada",
  "masters in computer science",
  "transfer to USA",
  "cheapest tuition abroad",
  "New Zealand",
];

interface AbroadDoc {
  kind: Kind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  countryId?: string;
  keywords: string;
  badge?: string;
  meta?: string;
}

export function AbroadSearch() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Kind | "all">("all");
  const [countryId, setCountryId] = useState("all");

  const docs = useMemo<AbroadDoc[]>(() => {
    const out: AbroadDoc[] = [];

    for (const i of ABROAD_INSTITUTIONS) {
      const c = getCountry(i.countryId);
      out.push({
        kind: "university",
        id: i.id,
        title: i.name,
        subtitle: `${i.city}, ${i.state} · ${c?.name ?? i.countryId}`,
        href: `/colleges/${i.slug}`,
        countryId: i.countryId,
        keywords: [i.name, i.city, i.state, c?.name ?? "", ...i.departments, ...i.highlights].join(" "),
        badge: `${i.type} ${i.category}`,
        meta: `${formatINR(convertToINR(i.tuition.tuitionAnnual.value, i.tuition.currency))}/yr tuition`,
      });
    }

    for (const r of TWINNING_ROUTES) {
      const c = getCountry(r.countryId);
      out.push({
        kind: "pathway",
        id: r.id,
        title: r.title,
        subtitle: `${r.mode} · ${r.field} · ${c?.name ?? r.countryId}`,
        href: `/abroad/2-2?route=${r.slug}`,
        countryId: r.countryId,
        keywords: [r.title, r.mode, r.field, r.summary, c?.name ?? ""].join(" "),
        badge: r.mode,
        meta: `${r.indiaLeg.years} yr India + ${r.abroadLeg.years} yr abroad`,
      });
    }

    for (const c of COUNTRIES.filter((x) => x.id !== "in")) {
      out.push({
        kind: "country",
        id: c.id,
        title: `${c.name} study guide`,
        subtitle: `${c.region} · tuition ${c.tuitionRange.value}`,
        href: `/abroad/${c.slug}`,
        countryId: c.id,
        keywords: [c.name, c.region, c.currency, ...c.popularFields, ...c.entranceTests].join(" "),
        badge: c.flag,
        meta: `Checked ${formatDate(c.lastVerified)}`,
      });
    }

    for (const s of SCHOLARSHIPS.filter((x) => x.countryId !== "in")) {
      const c = getCountry(s.countryId);
      out.push({
        kind: "scholarship",
        id: s.id,
        title: s.name,
        subtitle: `${s.provider} · ${s.countryId === "international" ? "International" : c?.name ?? s.countryId}`,
        href: `/scholarships?s=${s.slug}`,
        countryId: s.countryId === "international" ? undefined : s.countryId,
        keywords: [s.name, s.provider, s.eligibility, ...s.types].join(" "),
        badge: s.types[0],
        meta: s.amount.value,
      });
    }

    for (const e of EXAMS.filter((x) => ABROAD_TESTS.has(x.id))) {
      out.push({
        kind: "test",
        id: e.id,
        title: e.name,
        subtitle: `${e.conductedBy} · ${e.whoNeedsIt}`,
        href: `/exams/${e.slug}`,
        countryId: e.countryId,
        keywords: [e.name, e.conductedBy, ...e.acceptedBy].join(" "),
        badge: e.countryId.toUpperCase(),
        meta: `Checked ${formatDate(e.lastVerified)}`,
      });
    }

    for (const c of COURSES.filter((x) => x.studyAbroad.length > 0)) {
      out.push({
        kind: "course",
        id: c.id,
        title: c.name,
        subtitle: `${c.degreeType} · ${c.durationYears} yr · abroad routes in ${c.studyAbroad.map((s) => getCountry(s.country)?.name ?? s.country).slice(0, 3).join(", ")}`,
        href: `/courses/${c.slug}`,
        keywords: [c.name, c.degreeType, c.tagline, ...c.studyAbroad.map((s) => `${getCountry(s.country)?.name ?? s.country} ${s.note}`)].join(" "),
        badge: c.level,
        meta: `${formatINR(c.annualCost.value.minINR)}–${formatINR(c.annualCost.value.maxINR)}/yr`,
      });
    }

    return out;
  }, []);

  const hits = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let list = docs;
    if (kind !== "all") list = list.filter((d) => d.kind === kind);
    if (countryId !== "all") list = list.filter((d) => d.countryId === countryId);

    if (terms.length === 0) {
      return list
        .map((doc) => ({ doc, score: 0 }))
        .sort((a, b) => KIND_ORDER.indexOf(a.doc.kind) - KIND_ORDER.indexOf(b.doc.kind) || a.doc.title.localeCompare(b.doc.title));
    }

    return list
      .map((doc) => {
        const hay = `${doc.title} ${doc.subtitle} ${doc.keywords}`.toLowerCase();
        let score = 0;
        for (const t of terms) {
          if (doc.title.toLowerCase().includes(t)) score += 12;
          else if (hay.includes(t)) score += 5;
          else if (t.length > 4 && hay.includes(t.slice(0, -3))) score += 2;
        }
        return { doc, score };
      })
      .filter((h) => h.score > 0)
      .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));
  }, [docs, q, kind, countryId]);

  const grouped = useMemo(() => {
    const map = new Map<Kind, { doc: AbroadDoc; score: number }[]>();
    for (const h of hits) {
      const arr = map.get(h.doc.kind) ?? [];
      arr.push(h);
      map.set(h.doc.kind, arr);
    }
    return KIND_ORDER.filter((k) => map.get(k)?.length).map((k) => ({
      kind: k,
      hits: map.get(k)!,
    }));
  }, [hits]);

  const countryOptions = useMemo(
    () => Array.from(new Set(docs.map((d) => d.countryId).filter(Boolean))) as string[],
    [docs],
  );

  return (
    <>
      <PageHeader
        eyebrow="Search abroad opportunities"
        title="Every international option, in one search box"
        lede="Universities outside India, split-degree pathways, country guides, scholarships, language and entrance tests, and courses with a study-abroad route — each result carries where it links to and when it was last checked."
        actions={
          <>
            <Btn href="/universities">Universities worldwide</Btn>
            <Btn href="/abroad/2-2" variant="secondary">2+2 pathways</Btn>
          </>
        }
      />

      <Section wide>
        <div className="card mb-6 p-5">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-5 w-5 text-ink-faint" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try “2+2 engineering”, “scholarships in Germany”, “IELTS Canada”, “transfer to USA”…"
              aria-label="Search abroad opportunities"
              className="w-full rounded-2xl border border-hairline bg-white py-3.5 pl-12 pr-4 text-base text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button
                key={k.id}
                onClick={() => setKind(k.id)}
                aria-pressed={kind === k.id}
                className={`chip border ${kind === k.id ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950" : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"}`}
              >
                {k.label}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-ink-muted">
              Destination
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="rounded-full border border-hairline bg-white px-3.5 py-2 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
              >
                <option value="all">Anywhere</option>
                {countryOptions.map((id) => (
                  <option key={id} value={id}>{getCountry(id)?.name ?? id}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Try
            </span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setQ(s); setKind("all"); setCountryId("all"); }}
                className="chip border border-hairline bg-white text-ink-muted hover:border-navy-400 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink dark:text-slate-100">
            {hits.length} result{hits.length === 1 ? "" : "s"}
            {q.trim() && <span className="font-normal text-ink-muted"> for “{q.trim()}”</span>}
          </p>
          {(kind !== "all" || countryId !== "all") && (
            <button
              onClick={() => { setKind("all"); setCountryId("all"); }}
              className="text-xs font-medium text-navy-600 dark:text-cyan-300"
            >
              Clear filters
            </button>
          )}
        </div>

        {hits.length === 0 ? (
          <EmptyState
            title="Nothing abroad matches that"
            body="This build tracks a curated international dataset. Try a country name, a test like IELTS, or one of the suggested phrases above — or widen the filters."
            icon={<Globe2 className="h-6 w-6" aria-hidden />}
            action={<Btn onClick={() => { setQ(""); setKind("all"); setCountryId("all"); }}>Clear search</Btn>}
          />
        ) : (
          <div className="space-y-8">
            {grouped.map((g) => (
              <section key={g.kind}>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-semibold text-ink dark:text-slate-50">{KIND_LABEL[g.kind]}</h2>
                  <span className="text-xs text-ink-faint">{g.hits.length}</span>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {g.hits.slice(0, 12).map(({ doc }) => (
                    <li key={`${doc.kind}-${doc.id}`}>
                      <Link
                        href={doc.href}
                        className="group flex h-full items-start justify-between gap-3 rounded-2xl border border-hairline p-4 transition hover:border-navy-400 dark:border-hairline-dark"
                      >
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-ink group-hover:text-navy-600 dark:text-slate-100 dark:group-hover:text-cyan-300">
                              {doc.title}
                            </span>
                            {doc.badge && (
                              <span className="chip bg-surface-sunken text-[10px] text-ink-muted dark:bg-white/10 dark:text-slate-300">
                                {doc.badge}
                              </span>
                            )}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-ink-muted">{doc.subtitle}</span>
                          {doc.meta && <span className="mt-1 block text-[11px] text-ink-faint">{doc.meta}</span>}
                        </span>
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-faint transition group-hover:translate-x-1" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
                {g.hits.length > 12 && (
                  <p className="mt-2 text-xs text-ink-faint">
                    Showing the first 12 of {g.hits.length} — narrow the search to see the rest.
                  </p>
                )}
              </section>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="card p-5">
            <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
              <Badge tone="blue">Coverage</Badge>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {ABROAD_INSTITUTIONS.length} universities outside India, {COUNTRIES.length - 1} country guides,{" "}
              {TWINNING_ROUTES.length} split-degree pathways and every international test we track.
            </p>
          </div>
          <div className="card p-5">
            <p className="font-semibold text-ink dark:text-slate-100">Every result has a date</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Country and test records show when they were last checked, and anything older than 180 days carries a
              “may have changed” warning wherever it appears.
            </p>
          </div>
          <div className="card p-5">
            <p className="font-semibold text-ink dark:text-slate-100">Want the whole picture?</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Global search covers courses, careers, exams and guides inside India too — one query across everything.
            </p>
            <div className="mt-4">
              <Btn href="/search" size="sm" variant="secondary">Open global search</Btn>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Note>
            <strong>Nothing here is a promise.</strong> Admission, funding and visa outcomes rest with the institution
            and the relevant government. Use these results to build a shortlist, then verify each one on its official
            source before you apply or pay.
          </Note>
        </div>
      </Section>
    </>
  );
}
