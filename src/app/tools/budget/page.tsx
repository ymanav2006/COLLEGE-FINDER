"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Wallet, ArrowRight, Info, GraduationCap } from "lucide-react";
import { Btn, Badge, PageHeader, Section, Note, FactDisplay } from "@/components/ui";
import { INSTITUTIONS, getInstitution } from "@/data/colleges";
import { COURSES, getCourse } from "@/data/courses";
import { useAppStore } from "@/lib/store";
import { convertToINR } from "@/data/money";
import { formatINR } from "@/lib/format";

interface BudgetItem {
  id: string;
  label: string;
  amount: number;
  years: number;
  category: "tuition" | "hostel" | "living" | "travel" | "equipment" | "application" | "other";
  locked?: boolean;
}

const CATEGORY_LABEL: Record<BudgetItem["category"], string> = {
  tuition: "Tuition",
  hostel: "Hostel",
  living: "Living",
  travel: "Travel",
  equipment: "Equipment",
  application: "Application fees",
  other: "Other",
};

const uid = () => Math.random().toString(36).slice(2, 9);

const PRESETS: { id: string; label: string; items: Omit<BudgetItem, "id">[] }[] = [
  {
    id: "btech",
    label: "4-year engineering (hosteller)",
    items: [
      { label: "Tuition", amount: 200_000, years: 4, category: "tuition" },
      { label: "Hostel + mess", amount: 120_000, years: 4, category: "hostel" },
      { label: "Books & supplies", amount: 15_000, years: 4, category: "equipment" },
      { label: "Travel home", amount: 12_000, years: 4, category: "travel" },
      { label: "Application & exam fees", amount: 8_000, years: 1, category: "application" },
      { label: "Laptop", amount: 55_000, years: 1, category: "equipment" },
    ],
  },
  {
    id: "bcom",
    label: "3-year degree (day scholar)",
    items: [
      { label: "Tuition", amount: 80_000, years: 3, category: "tuition" },
      { label: "Commute & living", amount: 45_000, years: 3, category: "living" },
      { label: "Books & supplies", amount: 8_000, years: 3, category: "equipment" },
      { label: "Application & exam fees", amount: 4_000, years: 1, category: "application" },
    ],
  },
  {
    id: "mbbs",
    label: "5-year professional course",
    items: [
      { label: "Tuition", amount: 600_000, years: 5, category: "tuition" },
      { label: "Hostel + mess", amount: 110_000, years: 5, category: "hostel" },
      { label: "Equipment & instruments", amount: 25_000, years: 2, category: "equipment" },
      { label: "Travel home", amount: 15_000, years: 5, category: "travel" },
      { label: "Application & exam fees", amount: 12_000, years: 1, category: "application" },
    ],
  },
];

