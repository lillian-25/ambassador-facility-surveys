import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import heroImage from "@/assets/hotel-hero.jpg";
import mascotWave from "@/assets/mascot-wave.png.asset.json";
import mascotBow from "@/assets/mascot-bow.png.asset.json";
import logoSignature from "@/assets/logo-signature-ivory.png.asset.json";
import logotypeDark from "@/assets/logotype-dark.png.asset.json";
import {
  buildPath,
  isComplete,
  questions,
  type Question,
} from "@/lib/survey-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Guest Experience Survey | The Ambassador Seoul" },
      {
        name: "description",
        content:
          "Share how your stay went at The Ambassador Seoul. A short, guided survey that adapts to your answers.",
      },
      { property: "og:title", content: "Guest Experience Survey | The Ambassador Seoul" },
      {
        property: "og:description",
        content:
          "Share how your stay went at The Ambassador Seoul. A short, guided survey that adapts to your answers.",
      },
    ],
  }),
  component: SurveyPage,
});

type Answers = Record<string, number | string>;

function SurveyPage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const path = buildPath(answers);
  const endRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(path.length);

  useEffect(() => {
    if (path.length > prevCount.current) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    prevCount.current = path.length;
  }, [path.length]);

  function answer(id: string, value: number | string) {
    setAnswers((prev) => {
      const nextAnswers: Answers = { ...prev, [id]: value };
      // Drop answers that are no longer on the active path.
      const keep = new Set(buildPath(nextAnswers));
      keep.add(id);
      return Object.fromEntries(
        Object.entries(nextAnswers).filter(([key]) => keep.has(key)),
      );
    });
  }

  const answered = path.filter((id) => answers[id] !== undefined).length;
  const progress = Math.min(100, Math.round((answered / (path.length + 1)) * 100));

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md">
        <header className="relative h-[46vh] min-h-72 w-full overflow-hidden">
          <img
            src={heroImage}
            alt="Rooftop terrace dining at dusk overlooking the city"
            width={1024}
            height={768}
            className="h-full w-full object-cover"
          />
          <div className="veil absolute inset-0" />
          <img
            src={logoSignature.url}
            alt="The Ambassador Seoul, Pullman Hotels and Resorts"
            className="absolute inset-x-0 top-7 mx-auto w-40 opacity-95"
          />
          <img
            src={mascotWave.url}
            alt="The Ambassador Seoul bird mascot"
            className="absolute bottom-0 left-4 w-32 drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
          />
        </header>


        <div className="relative -mt-10 rounded-t-[2rem] bg-card px-5 pb-16 pt-8 text-card-foreground shadow-card">
          {submitted ? (
            <ThankYou />
          ) : (
            <>
              <div className="mb-7">
                <h1 className="font-display text-2xl leading-snug text-primary">
                  How was your stay?
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Each question unfolds based on your last answer — it takes about a
                  minute.
                </p>
                <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-7">
                {path.map((id, index) => {
                  const question = questions[id];
                  if (!question) return null;
                  return (
                    <div key={id} className="reveal">
                      <QuestionBlock
                        question={question}
                        index={index}
                        value={answers[id]}
                        onAnswer={(value) => answer(id, value)}
                      />
                    </div>
                  );
                })}
              </div>

              <div ref={endRef} className="pt-9">
                <button
                  type="button"
                  disabled={!isComplete(answers)}
                  onClick={() => setSubmitted(true)}
                  className="w-full rounded-full bg-primary px-6 py-4 text-sm font-semibold tracking-[0.14em] text-primary-foreground shadow-soft transition-opacity disabled:opacity-40"
                >
                  SUBMIT
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function QuestionBlock({
  question,
  index,
  value,
  onAnswer,
}: {
  question: Question;
  index: number;
  value: number | string | undefined;
  onAnswer: (value: number | string) => void;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="w-full">
        <span className="text-[0.65rem] font-semibold tracking-[0.3em] text-accent-foreground/50">
          {String(index + 1).padStart(2, "0")}
        </span>
        <p className="mt-1 text-base font-semibold leading-snug text-card-foreground">
          {question.title}
        </p>
        <p className="text-xs text-muted-foreground">{question.subtitle}</p>
      </legend>

      {question.kind === "scale" && (
        <div className="surface-sand mt-3 grid grid-cols-5 gap-1 rounded-2xl p-3">
          {[1, 2, 3, 4, 5].map((n) => {
            const selected = value === n;
            return (
              <button
                key={n}
                type="button"
                aria-pressed={selected}
                onClick={() => onAnswer(n)}
                className="flex flex-col items-center gap-1.5 rounded-xl py-1.5"
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full border transition-colors ${
                    selected
                      ? "border-primary bg-primary"
                      : "border-secondary-foreground/35 bg-transparent"
                  }`}
                >
                  {selected && <span className="size-2 rounded-full bg-accent" />}
                </span>
                <span className="text-xs text-secondary-foreground/70">{n}</span>
              </button>
            );
          })}
        </div>
      )}

      {question.kind === "choice" && (
        <div className="mt-3 space-y-2">
          {question.options.map((option) => {
            const selected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => onAnswer(option.value)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "surface-sand text-secondary-foreground"
                }`}
              >
                {option.label}
                {selected && <Check className="size-4 text-accent" />}
              </button>
            );
          })}
        </div>
      )}

      {question.kind === "text" && (
        <textarea
          rows={4}
          value={typeof value === "string" ? value : ""}
          placeholder={question.placeholder}
          onChange={(event) => onAnswer(event.target.value)}
          className="surface-sand mt-3 w-full resize-none rounded-2xl p-4 text-sm text-secondary-foreground outline-none placeholder:text-secondary-foreground/45 focus:ring-2 focus:ring-ring"
        />
      )}
    </fieldset>
  );
}

function ThankYou() {
  return (
    <div className="reveal flex flex-col items-center py-10 text-center">
      <img
        src={mascotBow.url}
        alt="The Ambassador Seoul bird mascot bowing in thanks"
        className="w-36"
      />
      <h1 className="font-display mt-4 text-3xl text-primary">Thank you</h1>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Your feedback helps us make every stay at The Ambassador Seoul a little more
        memorable.
      </p>
      <img
        src={logotypeDark.url}
        alt="The Ambassador Seoul, Pullman Hotels and Resorts"
        className="mt-10 w-52 opacity-70"
      />
    </div>
  );
}

