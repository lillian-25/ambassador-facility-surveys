export type ScaleQuestion = {
  id: string;
  kind: "scale";
  title: string;
  subtitle: string;
  /** Given the rating (1-5), the id of the next question, or null to finish. */
  next: (rating: number) => string | null;
};

export type ChoiceQuestion = {
  id: string;
  kind: "choice";
  title: string;
  subtitle: string;
  options: { value: string; label: string; next: string | null }[];
};

export type TextQuestion = {
  id: string;
  kind: "text";
  title: string;
  subtitle: string;
  placeholder: string;
  next: string | null;
};

export type Question = ScaleQuestion | ChoiceQuestion | TextQuestion;

export const FIRST_QUESTION_ID = "overall";

export const questions: Record<string, Question> = {
  overall: {
    id: "overall",
    kind: "scale",
    title: "How did you enjoy your overall stay?",
    subtitle: "Scale from 1–5",
    next: (r) => (r <= 3 ? "whatWentWrong" : "highlight"),
  },
  whatWentWrong: {
    id: "whatWentWrong",
    kind: "choice",
    title: "We're sorry to hear that. What let you down most?",
    subtitle: "Choose one",
    options: [
      { value: "room", label: "The room", next: "roomRating" },
      { value: "service", label: "Service & staff", next: "serviceRating" },
      { value: "dining", label: "Dining", next: "diningRating" },
      { value: "other", label: "Something else", next: "detail" },
    ],
  },
  highlight: {
    id: "highlight",
    kind: "choice",
    title: "Wonderful. What stood out the most?",
    subtitle: "Choose one",
    options: [
      { value: "room", label: "The room", next: "roomRating" },
      { value: "service", label: "Service & staff", next: "serviceRating" },
      { value: "dining", label: "Dining", next: "diningRating" },
      { value: "view", label: "The view & setting", next: "recommend" },
    ],
  },
  roomRating: {
    id: "roomRating",
    kind: "scale",
    title: "How would you rate the comfort of your room?",
    subtitle: "Scale from 1–5",
    next: (r) => (r <= 3 ? "housekeeping" : "recommend"),
  },
  housekeeping: {
    id: "housekeeping",
    kind: "scale",
    title: "And how was housekeeping during your stay?",
    subtitle: "Scale from 1–5",
    next: () => "detail",
  },
  serviceRating: {
    id: "serviceRating",
    kind: "scale",
    title: "How attentive was our team?",
    subtitle: "Scale from 1–5",
    next: (r) => (r <= 3 ? "checkin" : "recommend"),
  },
  checkin: {
    id: "checkin",
    kind: "scale",
    title: "How smooth was check-in and check-out?",
    subtitle: "Scale from 1–5",
    next: () => "detail",
  },
  diningRating: {
    id: "diningRating",
    kind: "scale",
    title: "How did you enjoy dining with us?",
    subtitle: "Scale from 1–5",
    next: (r) => (r <= 3 ? "breakfast" : "recommend"),
  },
  breakfast: {
    id: "breakfast",
    kind: "scale",
    title: "How was breakfast in particular?",
    subtitle: "Scale from 1–5",
    next: () => "detail",
  },
  recommend: {
    id: "recommend",
    kind: "scale",
    title: "How likely are you to recommend us to a friend?",
    subtitle: "Scale from 1–5",
    next: (r) => (r >= 4 ? "returnStay" : "detail"),
  },
  returnStay: {
    id: "returnStay",
    kind: "choice",
    title: "Would you stay with us again?",
    subtitle: "Choose one",
    options: [
      { value: "yes", label: "Absolutely", next: "detail" },
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

export function buildPath(answers: Record<string, number | string>): string[] {
  const path: string[] = [];
  let current: string | null = FIRST_QUESTION_ID;
  while (current) {
    path.push(current);
    const q: Question | undefined = questions[current];
    if (!q) break;
    const answer: number | string | undefined = answers[current];
    if (answer === undefined || answer === "") break;
    if (q.kind === "scale") {
      current = q.next(answer as number);
    } else if (q.kind === "choice") {
      current = q.options.find((o) => o.value === answer)?.next ?? null;
    } else {
      current = q.next;
    }
  }
  return path;
}

export function isComplete(answers: Record<string, number | string>): boolean {
  const path = buildPath(answers);
  const last = path[path.length - 1];
  if (!last) return false;
  const q = questions[last];
  if (!q) return false;
  if (q.kind === "text") return true;
  return answers[last] !== undefined;
}

