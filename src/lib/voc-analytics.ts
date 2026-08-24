export interface ResponseRecord {
  id: string;
  response_id: string;
  created_at: string;
  survey_type: string;
  touchpoint: string;
  facility: string;
  department: string;
  question_id: string;
  question_text: string;
  response: string | null;
  rating: number | null;
  sentiment: string | null;
  comment: string | null;
  language?: string | null;
  issue_category?: string | null;
  staff_recognition?: string | null;
}

export interface Filters {
  from: string;
  to: string;
  touchpoint: string;
  facility: string;
  department: string;
  surveyType: string;
  rating: string;
  issue: string;
  language: string;
  sentiment: string;
}

export const EMPTY_FILTERS: Filters = {
  from: "",
  to: "",
  touchpoint: "all",
  facility: "all",
  department: "all",
  surveyType: "all",
  rating: "all",
  issue: "all",
  language: "all",
  sentiment: "all",
};

const IMPROVEMENT_QUESTIONS = new Set(["q4_improve", "q4_service_recovery", "pc_improve"]);
const POSITIVE_QUESTIONS = new Set(["q4_positive"]);
export const isRecognition = (r: ResponseRecord) => r.question_id === "q3_staff_recognition";

export function splitIssues(response: string | null): string[] {
  if (!response) return [];
  return response
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function applyFilters(rows: ResponseRecord[], f: Filters): ResponseRecord[] {
  return rows.filter((r) => {
    const day = r.created_at.slice(0, 10);
    if (f.from && day < f.from) return false;
    if (f.to && day > f.to) return false;
    if (f.touchpoint !== "all" && r.touchpoint !== f.touchpoint) return false;
    if (f.facility !== "all" && r.facility !== f.facility) return false;
    if (f.department !== "all" && r.department !== f.department) return false;
    if (f.surveyType !== "all" && r.survey_type !== f.surveyType) return false;
    if (f.rating !== "all") {
      if (f.rating === "negative" && !(r.rating !== null && r.rating <= 2)) return false;
      if (f.rating === "neutral" && r.rating !== 3) return false;
      if (f.rating === "positive" && !(r.rating !== null && r.rating >= 4)) return false;
    }
    if (f.language !== "all" && (r.language ?? "en") !== f.language) return false;
    if (f.sentiment !== "all" && (r.sentiment ?? "") !== f.sentiment) return false;
    if (f.issue !== "all") {
      if (r.issue_category !== f.issue && !splitIssues(r.response).includes(f.issue)) return false;
    }
    return true;
  });
}

/** Filters that select whole submissions, so a filtered issue row keeps its siblings. */
export function submissionScope(all: ResponseRecord[], f: Filters): ResponseRecord[] {
  const ids = new Set(applyFilters(all, f).map((r) => r.response_id));
  return all.filter((r) => ids.has(r.response_id));
}

const avg = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);

export interface Overview {
  totalResponses: number;
  totalAnswers: number;
  avgSatisfaction: number;
  avgStaffRating: number;
  negativeRate: number;
  byFacility: { facility: string; count: number; avg: number; negativeRate: number }[];
  byDepartment: { department: string; count: number; avg: number }[];
  overTime: { date: string; count: number }[];
  topIssues: { issue: string; count: number }[];
  topPositives: { issue: string; count: number }[];
  recognitions: { name: string; note: string; facility: string; date: string }[];
  comments: { facility: string; date: string; comment: string; sentiment: string }[];
  postCheckoutSatisfaction: number;
  returnIntent: number;
  nps: number;
}