export default function BudgetPlannerPage() {
  const profile = useAppStore((s) => s.profile);

  const [items, setItems] = useState<BudgetItem[]>(
    PRESETS[0].items.map((i) => ({ ...i, id: uid() })),
  );
  const [institutionId, setInstitutionId] = useState<string>("none");
  const [courseId, setCourseId] = useState<string>("none");
  const [bufferPercent, setBufferPercent] = useState(10);
  const [savings, setSavings] = useState<number>(0);
  const [annualIncome, setAnnualIncome] = useState<number>(0);

  const inst = getInstitution(institutionId);
  const course = getCourse(courseId);

  /** Pull real figures from a selected institution/course into the plan. */
  const importFromSource = () => {
    const next: Omit<BudgetItem, "id">[] = [];
    if (inst) {
      next.push({
        label: `Tuition — ${inst.name}`,
        amount: convertToINR(inst.tuition.tuitionAnnual.value, inst.tuition.currency),
        years: 4,
        category: "tuition",
        locked: true,
      });
      if (inst.tuition.hostelAnnual) {
        next.push({
          label: `Hostel — ${inst.name}`,
          amount: convertToINR(inst.tuition.hostelAnnual.value, inst.tuition.currency),
          years: 4,
          category: "hostel",
        });
      }
    } else if (course) {
      next.push({
        label: `Tuition — ${course.name}`,
        amount: Math.round((course.annualCost.value.minINR + course.annualCost.value.maxINR) / 2),
        years: course.durationYears,
        category: "tuition",
      });
    }
    if (next.length) setItems((prev) => [...prev, ...next.map((n) => ({ ...n, id: uid() }))]);
  };

  const totals = useMemo(() => {
    const byCategory = new Map<string, number>();
    let subtotal = 0;
    for (const i of items) {
      const total = i.amount * i.years;
      subtotal += total;
      byCategory.set(i.category, (byCategory.get(i.category) ?? 0) + total);
    }
    const buffer = Math.round((subtotal * bufferPercent) / 100);
    const total = subtotal + buffer;
    return { byCategory: Array.from(byCategory.entries()), subtotal, buffer, total };
  }, [items, bufferPercent]);

  const gap = totals.total - savings;
  const perYear = Math.round(totals.total / Math.max(1, Math.max(...items.map((i) => i.years), 1)));
  const loanNeeded = Math.max(0, gap - (annualIncome ? annualIncome * 4 : 0));

  const update = (id: string, patch: Partial<BudgetItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const addEmpty = () =>
    setItems((prev) => [
      ...prev,
      { id: uid(), label: "New item", amount: 10_000, years: 1, category: "other" },
    ]);

  return (
    <>
      <PageHeader
        eyebrow="Planning tools · Budget planner"
        title="What the whole thing actually costs"
        lede="Tuition is one line. Hostel, living, travel, equipment, application fees and a buffer for the things nobody warns you about — over every year of the programme."
        actions={
          <>
            <Btn href="/tools/afford" variant="secondary">Can I afford this?</Btn>
            <Btn href="/scholarships" variant="ghost">Find funding</Btn>
          </>
        }
      />

      <Section wide>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* --------------------------- Plan --------------------------- */}
          <div className="space-y-6">
            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Start from a preset</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setItems(p.items.map((i) => ({ ...i, id: uid() })))}
                    className="chip border border-hairline bg-white text-ink-muted transition hover:border-navy-400 hover:text-navy-600 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
                  >
                    {p.label}
                  </button>
                ))}
                <button onClick={() => setItems([])} className="chip border border-hairline bg-white text-ink-muted hover:border-signal-red hover:text-signal-red dark:border-hairline-dark dark:bg-white/6">
                  Clear all
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="inst" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                    Import from an institution
                  </label>
                  <select
                    id="inst"
                    value={institutionId}
                    onChange={(e) => setInstitutionId(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  >
                    <option value="none">Choose an institution…</option>
                    {INSTITUTIONS.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="course" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                    Or from a course
                  </label>
                  <select
                    id="course"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  >
                    <option value="none">Choose a course…</option>
                    {COURSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <Btn onClick={importFromSource} variant="secondary" size="sm" disabled={institutionId === "none" && courseId === "none"}>
                  <GraduationCap className="h-4 w-4" aria-hidden /> Add to the plan
                </Btn>
                {(inst || course) && (
                  <span className="ml-3 text-xs text-ink-faint">
                    Imported figures are seed data with reported confidence — verify on the official fee document.
                  </span>
                )}
              </div>
            </div>

            {/* Line items */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-hairline px-5 py-4 dark:border-hairline-dark">
                <p className="font-semibold text-ink dark:text-slate-100">Line items</p>
                <button onClick={addEmpty} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 dark:text-cyan-300">
                  <Plus className="h-4 w-4" aria-hidden /> Add item
                </button>
              </div>

              {items.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-medium text-ink dark:text-slate-100">Your plan is empty</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-ink-muted">
                    Start from a preset above, import real figures, or add items one at a time.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-hairline dark:divide-hairline-dark">
                  {items.map((i) => (
                    <li key={i.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_120px_90px_110px_36px] sm:items-center">
                      <div>
                        <input
                          value={i.label}
                          onChange={(e) => update(i.id, { label: e.target.value })}
                          aria-label="Item label"
                          className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-medium text-ink outline-none hover:border-hairline focus:border-navy-400 dark:text-slate-100"
                        />
                        <select
                          value={i.category}
                          onChange={(e) => update(i.id, { category: e.target.value as BudgetItem["category"] })}
                          aria-label="Category"
                          className="ml-2 rounded-lg border border-hairline bg-white px-2 py-0.5 text-[11px] text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
                        >
                          {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>

                      <div className="relative">
                        <span className="absolute left-2 top-2 text-xs text-ink-faint">₹</span>
                        <input
                          type="number"
                          value={i.amount}
                          onChange={(e) => update(i.id, { amount: Math.max(0, Number(e.target.value)) })}
                          aria-label="Amount per year"
                          className="w-full rounded-lg border border-hairline bg-white py-1.5 pl-5 pr-2 text-sm tabular text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                        />
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          value={i.years}
                          onChange={(e) => update(i.id, { years: Math.max(1, Number(e.target.value)) })}
                          aria-label="Number of years"
                          className="w-full rounded-lg border border-hairline bg-white py-1.5 pl-2 pr-6 text-sm tabular text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                        />
                        <span className="absolute right-1.5 top-2 text-[10px] text-ink-faint">yr</span>
                      </div>

                      <p className="text-sm font-semibold tabular text-ink dark:text-slate-100">
                        {formatINR(i.amount * i.years)}
                      </p>

                      <button
                        onClick={() => remove(i.id)}
                        className="justify-self-end rounded-full p-1.5 text-ink-faint transition hover:bg-signal-red-soft hover:text-signal-red"
                        aria-label={`Remove ${i.label}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Assumptions */}
            <div className="card p-5">
              <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                <Info className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Assumptions you control
              </p>
              <div className="mt-4 grid gap-5 sm:grid-cols-3">
                <div>
                  <label htmlFor="buffer" className="block text-xs text-ink-muted">Contingency buffer: {bufferPercent}%</label>
                  <input
                    id="buffer"
                    type="range"
                    min={0}
                    max={30}
                    step={5}
                    value={bufferPercent}
                    onChange={(e) => setBufferPercent(Number(e.target.value))}
                    className="mt-2 w-full accent-[#2450c7] dark:accent-[#3ad9ec]"
                  />
                </div>
                <div>
                  <label htmlFor="savings" className="block text-xs text-ink-muted">Savings available (₹)</label>
                  <input
                    id="savings"
                    type="number"
                    value={savings}
                    onChange={(e) => setSavings(Math.max(0, Number(e.target.value)))}
                    className="mt-2 w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm tabular text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="income" className="block text-xs text-ink-muted">Household surplus per year (₹)</label>
                  <input
                    id="income"
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(Math.max(0, Number(e.target.value)))}
                    className="mt-2 w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm tabular text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-ink-faint">
                We don't optimise for you or recommend borrowing. We show what each assumption does to the total.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {totals.byCategory.map(([cat, amount]) => (
                <div key={cat} className="card p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                    {CATEGORY_LABEL[cat as BudgetItem["category"]] ?? cat}
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular text-ink dark:text-slate-50">{formatINR(amount)}</p>
                  <p className="mt-0.5 text-[11px] text-ink-faint">
                    {Math.round((amount / Math.max(1, totals.total)) * 100)}% of total
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* --------------------------- Summary --------------------------- */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Total cost of the plan</p>
              <p className="mt-2 text-3xl font-semibold tabular text-ink dark:text-slate-50">{formatINR(totals.total)}</p>
              <p className="mt-1 text-sm text-ink-muted">≈ {formatINR(perYear)} per year</p>

              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Subtotal" value={formatINR(totals.subtotal)} />
                <Row label={`Buffer (${bufferPercent}%)`} value={formatINR(totals.buffer)} />
                <Row label="Savings applied" value={`− ${formatINR(savings)}`} />
                <Row label="Still to fund" value={formatINR(Math.max(0, gap))} strong />
              </dl>

              {profile?.budgetYearlyINR && (
                <div className="mt-4 rounded-xl bg-surface-muted p-3 dark:bg-white/5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Your stated yearly budget</p>
                  <p className="mt-1 text-sm font-medium text-ink dark:text-slate-100">{formatINR(profile.budgetYearlyINR)}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    This plan averages {formatINR(perYear)} a year —{" "}
                    {perYear > profile.budgetYearlyINR ? "above" : "inside"} your budget.
                  </p>
                </div>
              )}

              <div className="mt-4 rounded-xl bg-signal-amber-soft p-3">
                <p className="text-xs leading-relaxed text-signal-amber">
                  Estimated shortfall after savings and household surplus:{" "}
                  <strong>{formatINR(Math.max(0, loanNeeded))}</strong>
                  {profile?.loanAcceptable ? " — loans are acceptable to you." : " — loans aren't marked as acceptable in your profile."}
                </p>
              </div>

              <div className="mt-4 grid gap-2">
                <Btn href="/scholarships">Find scholarships</Btn>
                <Btn href="/tools/afford" variant="secondary">Check a specific college</Btn>
                <Btn href="/roadmap" variant="ghost">Put this on my roadmap</Btn>
              </div>
            </div>

            <div className="card p-5">
              <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                <Wallet className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Costs people forget
              </p>
              <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
                <li>• Entrance exam registration (often multiple attempts)</li>
                <li>• Counselling and seat-acceptance fees</li>
                <li>• relocation and deposit for first-year hostel</li>
                <li>• Laptop, books and lab equipment</li>
                <li>• Travel home twice a year</li>
                <li>• Re-appear / supplementary exam fees</li>
              </ul>
            </div>

            <Note tone="warn">
              All amounts are planning estimates. Confirm every fee on the institution's official document before you
              commit — fees change between cycles.
            </Note>
          </aside>
        </div>
      </Section>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={`tabular ${strong ? "font-semibold text-ink dark:text-slate-100" : "text-ink dark:text-slate-200"}`}>
        {value}
      </dd>
    </div>
  );
}
