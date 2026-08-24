import { createFileRoute, Link } from "@tanstack/react-router";
import logoSignature from "@/assets/logo-signature-ivory.png.asset.json";
import heroImage from "@/assets/hero-mascot.png.asset.json";
import { FACILITIES, PRIVACY_STATEMENT } from "@/lib/survey-schema";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Guest Feedback | Ambassador Hotel" },
      {
        name: "description",
        content:
          "Share your experience at Ambassador Hotel. Scan the QR code at any facility or restaurant, or complete our short post-stay survey.",
      },
      { property: "og:title", content: "Guest Feedback | Ambassador Hotel" },
      {
        property: "og:description",
        content:
          "Short, anonymous surveys for every Ambassador Hotel facility, restaurant and bar, plus our post-stay survey.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Hub,
});

function Hub() {
  const dining = FACILITIES.filter((f) => f.touchpoint === "Dining");
  const others = FACILITIES.filter((f) => f.touchpoint !== "Dining");

  return (
    <main className="min-h-screen bg-background">
      <header className="relative isolate overflow-hidden px-6 pb-12 pt-10 text-center">
        <img
          src={heroImage.url}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover object-left opacity-40"
        />
        <div className="veil absolute inset-0 -z-10" />
        <img src={logoSignature.url} alt="Ambassador Hotel" className="mx-auto h-24 w-auto" />
        <h1 className="font-display mt-6 text-3xl leading-tight text-foreground">
          Voice of the Guest
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[0.9rem] leading-relaxed text-foreground/75">
          Choose a survey below, or simply scan the QR code displayed at the facility you visited.
        </p>
      </header>

      <section className="shadow-card rounded-t-[2rem] bg-card px-5 pb-16 pt-8 text-card-foreground">
        <Link
          to="/post-checkout"
          className="block rounded-2xl bg-primary px-5 py-5 text-primary-foreground"
        >
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-accent">Post-stay</p>
          <p className="font-display mt-1 text-2xl">Tell us about your stay</p>
          <p className="mt-1 text-[0.85rem] opacity-80">
            Four questions — enter the September Lucky Draw.
          </p>
        </Link>

        <h2 className="font-display mt-10 text-xl">Facilities & wellness</h2>
        <div className="mt-4 space-y-2">
          {others.map((f) => (
            <Link
              key={f.slug}
              to="/survey/$facility"
              params={{ facility: f.slug }}
              className="surface-sand flex items-center justify-between rounded-2xl px-4 py-3.5"
            >
              <span className="text-[0.95rem] text-card-foreground">{f.name}</span>
              <span className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
                {f.touchpoint}
              </span>
            </Link>
          ))}
        </div>

        <h2 className="font-display mt-10 text-xl">Dining & bars</h2>
        <div className="mt-4 space-y-2">
          {dining.map((f) => (
            <Link
              key={f.slug}
              to="/survey/$facility"
              params={{ facility: f.slug }}
              className="surface-sand flex items-center justify-between rounded-2xl px-4 py-3.5"
            >
              <span className="text-[0.95rem] text-card-foreground">{f.name}</span>
              <span className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
                Dining
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-[0.72rem] leading-relaxed text-muted-foreground">
          {PRIVACY_STATEMENT}
        </p>
        <Link
          to="/admin"
          className="mt-6 inline-block text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground underline"
        >
          Staff dashboard
        </Link>
      </section>
    </main>
  );
}
