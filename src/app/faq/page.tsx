"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, ArrowRight, MessageCircleQuestion } from "lucide-react";
import { Btn, Badge, PageHeader, Section, Note } from "@/components/ui";

interface Item {
  q: string;
  a: string;
  category: string;
}

const FAQ: Item[] = [
  // ---- Methodology & trust ----
  {
    category: "Methodology & trust",
    q: "Where does the data come from?",
    a: "Every value in this build points to a source record with a type (government, accreditation body, official website, institutional document, seed dataset) and a date it was last checked. Open “How We Know This” on any fact to see all three. This prototype ships a curated seed dataset — those records are explicitly marked as demo rather than dressed up as live research.",
  },
  {
    category: "Methodology & trust",
    q: "Why do some facts say “Reported” instead of “Verified”?",
    a: "Confidence is stated honestly rather than optimistically. Verified means we've confirmed it against a primary source on a known date. Cross-checked means two independent sources agree. Reported means someone published it and we've passed it through unchanged with attribution. Unverified means we have it but can't yet stand behind it. We would rather show a lower confidence label than imply certainty we don't have.",
  },
  {
    category: "Methodology & trust",
    q: "How do you decide which colleges are “good”?",
    a: "We deliberately don't. Each institution carries thirteen separate dimension scores with evidence attached to each one — academics, research, career outcomes, campus life, infrastructure, activities, affordability, location, international exposure, entrepreneurship, diversity, accommodation and student support. Averaging those into a single number would hide the exact trade-off you need to see. A college strong on research and weak on affordability is a different choice from the reverse, and no total can express that.",
  },
  {
    category: "Methodology & trust",
    q: "What happens when data gets old?",
    a: "Every time-sensitive fact carries the date it was last checked. Past 180 days it automatically displays an “information may have changed — verify before applying” warning wherever it appears. You'll see this most often on exam dates and scholarship deadlines, which move every cycle.",
  },
  {
    category: "Methodology & trust",
    q: "Do you guarantee admission, jobs or visas?",
    a: "No, and you should be sceptical of anything that does. We show eligibility rules, published cutoffs, reported outcome ranges and application timelines. We never predict an outcome, and nothing here should be read as a promise. Admission depends on that year's competition; hiring depends on a market we don't control; visas are decided solely by the relevant government.",
  },

  // ---- Using the platform ----
  {
    category: "Using the platform",
    q: "Do I need an account?",
    a: "No. Continue as a guest and everything works — your profile, saved items, compare tray, deadlines and applications all live in your browser's localStorage. Signing in (email link, Google, or a demo profile) just prefills a richer starting point.",
  },
  {
    category: "Using the platform",
    q: "What are the four demo profiles?",
    a: "Fictional students A–D covering quite different situations: a metro-oriented PCM student with a comfortable budget, a scholarship-dependent commerce student staying in-state, an undecided PCB student open to going abroad, and an arts student planning a cross-stream move on a tight budget. Load each one in turn and watch the reasons under “Why you're seeing this” change — that's the fastest way to understand how recommendations are formed.",
  },
  {
    category: "Using the platform",
    q: "How many colleges can I compare at once?",
    a: "Between two and five. Below two there's nothing to compare; above five the table stops being readable on a screen and you start comparing noise rather than trade-offs.",
  },
  {
    category: "Using the platform",
    q: "Why doesn't global search find everything?",
    a: "Because we only return records we actually hold. There's no fuzzy guesswork generating plausible-looking results. If a search comes back empty, that's a real answer about this build's dataset — not a failure of your query.",
  },
  {
    category: "Using the platform",
    q: "Can I use this on my phone?",
    a: "Yes. Navigation collapses into a mobile menu, the filter rail becomes a toggle, tables scroll horizontally, and the compare tray docks to the bottom of the screen.",
  },

  // ---- Pathfinder & tools ----
  {
    category: "Pathfinder & tools",
    q: "Is the Pathfinder a real AI?",
    a: "It's a retrieval engine: it parses what you asked, finds matching records in this build's database, and composes an answer with a citation attached to every claim. It has no ability to invent a fee, a deadline or a placement figure because it never generates facts — if the database has nothing, it says so. The interface is provider-agnostic, so a language model could be swapped in behind it later without changing how citations are shown.",
  },
  {
    category: "Pathfinder & tools",
    q: "What does the What-If Explorer actually do?",
    a: "It re-runs the same eligibility and filtering rules against a hypothetical version of your profile, then shows you the difference: which institutions and courses appeared, and which disappeared. It doesn't predict anything — it just makes the consequences of one changed assumption visible.",
  },
  {
    category: "Pathfinder & tools",
    q: "Does the decision matrix pick a winner for me?",
    a: "It multiplies scores you set by weights you set, and shows the arithmetic. The output describes your priorities back to you; it doesn't have any of its own. If two options land within a few points, the tool says so explicitly rather than pretending the gap means something.",
  },
  {
    category: "Pathfinder & tools",
    q: "Where do budget and deadline information live?",
    a: "In this browser only. Nothing is uploaded, synced or shared. Clearing your browser data clears it, which is also why we recommend keeping a PDF of anything important.",
  },

  // ---- Study abroad ----
  {
    category: "Study abroad",
    q: "How current are the country guides?",
    a: "Sixteen destinations, each with a last-verified date on tuition, living costs, visa notes, work rights and post-study options, plus links to the official government or institution source behind each claim. Visa rules change with little notice, so treat every row as a starting point and confirm on the official immigration site before you commit.",
  },
  {
    category: "Study abroad",
    q: "Can you help me get a visa?",
    a: "No. We can show you what the published requirements are and when they last changed, but visa decisions rest solely with the relevant government. No platform can influence that, and any service claiming otherwise is not being straight with you.",
  },
];

