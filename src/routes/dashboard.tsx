import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MOCK_RESPONSES } from "@/lib/mock-responses";
import {
  applyFilters,
  buildActionQueue,
  describeFilters,
  EMPTY_FILTERS,
  isFiltered,
  SEGMENT_LABELS,
  type Filters,
} from "@/lib/survey-analytics";
import { exportActionQueue, exportResponses } from "@/lib/survey-export";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Guest Feedback Dashboard — The Ambassador Seoul" },
      {
        name: "description",
        content:
          "Review guest survey responses, track the priority action queue, and export raw or aggregated results to Excel.",
      },
      { property: "og:title", content: "Guest Feedback Dashboard — The Ambassador Seoul" },
      {
        property: "og:description",
        content: "Filter guest survey results by date and segment, then export them to Excel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const rows = useMemo(() => applyFilters(MOCK_RESPONSES, filters), [filters]);
  const queue = useMemo(() => buildActionQueue(rows), [rows]);
  const filtered = isFiltered(filters);

  const avgOverall = useMemo(() => {
    const values = rows
      .map((r) => r.answers["overall"])
      .filter((v): v is number => typeof v === "number");
    if (!values.length) return "—";
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
  }, [rows]);

  const returnRate = useMemo(() => {
    if (!rows.length) return "—";
    const yes = rows.filter((r) => r.answers["returnPrice"] === "yes").length;
    return `${Math.round((yes / rows.length) * 100)}%`;
  }, [rows]);

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      <header className="border-b border-white/10 px-5 py-6">
        <p className="font-display text-xs tracking-[0.35em] text-gold uppercase">
          The Ambassador Seoul
        </p>
        <h1 className="font-display mt-1 text-3xl leading-tight">Guest Feedback Dashboard</h1>
        <p className="mt-1 text-sm text-white/60">
          {rows.length} of {MOCK_RESPONSES.length} responses
          {filtered ? " (filtered)" : ""}
        </p>
      </header>

      <main className="space-y-6 px-5 py-6">
        <section className="rounded-3xl bg-card p-5 text-card-foreground shadow-soft">
          <h2 className="font-display text-xl">Filters</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="text-muted-foreground">From</span>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">To</span>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground">Segment</span>
              <select
                value={filters.segment}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, segment: e.target.value as Filters["segment"] }))
                }
                className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
              >
                <option value="all">All guests</option>
                {Object.entries(SEGMENT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {filtered && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>{describeFilters(filters)}</span>
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="rounded-full border border-border px-3 py-1 font-medium text-card-foreground"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Responses" value={String(rows.length)} />
          <Stat label="Avg. overall" value={avgOverall} />
          <Stat label="Would return" value={returnRate} />
        </section>

        <section className="rounded-3xl bg-card p-5 text-card-foreground shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl">Priority Action Queue</h2>
            <button
              type="button"
              onClick={() => exportActionQueue(queue, filters, rows.length)}
              className="rounded-full border border-navy/20 px-4 py-2 text-xs font-semibold tracking-wide text-navy uppercase"
            >
              Export table
            </button>
          </div>
          <div className="mt-4 -mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="py-2 pr-3">Issue</th>
                  <th className="py-2 pr-3">Freq.</th>
                  <th className="py-2 pr-3">Severity</th>
                  <th className="py-2 pr-3">Impact</th>
                  <th className="py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => (
                  <tr key={item.issue} className="border-t border-border">
                    <td className="py-2.5 pr-3 font-medium">{item.issue}</td>
                    <td className="py-2.5 pr-3">{item.frequency}</td>
                    <td className="py-2.5 pr-3">{item.severity.toFixed(1)}</td>
                    <td className="py-2.5 pr-3">{item.impact.toFixed(1)}%</td>
                    <td className="py-2.5 font-semibold">{item.score.toFixed(1)}</td>
                  </tr>
                ))}
                {queue.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No issues in this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl bg-card p-5 text-card-foreground shadow-soft">
          <h2 className="font-display text-xl">Latest responses</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            {rows.slice(0, 8).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                <span>{SEGMENT_LABELS[r.segment]}</span>
                <span className="text-muted-foreground">{r.submittedAt.slice(0, 10)}</span>
                <span className="font-semibold">{String(r.answers["overall"] ?? "—")}/5</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-navy-deep/95 px-5 py-4 backdrop-blur">
        <button
          type="button"
          onClick={() => exportResponses(rows, filters)}
          className="w-full rounded-full bg-gold px-6 py-3.5 text-sm font-semibold tracking-[0.12em] text-accent-foreground uppercase shadow-soft"
        >
          Export Data{filtered ? ` (${rows.length} filtered)` : ` (${rows.length})`}
        </button>
        <p className="mt-2 text-center text-xs text-white/50">
          Downloads every question and answer as .xlsx
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 px-4 py-3">
      <p className="text-xs tracking-wide text-white/50 uppercase">{label}</p>
      <p className="font-display mt-1 text-2xl">{value}</p>
    </div>
  );
}
