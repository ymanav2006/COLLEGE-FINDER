import Link from "next/link";
import { MapPinOff, ArrowRight, Search, Compass } from "lucide-react";
import { Btn, PageHeader, Section, Note } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title="This route isn't in the map"
        lede="Either the record doesn't exist in this build's dataset, or the address has changed. We don't invent a substitute page to paper over the gap."
        actions={
          <>
            <Btn href="/search">
              <Search className="h-4 w-4" aria-hidden /> Search everything
            </Btn>
            <Btn href="/explore" variant="secondary">
              <Compass className="h-4 w-4" aria-hidden /> Explore by stream
            </Btn>
          </>
        }
      />

      <Section>
        <div className="mx-auto max-w-4xl">
          <div className="card p-6">
            <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
              <MapPinOff className="h-4 w-4 text-signal-amber" aria-hidden /> Where you might have been heading
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { t: "College database", d: "30 institutions with full scorecards.", href: "/colleges" },
                { t: "Course explorer", d: "Every programme with cost and routes out.", href: "/courses" },
                { t: "Careers", d: "What the work is actually like.", href: "/careers" },
                { t: "Scholarships", d: "Funding with verifiable deadlines.", href: "/scholarships" },
                { t: "Study abroad", d: "16 destinations with last-verified dates.", href: "/abroad" },
                { t: "Entrance exams", d: "Dates, pattern, syllabus, official links.", href: "/exams" },
              ].map((x) => (
                <Link key={x.t} href={x.href} className="flex items-center justify-between gap-3 rounded-2xl border border-hairline px-4 py-3.5 transition hover:border-navy-400 dark:border-hairline-dark">
                  <span>
                    <span className="block text-sm font-medium text-ink dark:text-slate-100">{x.t}</span>
                    <span className="mt-0.5 block text-xs text-ink-muted">{x.d}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Note>
              If you followed a link from inside this app, that's a bug worth fixing — tell us which page you came
              from and we'll trace it.
            </Note>
          </div>
        </div>
      </Section>
    </>
  );
}
