"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Bell, Bookmark, Scale, Menu, X, Sun, Moon, Sparkles, ChevronDown,
  LayoutDashboard, GraduationCap, Globe2, Wallet, CalendarDays, GitCompareArrows,
  Map, HelpCircle, ShieldCheck, LogIn, Compass, BookOpen, Users, FlaskConical,
} from "lucide-react";
import { groupHits, search as runSearch, SEARCH_SUGGESTIONS } from "@/lib/search";
import { useAppStore, deriveNotifications } from "@/lib/store";
import { STALE_AFTER_DAYS, daysSince } from "@/data/sources";
import { EXAMS } from "@/data/exams";
import { SCHOLARSHIPS } from "@/data/scholarships";
import { COUNTRIES } from "@/data/countries";

/* ------------------------------------------------------------------ */
/* Navigation model                                                    */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: { label: string; href: string; desc?: string }[];
}

const NAV: NavItem[] = [
  {
    label: "Explore",
    icon: <Compass className="h-4 w-4" aria-hidden />,
    children: [
      { label: "Stream → Career Explorer", href: "/explore", desc: "PCM, PCB, Commerce, Arts, Vocational" },
      { label: "What Else Can I Become?", href: "/explore/outside-my-stream", desc: "Routes from outside your stream" },
      { label: "Courses", href: "/courses", desc: "Every degree, diploma and certificate" },
      { label: "Careers", href: "/careers", desc: "What the work is actually like" },
      { label: "Entrance exams", href: "/exams", desc: "Dates, pattern, syllabus, prep" },
      { label: "Skills", href: "/skills", desc: "What to learn alongside your degree" },
      { label: "Higher studies planner", href: "/higher-studies", desc: "Master's, professional and research routes" },
    ],
  },
  { label: "Colleges", href: "/colleges", icon: <GraduationCap className="h-4 w-4" aria-hidden /> },
  {
    label: "Study Abroad",
    href: "/abroad",
    icon: <Globe2 className="h-4 w-4" aria-hidden />,
    children: [
      { label: "16 country guides", href: "/abroad", desc: "Costs, visas, work rights, last-verified dates" },
      { label: "Compare countries", href: "/tools/compare?kind=country", desc: "Tuition, living, post-study options" },
    ],
  },
  { label: "Scholarships", href: "/scholarships", icon: <Wallet className="h-4 w-4" aria-hidden /> },
  {
    label: "Tools",
    icon: <LayoutDashboard className="h-4 w-4" aria-hidden />,
    children: [
      { label: "Your Education Map", href: "/dashboard", desc: "Your personalised dashboard" },
      { label: "Compare colleges", href: "/tools/compare", desc: "2–5 way, multi-dimensional" },
      { label: "Budget planner", href: "/tools/budget", desc: "Plan what the four years cost" },
      { label: "Can I afford this?", href: "/tools/afford", desc: "Budget check against real fees" },
      { label: "Deadline tracker", href: "/tools/deadlines", desc: "Every date in one place" },
      { label: "Application tracker", href: "/tools/applications", desc: "Status, documents, results" },
      { label: "Decision matrix", href: "/tools/decision-matrix", desc: "Weight what matters to you" },
      { label: "Plan B Generator", href: "/tools/plan-b", desc: "Alternatives if the first route fails" },
      { label: "What-If Explorer", href: "/tools/what-if", desc: "Change one variable, see what moves" },
      { label: "5-Year Map", href: "/roadmap", desc: "Milestones year by year" },
      { label: "India & world maps", href: "/maps", desc: "Where everything is" },
      { label: "Confusion Solver", href: "/confusion-solver", desc: "I don't know what to do" },
    ],
  },
  { label: "Pathfinder AI", href: "/pathfinder", icon: <Sparkles className="h-4 w-4" aria-hidden /> },
];

const ICON_LINKS = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/tools/compare", label: "Compare", icon: Scale },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (localStorage.getItem("cf-theme") as "light" | "dark" | null) ?? null;
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initial = stored ?? system;
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("cf-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  return { theme, toggle };
}