export function buildOverview(rows: ResponseRecord[]): Overview {
  const submissions = new Set(rows.map((r) => r.response_id));
  const rated = rows.filter((r) => r.rating !== null && r.question_id !== "pc_nps" && r.question_id !== "pc_return_intent");
  const ratings = rated.map((r) => r.rating as number);

  const facilityMap = new Map<string, number[]>();
  const facilitySubs = new Map<string, Set<string>>();
  const deptMap = new Map<string, number[]>();
  const deptSubs = new Map<string, Set<string>>();
  const dayMap = new Map<string, Set<string>>();
  const issueMap = new Map<string, number>();
  const positiveMap = new Map<string, number>();
  const recognitions: Overview["recognitions"] = [];
  const comments: Overview["comments"] = [];

  for (const r of rows) {
    if (!facilitySubs.has(r.facility)) facilitySubs.set(r.facility, new Set());
    facilitySubs.get(r.facility)!.add(r.response_id);
    if (!deptSubs.has(r.department)) deptSubs.set(r.department, new Set());
    deptSubs.get(r.department)!.add(r.response_id);
    const day = r.created_at.slice(0, 10);
    if (!dayMap.has(day)) dayMap.set(day, new Set());
    dayMap.get(day)!.add(r.response_id);
    if (r.rating !== null && r.question_id !== "pc_nps" && r.question_id !== "pc_return_intent") {
      if (!facilityMap.has(r.facility)) facilityMap.set(r.facility, []);
      facilityMap.get(r.facility)!.push(r.rating);
      if (!deptMap.has(r.department)) deptMap.set(r.department, []);
      deptMap.get(r.department)!.push(r.rating);
    }
    if (IMPROVEMENT_QUESTIONS.has(r.question_id)) {
      for (const issue of splitIssues(r.issue_category ?? r.response)) {
        if (issue.startsWith("Nothing")) continue;
        issueMap.set(issue, (issueMap.get(issue) ?? 0) + 1);
      }
    }
    if (POSITIVE_QUESTIONS.has(r.question_id)) {
      for (const issue of splitIssues(r.issue_category ?? r.response)) {
        positiveMap.set(issue, (positiveMap.get(issue) ?? 0) + 1);
      }
    }
    if (isRecognition(r)) {
      recognitions.push({
        name: r.response ?? "Unnamed team member",
        note: r.comment ?? "",
        facility: r.facility,
        date: r.created_at.slice(0, 10),
      });
    }
    if (r.comment && !isRecognition(r)) {
      comments.push({
        facility: r.facility,
        date: r.created_at.slice(0, 10),
        comment: r.comment,
        sentiment: r.sentiment ?? "—",
      });
    }
  }
  const staffRatings = rows
    .filter((r) => r.question_id === "q2_staff" && r.rating !== null)
    .map((r) => r.rating as number);

  const pcOverall = rows.filter((r) => r.question_id === "pc_overall" && r.rating !== null);
  const returns = rows.filter((r) => r.question_id === "pc_return_intent" && r.rating !== null);
  const npsRows = rows.filter((r) => r.question_id === "pc_nps" && r.rating !== null);
  const promoters = npsRows.filter((r) => (r.rating as number) >= 9).length;
  const detractors = npsRows.filter((r) => (r.rating as number) <= 6).length;

  return {
    totalResponses: submissions.size,
    totalAnswers: rows.length,
    avgSatisfaction: avg(ratings),
    avgStaffRating: avg(staffRatings),
    negativeRate: ratings.length ? ratings.filter((n) => n <= 2).length / ratings.length : 0,
    byFacility: [...facilitySubs.entries()]
      .map(([facility, subs]) => {
        const vals = facilityMap.get(facility) ?? [];
        return {
          facility,
          count: subs.size,
          avg: avg(vals),
          negativeRate: vals.length ? vals.filter((n) => n <= 2).length / vals.length : 0,
        };
      })
      .sort((a, b) => b.count - a.count),
    byDepartment: [...deptSubs.entries()]
      .map(([department, subs]) => ({
        department,
        count: subs.size,
        avg: avg(deptMap.get(department) ?? []),
      }))
      .sort((a, b) => b.count - a.count),
    overTime: [...dayMap.entries()]
      .map(([date, subs]) => ({ date, count: subs.size }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    topIssues: [...issueMap.entries()]
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count),
    topPositives: [...positiveMap.entries()]
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count),
    recognitions,
    comments,
    postCheckoutSatisfaction: avg(pcOverall.map((r) => r.rating as number)),
    returnIntent: avg(returns.map((r) => r.rating as number)),
    nps: npsRows.length ? ((promoters - detractors) / npsRows.length) * 100 : 0,
  };
}

export interface PriorityIssue {
  facility: string;
  department: string;
  issue: string;
  frequency: number;
  negativeRate: number;
  businessImpact: number;
  departmentWeight: number;
  score: number;
}

