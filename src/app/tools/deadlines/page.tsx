"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays, Plus, Trash2, CheckCircle2, Circle, AlertTriangle, Clock,
} from "lucide-react";
import {
  Btn, Badge, PageHeader, Section, Note, EmptyState,
} from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { EXAMS } from "@/data/exams";
import { SCHOLARSHIPS } from "@/data/scholarships";
import { INSTITUTIONS } from "@/data/colleges";
import { formatDate } from "@/lib/format";
import type { DeadlineRecord } from "@/lib/types";

const CATEGORIES = [
  "College", "Entrance exam", "Scholarship", "Document", "Counselling",
  "Admission round", "Visa", "Hostel",
] as const;

const CAT_TONE: Record<DeadlineRecord["category"], "brand" | "green" | "amber" | "blue" | "neutral"> = {
  College: "brand",
  "Entrance exam": "blue",
  Scholarship: "green",
  Document: "neutral",
  Counselling: "amber",
  "Admission round": "brand",
  Visa: "blue",
  Hostel: "neutral",
};

const uid = () => Math.random().toString(36).slice(2, 9);

function daysUntil(date: string) {
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
  return Number.isFinite(diff) ? diff : null;
}

export default function DeadlinesPage() {
  const deadlines = useAppStore((s) => s.deadlines);
  const upsertDeadline = useAppStore((s) => s.upsertDeadline);
  const removeDeadline = useAppStore((s) => s.removeDeadline);
  const toggleDeadline = useAppStore((s) => s.toggleDeadline);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DeadlineRecord["category"]>("College");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState<DeadlineRecord["priority"]>("High");
  const [filter, setFilter] = useState<"all" | "open" | "done">("open");
  const [showAdd, setShowAdd] = useState(false);

  const sorted = useMemo(() => {
    const list = [...deadlines].sort((a, b) => a.date.localeCompare(b.date));
    if (filter === "open") return list.filter((d) => !d.completed);
    if (filter === "done") return list.filter((d) => d.completed);
    return list;
  }, [deadlines, filter]);

  const upcoming = useMemo(
    () => deadlines.filter((d) => !d.completed && (daysUntil(d.date) ?? 9999) <= 60),
    [deadlines],
  );

  const seeded = useMemo(() => {
    const items: { title: string; category: DeadlineRecord["category"]; detail: string }[] = [];
    for (const e of EXAMS.slice(0, 4)) {
      const d = e.importantDates.find((x) => /application|registration|reg/i.test(x.label));
      if (d) items.push({ title: `${e.name} — ${d.label}`, category: "Entrance exam", detail: d.window });
    }
    for (const s of SCHOLARSHIPS.slice(0, 3)) {
      items.push({ title: `${s.name} — deadline`, category: "Scholarship", detail: s.deadline.value });
    }
    for (const i of INSTITUTIONS.slice(0, 3)) {
      const d = i.deadlines[0];
      if (d) items.push({ title: `${i.name} — ${d.label}`, category: "College", detail: d.window });
    }
    return items;
  }, []);

  const addFromSeed = (seed: { title: string; category: DeadlineRecord["category"]; detail: string }) => {
    upsertDeadline({
      id: uid(),
      title: seed.title,
      category: seed.category,
      date: new Date(Date.now() + 45 * 86_400_000).toISOString().slice(0, 10),
      priority: "Medium",
      completed: false,
      notes: `Source window: ${seed.detail}. Confirm the exact date on the official site.`,
    });
  };

  const add = () => {
    if (!title.trim() || !date) return;
    upsertDeadline({
      id: uid(),
      title: title.trim(),
      category,
      date,
      priority,
      completed: false,
    });
    setTitle("");
    setDate("");
    setShowAdd(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Planning tools · Deadline tracker"
        title="Every date that can slip past you"
        lede="Exam registrations, application windows, counselling rounds, scholarship deadlines, documents, visa and hostel — in one list with days remaining and a completion state."
        actions={
          <>
            <Btn onClick={() => setShowAdd((v) => !v)}>
              <Plus className="h-4 w-4" aria-hidden /> Add deadline
            </Btn>
            <Btn href="/tools/applications" variant="secondary">Application tracker</Btn>
          </>
        }
      />

      <Section wide>
        {/* ------------------------------ Upcoming ------------------------------ */}
        <div className={`mb-6 rounded-3xl border p-5 ${upcoming.length ? "border-signal-amber/30 bg-signal-amber-soft" : "border-hairline bg-surface-muted dark:border-hairline-dark dark:bg-white/5"}`}>
          <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
            <AlertTriangle className="h-4 w-4 text-signal-amber" aria-hidden />
            {upcoming.length
              ? `${upcoming.length} date${upcoming.length === 1 ? "" : "s"} in the next 60 days`
              : "Nothing due in the next 60 days"}
          </p>
          {upcoming.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {upcoming.slice(0, 6).map((d) => {
                const left = daysUntil(d.date);
                return (
                  <li key={d.id} className="chip bg-white text-ink dark:bg-white/10 dark:text-slate-100">
                    {d.title}
                    <span className={left !== null && left <= 7 ? "ml-1 font-semibold text-signal-red" : "ml-1 text-ink-faint"}>
                      {left !== null && left < 0 ? `${Math.abs(left)}d overdue` : left === 0 ? "today" : `${left}d`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {upcoming.length === 0 && deadlines.length === 0 && (
            <p className="mt-2 text-sm text-ink-muted">
              Your tracker is empty. Add your own dates, or seed it from the exam and scholarship records below.
            </p>
          )}
        </div>

        {/* ------------------------------ Add form ------------------------------ */}
        {showAdd && (
          <div className="mb-6 card p-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_170px_150px_130px_auto]">
              <div>
                <label htmlFor="dl-title" className="sr-only">Deadline title</label>
                <input
                  id="dl-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. JEE Main application closes"
                  className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="dl-cat" className="sr-only">Category</label>
                <select
                  id="dl-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DeadlineRecord["category"])}
                  className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="dl-date" className="sr-only">Date</label>
                <input
                  id="dl-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="dl-pri" className="sr-only">Priority</label>
                <select
                  id="dl-pri"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as DeadlineRecord["priority"])}
                  className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                >
                  {["High", "Medium", "Low"].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <Btn onClick={add} disabled={!title.trim() || !date}>Add</Btn>
            </div>
          </div>
        )}

        {/* ------------------------------ Filters ------------------------------ */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(["open", "done", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`chip border ${filter === f
                  ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950"
                  : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"}`}
              >
                {f === "open" ? "Upcoming" : f === "done" ? "Completed" : "All"} ({f === "open"
                  ? deadlines.filter((d) => !d.completed).length
                  : f === "done"
                    ? deadlines.filter((d) => d.completed).length
                    : deadlines.length})
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-faint">Stored on this device only — nothing is uploaded.</p>
        </div>

        {/* ------------------------------ List ------------------------------ */}
        {sorted.length === 0 ? (
          <EmptyState
            title={filter === "open" ? "Nothing outstanding" : "No deadlines yet"}
            body={
              filter === "open"
                ? "Either you're fully caught up, or the tracker hasn't been filled yet. Seed it from the records below."
                : "Add a date, or seed from the exam and scholarship records below."
            }
            icon={<CalendarDays className="h-6 w-6" aria-hidden />}
            action={<Btn onClick={() => setShowAdd(true)}>Add your first deadline</Btn>}
          />
        ) : (
          <ul className="space-y-3">
            {sorted.map((d) => {
              const left = daysUntil(d.date);
              const overdue = left !== null && left < 0 && !d.completed;
              const soon = left !== null && left >= 0 && left <= 14 && !d.completed;
              return (
                <li
                  key={d.id}
                  className={`card flex flex-wrap items-center gap-4 p-4 ${overdue ? "border-signal-red/40" : soon ? "border-signal-amber/40" : ""}`}
                >
                  <button
                    onClick={() => toggleDeadline(d.id)}
                    aria-label={d.completed ? `Mark ${d.title} as not done` : `Mark ${d.title} as done`}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                      d.completed
                        ? "border-signal-green bg-signal-green text-white"
                        : "border-hairline text-ink-faint hover:border-navy-400 hover:text-navy-600 dark:border-hairline-dark"
                    }`}
                  >
                    {d.completed ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
                  </button>

                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-medium ${d.completed ? "text-ink-faint line-through" : "text-ink dark:text-slate-100"}`}>
                      {d.title}
                    </span>
                    {d.notes && <span className="mt-0.5 block text-xs text-ink-muted">{d.notes}</span>}
                  </span>

                  <Badge tone={CAT_TONE[d.category]}>{d.category}</Badge>
                  <Badge tone={d.priority === "High" ? "red" : d.priority === "Medium" ? "amber" : "neutral"}>
                    {d.priority}
                  </Badge>

                  <span className="text-right">
                    <span className="block text-sm font-medium tabular text-ink dark:text-slate-100">{formatDate(d.date)}</span>
                    <span className={`block text-xs ${overdue ? "text-signal-red" : soon ? "text-signal-amber" : "text-ink-faint"}`}>
                      {left === null
                        ? "—"
                        : left < 0
                          ? `${Math.abs(left)} days overdue`
                          : left === 0
                            ? "today"
                            : `in ${left} days`}
                    </span>
                  </span>

                  <button
                    onClick={() => removeDeadline(d.id)}
                    aria-label={`Delete ${d.title}`}
                    className="rounded-full p-1.5 text-ink-faint transition hover:bg-signal-red-soft hover:text-signal-red"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* ------------------------------ Seeding ------------------------------ */}
        <div className="mt-8 card p-5">
          <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
            <Clock className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden />
            Seed from verified records in this build
          </p>
          <p className="mt-1.5 text-sm text-ink-muted">
            These carry the window recorded in the dataset, not a live date — always confirm before acting on them.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {seeded.map((s) => (
              <button
                key={s.title}
                onClick={() => addFromSeed(s)}
                className="rounded-xl border border-hairline px-4 py-3 text-left transition hover:border-navy-400 dark:border-hairline-dark"
              >
                <span className="block text-sm font-medium text-ink dark:text-slate-100">{s.title}</span>
                <span className="mt-0.5 block text-xs text-ink-muted">{s.detail}</span>
                <span className="mt-1 block text-[11px] font-semibold text-navy-600 dark:text-cyan-300">+ Add to tracker</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Note tone="warn">
            A tracked deadline is a reminder, not a guarantee that the window will hold. Exam bodies and institutions
            revise schedules — check the official site the same day you act.
          </Note>
        </div>
      </Section>
    </>
  );
}
