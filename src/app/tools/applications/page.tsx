"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, Plus, Trash2, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";
import { Btn, Badge, PageHeader, Section, Note, EmptyState } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { INSTITUTIONS, getInstitution } from "@/data/colleges";
import { formatDate } from "@/lib/format";
import type { ApplicationRecord, ApplicationStatus } from "@/lib/types";

const STATUSES: ApplicationStatus[] = [
  "Interested", "Researching", "Preparing", "Applied", "Exam completed",
  "Shortlisted", "Waitlisted", "Accepted", "Rejected", "Final choice",
];

const STATUS_TONE: Record<ApplicationStatus, "neutral" | "blue" | "amber" | "green" | "red" | "brand"> = {
  Interested: "neutral",
  Researching: "neutral",
  Preparing: "blue",
  Applied: "brand",
  "Exam completed": "blue",
  Shortlisted: "blue",
  Waitlisted: "amber",
  Accepted: "green",
  Rejected: "red",
  "Final choice": "green",
};

const CHECKLIST = [
  "Mark sheet (Class 10 & 12)",
  "Transfer / migration certificate",
  "Category / caste certificate (if applicable)",
  "Entrance score card",
  "Passport-size photographs",
  "Address & identity proof",
  "Counselling registration printout",
  "Fee payment confirmation",
];

const uid = () => Math.random().toString(36).slice(2, 9);

