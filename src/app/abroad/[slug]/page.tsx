import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, CheckCircle2, XCircle, ArrowRight, AlertTriangle } from "lucide-react";
import { Btn, Badge, FactDisplay, Note, PageHeader, Section, StaleWarning } from "@/components/ui";
import { SaveButton } from "@/components/cards";
import { COUNTRIES } from "@/data/countries";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = COUNTRIES.find((x) => x.slug === slug);
  if (!c) return { title: "Destination not found" };
  return {
    title: `Study in ${c.name} — costs, visa, work rights & timelines`,
    description: `${c.name}: tuition ${c.tuitionRange.value}, living ${c.livingRange.value}. Application timeline, tests, visa notes, work rights and post-study options with last-verified dates.`,
    alternates: { canonical: `/abroad/${c.slug}` },
  };
}

export default async function CountryPage({ params }: Props) {
  const { slug } = await params;
  const country = COUNTRIES.find((c) => c.slug === slug);
  if (!country) notFound();

  const others = COUNTRIES.filter((c) => c.id !== country.id).slice(0, 6);

  return (
    <>
      <PageHeader
        breadcrumb={
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-ink-faint" aria-label="Breadcrumb">
            <Link href="/abroad" className="hover:text-navy-600 dark:hover:text-cyan-300">Study abroad</Link>
            <span aria-hidden>/</span>
            <span className="text-ink-muted">{country.region}</span>
            <span aria-hidden>/</span>
            <span className="text-ink dark:text-slate-200">{country.name}</span>
          </nav>
        }
        eyebrow={`${country.flag} ${country.region} · ${country.currency}`}
        title={`Study in ${country.name}`}
        lede={`Tuition ${country.tuitionRange.value} · living ${country.livingRange.value} per year. Last checked ${country.lastVerified}.`}
        actions={
          <>
            <SaveButton kind="country" id={country.id} />
            <Btn href="/tools/compare?kind=country" variant="secondary">Compare destinations</Btn>
            <Btn href="/tools/afford" variant="ghost">Check affordability</Btn>
          </>
        }
      />

      <Section>
        <div className="mb-6">
          <StaleWarning verifiedOn={country.lastVerified} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_330px]">
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <FactDisplay fact={country.tuitionRange} label="Typical annual tuition" />
              <FactDisplay fact={country.livingRange} label="Typical annual living cost" />
              <FactDisplay fact={country.visaNotes} label="Visa" />
              <FactDisplay fact={country.workRights} label="Work rights during study" />
              <FactDisplay fact={country.postStudy} label="After you graduate" />
              <div className="card p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Application timeline</p>
                <p className="mt-2 text-lg font-semibold text-ink dark:text-slate-100">{country.applicationTimeline}</p>
                <p className="mt-2 text-xs text-ink-muted">
                  For the common intake. Two-intake systems often run a second window six months later.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="card p-5">
                <p className="font-semibold text-ink dark:text-slate-100">English tests</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {country.englishTests.map((t) => (
                    <span key={t} className="chip bg-surface-sunken text-ink-muted dark:bg-white/8 dark:text-slate-300">{t}</span>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <p className="font-semibold text-ink dark:text-slate-100">Entrance tests used</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {country.entranceTests.length === 0 ? (
                    <span className="text-sm text-ink-muted">No common national test — institutions assess individually.</span>
                  ) : (
                    country.entranceTests.map((t) => (
                      <span key={t} className="chip border border-hairline text-ink-muted dark:border-hairline-dark dark:text-slate-300">{t}</span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink dark:text-slate-50">Popular fields</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {country.popularFields.map((f) => (
                  <span key={f} className="chip bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">{f}</span>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="card p-5">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-signal-green" aria-hidden /> Why students pick it
                </p>
                <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
                  {country.pros.map((p) => <li key={p}>• {p}</li>)}
                </ul>
              </div>
              <div className="card p-5">
                <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                  <XCircle className="h-4 w-4 text-signal-amber" aria-hidden /> What to weigh carefully
                </p>
                <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
                  {country.considerations.map((p) => <li key={p}>• {p}</li>)}
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink dark:text-slate-50">Scholarships commonly used here</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {country.scholarships.map((s) => (
                  <Link
                    key={s}
                    href={`/scholarships?q=${encodeURIComponent(s)}`}
                    className="chip border border-hairline bg-white text-ink-muted transition hover:border-navy-400 hover:text-navy-600 dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink dark:text-slate-50">Official sources</h2>
              <ul className="mt-4 space-y-3">
                {country.officialSources.map((s) => (
                  <li key={s.url} className="rounded-2xl border border-hairline p-4 dark:border-hairline-dark">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink dark:text-slate-100">{s.label}</p>
                      <Badge tone="green">Official</Badge>
                    </div>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy-600 dark:text-cyan-300"
                    >
                      Open source <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                    <p className="mt-2 text-[11px] text-ink-faint">Last checked {country.lastVerified}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">Quick facts</p>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-faint">Region</dt>
                  <dd className="font-medium text-ink dark:text-slate-100">{country.region}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-faint">Currency</dt>
                  <dd className="font-medium text-ink dark:text-slate-100">{country.currency}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-faint">Tuition shown in</dt>
                  <dd className="font-medium text-ink dark:text-slate-100">{country.tuitionCurrency}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-faint">Last verified</dt>
                  <dd className="font-medium text-ink dark:text-slate-100">{country.lastVerified}</dd>
                </div>
              </dl>
            </div>

            <div className="card p-5">
              <p className="flex items-center gap-2 font-semibold text-ink dark:text-slate-100">
                <AlertTriangle className="h-4 w-4 text-signal-amber" aria-hidden /> Before you book anything
              </p>
              <ul className="mt-3 space-y-2 text-sm text-ink-muted dark:text-slate-300">
                <li>• Confirm visa rules on the immigration site — not a forum.</li>
                <li>• Get the total cost of attendance from the institution, not an estimate.</li>
                <li>• Check the scholarship deadline separately from the admission deadline.</li>
                <li>• Read the post-study work rule that applies at the time you graduate.</li>
              </ul>
            </div>

            <div className="card p-5">
              <p className="font-semibold text-ink dark:text-slate-100">Other destinations</p>
              <ul className="mt-3 space-y-2">
                {others.map((c) => (
                  <li key={c.id}>
                    <Link href={`/abroad/${c.slug}`} className="flex items-center justify-between text-sm text-ink-muted hover:text-navy-600 dark:text-slate-300 dark:hover:text-cyan-300">
                      <span><span aria-hidden className="mr-1.5">{c.flag}</span>{c.name}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Note tone="warn">
              We never promise a visa. No platform can — immigration decisions rest solely with the relevant government.
            </Note>
          </aside>
        </div>
      </Section>
    </>
  );
}
