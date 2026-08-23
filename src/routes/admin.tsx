import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  aggregatedCsv,
  applyFilters,
  buildOverview,
  buildPriorityIssues,
  downloadCsv,
  EMPTY_FILTERS,
  rawCsv,
  submissionScope,
  type Filters,
  type ResponseRecord,
} from "@/lib/voc-analytics";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "VOC Dashboard | Ambassador Hotel" },
      {
        name: "description",
        content:
          "Internal Voice of Customer dashboard for Ambassador Hotel: satisfaction, priority issues and CSV exports.",
      },
      { property: "og:title", content: "VOC Dashboard | Ambassador Hotel" },
      { property: "og:description", content: "Internal Voice of Customer analytics for Ambassador Hotel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const num = (n: number, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : "—");

function Admin() {
  const [rows, setRows] = useState<ResponseRecord[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [res, w] = await Promise.all([
        supabase
          .from("survey_responses")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20000),
        supabase.from("department_weights").select("*"),
      ]);
      if (cancelled) return;
      if (res.error) setError(res.error.message);
      setRows((res.data ?? []) as ResponseRecord[]);
      const map: Record<string, number> = {};
      for (const item of w.data ?? []) map[item.department] = Number(item.weight);
      setWeights(map);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => submissionScope(rows, filters), [rows, filters]);
  const overview = useMemo(() => buildOverview(filtered), [filtered]);
  const priority = useMemo(() => buildPriorityIssues(filtered, weights), [filtered, weights]);

  const options = useMemo(() => {
    const uniq = (fn: (r: ResponseRecord) => string) =>
      [...new Set(rows.map(fn))].filter(Boolean).sort();
    const issues = new Set<string>();
    for (const r of rows) {
      if (r.question_id === "q4_improve" || r.question_id === "pc_improve") {
        for (const i of (r.response ?? "").split(";").map((s) => s.trim()).filter(Boolean))
          issues.add(i);
      }
    }
    return {
      touchpoints: uniq((r) => r.touchpoint),
      facilities: uniq((r) => r.facility),
      departments: uniq((r) => r.department),
      surveyTypes: uniq((r) => r.survey_type),
      issues: [...issues].sort(),
    };
  }, [rows]);

  const updateWeight = async (department: string, weight: number) => {
    setWeights((w) => ({ ...w, [department]: weight }));
    await supabase
      .from("department_weights")
      .update({ weight, updated_at: new Date().toISOString() })
      .eq("department", department);
  };

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  const stamp = new Date().toISOString().slice(0, 10);

  return (
    <main className="min-h-screen bg-background pb-28">
      <header className="px-5 pb-6 pt-8">
        <p className="text-[0.68rem] uppercase tracking-[0.28em] text-accent">Internal</p>
        <h1 className="font-display mt-1 text-3xl text-foreground">VOC Dashboard</h1>
        <p className="mt-1 text-sm text-foreground/60">
          {loading ? "Loading responses…" : `${overview.totalResponses} responses in view`}
        </p>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </header>

      <div className="space-y-5 rounded-t-[2rem] bg-card px-5 pb-10 pt-7 text-card-foreground">
        {/* Filters */}
        <section className="surface-sand rounded-2xl p-4">
          <h2 className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">Filters</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <LabeledInput label="From" type="date" value={filters.from} onChange={(v) => set({ from: v })} />
            <LabeledInput label="To" type="date" value={filters.to} onChange={(v) => set({ to: v })} />
            <LabeledSelect label="Touchpoint" value={filters.touchpoint} onChange={(v) => set({ touchpoint: v })} options={options.touchpoints} />
            <LabeledSelect label="Facility" value={filters.facility} onChange={(v) => set({ facility: v })} options={options.facilities} />
            <LabeledSelect label="Department" value={filters.department} onChange={(v) => set({ department: v })} options={options.departments} />
            <LabeledSelect label="Survey type" value={filters.surveyType} onChange={(v) => set({ surveyType: v })} options={options.surveyTypes} />
            <LabeledSelect
              label="Rating"
              value={filters.rating}
              onChange={(v) => set({ rating: v })}
              options={["negative", "neutral", "positive"]}
            />
            <LabeledSelect label="Issue" value={filters.issue} onChange={(v) => set({ issue: v })} options={options.issues} />
          </div>
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="mt-3 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground underline"
          >
            Reset filters
          </button>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-2 gap-2">
          <Stat label="Total responses" value={String(overview.totalResponses)} />
          <Stat label="Avg satisfaction" value={num(overview.avgSatisfaction)} />
          <Stat label="Negative response rate" value={pct(overview.negativeRate)} />
          <Stat label="Post-checkout satisfaction" value={num(overview.postCheckoutSatisfaction)} />
          <Stat label="Return intention" value={`${num(overview.returnIntent, 1)}/10`} />
          <Stat label="NPS" value={num(overview.nps, 0)} />
        </section>

        <Panel title="Responses & satisfaction by facility">
          <Table
            head={["Facility", "Responses", "Avg", "Neg %"]}
            rows={overview.byFacility.map((f) => [f.facility, String(f.count), num(f.avg), pct(f.negativeRate)])}
          />
        </Panel>

        <Panel title="Responses by department">
          <Table
            head={["Department", "Responses", "Avg"]}
            rows={overview.byDepartment.map((d) => [d.department, String(d.count), num(d.avg)])}
          />
        </Panel>

        <Panel title="Most selected improvement areas">
          <Table head={["Issue", "Mentions"]} rows={overview.topIssues.map((i) => [i.issue, String(i.count)])} />
        </Panel>

        <Panel title="Responses over time">
          <Table head={["Date", "Responses"]} rows={overview.overTime.map((d) => [d.date, String(d.count)])} />
        </Panel>

        <Panel title="Priority issues">
          <p className="mb-3 text-[0.75rem] text-muted-foreground">
            Score = frequency × negative sentiment × business impact × department weight.
          </p>
          <Table
            head={["Facility", "Issue", "Dept", "Freq", "Neg", "Impact", "Weight", "Score"]}
            rows={priority
              .slice(0, 25)
              .map((p) => [
                p.facility,
                p.issue,
                p.department,
                String(p.frequency),
                pct(p.negativeRate),
                num(p.businessImpact),
                num(p.departmentWeight),
                num(p.score),
              ])}
          />
        </Panel>

        <Panel title="Department weights">
          <div className="space-y-2">
            {Object.entries(weights)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([dept, weight]) => (
                <div key={dept} className="flex items-center justify-between gap-3">
                  <span className="text-sm">{dept}</span>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="5"
                    value={weight}
                    onChange={(e) => updateWeight(dept, Number(e.target.value))}
                    className="w-24 rounded-lg border border-border px-3 py-1.5 text-right text-sm"
                  />
                </div>
              ))}
          </div>
        </Panel>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card px-5 py-3">
        <div className="mx-auto flex max-w-3xl gap-2">
          <button
            type="button"
            onClick={() => downloadCsv(`ambassador-voc-raw-${stamp}.csv`, rawCsv(applyFilters(rows, filters)))}
            className="flex-1 rounded-full bg-primary px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => downloadCsv(`ambassador-voc-aggregated-${stamp}.csv`, aggregatedCsv(filtered, weights))}
            className="flex-1 rounded-full border border-primary px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-primary"
          >
            Aggregated CSV
          </button>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-sand rounded-2xl px-4 py-3">
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="font-display mt-1 text-2xl text-card-foreground">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border p-4">
      <h2 className="font-display text-lg text-card-foreground">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-full text-left text-[0.8rem]">
        <thead>
          <tr className="text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap py-1.5 pr-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              {r.map((c, j) => (
                <td key={j} className="whitespace-nowrap py-2 pr-3">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-[0.8rem]"
      />
    </label>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-[0.8rem]"
      >
        <option value="all">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