export function buildPriorityIssues(
  rows: ResponseRecord[],
  weights: Record<string, number>,
): PriorityIssue[] {
  const facilityStats = new Map<string, { subs: Set<string>; ratings: number[] }>();
  for (const r of rows) {
    if (!facilityStats.has(r.facility))
      facilityStats.set(r.facility, { subs: new Set(), ratings: [] });
    const s = facilityStats.get(r.facility)!;
    s.subs.add(r.response_id);
    if (r.rating !== null) s.ratings.push(r.rating);
  }
  const maxVolume = Math.max(1, ...[...facilityStats.values()].map((s) => s.subs.size));

  const groups = new Map<string, PriorityIssue>();
  for (const r of rows) {
    if (!IMPROVEMENT_QUESTIONS.has(r.question_id)) continue;
    for (const issue of splitIssues(r.issue_category ?? r.response)) {
      if (issue.startsWith("Nothing")) continue;
      const key = `${r.facility}|${r.department}|${issue}`;
      const stats = facilityStats.get(r.facility)!;
      const negativeRate = stats.ratings.length
        ? stats.ratings.filter((n) => n <= 3).length / stats.ratings.length
        : 0;
      const businessImpact = stats.subs.size / maxVolume;
      const departmentWeight = weights[r.department] ?? 0.5;
      const existing = groups.get(key);
      const frequency = (existing?.frequency ?? 0) + 1;
      groups.set(key, {
        facility: r.facility,
        department: r.department,
        issue,
        frequency,
        negativeRate,
        businessImpact,
        departmentWeight,
        score: frequency * negativeRate * businessImpact * departmentWeight,
      });
    }
  }
  return [...groups.values()].sort((a, b) => b.score - a.score);
}

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  return [headers.map(csvEscape).join(","), ...rows.map((r) => r.map(csvEscape).join(","))].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function rawCsv(rows: ResponseRecord[]): string {
  return toCsv(
    [
      "response_id",
      "timestamp",
      "survey_type",
      "touchpoint",
      "facility",
      "department",
      "question_id",
      "question_text",
      "response",
      "rating",
      "issue_category",
      "sentiment",
      "staff_recognition",
      "language",
      "comment",
    ],
    rows.map((r) => [
      r.response_id,
      r.created_at,
      r.survey_type,
      r.touchpoint,
      r.facility,
      r.department,
      r.question_id,
      r.question_text,
      r.response ?? "N/A",
      r.rating ?? "N/A",
      r.issue_category ?? "N/A",
      r.sentiment ?? "N/A",
      r.staff_recognition ?? "N/A",
      r.language ?? "en",
      r.comment ?? "",
    ]),
  );
}

export function aggregatedCsv(rows: ResponseRecord[], weights: Record<string, number>): string {
  const issues = buildPriorityIssues(rows, weights);
  const byDay = new Map<string, ResponseRecord[]>();
  for (const r of rows) {
    const key = `${r.created_at.slice(0, 10)}|${r.facility}|${r.department}`;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(r);
  }
  const out: (string | number)[][] = [];
  for (const [key, group] of byDay) {
    const parts = key.split("|");
    const date = parts[0] ?? "";
    const facility = parts[1] ?? "";
    const department = parts[2] ?? "";
    const ratings = group.filter((r) => r.rating !== null).map((r) => r.rating as number);
    const volume = new Set(group.map((r) => r.response_id)).size;
    const negRate = ratings.length ? ratings.filter((n) => n <= 3).length / ratings.length : 0;
    const relevant = issues.filter((i) => i.facility === facility && i.department === department);
    const mentions = relevant.reduce((a, b) => a + b.frequency, 0);
    const impact = relevant[0]?.businessImpact ?? 0;
    const weight = weights[department] ?? 0.5;
    out.push([
      date,
      facility,
      department,
      volume,
      ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : "N/A",
      negRate.toFixed(3),
      mentions,
      impact.toFixed(3),
      weight,
      (mentions * negRate * impact * weight).toFixed(3),
    ]);
  }
  return toCsv(
    [
      "date",
      "facility",
      "department",
      "response_volume",
      "average_satisfaction",
      "negative_sentiment_rate",
      "mention_frequency",
      "business_impact",
      "department_weight",
      "priority_score",
    ],
    out.sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
  );
}

/** One row per submitted survey — the flat shape for Zoho Analytics. */
export function responseSummaryCsv(rows: ResponseRecord[]): string {
  const byResponse = new Map<string, ResponseRecord[]>();
  for (const r of rows) {
    if (!byResponse.has(r.response_id)) byResponse.set(r.response_id, []);
    byResponse.get(r.response_id)!.push(r);
  }
  const out: (string | number)[][] = [];
  for (const [id, group] of byResponse) {
    const first = group[0]!;
    const overall = group.find((r) => r.question_id === "q1_overall" || r.question_id === "pc_overall");
    const staff = group.find((r) => r.question_id === "q2_staff");
    const issues = group
      .filter((r) => r.issue_category && !isRecognition(r))
      .map((r) => r.issue_category as string);
    const recognition = group.find(isRecognition);
    const comments = group.map((r) => r.comment).filter(Boolean).join(" | ");
    out.push([
      first.created_at,
      id,
      first.survey_type,
      first.touchpoint,
      first.facility,
      first.department,
      first.language ?? "en",
      overall?.rating ?? "N/A",
      staff?.rating ?? "N/A",
      issues.join("; ") || "N/A",
      overall?.sentiment ?? "N/A",
      recognition?.staff_recognition ?? "N/A",
      comments,
    ]);
  }
  return toCsv(
    [
      "date",
      "response_id",
      "survey_type",
      "touchpoint",
      "facility",
      "department",
      "language",
      "overall_rating",
      "staff_rating",
      "issue",
      "sentiment",
      "staff_recognition",
      "comment",
    ],
    out.sort((a, b) => String(b[0]).localeCompare(String(a[0]))),
  );
}
