"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ApplicationRecord,
  ApplicationStatus,
  DeadlineRecord,
  SavedItem,
  StudentProfile,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Notification model                                                  */
/* ------------------------------------------------------------------ */

export interface Notification {
  id: string;
  kind: "deadline" | "data" | "recommendation" | "reminder";
  title: string;
  body: string;
  date: string;
  read: boolean;
  href?: string;
}

/* ------------------------------------------------------------------ */
/* Audit trail (admin)                                                 */
/* ------------------------------------------------------------------ */

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
  before?: string;
  after?: string;
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

export const EMPTY_PROFILE: StudentProfile = {
  id: "local",
  name: "",
  country: "India",
  state: "",
  board: "",
  stream: null,
  subjects: [],
  percentage: null,
  grade: "",
  entranceScores: [],
  expectedPercentage: null,
  category: "",
  admissionRoute: "",
  interests: [],
  favoriteSubjects: [],
  skills: [],
  activities: [],
  careerInterests: [],
  workStyle: "",
  researchInterest: 3,
  entrepreneurshipInterest: 3,
  sectorPreference: "",
  wantAbroad: false,
  budgetYearlyINR: null,
  budgetPreset: "",
  scholarshipDependent: false,
  loanAcceptable: false,
  preferPublic: true,
  privateAcceptable: true,
  locationPreference: "Any location",
  specificCountries: [],
};

interface AppState {
  hydrated: boolean;

  profile: StudentProfile | null;
  onboardingComplete: boolean;
  onboardingStep: number;
  demoProfileId: string | null;

  saved: SavedItem[];
  compare: string[]; // institution ids, 2–5
  applications: ApplicationRecord[];
  deadlines: DeadlineRecord[];
  notifications: Notification[];
  audit: AuditEntry[];

  searchHistory: string[];

  setProfile: (profile: StudentProfile | null) => void;
  patchProfile: (patch: Partial<StudentProfile>) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: (profile: StudentProfile) => void;
  resetAll: () => void;

  toggleSaved: (kind: SavedItem["kind"], id: string) => void;
  isSaved: (kind: SavedItem["kind"], id: string) => boolean;

  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  inCompare: (id: string) => boolean;

  upsertApplication: (record: ApplicationRecord) => void;
  removeApplication: (id: string) => void;
  setApplicationStatus: (id: string, status: ApplicationStatus) => void;

  upsertDeadline: (record: DeadlineRecord) => void;
  removeDeadline: (id: string) => void;
  toggleDeadline: (id: string) => void;

  pushNotification: (n: Omit<Notification, "id" | "date" | "read">) => void;
  markAllRead: () => void;

  logAudit: (entry: Omit<AuditEntry, "id" | "at">) => void;

