import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CommentBox,
  MultiSelect,
  NumberScale,
  PrimaryButton,
  PrivacyNote,
  ProgressBar,
  QuestionTitle,
  ScaleChoice,
  SurveyShell,
  ThankYou,
} from "@/components/survey-ui";
import {
  NOTHING_OPTION,
  POST_CHECKOUT_IMPROVEMENTS,
  POST_CHECKOUT_MATRIX,
  SATISFACTION_LABELS,
  sentimentForRating,
} from "@/lib/survey-schema";
import { newResponseId, submitResponses, type ResponseRow } from "@/lib/survey-submit";

export const Route = createFileRoute("/post-checkout")({
  head: () => ({
    meta: [
      { title: "Post-Stay Survey | Ambassador Hotel" },
      {
        name: "description",
        content:
          "Tell us about your stay at Ambassador and enter the September Lucky Draw. Four short questions.",
      },
      { property: "og:title", content: "Post-Stay Survey | Ambassador Hotel" },
      {
        property: "og:description",
        content: "Share your stay experience with Ambassador and enter the September Lucky Draw.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostCheckout,
});

const TOTAL = 4;
const SURVEY_META = {
  survey_type: "Post-checkout",
  touchpoint: "Post-checkout",
  facility: "Overall stay",
};

function PostCheckout() {
  const [q1, setQ1] = useState<number | null>(null);
  const [matrix, setMatrix] = useState<Record<string, number | "na">>({});
  const [improve, setImprove] = useState<string[]>([]);
  const [improveComment, setImproveComment] = useState("");
  const [returnIntent, setReturnIntent] = useState<number | null>(null);
  const [nps, setNps] = useState<number | null>(null);
  const [finalComment, setFinalComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matrixDone = POST_CHECKOUT_MATRIX.every((row) => matrix[row.id] !== undefined);
  const step = q1 === null ? 1 : !matrixDone ? 2 : improve.length === 0 ? 3 : 4;
  const canSubmit =
    q1 !== null && matrixDone && improve.length > 0 && returnIntent !== null && nps !== null;

  const toggleImprove = (option: string) => {
    setImprove((prev) => {
      if (option === NOTHING_OPTION) return prev.includes(option) ? [] : [option];
      const without = prev.filter((o) => o !== NOTHING_OPTION);
      return without.includes(option) ? without.filter((o) => o !== option) : [...without, option];
    });
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const id = newResponseId();
    const rows: ResponseRow[] = [
      {
        response_id: id,
        ...SURVEY_META,
        department: "Front desk",
        question_id: "pc_overall",
        question_text: "Overall, how satisfied were you with your stay at Ambassador?",
        response: SATISFACTION_LABELS[(q1 as number) - 1] ?? null,
        rating: q1,
        sentiment: sentimentForRating(q1 as number),
        comment: null,
      },
      ...POST_CHECKOUT_MATRIX.map((row) => {
        const value = matrix[row.id];
        const isNa = value === "na";
        return {
          response_id: id,
          ...SURVEY_META,
          department: row.department,
          question_id: `pc_matrix_${row.id}`,
          question_text: `How would you rate: ${row.label}?`,
          response: isNa ? "N/A" : (SATISFACTION_LABELS[(value as number) - 1] ?? null),
          rating: isNa ? null : (value as number),
          sentiment: isNa ? null : sentimentForRating(value as number),
          comment: null,
        } satisfies ResponseRow;
      }),
      {
        response_id: id,
        ...SURVEY_META,
        department: "Front desk",
        question_id: "pc_improve",
        question_text: "What was the most important area we could improve?",
        response: improve.join("; "),
        rating: null,
        sentiment: improve.includes(NOTHING_OPTION) ? "Positive" : "Negative",
        comment: improveComment.trim() || null,
      },
      {
        response_id: id,
        ...SURVEY_META,
        department: "Front desk",
        question_id: "pc_return_intent",
        question_text: "How likely are you to choose Ambassador again for your next stay?",
        response: `${returnIntent}/10`,
        rating: returnIntent,
        sentiment: sentimentForRating(returnIntent as number, 10),
        comment: null,
      },
      {
        response_id: id,
        ...SURVEY_META,
        department: "Front desk",
        question_id: "pc_nps",
        question_text: "How likely are you to recommend Ambassador to a friend or colleague?",
        response: `${nps}/10`,
        rating: nps,
        sentiment: sentimentForRating(nps as number, 10),
        comment: finalComment.trim() || null,
      },
    ];
    try {
      await submitResponses(rows);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <SurveyShell eyebrow="Post-stay" title="Your stay with us">
        <ThankYou message="Your feedback has been received and you are entered into the September Lucky Draw. We hope to welcome you back soon." />
      </SurveyShell>
    );
  }

  return (
    <SurveyShell eyebrow="Post-stay" title="Your stay with us">
      <p className="mb-6 text-[0.95rem] leading-relaxed text-muted-foreground">
        Thank you for staying with Ambassador. We'd love to hear about your experience. Complete our
        short survey for your chance to enter the September Lucky Draw.
      </p>

      <ProgressBar step={step} total={TOTAL} />

      <div className="space-y-10">
        <div>
          <QuestionTitle>Overall, how satisfied were you with your stay at Ambassador?</QuestionTitle>
          <ScaleChoice labels={SATISFACTION_LABELS} value={q1} onChange={(v) => setQ1(v as number)} />
        </div>

        {q1 !== null ? (
          <div>
            <QuestionTitle>How would you rate each part of your stay?</QuestionTitle>
            <p className="mt-1 text-[0.8rem] text-muted-foreground">
              1 = Very dissatisfied, 5 = Very satisfied. Choose N/A if it doesn't apply.
            </p>
            <div className="mt-5 space-y-3">
              {POST_CHECKOUT_MATRIX.map((row) => (
                <div key={row.id} className="surface-sand rounded-2xl px-4 py-3">
                  <p className="text-[0.9rem] font-medium text-card-foreground">{row.label}</p>
                  <div className="mt-2 grid grid-cols-6 gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setMatrix((m) => ({ ...m, [row.id]: n }))}
                        className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                          matrix[row.id] === n
                            ? "bg-accent text-accent-foreground"
                            : "bg-white/70 text-card-foreground"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setMatrix((m) => ({ ...m, [row.id]: "na" }))}
                      className={`rounded-lg py-2 text-[0.7rem] font-semibold transition-colors ${
                        matrix[row.id] === "na"
                          ? "bg-accent text-accent-foreground"
                          : "bg-white/70 text-muted-foreground"
                      }`}
                    >
                      N/A
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {matrixDone && q1 !== null ? (
          <div>
            <QuestionTitle>What was the most important area we could improve?</QuestionTitle>
            <MultiSelect
              options={POST_CHECKOUT_IMPROVEMENTS}
              selected={improve}
              onToggle={toggleImprove}
              exclusive={NOTHING_OPTION}
            />
            <CommentBox value={improveComment} onChange={setImproveComment} />
          </div>
        ) : null}

        {improve.length > 0 ? (
          <div className="space-y-8">
            <div>
              <QuestionTitle>
                How likely are you to choose Ambassador again for your next stay?
              </QuestionTitle>
              <NumberScale
                value={returnIntent}
                onChange={setReturnIntent}
                minLabel="Not at all likely"
                maxLabel="Extremely likely"
              />
            </div>
            <div>
              <QuestionTitle>
                How likely are you to recommend Ambassador to a friend or colleague?
              </QuestionTitle>
              <NumberScale
                value={nps}
                onChange={setNps}
                minLabel="Not at all likely"
                maxLabel="Extremely likely"
              />
              <CommentBox
                value={finalComment}
                onChange={setFinalComment}
                placeholder="Any final thoughts? (optional)"
              />
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-6 text-sm text-destructive">{error}</p> : null}

      <div className="mt-8">
        <PrimaryButton onClick={submit} disabled={!canSubmit || submitting}>
          {submitting ? "Sending…" : "Submit & enter lucky draw"}
        </PrimaryButton>
      </div>

      <PrivacyNote />
    </SurveyShell>
  );
}
