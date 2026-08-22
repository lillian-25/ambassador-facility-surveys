import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import logoSignature from "@/assets/logo-signature-ivory.png.asset.json";
import mascotBow from "@/assets/mascot-bow.png.asset.json";
import { PRIVACY_STATEMENT } from "@/lib/survey-schema";

export function SurveyShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background">
      <header className="relative overflow-hidden px-6 pb-10 pt-9 text-center">
        <img src={logoSignature.url} alt="The Ambassador Seoul" className="mx-auto h-20 w-auto" />
        <p className="mt-6 text-[0.68rem] uppercase tracking-[0.32em] text-accent">{eyebrow}</p>
        <h1 className="font-display mt-2 text-3xl leading-tight text-foreground">{title}</h1>
      </header>
      <section className="shadow-card min-h-[70vh] rounded-t-[2rem] bg-card px-5 pb-28 pt-7 text-card-foreground">
        {children}
      </section>
    </main>
  );
}

export function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between">
        <span className="text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
          Question {Math.min(step, total)} of {total}
        </span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${(Math.min(step, total) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function QuestionTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-2xl leading-snug text-card-foreground">{children}</h2>;
}

export function ScaleChoice({
  labels,
  value,
  onChange,
  allowNA = false,
  max = 5,
}: {
  labels?: string[];
  value: number | "na" | null;
  onChange: (v: number | "na") => void;
  allowNA?: boolean;
  max?: number;
}) {
  const values = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <div className="mt-5 space-y-2">
      {labels
        ? values.map((n) => {
            const active = value === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-colors ${
                  active
                    ? "border-accent bg-accent/15"
                    : "surface-sand border-transparent hover:border-accent/50"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    active ? "bg-accent text-accent-foreground" : "bg-white/70 text-card-foreground"
                  }`}
                >
                  {n}
                </span>
                <span className="text-[0.95rem] text-card-foreground">{labels[n - 1]}</span>
              </button>
            );
          })
        : null}
      {allowNA ? (
        <button
          type="button"
          onClick={() => onChange("na")}
          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
            value === "na"
              ? "border-accent bg-accent/15 text-card-foreground"
              : "border-border text-muted-foreground hover:border-accent/50"
          }`}
        >
          Not applicable
        </button>
      ) : null}
    </div>
  );
}

export function NumberScale({
  value,
  onChange,
  min = 0,
  max = 10,
  minLabel,
  maxLabel,
}: {
  value: number | null;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return (
    <div className="mt-5">
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
        {values.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`aspect-square rounded-xl text-sm font-semibold transition-colors ${
              value === n ? "bg-accent text-accent-foreground" : "surface-sand text-card-foreground"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {minLabel || maxLabel ? (
        <div className="mt-2 flex justify-between text-[0.7rem] text-muted-foreground">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

export function MultiSelect({
  options,
  selected,
  onToggle,
  exclusive,
}: {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  exclusive?: string;
}) {
  return (
    <div className="mt-5 space-y-2">
      {options.map((option) => {
        const active = selected.includes(option);
        const isExclusive = option === exclusive;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[0.95rem] transition-colors ${
              active
                ? "border-accent bg-accent/15"
                : isExclusive
                  ? "border-border bg-transparent"
                  : "surface-sand border-transparent hover:border-accent/50"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                active ? "border-accent bg-accent" : "border-muted-foreground/40"
              }`}
            >
              {active ? (
                <svg viewBox="0 0 12 12" className="h-3 w-3 text-accent-foreground" fill="none">
                  <path
                    d="M2 6.5 4.7 9 10 3.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>
            <span className="text-card-foreground">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

export function CommentBox({
  value,
  onChange,
  placeholder = "Anything you'd like to add? (optional)",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      placeholder={placeholder}
      className="mt-4 w-full resize-none rounded-2xl border border-border bg-white px-4 py-3 text-[0.95rem] text-card-foreground outline-none placeholder:text-muted-foreground focus:border-accent"
    />
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-full bg-primary px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-opacity disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function PrivacyNote() {
  return (
    <p className="mt-8 text-[0.72rem] leading-relaxed text-muted-foreground">{PRIVACY_STATEMENT}</p>
  );
}

export function ThankYou({ message }: { message: string }) {
  return (
    <div className="px-2 py-10 text-center">
      <img src={mascotBow.url} alt="" className="mx-auto h-40 w-auto" />
      <h2 className="font-display mt-4 text-3xl text-card-foreground">Thank you</h2>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">{message}</p>
      <Link
        to="/"
        className="mt-8 inline-block text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground underline"
      >
        Back to surveys
      </Link>
    </div>
  );
}
