export type ScaleQuestion = {
  id: string;
  kind: "scale";
  title: string;
  subtitle: string;
  comment?: string;
  reactions?: {
    low?: string;
    high?: string;
    neutral?: string;
  };
  next: (rating: number) => string | null;
};

export type ChoiceQuestion = {
  id: string;
  kind: "choice";
  title: string;
  subtitle: string;
  options: { value: string; label: string; next: string | null }[];
};

export type MultiQuestion = {
  id: string;
  kind: "multi";
  title: string;
  subtitle: string;
  options: string[];
  noneLabel: string;
  /** Branch on the set of selected facilities. */
  next: (selected: string[]) => string | null;
};

export type TextQuestion = {
  id: string;
  kind: "text";
  title: string;
  subtitle: string;
  placeholder: string;
  next: string | null;
};

export type Question = ScaleQuestion | ChoiceQuestion | MultiQuestion | TextQuestion;

/** Answers: scale -> number, choice -> string, multi -> string[], text -> string.
 *  Comments are stored under `${questionId}__comment`. */
export type AnswerValue = number | string | string[];
export type Answers = Record<string, AnswerValue>;

export const FIRST_QUESTION_ID = "stayType";

export const questions: Record<string, Question> = {
  stayType: {
    id: "stayType",
    kind: "choice",
    title: "What best describes your stay?",
    subtitle: "Choose one",
    options: [
      { value: "leisure", label: "Leisure", next: "overall" },
      { value: "business", label: "Business", next: "overall" },
      { value: "repeat", label: "Repeat guest", next: "overall" },
    ],
  },
  overall: {
    id: "overall",
    kind: "scale",
    title: "How did you enjoy your overall stay?",
    subtitle: "Scale from 1–5",
    next: () => "facilities",
  },
  facilities: {
    id: "facilities",
    kind: "multi",
    title: "What facilities did you use?",
    subtitle: "Select all that apply",
    options: [
      "Fitness",
      "Sauna",
      "Indoor Swimming Pool",
      "Urban escape",
      "Cabana & nest bed",
      "Screen golf",
      "G.X / Yoga / Pilates",
      "Club Ambassador Lounge",
      "Business Center",
      "Barber",
    ],
    noneLabel: "I didn't use any facilities",
    next: (selected) => (selected.length > 0 ? "facilityCleanliness" : "dining"),
  },
  facilityCleanliness: {
    id: "facilityCleanliness",
    kind: "scale",
    title: "How was the cleanliness at these facilities?",
    subtitle: "Scale from 1–5",
    comment: "Anything specific about cleanliness? (optional)",
    next: () => "facilityStaff",
  },
  facilityStaff: {
    id: "facilityStaff",
    kind: "scale",
    title: "How helpful, knowledgeable, and attentive were the staff?",
    subtitle: "Scale from 1–5",
    comment: "Tell us about the team (optional)",
    next: () => "dining",
  },
  dining: {
    id: "dining",
    kind: "multi",
    title: "Which dining did you visit during your stay?",
    subtitle: "Select all that apply",
    options: ["Lobby buffet", "Haobin", "Lobby bar", "Pool-side bar"],
    noneLabel: "I didn't dine with us",
    next: (selected) => (selected.length > 0 ? "diningCleanliness" : "returnPrice"),
  },
  diningCleanliness: {
    id: "diningCleanliness",
    kind: "scale",
    title: "How was the cleanliness at these venues?",
    subtitle: "Scale from 1–5",
    comment: "Anything specific about cleanliness? (optional)",
    next: () => "diningStaff",
  },
  diningStaff: {
    id: "diningStaff",
    kind: "scale",
    title: "Were the staff helpful, knowledgeable, and attentive to your needs?",
    subtitle: "Scale from 1–5",
    comment: "Tell us about the dining team (optional)",
    next: () => "returnPrice",
  },
  returnPrice: {
    id: "returnPrice",
    kind: "choice",
    title: "Would you choose to stay with us again at a similar price point?",
    subtitle: "Choose one",
    options: [
      { value: "yes", label: "Yes, absolutely", next: "detail" },
      { value: "maybe", label: "Perhaps", next: "detail" },
      { value: "no", label: "Unlikely", next: "detail" },
    ],
  },
  detail: {
    id: "detail",
    kind: "text",
    title: "Anything else you'd like to share?",
    subtitle: "Optional",
    placeholder: "Tell us more about your stay…",
    next: null,
  },
};

function isAnswered(q: Question, value: AnswerValue | undefined): boolean {
  if (value === undefined) return false;
  if (q.kind === "multi") return Array.isArray(value);
  if (q.kind === "text") return true;
  return value !== "";
}

export function buildPath(answers: Answers): string[] {
  const path: string[] = [];
  let current: string | null = FIRST_QUESTION_ID;
  while (current) {
    path.push(current);
    const q: Question | undefined = questions[current];
    if (!q) break;
    const value: AnswerValue | undefined = answers[current];
    if (!isAnswered(q, value)) break;
    if (q.kind === "scale") {
      current = q.next(value as number);
    } else if (q.kind === "choice") {
      current = q.options.find((o) => o.value === value)?.next ?? null;
    } else if (q.kind === "multi") {
      current = q.next(value as string[]);
    } else {
      current = q.next;
    }
  }
  return path;
}

export function isComplete(answers: Answers): boolean {
  const path = buildPath(answers);
  const last = path[path.length - 1];
  if (!last) return false;
  const q = questions[last];
  if (!q) return false;
  return q.kind === "text" || isAnswered(q, answers[last]);
}