const CATEGORIES = Array.from(new Set(FAQ.map((f) => f.category)));

export default function FaqPage() {
  const [open, setOpen] = useState<string | null>(FAQ[0].q);
  const [category, setCategory] = useState("All");

  const visible = FAQ.filter((f) => category === "All" || f.category === category);

  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Questions students actually ask"
        lede="About the data, the method, the tools and what this platform will deliberately never do."
        actions={
          <>
            <Btn href="/pathfinder">Ask Pathfinder</Btn>
            <Btn href="/methodology" variant="secondary">Read the methodology</Btn>
          </>
        }
      />

      <Section>
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-wrap gap-2">
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`chip border ${category === c
                  ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950"
                  : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {visible.map((f) => {
              const isOpen = open === f.q;
              return (
                <div
                  key={f.q}
                  className={`card overflow-hidden transition ${isOpen ? "border-navy-300 dark:border-cyan-500/50" : ""}`}
                >
                  <h2>
                    <button
                      onClick={() => setOpen(isOpen ? null : f.q)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="flex items-start gap-3">
                        <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-navy-500 dark:text-cyan-400" aria-hidden />
                        <span className="text-[15px] font-medium text-ink dark:text-slate-100">{f.q}</span>
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-ink-faint transition-transform ${isOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </button>
                  </h2>
                  {isOpen && (
                    <div className="border-t border-hairline px-5 py-4 dark:border-hairline-dark">
                      <p className="pl-7 text-sm leading-relaxed text-ink-muted dark:text-slate-300">{f.a}</p>
                      <div className="mt-3 pl-7">
                        <Badge tone="neutral">{f.category}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { t: "How we source everything", d: "Confidence labels, staleness rules and editorial policy.", href: "/methodology" },
              { t: "Accessibility statement", d: "Keyboard, screen reader and contrast commitments.", href: "/accessibility" },
              { t: "The Confusion Solver", d: "If none of these questions were yours.", href: "/confusion-solver" },
            ].map((x) => (
              <Link key={x.t} href={x.href} className="card interactive-card p-5">
                <p className="flex items-center gap-1 font-semibold text-ink dark:text-slate-100">
                  {x.t} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </p>
                <p className="mt-1.5 text-sm text-ink-muted">{x.d}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Note>
              Still unclear about something? Ask Pathfinder — if it doesn't know, it will say so rather than
              improvising an answer.
            </Note>
          </div>
        </div>
      </Section>
    </>
  );
}
