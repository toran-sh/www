import Link from "next/link";

const tiers = [
  {
    name: "Free",
    label: "Free (signed in)",
    price: "$0",
    period: "",
    description: "A real, usable tier for development and debugging.",
    features: [
      "24h log retention",
      "Metadata + headers (authorization redacted)",
      "1–3 torans",
      "Live + historical view",
      "Reasonable request caps",
    ],
    cta: "Create a toran",
    ctaHref: "/try",
    highlighted: false,
  },
  {
    name: "Pro",
    label: "Pro",
    price: "$29",
    period: "/ month",
    description:
      "When something breaks, you can always figure out what happened.",
    features: [
      "7–30 day log retention",
      "Time-limited payload capture",
      "Unlimited torans (soft limits)",
      "Higher request caps",
      "Log export (JSON)",
    ],
    cta: "Upgrade to Pro",
    ctaHref: "/login",
    highlighted: true,
  },
  {
    name: "Pro Plus",
    label: "Pro Plus",
    price: "$99",
    period: "/ month",
    description: "For production traffic where continuity matters.",
    features: [
      "30–90 day log retention",
      "Very high request caps",
      "Multi-region edge selection",
      "Priority support",
    ],
    cta: "Upgrade to Pro Plus",
    ctaHref: "/login",
    highlighted: false,
  },
];

const rules = [
  "No per-request billing",
  "No surprise overages",
  "Hard caps with graceful degradation",
  "Downgrade or cancel anytime",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-3xl font-bold text-cyan-600 dark:text-cyan-400"
          >
            <img src="/logo.png" alt="toran" className="h-10 w-10" />
            toran
          </Link>
          <Link
            href="/try"
            className="bg-cyan-600 dark:bg-cyan-500 px-4 py-2 text-sm text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400"
          >
            Try Now
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Pay for how long you want to remember what happened
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            toran charges for retention and continuity — not requests, not
            performance.
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`border p-6 ${
                tier.highlighted
                  ? "border-cyan-500 dark:border-cyan-400"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="text-sm text-zinc-500 dark:text-zinc-500">
                {tier.label}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{tier.price}</span>
                {tier.period && (
                  <span className="text-zinc-500 dark:text-zinc-500">
                    {tier.period}
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                {tier.description}
              </p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="text-cyan-600 dark:text-cyan-400">-</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.ctaHref}
                className={`mt-8 block w-full py-2 text-center text-sm ${
                  tier.highlighted
                    ? "bg-cyan-600 dark:bg-cyan-500 text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400"
                    : "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Pricing Rules */}
        <section className="mt-20">
          <h2 className="text-xl font-bold">How billing works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {rules.map((rule) => (
              <div
                key={rule}
                className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400"
              >
                <span className="text-cyan-600 dark:text-cyan-400">-</span>
                {rule}
              </div>
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <section className="mt-20">
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-zinc-600 dark:text-zinc-400">
              You can remove toran at any time by changing your base URL back.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto mt-32 border-t border-zinc-200 dark:border-zinc-800 px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-zinc-500">
              Live outbound API inspector — see, search, and understand calls
              without SDKs.
            </div>
            <div className="flex gap-4 text-sm text-zinc-500">
              <Link
                href="/pricing"
                className="hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Pricing
              </Link>
              <Link
                href="/roadmap"
                className="hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Roadmap
              </Link>
              <a
                href="/privacy"
                className="hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
