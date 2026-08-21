import { questions, type Question } from "./survey-config";
import { reachedIds, type SurveyResponse } from "./mock-responses";

export const SEGMENT_LABELS: Record<string, string> = {
  leisure: "Leisure",
  business: "Business",
  repeat: "Repeat guest",
};

export type Filters = {
  from: string; // yyyy-mm-dd or ""
  to: string; // yyyy-mm-dd or ""
  segment: "all" | "leisure" | "business" | "repeat";
};

export const EMPTY_FILTERS: Filters = { from: "", to: "", segment: "all" };

export function isFiltered(f: Filters): boolean {
  return f.from !== "" || f.to !== "" || f.segment !== "all";
}

export function describeFilters(f: Filters): string {
  const parts: string[] = [];
  if (f.from || f.to) parts.push(`Date range: ${f.from || "earliest"} to ${f.to || "latest"}`);
  parts.push(`Segment: ${f.segment === "all" ? "All guests" : SEGMENT_LABELS[f.segment]}`);
  return parts.join("  •  ");
}

export function applyFilters(rows: SurveyResponse[], f: Filters): SurveyResponse[] {
  return rows.filter((r) => {
    const day = r.submittedAt.slice(0, 10);
    if (f.from && day < f.from) return false;
    if (f.to && day > f.to) return false;
    if (f.segment !== "all" && r.segment !== f.segment) return false;
    return true;
  });
}

/** Ordered export columns: one per question (+ its comment field). */
export type Column = { key: string; header: string; width: number };

export const COLUMNS: Column[] = (() => {
  const cols: Column[] = [
    { key: "__id", header: "Response ID", width: 14 },
    { key: "__submitted", header: "Submitted (UTC)", width: 20 },
    { key: "__segment", header: "Segment", width: 14 },
  ];
  for (const q of Object.values(questions) as Question[]) {
    cols.push({ key: q.id, header: q.title, width: 34 });
    if (q.kind === "scale" && q.comment) {
      cols.push({ key: `${q.id}__comment`, header: `${q.title} — comment`, width: 40 });
    }
  }
  return cols;
})();

const NA = "N/A";

export function cellValue(response: SurveyResponse, key: string): string | number {
  if (key === "__id") return response.id;
  if (key === "__submitted") return response.submittedAt.replace("T", " ").slice(0, 19);
  if (key === "__segment") return SEGMENT_LABELS[response.segment] ?? response.segment;

  const baseId = key.endsWith("__comment") ? key.slice(0, -"__comment".length) : key;
  if (!reachedIds(response).has(baseId)) return NA;

  const value = response.answers[key];
  if (value === undefined || value === "") return key.endsWith("__comment") ? "" : NA;
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None selected";
  if (typeof value === "string" && baseId === "stayType") return SEGMENT_LABELS[value] ?? value;
  if (typeof value === "string" && baseId === "returnPrice") {
    return { yes: "Yes, absolutely", maybe: "Perhaps", no: "Unlikely" }[value] ?? value;
  }
  return value;
}

/* ---------------- Priority Action Queue ---------------- */

export type ActionItem = {
  issue: string;
  frequency: number; // responses affected
  severity: number; // 1-5, how bad the average score is
  impact: number; // share of filtered responses (%)
  score: number; // severity * impact weighting
};

type Tracked = { id: string; issue: string };

const TRACKED: Tracked[] = [
  { id: "overall", issue: "Overall stay experience" },
  { id: "facilityCleanliness", issue: "Facility cleanliness" },
  { id: "facilityStaff", issue: "Facility staff attentiveness" },
  { id: "diningCleanliness", issue: "Dining venue cleanliness" },
  { id: "diningStaff", issue: "Dining staff attentiveness" },
];

export function buildActionQueue(rows: SurveyResponse[]): ActionItem[] {
  const total = rows.length || 1;
  const items: ActionItem[] = [];

  for (const t of TRACKED) {
    const scores = rows
      .map((r) => r.answers[t.id])
      .filter((v): v is number => typeof v === "number");
    if (scores.length === 0) continue;
    const detractors = scores.filter((s) => s <= 3).length;
    if (detractors === 0) continue;
    const avgDetractor = scores.filter((s) => s <= 3).reduce((a, b) => a + b, 0) / detractors;
    const severity = Math.round((6 - avgDetractor) * 10) / 10;
    const impact = Math.round((detractors / total) * 1000) / 10;
    items.push({
      issue: t.issue,
      frequency: detractors,
      severity,
      impact,
      score: Math.round(severity * impact * 10) / 10,
    });
  }

  const wouldNotReturn = rows.filter((r) => r.answers["returnPrice"] === "no").length;
  if (wouldNotReturn > 0) {
    const impact = Math.round((wouldNotReturn / total) * 1000) / 10;
    items.push({
      issue: "Would not return at a similar price point",
      frequency: wouldNotReturn,
      severity: 5,
      impact,
      score: Math.round(5 * impact * 10) / 10,
    });
  }

  return items.sort((a, b) => b.score - a.score);
}
