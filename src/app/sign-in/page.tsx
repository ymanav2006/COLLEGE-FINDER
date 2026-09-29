"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail, Globe, UserRound, ShieldCheck, ArrowRight, CheckCircle2, GraduationCap, Sparkles,
} from "lucide-react";
import { Btn, Badge, PageHeader, Section, Note } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { DEMO_PROFILES, getDemoProfile, isDemoProfileId, type DemoProfileId } from "@/lib/demo-profiles";

export default function SignInPage() {
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const demoProfileId = useAppStore((s) => s.demoProfileId);

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [guestName, setGuestName] = useState("");

  // Deep link: /sign-in?demo=A loads that demo profile immediately.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("demo");
    if (isDemoProfileId(wanted)) {
      const p = getDemoProfile(wanted);
      if (p) completeOnboarding(p.profile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const useDemo = (id: DemoProfileId) => {
    const p = getDemoProfile(id);
    if (!p) return;
    completeOnboarding(p.profile);
    router.push("/dashboard");
  };

  const continueAsGuest = () => {
    router.push("/onboarding");
  };

  const sendLink = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That doesn't look like an email address.");
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 700);
  };

  return (
    <>
      <PageHeader
        eyebrow="Sign in"
        title="Start in ten seconds — no password needed"
        lede="Email magic link, Google, or continue as a guest. This build runs entirely in your browser: nothing you enter here leaves your device, and no account is created on a server."
        actions={<Btn href="/onboarding" variant="secondary">Skip to onboarding</Btn>}
      />

      <Section>
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
          {/* --------------------------- Auth --------------------------- */}
          <div className="space-y-5">
            <div className="card p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Continue with email</p>

              {sent ? (
                <div className="mt-4 rounded-2xl border border-signal-green/30 bg-signal-green-soft p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-signal-green">
                    <CheckCircle2 className="h-4 w-4" aria-hidden /> Demo magic link "sent"
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
                    In a real deployment you'd receive a one-time link at{" "}
                    <strong>{email}</strong>. There is no mail server behind this prototype, so nothing will arrive —
                    use guest access or a demo profile to actually get in.
                  </p>
                  <div className="mt-3">
                    <Btn size="sm" variant="secondary" onClick={() => setSent(false)}>
                      Use a different address
                    </Btn>
                  </div>
                </div>
              ) : (
                <form onSubmit={sendLink} className="mt-4 space-y-3">
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm text-ink-muted">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-ink-faint" aria-hidden />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-hairline bg-white py-2.5 pl-10 pr-3 text-sm text-ink outline-none focus:border-navy-400 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                      />
                    </div>
                    {error && <p className="mt-1.5 text-xs text-signal-red">{error}</p>}
                  </div>
                  <Btn type="submit" className="w-full" disabled={sending || !email}>
                    {sending ? "Sending…" : "Send magic link"}
                  </Btn>
                  <p className="text-[11px] leading-relaxed text-ink-faint">
                    We never ask for a password. Magic links expire and are single-use in a production deployment.
                  </p>
                </form>
              )}

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-hairline dark:bg-hairline-dark" aria-hidden />
                <span className="text-[11px] uppercase tracking-wider text-ink-faint">or</span>
                <span className="h-px flex-1 bg-hairline dark:bg-hairline-dark" aria-hidden />
              </div>

              <div className="grid gap-2">
                <button
                  onClick={() => useDemo("A")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-hairline bg-white py-2.5 text-sm font-medium text-ink transition hover:border-navy-400 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                >
                  <Globe className="h-4 w-4" aria-hidden /> Continue with Google
                </button>
                <button
                  onClick={continueAsGuest}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-hairline bg-white py-2.5 text-sm font-medium text-ink transition hover:border-navy-400 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                >
                  <UserRound className="h-4 w-4" aria-hidden /> Continue as guest
                </button>
              </div>

              <div className="mt-4 rounded-xl bg-surface-muted p-3 dark:bg-white/5">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Why no password?
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
                  Passwords get reused and leaked. A one-time link removes that whole class of problem — and in this
                  offline prototype, none of the three options actually contacts a server.
                </p>
              </div>
            </div>

            <div className="card p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Or give me a name</p>
              <div className="mt-3 flex gap-2">
                <label htmlFor="guest-name" className="sr-only">First name</label>
                <input
                  id="guest-name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="First name"
                  className="flex-1 rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm text-ink dark:border-hairline-dark dark:bg-white/6 dark:text-slate-100"
                />
                <Btn onClick={continueAsGuest} size="sm" disabled={!guestName.trim()}>
                  Go <ArrowRight className="h-4 w-4" aria-hidden />
                </Btn>
              </div>
            </div>
          </div>

          {/* --------------------------- Demo profiles --------------------------- */}
          <div className="space-y-5">
            <div className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <Sparkles className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> Demo profiles
                </p>
                <Badge tone="neutral">Clearly labelled demo data</Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Load a fully populated student to see how recommendations, eligibility and dashboards behave when a
                profile exists. Switch between them to watch the "why you're seeing this" reasons change.
              </p>

              <div className="mt-4 space-y-3">
                {DEMO_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => useDemo(p.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition hover:border-navy-400 ${
                      demoProfileId === p.id
                        ? "border-navy-500 bg-navy-50 dark:border-cyan-400 dark:bg-cyan-500/12"
                        : "border-hairline dark:border-hairline-dark"
                    }`}
                  >
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-600 text-xs font-bold text-white dark:bg-cyan-500 dark:text-navy-950">
                          {p.id}
                        </span>
                        <span className="font-semibold text-ink dark:text-slate-100">{p.name}</span>
                      </span>
                      {demoProfileId === p.id && <Badge tone="green">In use</Badge>}
                    </span>
                    <span className="mt-2 block text-sm text-ink-muted">{p.summary}</span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <span key={t} className="chip bg-surface-sunken text-[10px] text-ink-muted dark:bg-white/8 dark:text-slate-300">
                          {t}
                        </span>
                      ))}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 dark:text-cyan-300">
                      Load profile {p.id} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                <GraduationCap className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> What sign-in actually does
              </p>
              <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" aria-hidden /> Stores your profile in this browser's localStorage.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" aria-hidden /> Nothing is transmitted — there is no backend in this build.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" aria-hidden /> Signing out clears local state and nothing else.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" aria-hidden /> Demo profiles are fictional and marked as such throughout.</li>
              </ul>
            </div>

            <Note>
              Demo profile data is illustrative. It never appears as if it were real research about a real person.
            </Note>
          </div>
        </div>
      </Section>
    </>
  );
}
