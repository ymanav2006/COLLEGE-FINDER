"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, BellOff, CheckCheck, CalendarDays, Database, Sparkles, BellRing, ArrowRight } from "lucide-react";
import { Btn, Badge, PageHeader, Section, EmptyState, Note } from "@/components/ui";
import { useAppStore, type Notification } from "@/lib/store";
import { formatDate } from "@/lib/format";

const KIND_META: Record<
  Notification["kind"],
  { label: string; tone: "brand" | "blue" | "green" | "amber"; icon: typeof Bell }
> = {
  deadline: { label: "Deadline", tone: "amber", icon: CalendarDays },
  data: { label: "Data freshness", tone: "blue", icon: Database },
  recommendation: { label: "Recommendation", tone: "brand", icon: Sparkles },
  reminder: { label: "Reminder", tone: "green", icon: BellRing },
};

export default function NotificationsPage() {
  const notifications = useAppStore((s) => s.notifications);
  const markAllRead = useAppStore((s) => s.markAllRead);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const list = useMemo(
    () =>
      [...notifications]
        .sort((a, b) => b.date.localeCompare(a.date))
        .filter((n) => (filter === "unread" ? !n.read : true)),
    [notifications, filter],
  );

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader
        eyebrow="Notifications"
        title="Nudges you'll actually act on"
        lede="Deadlines approaching, records whose last-checked date has gone stale, and reminders generated from your own profile. Nothing promotional — there is nothing to sell you here."
        actions={
          <>
            <Btn onClick={markAllRead} variant="secondary" disabled={unread === 0}>
              <CheckCheck className="h-4 w-4" aria-hidden /> Mark all read
            </Btn>
            <Btn href="/tools/deadlines" variant="ghost">Open deadline tracker</Btn>
          </>
        }
      />

      <Section>
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              {(["all", "unread"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`chip border ${filter === f
                    ? "border-navy-500 bg-navy-600 text-white dark:border-cyan-400 dark:bg-cyan-500 dark:text-navy-950"
                    : "border-hairline bg-white text-ink-muted dark:border-hairline-dark dark:bg-white/6 dark:text-slate-300"}`}
                >
                  {f === "all" ? `All (${notifications.length})` : `Unread (${unread})`}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-ink-faint">Stored on this device only</span>
          </div>

          {list.length === 0 ? (
            <EmptyState
              title={filter === "unread" ? "You're all caught up" : "No notifications yet"}
              body={
                filter === "unread"
                  ? "Nothing unread. Deadlines and data-freshness warnings will show up here as they arise."
                  : "Notifications appear when a tracked deadline approaches, a record's last-checked date ages past 180 days, or your profile changes what's recommended to you."
              }
              icon={<BellOff className="h-6 w-6" aria-hidden />}
              action={<Btn href="/tools/deadlines">Add a deadline</Btn>}
              secondaryAction={<Btn href="/onboarding" variant="secondary">Refresh my profile</Btn>}
            />
          ) : (
            <ul className="space-y-3">
              {list.map((n) => {
                const meta = KIND_META[n.kind];
                const Icon = meta.icon;
                return (
                  <li
                    key={n.id}
                    className={`card flex items-start gap-4 p-4 ${n.read ? "opacity-70" : ""}`}
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        n.read
                          ? "bg-surface-sunken text-ink-faint dark:bg-white/10"
                          : "bg-navy-50 text-navy-600 dark:bg-cyan-500/12 dark:text-cyan-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-ink dark:text-slate-100">{n.title}</span>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                        {!n.read && <span className="h-2 w-2 rounded-full bg-signal-blue" aria-label="Unread" />}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-ink-muted dark:text-slate-300">
                        {n.body}
                      </span>
                      <span className="mt-1.5 block text-[11px] text-ink-faint">{formatDate(n.date)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { t: "Deadline tracker", d: "Add and complete dated milestones.", href: "/tools/deadlines" },
              { t: "Your dashboard", d: "See what's recommended and why.", href: "/dashboard" },
              { t: "Methodology", d: "How stale-data warnings are triggered.", href: "/methodology" },
            ].map((x) => (
              <Link key={x.t} href={x.href} className="card interactive-card p-5">
                <p className="flex items-center gap-1 font-semibold text-ink dark:text-slate-100">
                  {x.t} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </p>
                <p className="mt-1.5 text-sm text-ink-muted">{x.d}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <Note>
              We don't send marketing notifications. Every item here traces to a deadline you tracked, a record whose
              verification date aged out, or a change you made to your own profile.
            </Note>
          </div>
        </div>
      </Section>
    </>
  );
}
