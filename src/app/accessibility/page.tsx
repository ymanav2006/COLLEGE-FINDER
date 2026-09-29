import type { Metadata } from "next";
import Link from "next/link";
import { Keyboard, Eye, Type, Palette, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { Btn, PageHeader, Section, Note, Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Accessibility — commitments and known limits",
  description:
    "Keyboard support, screen reader labelling, contrast, motion preferences and known accessibility limits in this build.",
  alternates: { canonical: "/accessibility" },
};

const COMMITMENTS = [
  {
    icon: Keyboard,
    title: "Keyboard operable",
    items: [
      "A skip link jumps straight past the navigation to main content.",
      "Every control is reachable with Tab and actionable with Enter or Space.",
      "Map markers are focusable buttons, not click-only shapes.",
      "Visible focus rings are never removed — only restyled for the dark theme.",
    ],
  },
  {
    icon: Eye,
    title: "Screen readers",
    items: [
      "Icon-only buttons carry aria-label text describing their action.",
      "Tables use scope, captions and row groups so comparisons read correctly.",
      "The world map and India map expose role=img / role=button with a description.",
      "Confidence and status are conveyed with text, never colour alone.",
    ],
  },
  {
    icon: Type,
    title: "Content",
    items: [
      "Body text is 15–16px with a readable line length and relaxed line-height.",
      "Headings follow a single ordered hierarchy per page.",
      "Amounts use tabular figures so columns line up and compare cleanly.",
      "Nothing auto-plays, and no content flashes or strobes.",
    ],
  },
  {
    icon: Palette,
    title: "Colour & motion",
    items: [
      "Dark mode is a first-class theme, not an inverted filter.",
      "Text and control colours are checked against their backgrounds in both themes.",
      "prefers-reduced-motion disables the fade-up and shimmer animations.",
      "Long prose is left-aligned; nothing important relies on a gradient.",
    ],
  },
];

export default function AccessibilityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Accessibility"
        title="Built to be used, not just to be seen"
        lede="A platform that hands someone a decision should not lock out people who use a keyboard, a screen reader or a smaller screen. Here's what's in place — and what isn't yet."
        actions={
          <>
            <Btn href="/faq">Read the FAQ</Btn>
            <Btn href="/methodology" variant="secondary">Methodology</Btn>
          </>
        }
      />

      <Section>
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="grid gap-5 sm:grid-cols-2">
            {COMMITMENTS.map((c) => (
              <div key={c.title} className="card p-5">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <c.icon className="h-4 w-4 text-navy-500 dark:text-cyan-400" aria-hidden /> {c.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {c.items.map((i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-muted dark:text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" aria-hidden />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink dark:text-slate-50">Known limits in this build</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
              Stating the gaps is more useful than claiming a compliance badge.
            </p>
            <ul className="mt-4 space-y-3">
              {[
                "The map views are visual summaries. Equivalent figures are always available in list and table form beside them.",
                "Compare tables scroll horizontally on narrow screens — screen-reader users get a linearised table, sighted users need to scroll.",
                "Colour is never the only signal, but the palette has not been run through a formal contrast audit in every dark-mode surface.",
                "No live-region announcements are wired up for filtered result counts; the counts change visually without being spoken.",
                "This is a prototype: a full WCAG 2.2 AA audit with assistive-technology testing has not been performed.",
              ].map((t) => (
                <li key={t} className="flex gap-3 rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal-amber" aria-hidden />
                  <span className="text-sm leading-relaxed text-ink-muted dark:text-slate-300">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="card p-6">
              <p className="font-semibold text-ink dark:text-slate-100">Try it without a mouse</p>
              <ol className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
                <li>1. Press Tab once — the skip link appears at the top of the page.</li>
                <li>2. Press Enter to jump past the navigation.</li>
                <li>3. Keep tabbing: search, nav dropdowns, filters, cards and table controls are all in reading order.</li>
                <li>4. On the maps, Tab focuses each state marker and Enter selects it.</li>
                <li>5. Escape closes the global search overlay.</li>
              </ol>
              <div className="mt-4">
                <Btn href="/colleges" size="sm">Open a filtered list</Btn>
              </div>
            </div>

            <div className="card p-6">
              <p className="font-semibold text-ink dark:text-slate-100">Keyboard shortcuts</p>
              <dl className="mt-3 space-y-2 text-sm">
                {[
                  ["/", "Open global search"],
                  ["Esc", "Close overlays"],
                  ["Tab", "Move through controls in reading order"],
                  ["Enter / Space", "Activate the focused control"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <dt>
                      <kbd className="rounded-md border border-hairline bg-surface-muted px-2 py-0.5 text-xs font-semibold text-ink dark:border-hairline-dark dark:bg-white/8 dark:text-slate-100">
                        {k}
                      </kbd>
                    </dt>
                    <dd className="text-ink-muted dark:text-slate-300">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[11px] text-ink-faint">
                Shortcuts are deliberately few. A tool people use under stress should not require memorising a command
                palette.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="neutral">WCAG 2.2 AA: targets met, not formally audited</Badge>
            <Badge tone="neutral">Responsive from 360px upward</Badge>
            <Badge tone="neutral">Reduced-motion respected</Badge>
          </div>

          <Note>
            Found something that blocks you? That's a bug worth reporting more than any visual issue — accessibility
            gaps lock people out entirely rather than just looking wrong.
          </Note>
        </div>
      </Section>
    </>
  );
}
