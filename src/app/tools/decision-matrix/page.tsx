"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Scale, Plus, Trash2, ArrowRight, Info, Trophy } from "lucide-react";
import { Btn, Badge, PageHeader, Section, Note, EmptyState } from "@/components/ui";
import { INSTITUTIONS, getInstitution } from "@/data/colleges";
import { useAppStore } from "@/lib/store";
import { convertToINR } from "@/data/money";
import { formatINR } from "@/lib/format";

interface Criterion {
  id: string;
  label: string;
  weight: number; // 1–5
}

interface Option {
  id: string;
  label: string;
  scores: Record<string, number>; // criterion id -> 1..10
}

const DEFAULT_CRITERIA: Criterion[] = [
  { id: "c1", label: "Total cost over the programme", weight: 4 },
  { id: "c2", label: "Academic strength in my subject", weight: 3 },
  { id: "c3", label: "Distance from home", weight: 2 },
  { id: "c4", label: "Placement outcomes", weight: 3 },
  { id: "c5", label: "Campus life & facilities", weight: 2 },
];

const uid = () => Math.random().toString(36).slice(2, 9);

export default function DecisionMatrixPage() {
  const profile = useAppStore((s) => s.profile);

  const [criteria, setCriteria] = useState<Criterion[]>(DEFAULT_CRITERIA);
  const [options, setOptions] = useState<Option[]>(() => {
    const seed = INSTITUTIONS.slice(0, 3).map((i) => ({
      id: i.id,
      label: i.name,
      scores: {} as Record<string, number>,
    }));
    const score = (optIdx: number, critIdx: number) => 5 + ((optIdx * 3 + critIdx * 4) % 6);
    seed.forEach((o, oi) =>
      DEFAULT_CRITERIA.forEach((c, ci) => {
        o.scores[c.id] = score(oi, ci);
      }),
    );
    return seed;
  });
  const [newLabel, setNewLabel] = useState("");
  const [showExplain, setShowExplain] = useState(false);

  const totals = useMemo(() => {
    const totalWeight = criteria.reduce((s, c) => s + c.weight, 0) || 1;
    return options.map((o) => {
      const points = criteria.reduce((sum, c) => sum + (o.scores[c.id] ?? 5) * c.weight, 0);
      return { id: o.id, label: o.label, points, pct: Math.round((points / (totalWeight * 10)) * 100) };
    }).sort((a, b) => b.points - a.points);
  }, [criteria, options]);

  const top = totals[0];
  const second = totals[1];
  const close = top && second ? top.pct - second.pct <= 8 : false;

  const addCriterion = () => {
    setCriteria((prev) => [...prev, { id: uid(), label: "New criterion", weight: 3 }]);
  };

  const updateCriterion = (id: string, patch: Partial<Criterion>) =>
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const removeCriterion = (id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
    setOptions((prev) =>
      prev.map((o) => {
        const { [id]: _drop, ...rest } = o.scores;
        return { ...o, scores: rest };
      }),
    );
  };

  const addOption = () => {
    if (options.length >= 6) return;
    const label = newLabel.trim() || `Option ${options.length + 1}`;
    setOptions((prev) => [
      ...prev,
      {
        id: uid(),
        label,
        scores: Object.fromEntries(criteria.map((c) => [c.id, 5])),
      },
    ]);
    setNewLabel("");
  };

  const addFromInstitution = (id: string) => {
    if (options.length >= 6 || options.some((o) => o.id === id)) return;
    const inst = getInstitution(id);
    if (!inst) return;
    const dim = (key: string) => inst.scorecard.find((s) => s.id === key)?.score ?? 5;
    setOptions((prev) => [
      ...prev,
      {
        id: inst.id,
        label: inst.name,
        scores: Object.fromEntries(
          criteria.map((c, idx) => [
            c.id,
            idx === 0
              ? Math.max(2, 10 - Math.min(8, Math.round(convertToINR(inst.tuition.tuitionAnnual.value, inst.tuition.currency) / 150_000)))
              : idx === 1
                ? dim("academics")
                : idx === 2
                  ? dim("location")
                  : idx === 3
                    ? dim("careerOutcomes")
                    : dim("campusLife"),
          ]),
        ),
      },
    ]);
  };

  const setScore = (optId: string, critId: string, value: number) =>
    setOptions((prev) =>
      prev.map((o) => (o.id === optId ? { ...o, scores: { ...o.scores, [critId]: Math.max(1, Math.min(10, value)) } } : o)),
    );

  return (
    <>
      <PageHeader
        eyebrow="Planning tools · Decision matrix"
        title="Decide what you care about, then score it"
        lede="You set the criteria and how much each one matters. The matrix only multiplies your own judgement — it never tells you which option is better, and it never invents a score for you."
        actions={
          <>
            <Btn href="/tools/compare" variant="secondary">13-dimension comparison</Btn>
            <Btn href="/tools/what-if" variant="ghost">What-If Explorer</Btn>
          </>
        }
      />

      <Section wide>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Weighting</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Criteria are weighted 1–5. Higher weight means it moves the total more — set weights honestly, not
              aspirationally.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Scoring</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Score each option 1–10 against each criterion. The result shows percentages so the arithmetic is visible.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">What it won't do</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              It won't average away a trade-off you flagged as important, or hand you a "winner" you didn't earn.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {/* --------------------------- Matrix --------------------------- */}
            <div className="card overflow-x-auto p-0">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <caption className="sr-only">Decision matrix scoring table</caption>
                <thead>
                  <tr className="border-b border-hairline dark:border-hairline-dark">
                    <th scope="col" className="w-64 px-5 py-4 text-left align-bottom">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Criterion (weight)</span>
                    </th>
                    {options.map((o) => (
                      <th key={o.id} scope="col" className="px-3 py-4 text-left align-bottom">
                        <span className="block text-sm font-semibold text-ink dark:text-slate-100">{o.label}</span>
                        <button
                          onClick={() => setOptions((prev) => prev.filter((x) => x.id !== o.id))}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink-faint hover:text-signal-red"
                          aria-label={`Remove ${o.label}`}
                        >
                          <Trash2 className="h-3 w-3" aria-hidden /> remove
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((c) => (
                    <tr key={c.id} className="border-b border-hairline dark:border-hairline-dark">
                      <th scope="row" className="px-5 py-3 text-left align-top">
                        <input
                          value={c.label}
                          onChange={(e) => updateCriterion(c.id, { label: e.target.value })}
                          aria-label="Criterion label"
                          className="w-full rounded-lg border border-transparent bg-transparent px-1 py-1 text-sm font-medium text-ink outline-none hover:border-hairline focus:border-navy-400 dark:text-slate-100"
                        />
                        <span className="mt-1 flex items-center gap-2 px-1">
                          <label htmlFor={`w-${c.id}`} className="text-[11px] text-ink-faint">weight</label>
                          <input
                            id={`w-${c.id}`}
                            type="range"
                            min={1}
                            max={5}
                            value={c.weight}
                            onChange={(e) => updateCriterion(c.id, { weight: Number(e.target.value) })}
                            className="w-20 accent-[#2450c7] dark:accent-[#3ad9ec]"
                          />
                          <span className="text-[11px] font-semibold text-ink-muted">{c.weight}</span>
                          <button
                            onClick={() => removeCriterion(c.id)}
                            className="ml-auto text-ink-faint hover:text-signal-red"
                            aria-label={`Remove ${c.label}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </span>
                      </th>
                      {options.map((o) => (
                        <td key={o.id} className="px-3 py-3 align-top">
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={o.scores[c.id] ?? 5}
                            onChange={(e) => setScore(o.id, c.id, Number(e.target.value))}
                            aria-label={`${o.label} on ${c.label}`}
                            className="w-16 rounded-lg border border-hairline bg-white px-2 py-1.5 text-sm tabular text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-surface-muted dark:bg-white/5">
                    <th scope="row" className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                      Weighted total
                    </th>
                    {options.map((o) => {
                      const t = totals.find((x) => x.id === o.id);
                      return (
                        <td key={o.id} className="px-3 py-4 align-top">
                          <span className="block text-lg font-semibold tabular text-ink dark:text-slate-100">{t?.pct ?? 0}%</span>
                          <span className="block text-[11px] text-ink-faint">of max possible</span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* --------------------------- Result --------------------------- */}
            {top && (
              <div className={`rounded-3xl border p-6 ${close ? "border-signal-amber/30 bg-signal-amber-soft" : "border-hairline bg-surface-muted dark:border-hairline-dark dark:bg-white/5"}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Trophy className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden />
                  <p className="font-semibold text-ink dark:text-slate-100">Highest weighted score: {top.label}</p>
                  <Badge tone="brand">{top.pct}%</Badge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
                  {close
                    ? `This is only ${top.pct - (second?.pct ?? 0)} points ahead of ${second?.label}. At that gap, a small change in how you scored one criterion would flip the result — so decide what you actually care about rather than reading this as a verdict.`
                    : `${top.label} leads on the criteria and weights you set. That result describes your own priorities — change a weight and it can change completely.`}
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setShowExplain((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 dark:text-cyan-300"
                  >
                    <Info className="h-4 w-4" aria-hidden /> {showExplain ? "Hide" : "Show"} the arithmetic
                  </button>
                </div>
                {showExplain && (
                  <ul className="mt-3 space-y-1.5 text-xs text-ink-muted">
                    {criteria.map((c) => (
                      <li key={c.id}>
                        {c.label} → weighted {c.weight} × {options[0] ? options[0].scores[c.id] ?? 5 : "—"} for{" "}
                        {top.label}
                      </li>
                    ))}
                    <li className="pt-1 font-semibold text-ink dark:text-slate-200">
                      Total ÷ (sum of weights × 10) × 100 = {top.pct}%
                    </li>
                  </ul>
                )}
                <div className="mt-4">
                  <Note>
                    <strong>No single “best” answer.</strong> The matrix exposes trade-offs; it does not remove them.
                    Whatever you choose, something else was given up.
                  </Note>
                </div>
              </div>
            )}

            {/* --------------------------- Add --------------------------- */}
            <div className="card p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Add an option</p>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addOption()}
                      placeholder="e.g. B.Sc in my city"
                      className="flex-1 rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                      aria-label="New option label"
                    />
                    <Btn onClick={addOption} size="sm" disabled={options.length >= 6}>
                      <Plus className="h-4 w-4" aria-hidden /> Add
                    </Btn>
                  </div>
                  <p className="mt-2 text-[11px] text-ink-faint">Up to 6 options. {6 - options.length} slots left.</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Add a criterion</p>
                  <div className="mt-2 flex gap-2">
                    <Btn onClick={addCriterion} variant="secondary" size="sm">
                      <Plus className="h-4 w-4" aria-hidden /> New criterion
                    </Btn>
                  </div>
                  <p className="mt-2 text-[11px] text-ink-faint">{criteria.length} criteria · total weight {criteria.reduce((s, c) => s + c.weight, 0)}</p>
                </div>
              </div>

              <div className="mt-5 border-t border-hairline pt-4 dark:border-hairline-dark">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Or pull in a tracked institution</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {INSTITUTIONS.slice(0, 6).map((i) => {
                    const already = options.some((o) => o.id === i.id);
                    return (
                      <button
                        key={i.id}
                        disabled={already || options.length >= 6}
                        onClick={() => addFromInstitution(i.id)}
                        className="chip border border-hairline bg-white text-ink-muted transition hover:border-navy-400 hover:text-navy-600 disabled:opacity-40 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
                      >
                        {i.name}{already ? " · added" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------- Sidebar --------------------------- */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Ranking (by your own weights)</p>
              <ol className="mt-3 space-y-3">
                {totals.map((t, i) => (
                  <li key={t.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-ink dark:text-slate-100">
                        {i + 1}. {t.label}
                      </span>
                      <span className="text-sm font-semibold tabular text-ink-muted">{t.pct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-navy-500 via-violet-500 to-cyan-500"
                        style={{ width: `${t.pct}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
              {totals.length < 2 && (
                <p className="mt-3 text-xs text-ink-faint">Add at least two options to compare anything.</p>
              )}
            </div>

            <div className="card p-5">
              <p className="font-semibold text-ink dark:text-slate-100">Common criteria people forget</p>
              <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
                <li>• Total cost, not just tuition</li>
                <li>• Travel time home during term</li>
                <li>• Language of instruction</li>
                <li>• Whether the programme is recognised where you want to work</li>
                <li>• What you'd do if you changed your mind in year two</li>
              </ul>
            </div>

            <div className="card p-5">
              <p className="font-semibold text-ink dark:text-slate-100">Next steps</p>
              <div className="mt-3 grid gap-2">
                <Btn href="/tools/plan-b" size="sm">Generate a Plan B</Btn>
                <Btn href="/pathfinder" variant="secondary" size="sm">Ask Pathfinder to check a criterion</Btn>
                <Btn href="/roadmap" variant="ghost" size="sm">Put the decision on a timeline</Btn>
              </div>
              <p className="mt-3 text-xs text-ink-faint">
                Your criteria are yours — nothing about them is uploaded or shared.
              </p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