export default function ApplicationsPage() {
  const applications = useAppStore((s) => s.applications);
  const upsertApplication = useAppStore((s) => s.upsertApplication);
  const removeApplication = useAppStore((s) => s.removeApplication);
  const setApplicationStatus = useAppStore((s) => s.setApplicationStatus);
  const logAudit = useAppStore((s) => s.logAudit);

  const [showAdd, setShowAdd] = useState(false);
  const [institutionId, setInstitutionId] = useState(INSTITUTIONS[0]?.id ?? "");
  const [course, setCourse] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const active = useMemo(
    () => applications.filter((a) => !["Rejected", "Final choice"].includes(a.status)),
    [applications],
  );

  const add = () => {
    if (!institutionId) return;
    const inst = getInstitution(institutionId);
    const record: ApplicationRecord = {
      id: uid(),
      institutionId,
      course: course || inst?.courseIds.length + " tracked programmes" || "",
      status: "Researching",
      examRequired: inst?.entranceExams.join(", ") || "Merit / institute level",
      deadline: deadline || "",
      fee: inst ? `${inst.tuition.tuitionAnnual.value.toLocaleString("en-IN")} ${inst.tuition.currency} / yr (verify)` : "",
      documents: [],
      scholarship: inst?.financialAid ?? "",
      result: "",
      notes: "",
      updatedAt: new Date().toISOString(),
    };
    upsertApplication(record);
    setSelected(record.id);
    setShowAdd(false);
    setCourse("");
    setDeadline("");
    logAudit({ actor: "student", action: "created application", entity: `Application ${inst?.name ?? institutionId}` });
  };

  const current = selected ? applications.find((a) => a.id === selected) : undefined;
  const currentInst = current ? getInstitution(current.institutionId) : undefined;

  const counts = useMemo(() => {
    const map = new Map<ApplicationStatus, number>();
    for (const a of applications) map.set(a.status, (map.get(a.status) ?? 0) + 1);
    return Array.from(map.entries());
  }, [applications]);

  const toggleDocument = (appId: string, doc: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;
    const has = app.documents.includes(doc);
    upsertApplication({
      ...app,
      documents: has ? app.documents.filter((d) => d !== doc) : [...app.documents, doc],
      updatedAt: new Date().toISOString(),
    });
    logAudit({ actor: "student", action: has ? "unchecked document" : "checked document", entity: doc });
  };

  return (
    <>
      <PageHeader
        eyebrow="Planning tools · Application tracker"
        title="Your applications, and everything each one needs"
        lede="Track every application's stage, the exam it needs, its fee, deadline, document checklist and result — with a timestamp each time something changes."
        actions={
          <>
            <Btn onClick={() => setShowAdd((v) => !v)}>
              <Plus className="h-4 w-4" aria-hidden /> Add application
            </Btn>
            <Btn href="/tools/deadlines" variant="secondary">Deadline tracker</Btn>
          </>
        }
      />

      <Section wide>
        {/* ------------------------------ KPIs ------------------------------ */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total tracked", value: applications.length },
            { label: "In progress", value: active.length },
            { label: "Offers received", value: applications.filter((a) => ["Accepted", "Final choice"].includes(a.status)).length },
            { label: "Final choice", value: applications.filter((a) => a.status === "Final choice").length },
          ].map((k) => (
            <div key={k.label} className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">{k.label}</p>
              <p className="mt-1.5 text-3xl font-semibold tabular text-ink dark:text-slate-50">{k.value}</p>
            </div>
          ))}
        </div>

        {counts.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {counts.map(([status, n]) => (
              <Badge key={status} tone={STATUS_TONE[status]}>{status} · {n}</Badge>
            ))}
          </div>
        )}

        {/* ------------------------------ Add ------------------------------ */}
        {showAdd && (
          <div className="mb-6 card p-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_170px_auto] sm:items-end">
              <div>
                <label htmlFor="app-inst" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                  Institution
                </label>
                <select
                  id="app-inst"
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                >
                  {INSTITUTIONS.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="app-course" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                  Programme
                </label>
                <input
                  id="app-course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="app-dl" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                  Deadline
                </label>
                <input
                  id="app-dl"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                />
              </div>
              <Btn onClick={add}>Add</Btn>
            </div>
          </div>
        )}

        {applications.length === 0 ? (
          <EmptyState
            title="No applications tracked yet"
            body="Add every institution you're considering — even the ones you're unsure about. Watching them side by side is where clarity usually appears."
            icon={<ClipboardList className="h-6 w-6" aria-hidden />}
            action={<Btn onClick={() => setShowAdd(true)}>Add your first application</Btn>}
            secondaryAction={<Btn href="/colleges" variant="secondary">Browse colleges</Btn>}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* ------------------------------ List ------------------------------ */}
            <div className="space-y-3">
              {applications.map((a) => {
                const inst = getInstitution(a.institutionId);
                const docsDone = a.documents.length;
                const isOpen = current?.id === a.id;
                return (
                  <div
                    key={a.id}
                    className={`card p-4 transition ${isOpen ? "border-navy-500 ring-1 ring-navy-500/30 dark:border-cyan-400 dark:ring-cyan-400/30" : ""}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <button onClick={() => setSelected(a.id)} className="min-w-0 flex-1 text-left">
                        <span className="block font-semibold text-ink dark:text-slate-100">{inst?.name ?? "Unknown institution"}</span>
                        <span className="mt-0.5 block text-sm text-ink-muted">
                          {a.course || "Programme not specified"}
                          {inst && ` · ${inst.city}, ${inst.state}`}
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
                          {a.deadline && <Badge tone="neutral">Deadline {formatDate(a.deadline)}</Badge>}
                          <Badge tone={docsDone >= CHECKLIST.length ? "green" : "neutral"}>
                            {docsDone}/{CHECKLIST.length} documents
                          </Badge>
                        </span>
                      </button>
                      <div className="flex items-center gap-2">
                        <select
                          value={a.status}
                          onChange={(e) => {
                            setApplicationStatus(a.id, e.target.value as ApplicationStatus);
                            logAudit({ actor: "student", action: `status → ${e.target.value}`, entity: inst?.name ?? a.id });
                          }}
                          aria-label={`Status for ${inst?.name ?? "application"}`}
                          className="rounded-full border border-hairline bg-white px-3 py-1.5 text-xs font-medium text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button
                          onClick={() => removeApplication(a.id)}
                          aria-label="Delete application"
                          className="rounded-full p-1.5 text-ink-faint transition hover:bg-signal-red-soft hover:text-signal-red"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ------------------------------ Detail ------------------------------ */}
            <aside className="lg:sticky lg:top-20 lg:self-start">
              {!current ? (
                <div className="card p-5">
                  <p className="font-semibold text-ink dark:text-slate-100">Select an application</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    The detail panel shows the required exam, fee, deadline, document checklist and notes for whichever
                    application you pick.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="card p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Application</p>
                        <p className="mt-1 font-semibold text-ink dark:text-slate-100">{currentInst?.name}</p>
                        <p className="text-sm text-ink-muted">{current.course}</p>
                      </div>
                      <Badge tone={STATUS_TONE[current.status]}>{current.status}</Badge>
                    </div>

                    <dl className="mt-4 space-y-3 text-sm">
                      <Row label="Entrance required" value={current.examRequired} />
                      <Row label="Deadline" value={current.deadline ? formatDate(current.deadline) : "Not recorded"} />
                      <Row label="Fee" value={current.fee || "Not recorded"} />
                      <Row label="Last updated" value={formatDate(current.updatedAt)} />
                    </dl>

                    {currentInst && (
                      <div className="mt-4 grid gap-2">
                        <Link href={`/colleges/${currentInst.slug}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
                          Open institution profile <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                        <a href="https://www.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-muted dark:text-slate-300">
                          Verify on the official site <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </a>
                      </div>
                    )}

                    <div className="mt-4 border-t border-hairline pt-4 dark:border-hairline-dark">
                      <label htmlFor="app-notes" className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                        Notes
                      </label>
                      <textarea
                        id="app-notes"
                        rows={3}
                        defaultValue={current.notes}
                        onBlur={(e) =>
                          upsertApplication({
                            ...current,
                            notes: e.target.value,
                            updatedAt: new Date().toISOString(),
                          })
                        }
                        placeholder="Counselling round, contact person, seat matrix notes…"
                        className="mt-1.5 w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="card p-5">
                    <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                      <CheckCircle2 className="h-4 w-4 text-signal-green" aria-hidden /> Document checklist
                    </p>
                    <ul className="mt-3 space-y-2">
                      {CHECKLIST.map((doc) => {
                        const done = current.documents.includes(doc);
                        return (
                          <li key={doc}>
                            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={done}
                                onChange={() => toggleDocument(current.id, doc)}
                                className="h-4 w-4 accent-[#2450c7] dark:accent-[#3ad9ec]"
                              />
                              <span className={done ? "line-through text-ink-faint" : ""}>{doc}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-3 text-[11px] text-ink-faint">
                      Checklist is generic — confirm the exact list in this institution's information brochure.
                    </p>
                  </div>

                  <div className="card p-5">
                    <p className="font-semibold text-ink dark:text-slate-100">Aid mentioned</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {current.scholarship || "Nothing recorded — check the institution's aid page separately."}
                    </p>
                    <div className="mt-3">
                      <Btn href="/scholarships" variant="secondary" size="sm">Search scholarships</Btn>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        <div className="mt-8">
          <Note tone="warn">
            Every entry here is yours and stays on this device. Nothing is submitted to any institution on your behalf —
            you still need to complete the actual application on the official portal.
          </Note>
        </div>
      </Section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right font-medium text-ink dark:text-slate-100">{value}</dd>
    </div>
  );
}
