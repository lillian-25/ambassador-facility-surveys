import { questions, type Answers, buildPath } from "./survey-config";

export type SurveyResponse = {
  id: string;
  submittedAt: string; // ISO
  segment: "leisure" | "business" | "repeat";
  answers: Answers;
};

/** Deterministic PRNG so the dashboard is stable between renders/SSR. */
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function multiOptions(id: string): string[] {
  const q = questions[id];
  return q && q.kind === "multi" ? q.options : [];
}

const FACILITIES = multiOptions("facilities");
const DINING = multiOptions("dining");

const CLEAN_COMMENTS = [
  "Sauna floor was slippery and towels ran out mid-morning.",
  "Spotless, genuinely impressive.",
  "Pool area needed attention in the afternoon.",
  "",
  "Gym mats were dusty.",
  "",
];
const STAFF_COMMENTS = [
  "Front desk was warm but the lounge team seemed stretched.",
  "Everyone remembered my name — lovely.",
  "Waited 15 minutes for someone at the business centre.",
  "",
  "",
  "Barber was fantastic.",
];
const DETAILS = [
  "Check-in queue was long at 3pm.",
  "The rooftop view made the trip.",
  "Breakfast buffet ran out of hot items by 9:30.",
  "Room was quiet and very comfortable.",
  "",
  "Air conditioning in the room was noisy overnight.",
];

function pickSome(list: string[], rnd: () => number, chance: number): string[] {
  return list.filter(() => rnd() < chance);
}

export function generateResponses(count = 180, seed = 20260819): SurveyResponse[] {
  const rnd = makeRandom(seed);
  const now = Date.UTC(2026, 7, 19, 12, 0, 0);
  const out: SurveyResponse[] = [];

  for (let i = 0; i < count; i += 1) {
    const daysAgo = Math.floor(rnd() * 120);
    const submittedAt = new Date(now - daysAgo * 86400000 - Math.floor(rnd() * 86400000)).toISOString();
    const segment: SurveyResponse["segment"] =
      rnd() < 0.45 ? "leisure" : rnd() < 0.65 ? "business" : "repeat";

    const answers: Answers = { stayType: segment };
    const bias = segment === "business" ? -0.4 : segment === "repeat" ? 0.4 : 0;
    const scale = (base: number) =>
      Math.max(1, Math.min(5, Math.round(base + bias + (rnd() * 2 - 1) * 1.3)));

    answers['overall'] = scale(3.9);

    const facilities = pickSome(FACILITIES, rnd, 0.22);
    answers['facilities'] = facilities;
    if (facilities.length > 0) {
      answers['facilityCleanliness'] = scale(3.5);
      answers['facilityStaff'] = scale(3.8);
      if (rnd() < 0.4) answers['facilityCleanliness__comment'] = CLEAN_COMMENTS[Math.floor(rnd() * CLEAN_COMMENTS.length)]!;
      if (rnd() < 0.35) answers['facilityStaff__comment'] = STAFF_COMMENTS[Math.floor(rnd() * STAFF_COMMENTS.length)]!;
    }

    const dining = pickSome(DINING, rnd, 0.42);
    answers['dining'] = dining;
    if (dining.length > 0) {
      answers['diningCleanliness'] = scale(3.7);
      answers['diningStaff'] = scale(3.6);
      if (rnd() < 0.35) answers['diningCleanliness__comment'] = CLEAN_COMMENTS[Math.floor(rnd() * CLEAN_COMMENTS.length)]!;
      if (rnd() < 0.3) answers['diningStaff__comment'] = STAFF_COMMENTS[Math.floor(rnd() * STAFF_COMMENTS.length)]!;
    }

    const overall = answers['overall'] as number;
    answers['returnPrice'] = overall >= 4 ? "yes" : overall === 3 ? "maybe" : rnd() < 0.6 ? "no" : "maybe";
    if (rnd() < 0.5) answers['detail'] = DETAILS[Math.floor(rnd() * DETAILS.length)]!;

    out.push({
      id: `AMB-${(10000 + i).toString()}`,
      submittedAt,
      segment,
      answers,
    });
  }

  return out.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

/** Question ids actually reached by this response (everything else is skipped). */
export function reachedIds(response: SurveyResponse): Set<string> {
  return new Set(buildPath(response.answers));
}

export const MOCK_RESPONSES = generateResponses();
