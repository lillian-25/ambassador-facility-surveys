import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  CommentBox,
  MultiSelect,
  PrimaryButton,
  PrivacyNote,
  ProgressBar,
  QuestionTitle,
  ScaleChoice,
  SurveyShell,
  ThankYou,
} from "@/components/survey-ui";
import {
  facilityBySlug,
  improvementOptions,
  NOTHING_OPTION,
  QUALITY_LABELS,
  SATISFACTION_LABELS,
  sentimentForRating,
} from "@/lib/survey-schema";
import { newResponseId, submitResponses, type ResponseRow } from "@/lib/survey-submit";

export const Route = createFileRoute("/s/$facility")({
  loader: ({ params }) => {
    const facility = facilityBySlug(params.facility);
    if (!facility) throw notFound();
    return { facility };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.facility.name ?? "Facility";
    const title = `${name} Feedback | Ambassador Hotel`;
    const description = `Tell us about your experience at ${name}. Four quick questions, no sign-up needed.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: FacilitySurvey,
});

const TOTAL = 4;

function FacilitySurvey() {
  const { facility } = Route.useLoaderData();
  const [q1, setQ1] = useState<number | null>(null);
  const [q2, setQ2] = useState<number | null>(null);
  const [q3, setQ3] = useState<number | "na" | null>(null);
  const [q4, setQ4] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = q1 === null ? 1 : q2 === null ? 2 : q3 === null ? 3 : 4;
  const canSubmit = q1 !== null && q2 !== null && q3 !== null && q4.length > 0;

  const toggleImprovement = (option: string) => {
    setQ4((prev) => {
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
    const base = {
      response_id: id,
      survey_type: "Facility",
      touchpoint: facility.touchpoint,
      facility: facility.name,
      department: facility.department,
    };
    const rows: ResponseRow[] = [
      {
        ...base,
        question_id: "q1_overall",
        question_text: `How satisfied were you with your overall experience at ${facility.name}?`,
        response: SATISFACTION_LABELS[(q1 as number) - 1] ?? null,
        rating: q1,
        sentiment: sentimentForRating(q1 as number),
        comment: null,
      },
      {
        ...base,
        question_id: "q2_condition",
        question_text: `How would you rate the condition, cleanliness and overall quality of ${facility.qualityNoun}?`,
        response: QUALITY_LABELS[(q2 as number) - 1] ?? null,
        rating: q2,
        sentiment: sentimentForRating(q2 as number),
        comment: null,
      },
      {
        ...base,
        question_id: "q3_staff",
        question_text: "How would you rate the helpfulness and attentiveness of our staff?",
        response: q3 === "na" ? "N/A" : (QUALITY_LABELS[(q3 as number) - 1] ?? null),
        rating: q3 === "na" ? null : (q3 as number),
        sentiment: q3 === "na" ? null : sentimentForRating(q3 as number),
        comment: null,
      },
      {
        ...base,
        question_id: "q4_improve",
        question_text: "Was there anything we could have improved?",
        response: q4.join("; "),
        rating: null,
        sentiment: q4.includes(NOTHING_OPTION) ? "Positive" : "Negative",
        comment: comment.trim() || null,
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
      <SurveyShell eyebrow={facility.touchpoint} title={facility.name}>
        <ThankYou message={`Your feedback on ${facility.name} has been shared with our team.`} />
      </SurveyShell>
    );
  }

  return (
    <SurveyShell eyebrow={facility.touchpoint} title={facility.name}>
      <ProgressBar step={step} total={TOTAL} />

      <div className="space-y-10">
        <div>
          <QuestionTitle>
            How satisfied were you with your overall experience at {facility.name}?
          </QuestionTitle>
          <ScaleChoice labels={SATISFACTION_LABELS} value={q1} onChange={(v) => setQ1(v as number)} />
        </div>

        {q1 !== null ? (
          <div>
            <QuestionTitle>
              How would you rate the condition, cleanliness and overall quality of{" "}
              {facility.qualityNoun}?
            </QuestionTitle>
            <ScaleChoice labels={QUALITY_LABELS} value={q2} onChange={(v) => setQ2(v as number)} />
          </div>
        ) : null}

        {q2 !== null ? (
          <div>
            <QuestionTitle>
              How would you rate the helpfulness and attentiveness of our staff?
            </QuestionTitle>
            <ScaleChoice labels={QUALITY_LABELS} value={q3} onChange={setQ3} allowNA />
          </div>
        ) : null}

        {q3 !== null ? (
          <div>
            <QuestionTitle>Was there anything we could have improved?</QuestionTitle>
            <p className="mt-1 text-[0.8rem] text-muted-foreground">Select all that apply.</p>
            <MultiSelect
              options={improvementOptions(facility)}
              selected={q4}
              onToggle={toggleImprovement}
              exclusive={NOTHING_OPTION}
            />
            <CommentBox value={comment} onChange={setComment} />
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-6 text-sm text-destructive">{error}</p> : null}

      <div className="mt-8">
        <PrimaryButton onClick={submit} disabled={!canSubmit || submitting}>
          {submitting ? "Sending…" : "Submit feedback"}
        </PrimaryButton>
      </div>

      <PrivacyNote />
    </SurveyShell>
  );
}
