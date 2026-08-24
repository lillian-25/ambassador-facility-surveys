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
  OTHER_OPTION,
  Q1_REACTIONS,
  q4Prompt,
  QUALITY_LABELS,
  SATISFACTION_LABELS,
  sentimentForRating,
  SERVICE_RECOVERY_OPTIONS,
} from "@/lib/survey-schema";
import { newResponseId, submitResponses, type ResponseRow } from "@/lib/survey-submit";

export const Route = createFileRoute("/survey/$facility")({
  loader: ({ params }) => {
    const facility = facilityBySlug(params.facility);
    if (!facility) throw notFound();
    return { facility };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.facility.name ?? "Facility";
    const title = `${name} Feedback | The Ambassador Seoul`;
    const description = `Tell us about your experience at ${name}. A few quick taps, under two minutes, no sign-up.`;
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

function FacilitySurvey() {
  const { facility } = Route.useLoaderData();
  const dining = !!facility.dining;

  const [q1, setQ1] = useState<number | null>(null);
  const [q2, setQ2] = useState<number | "na" | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffNote, setStaffNote] = useState("");
  const [picks, setPicks] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [wantsComment, setWantsComment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const staffRating = typeof q2 === "number" ? q2 : null;
  const recovery = staffRating !== null && staffRating <= 2;
  const showRecognition = staffRating !== null && staffRating >= 3;
  const options = recovery
    ? SERVICE_RECOVERY_OPTIONS
    : q1 !== null && q1 >= 4
      ? facility.positiveOptions
      : facility.negativeOptions;

  const q1Text = dining
    ? `How satisfied were you with your overall dining experience at ${facility.name}?`
    : `How satisfied were you with your overall experience at ${facility.name}?`;
  const q2Text = dining
    ? "How would you rate the service provided by our dining staff?"
    : "How would you rate the service provided by our staff?";
  const q4Text = recovery
    ? "We're sorry our service didn't meet your expectations. What could our staff have done better?"
    : q4Prompt(q1 ?? 5);

  const total = showRecognition ? 5 : 4;
  const step = q1 === null ? 1 : q2 === null ? 2 : picks.length === 0 ? (showRecognition ? 3 : 3) : total;

  const showComment =
    picks.includes(OTHER_OPTION) || (q1 !== null && q1 <= 2) || recovery || wantsComment;

  const canSubmit = q1 !== null && q2 !== null && picks.length > 0;

  const toggle = (option: string) =>
    setPicks((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    );

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const id = newResponseId();
    const base = {
      response_id: id,
      survey_type: dining ? "Dining" : "Facility",
      touchpoint: facility.touchpoint,
      facility: facility.name,
      department: facility.department,
      language: "en",
    };
    const positive = (q1 as number) >= 4 && !recovery;
    const trimmedComment = comment.trim() || null;

    const rows: ResponseRow[] = [
      {
        ...base,
        question_id: "q1_overall",
        question_text: q1Text,
        response: SATISFACTION_LABELS[(q1 as number) - 1] ?? null,
        rating: q1,
        sentiment: sentimentForRating(q1 as number),
        issue_category: null,
        staff_recognition: null,
        comment: null,
      },
      {
        ...base,
        question_id: "q2_staff",
        question_text: q2Text,
        response: q2 === "na" ? "N/A — did not interact with staff" : (QUALITY_LABELS[(staffRating as number) - 1] ?? null),
        rating: staffRating,
        sentiment: staffRating === null ? null : sentimentForRating(staffRating),
        issue_category: null,
        staff_recognition: null,
        comment: null,
      },
    ];

    if (showRecognition && (staffName.trim() || staffNote.trim())) {
      rows.push({
        ...base,
        survey_type: "STAFF_RECOGNITION",
        question_id: "q3_staff_recognition",
        question_text: "Was there a staff member who made your experience particularly special?",
        response: staffName.trim() || "Unnamed team member",
        rating: null,
        sentiment: "Positive",
        issue_category: "Staff recognition",
        staff_recognition: [staffName.trim(), staffNote.trim()].filter(Boolean).join(" — "),
        comment: staffNote.trim() || null,
      });
    }

    for (const pick of picks) {
      rows.push({
        ...base,
        question_id: recovery ? "q4_service_recovery" : positive ? "q4_positive" : "q4_improve",
        question_text: q4Text,
        response: pick,
        rating: null,
        sentiment: positive ? "Positive" : "Negative",
        issue_category: pick,
        staff_recognition: null,
        comment: null,
      });
    }

    if (trimmedComment) {
      rows.push({
        ...base,
        question_id: "q5_comment",
        question_text: "Could you tell us a little more about this?",
        response: null,
        rating: null,
        sentiment: positive ? "Positive" : "Negative",
        issue_category: null,
        staff_recognition: null,
        comment: trimmedComment,
      });
    }

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
      <ProgressBar step={step} total={total} />

      <div className="space-y-10">
        <div>
          <QuestionTitle>{q1Text}</QuestionTitle>
          <ScaleChoice
            labels={SATISFACTION_LABELS}
            value={q1}
            onChange={(v) => {
              setQ1(v as number);
              setPicks([]);
            }}
          />
          {q1 !== null ? (
            <p className="reveal mt-4 rounded-2xl bg-accent/10 px-4 py-3 text-[0.9rem] leading-relaxed text-card-foreground">
              {Q1_REACTIONS[q1]}
            </p>
          ) : null}
        </div>

        {q1 !== null ? (
          <div className="reveal">
            <QuestionTitle>{q2Text}</QuestionTitle>
            <ScaleChoice
              labels={QUALITY_LABELS}
              value={q2}
              onChange={(v) => {
                setQ2(v);
                setPicks([]);
              }}
              allowNA
            />
            <p className="mt-2 text-[0.75rem] text-muted-foreground">
              Choose “Not applicable” if you did not interact with staff.
            </p>
          </div>
        ) : null}

        {showRecognition ? (
          <div className="reveal">
            <QuestionTitle>
              Was there a staff member who made your experience particularly special?
            </QuestionTitle>
            <p className="mt-1 text-[0.85rem] text-muted-foreground">
              We&apos;d love to recognise them! Optional.
            </p>
            <input
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Staff member name"
              className="mt-4 w-full rounded-2xl border border-border bg-white px-4 py-3.5 text-[0.95rem] text-card-foreground outline-none placeholder:text-muted-foreground focus:border-accent"
            />
            <CommentBox
              value={staffNote}
              onChange={setStaffNote}
              placeholder="Tell us their name or what they did that stood out."
            />
          </div>
        ) : null}

        {q2 !== null ? (
          <div className="reveal">
            <QuestionTitle>{q4Text}</QuestionTitle>
            <p className="mt-1 text-[0.8rem] text-muted-foreground">Please select all that apply.</p>
            <MultiSelect options={options} selected={picks} onToggle={toggle} />
          </div>
        ) : null}

        {q2 !== null && picks.length > 0 ? (
          <div className="reveal">
            {showComment ? (
              <>
                <QuestionTitle>Could you tell us a little more about this?</QuestionTitle>
                <p className="mt-1 text-[0.8rem] text-muted-foreground">
                  Your feedback helps us make the Ambassador experience even better. Optional.
                </p>
                <CommentBox value={comment} onChange={setComment} placeholder="Optional" />
              </>
            ) : (
              <button
                type="button"
                onClick={() => setWantsComment(true)}
                className="w-full rounded-2xl border border-border px-4 py-3.5 text-[0.9rem] text-muted-foreground"
              >
                Add a comment (optional)
              </button>
            )}
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