  rememberSearch: (q: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,

      profile: null,
      onboardingComplete: false,
      onboardingStep: 0,
      demoProfileId: null,

      saved: [],
      compare: [],
      applications: [],
      deadlines: [],
      notifications: [],
      audit: [],
      searchHistory: [],

      setProfile: (profile) => set({ profile }),

      patchProfile: (patch) =>
        set((s) => ({ profile: { ...(s.profile ?? EMPTY_PROFILE), ...patch } })),

      setOnboardingStep: (step) => set({ onboardingStep: step }),

      completeOnboarding: (profile) =>
        set({
          profile,
          onboardingComplete: true,
          onboardingStep: 0,
          demoProfileId: null,
          notifications: [
            {
              id: uid(),
              kind: "recommendation",
              title: "Your Education Map is ready",
              body: "We've built a first pass of recommendations from what you told us. Every card explains why it appears.",
              date: new Date().toISOString(),
              read: false,
              href: "/dashboard",
            },
            ...get().notifications,
          ],
        }),

      resetAll: () =>
        set({
          profile: null,
          onboardingComplete: false,
          onboardingStep: 0,
          demoProfileId: null,
          saved: [],
          compare: [],
          applications: [],
          deadlines: [],
          notifications: [],
          audit: [],
          searchHistory: [],
        }),

      toggleSaved: (kind, id) =>
        set((s) => {
          const exists = s.saved.some((x) => x.kind === kind && x.id === id);
          return {
            saved: exists
              ? s.saved.filter((x) => !(x.kind === kind && x.id === id))
              : [{ kind, id, savedAt: new Date().toISOString() }, ...s.saved],
          };
        }),

      isSaved: (kind, id) => get().saved.some((x) => x.kind === kind && x.id === id),

      toggleCompare: (id) =>
        set((s) => {
          if (s.compare.includes(id)) return { compare: s.compare.filter((c) => c !== id) };
          if (s.compare.length >= 5) return s; // 2–5 way compare; keep the cap explicit
          return { compare: [...s.compare, id] };
        }),

      clearCompare: () => set({ compare: [] }),

      inCompare: (id) => get().compare.includes(id),

      upsertApplication: (record) =>
        set((s) => {
          const exists = s.applications.some((a) => a.id === record.id);
          return {
            applications: exists
              ? s.applications.map((a) => (a.id === record.id ? record : a))
              : [record, ...s.applications],
          };
        }),

      removeApplication: (id) =>
        set((s) => ({ applications: s.applications.filter((a) => a.id !== id) })),

      setApplicationStatus: (id, status) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a,
          ),
        })),

      upsertDeadline: (record) =>
        set((s) => {
          const exists = s.deadlines.some((d) => d.id === record.id);
          return {
            deadlines: exists
              ? s.deadlines.map((d) => (d.id === record.id ? record : d))
              : [...s.deadlines, record].sort((a, b) => a.date.localeCompare(b.date)),
          };
        }),

      removeDeadline: (id) => set((s) => ({ deadlines: s.deadlines.filter((d) => d.id !== id) })),

      toggleDeadline: (id) =>
        set((s) => ({
          deadlines: s.deadlines.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d)),
        })),

      pushNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: uid(), date: new Date().toISOString(), read: false },
            ...s.notifications,
          ].slice(0, 50),
        })),

      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      logAudit: (entry) =>
        set((s) => ({
          audit: [{ ...entry, id: uid(), at: new Date().toISOString() }, ...s.audit].slice(0, 500),
        })),

      rememberSearch: (q) =>
        set((s) => ({
          searchHistory: [q, ...s.searchHistory.filter((x) => x !== q)].slice(0, 10),
        })),
    }),
    {
      name: "college-finder-state",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        profile: s.profile,
        onboardingComplete: s.onboardingComplete,
        onboardingStep: s.onboardingStep,
        demoProfileId: s.demoProfileId,
        saved: s.saved,
        compare: s.compare,
        applications: s.applications,
        deadlines: s.deadlines,
        notifications: s.notifications,
        audit: s.audit,
        searchHistory: s.searchHistory,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

/* ------------------------------------------------------------------ */
/* Derived notifications                                               */
/* ------------------------------------------------------------------ */

/** Deadlines due soon + stale data nudges, computed from state. */
export function deriveNotifications(
  deadlines: DeadlineRecord[],
  staleItems: { title: string; href: string; days: number }[],
): Notification[] {
  const now = Date.now();
  const out: Notification[] = [];

  for (const d of deadlines) {
    if (d.completed) continue;
    const t = Date.parse(d.date);
    if (Number.isNaN(t)) continue;
    const days = Math.ceil((t - now) / 86_400_000);
    if (days < 0) {
      out.push({
        id: `dl-pass-${d.id}`,
        kind: "deadline",
        title: `Missed: ${d.title}`,
        body: `This deadline passed ${Math.abs(days)} day(s) ago. Check whether the window has been extended before you give up.`,
        date: d.date,
        read: false,
        href: "/tools/deadlines",
      });
    } else if (days <= 14) {
      out.push({
        id: `dl-soon-${d.id}`,
        kind: "deadline",
        title: `${d.title} — ${days === 0 ? "today" : `${days} day(s) left`}`,
        body: `${d.category} · ${d.priority} priority${d.notes ? ` · ${d.notes}` : ""}.`,
        date: d.date,
        read: false,
        href: "/tools/deadlines",
      });
    }
  }

  for (const s of staleItems) {
    out.push({
      id: `stale-${s.href}`,
      kind: "data",
      title: `Old data: ${s.title}`,
      body: `Last checked ${s.days} days ago. Information may have changed — verify before applying.`,
      date: new Date().toISOString(),
      read: false,
      href: s.href,
    });
  }

  return out.sort((a, b) => a.date.localeCompare(b.date));
}