/* ------------------------------------------------------------------ */
/* Search overlay                                                      */
/* ------------------------------------------------------------------ */

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const rememberSearch = useAppStore((s) => s.rememberSearch);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open, onClose]);

  const hits = useMemo(() => (q.trim().length > 1 ? runSearch(q, 24) : []), [q]);
  const groups = useMemo(() => groupHits(hits), [hits]);

  const submit = (value: string) => {
    rememberSearch(value);
    onClose();
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
      <button
        className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close search"
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-hairline bg-white shadow-lift dark:border-hairline-dark dark:bg-surface-dark">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) submit(q.trim());
          }}
          className="flex items-center gap-3 border-b border-hairline px-5 py-4 dark:border-hairline-dark"
        >
          <Search className="h-5 w-5 text-ink-faint" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Try "Computer Science colleges under ₹3 lakh in India"'
            className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-faint dark:text-slate-100"
            aria-label="Search everything"
          />
          <kbd className="hidden rounded-md border border-hairline px-1.5 py-0.5 text-[10px] text-ink-faint sm:block dark:border-hairline-dark">
            ESC
          </kbd>
        </form>

        <div className="max-h-[58vh] overflow-y-auto p-3">
          {q.trim().length <= 1 && (
            <div className="p-2">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Try one of these</p>
              <div className="flex flex-wrap gap-2">
                {SEARCH_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQ(s)}
                    className="rounded-full border border-hairline px-3 py-1.5 text-xs text-ink-muted transition hover:border-navy-300 hover:text-navy-600 dark:border-hairline-dark dark:text-slate-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {q.trim().length > 1 && hits.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-ink dark:text-slate-100">Nothing matched that.</p>
              <p className="mt-1 text-xs text-ink-muted">
                We only show results we actually hold records for — we won't invent an answer.
              </p>
              <button
                onClick={() => submit(q)}
                className="mt-4 rounded-full bg-navy-600 px-4 py-2 text-xs font-semibold text-white dark:bg-cyan-500 dark:text-navy-950"
              >
                Ask Pathfinder AI instead
              </button>
            </div>
          )}

          {groups.map((g) => (
            <div key={g.type} className="mb-2">
              <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{g.label}</p>
              {g.hits.map((h) => (
                <Link
                  key={`${h.doc.type}-${h.doc.id}`}
                  href={h.doc.href}
                  onClick={onClose}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition hover:bg-surface-muted dark:hover:bg-white/6"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink dark:text-slate-100">{h.doc.title}</span>
                    <span className="block truncate text-xs text-ink-muted">{h.doc.subtitle}</span>
                  </span>
                  <span className="shrink-0 text-[10px] font-semibold text-navy-500 dark:text-cyan-400">
                    {h.score}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Compare tray                                                        */
/* ------------------------------------------------------------------ */

function CompareTray() {
  const compare = useAppStore((s) => s.compare);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => setDismissed(false), [compare.length]);

  if (compare.length === 0 || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white/95 px-4 py-3 backdrop-blur dark:border-hairline-dark dark:bg-surface-dark/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <p className="text-sm text-ink-muted dark:text-slate-300">
          <strong className="text-ink dark:text-slate-100">{compare.length}</strong> selected for comparison
          {compare.length < 2 && " — pick at least two"}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDismissed(true)}
            className="rounded-full px-3 py-2 text-xs text-ink-faint hover:text-ink dark:hover:text-slate-100"
          >
            Hide
          </button>
          <button
            onClick={clearCompare}
            className="rounded-full px-3 py-2 text-xs text-ink-muted hover:text-ink dark:text-slate-300"
          >
            Clear
          </button>
          <Link
            href="/tools/compare"
            className="rounded-full bg-navy-600 px-4 py-2 text-xs font-semibold text-white hover:bg-navy-700 dark:bg-cyan-500 dark:text-navy-950"
          >
            Compare now
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications popover                                               */
/* ------------------------------------------------------------------ */

function BellMenu() {
  const [open, setOpen] = useState(false);
  const deadlines = useAppStore((s) => s.deadlines);
  const notifications = useAppStore((s) => s.notifications);
  const markAllRead = useAppStore((s) => s.markAllRead);

  const stale = useMemo(() => {
    const out: { title: string; href: string; days: number }[] = [];
    const push = (title: string, href: string, verifiedOn: string) => {
      const days = daysSince(verifiedOn);
      if (days > STALE_AFTER_DAYS) out.push({ title, href, days });
    };
    push("Entrance exam dates", "/exams", EXAMS[0]?.lastVerified ?? "2026-08-20");
    push("Scholarship deadlines", "/scholarships", SCHOLARSHIPS[0]?.lastVerified ?? "2026-06-01");
    push("Study-abroad visa notes", "/abroad", COUNTRIES[0]?.lastVerified ?? "2026-06-01");
    return out;
  }, []);

  const derived = useMemo(() => deriveNotifications(deadlines, stale), [deadlines, stale]);
  const merged = useMemo(
    () => [...derived, ...notifications].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20),
    [derived, notifications],
  );
  const unread = merged.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-ink-muted transition hover:bg-surface-sunken hover:text-ink dark:text-slate-300 dark:hover:bg-white/8"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal-red px-1 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-hairline bg-white shadow-lift dark:border-hairline-dark dark:bg-surface-dark">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3 dark:border-hairline-dark">
              <p className="text-sm font-semibold text-ink dark:text-slate-100">Notifications</p>
              <button onClick={markAllRead} className="text-[11px] font-medium text-navy-600 dark:text-cyan-300">
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {merged.length === 0 && (
                <p className="px-4 py-6 text-center text-xs text-ink-muted">
                  Nothing yet. Add a deadline and we'll remind you here.
                </p>
              )}
              {merged.map((n) => (
                <Link
                  key={n.id}
                  href={n.href ?? "/notifications"}
                  onClick={() => setOpen(false)}
                  className="block border-b border-hairline px-4 py-3 last:border-0 hover:bg-surface-muted dark:border-hairline-dark dark:hover:bg-white/5"
                >
                  <p className="text-[13px] font-medium text-ink dark:text-slate-100">{n.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{n.body}</p>
                </Link>
              ))}
            </div>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-center text-xs font-semibold text-navy-600 hover:bg-surface-muted dark:text-cyan-300 dark:hover:bg-white/5"
            >
              Open notification centre
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const profile = useAppStore((s) => s.profile);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const compareCount = useAppStore((s) => s.compare.length);
  const savedCount = useAppStore((s) => s.saved.length);

  // Global keyboard shortcut: "/" opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-navy-600 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-hairline bg-white/85 backdrop-blur-xl dark:border-hairline-dark dark:bg-page-dark/85">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="College Finder home">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-navy-600 via-violet-600 to-cyan-600 text-white">
              <GraduationCap className="h-4.5 w-4.5" aria-hidden />
            </span>
            <span className="hidden text-[15px] font-bold tracking-tight text-ink sm:block dark:text-slate-50">
              College<span className="text-navy-600 dark:text-cyan-400">Finder</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(item.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-medium transition ${
                      openMenu === item.label
                        ? "bg-surface-sunken text-ink dark:bg-white/8 dark:text-white"
                        : "text-ink-muted hover:text-ink dark:text-slate-300 dark:hover:text-white"
                    }`}
                    aria-expanded={openMenu === item.label}
                    onClick={() => setOpenMenu((v) => (v === item.label ? null : item.label))}
                  >
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
                  </button>
                  {openMenu === item.label && (
                    <div className="absolute left-0 top-full w-[19rem] rounded-2xl border border-hairline bg-white p-2 shadow-lift dark:border-hairline-dark dark:bg-surface-dark">
                      {item.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          className="block rounded-xl px-3 py-2.5 transition hover:bg-surface-muted dark:hover:bg-white/6"
                        >
                          <span className="block text-[13px] font-medium text-ink dark:text-slate-100">{c.label}</span>
                          {c.desc && <span className="mt-0.5 block text-[11px] text-ink-muted">{c.desc}</span>}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={`rounded-lg px-3 py-2 text-[13px] font-medium transition ${
                    isActive(item.href!)
                      ? "bg-navy-50 text-navy-700 dark:bg-cyan-500/12 dark:text-cyan-300"
                      : "text-ink-muted hover:text-ink dark:text-slate-300 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-hairline bg-surface-muted px-3.5 py-2 text-[13px] text-ink-faint transition hover:border-navy-300 hover:text-ink md:flex dark:border-hairline-dark dark:bg-white/5 dark:text-slate-400"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" aria-hidden />
              Search…
              <kbd className="rounded border border-hairline px-1 text-[10px] dark:border-hairline-dark">/</kbd>
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2 text-ink-muted hover:bg-surface-sunken md:hidden dark:text-slate-300 dark:hover:bg-white/8"
              aria-label="Open search"
            >
              <Search className="h-[18px] w-[18px]" aria-hidden />
            </button>

            <Link
              href="/saved"
              className="relative hidden rounded-full p-2 text-ink-muted transition hover:bg-surface-sunken sm:block dark:text-slate-300 dark:hover:bg-white/8"
              aria-label={`Saved items${savedCount ? `, ${savedCount}` : ""}`}
            >
              <Bookmark className="h-[18px] w-[18px]" aria-hidden />
              {savedCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-navy-500 dark:bg-cyan-400" />
              )}
            </Link>

            <Link
              href="/tools/compare"
              className="relative hidden rounded-full p-2 text-ink-muted transition hover:bg-surface-sunken sm:block dark:text-slate-300 dark:hover:bg-white/8"
              aria-label={`Compare${compareCount ? `, ${compareCount} selected` : ""}`}
            >
              <Scale className="h-[18px] w-[18px]" aria-hidden />
              {compareCount > 0 && (
                <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-navy-500 px-1 text-[9px] font-bold text-white dark:bg-cyan-400 dark:text-navy-950">
                  {compareCount}
                </span>
              )}
            </Link>

            <BellMenu />

            <button
              onClick={toggle}
              className="rounded-full p-2 text-ink-muted transition hover:bg-surface-sunken dark:text-slate-300 dark:hover:bg-white/8"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" aria-hidden /> : <Moon className="h-[18px] w-[18px]" aria-hidden />}
            </button>

            <Link
              href={onboardingComplete ? "/dashboard" : "/sign-in"}
              className="ml-1 hidden rounded-full bg-navy-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-navy-700 sm:block dark:bg-cyan-500 dark:text-navy-950 dark:hover:bg-cyan-400"
            >
              {profile?.name ? profile.name.split(" ")[0] : onboardingComplete ? "Dashboard" : "Sign in"}
            </Link>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-full p-2 text-ink-muted lg:hidden dark:text-slate-300"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-hairline px-4 py-4 lg:hidden dark:border-hairline-dark">
            <div className="grid gap-1">
              {NAV.map((item) =>
                item.children ? (
                  <details key={item.label} className="rounded-xl border border-hairline dark:border-hairline-dark">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3 text-sm font-medium text-ink dark:text-slate-100">
                      {item.label}
                      <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
                    </summary>
                    <div className="border-t border-hairline p-1.5 dark:border-hairline-dark">
                      {item.children.map((c) => (
                        <Link key={c.href} href={c.href} className="block rounded-lg px-3 py-2.5 text-sm text-ink-muted hover:bg-surface-muted dark:hover:bg-white/6">
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={`rounded-xl px-3 py-3 text-sm font-medium ${
                      isActive(item.href!) ? "bg-navy-50 text-navy-700 dark:bg-cyan-500/12 dark:text-cyan-300" : "text-ink dark:text-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {ICON_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-2 rounded-xl border border-hairline px-3 py-2.5 text-sm text-ink-muted dark:border-hairline-dark dark:text-slate-300"
                >
                  <l.icon className="h-4 w-4" aria-hidden />
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href="/pathfinder" className="rounded-xl bg-navy-600 px-3 py-2.5 text-center text-sm font-semibold text-white dark:bg-cyan-500 dark:text-navy-950">
                Pathfinder AI
              </Link>
              <Link href={onboardingComplete ? "/dashboard" : "/sign-in"} className="rounded-xl border border-hairline px-3 py-2.5 text-center text-sm font-semibold text-ink dark:border-hairline-dark dark:text-slate-100">
                {onboardingComplete ? "My dashboard" : "Sign in"}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer />
      <CompareTray />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function Footer() {
  const groups = [
    {
      title: "Explore",
      links: [
        { label: "Stream → Career Explorer", href: "/explore" },
        { label: "What Else Can I Become?", href: "/explore/outside-my-stream" },
        { label: "Courses", href: "/courses" },
        { label: "Careers", href: "/careers" },
        { label: "Entrance exams", href: "/exams" },
        { label: "Skills", href: "/skills" },
      ],
    },
    {
      title: "Find & compare",
      links: [
        { label: "College database", href: "/colleges" },
        { label: "Compare (2–5 way)", href: "/tools/compare" },
        { label: "Study abroad", href: "/abroad" },
        { label: "Scholarships", href: "/scholarships" },
        { label: "Search everything", href: "/search" },
        { label: "Saved items", href: "/saved" },
      ],
    },
    {
      title: "Plan",
      links: [
        { label: "Your Education Map", href: "/dashboard" },
        { label: "Budget planner", href: "/tools/budget" },
        { label: "Can I afford this?", href: "/tools/afford" },
        { label: "Deadline tracker", href: "/tools/deadlines" },
        { label: "Application tracker", href: "/tools/applications" },
        { label: "Decision matrix", href: "/tools/decision-matrix" },
        { label: "Plan B Generator", href: "/tools/plan-b" },
        { label: "What-If Explorer", href: "/tools/what-if" },
        { label: "5-Year Map", href: "/roadmap" },
      ],
    },
    {
      title: "Help & trust",
      links: [
        { label: "Pathfinder AI", href: "/pathfinder" },
        { label: "Confusion Solver", href: "/confusion-solver" },
        { label: "How we source data", href: "/methodology" },
        { label: "FAQ", href: "/faq" },
        { label: "Accessibility", href: "/accessibility" },
        { label: "Admin dashboard", href: "/admin" },
      ],
    },
  ];

  return (
    <footer className="border-t border-hairline bg-surface-muted dark:border-hairline-dark dark:bg-white/3">
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-navy-600 via-violet-600 to-cyan-600 text-white">
                <GraduationCap className="h-4.5 w-4.5" aria-hidden />
              </span>
              <span className="text-[15px] font-bold text-ink dark:text-slate-50">CollegeFinder</span>
            </div>
            <p className="mt-4 text-sm font-medium text-ink dark:text-slate-200">
              Your Future Has More Than One Path.
            </p>
            <p className="mt-1 text-sm text-ink-muted">Explore. Compare. Plan. Move Forward.</p>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-ink-faint">
              We never guarantee admission, employment or salary. Every important number shows its source, date and
              confidence so you can check it yourself.
            </p>
            <div className="mt-5 flex gap-2">
              <Link href="/pathfinder" className="chip bg-navy-600 text-white dark:bg-cyan-500 dark:text-navy-950">
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Ask Pathfinder
              </Link>
              <Link href="/methodology" className="chip border border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/5 dark:text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> How we know
              </Link>
            </div>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-faint">{g.title}</p>
              <ul className="space-y-2">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[13px] text-ink-muted transition hover:text-navy-600 dark:text-slate-400 dark:hover:text-cyan-300">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-hairline pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between dark:border-hairline-dark">
          <p>© {new Date().getFullYear()} CollegeFinder · Demo build — seed data is labelled and not verified production data.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/accessibility" className="hover:text-ink">Accessibility</Link>
            <Link href="/faq" className="hover:text-ink">FAQ</Link>
            <Link href="/methodology" className="hover:text-ink">Methodology</Link>
            <Link href="/admin" className="hover:text-ink">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
