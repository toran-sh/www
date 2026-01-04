import Link from "next/link";
import { Footer } from "@/components/footer";

const tiers = [
  {
    name: "Anonymous",
    label: "Anonymous (no account)",
    price: "$0",
    period: "",
    description: "Live inspection in minutes. No account.",
    features: [
      "Live streaming",
      "Latest 1,000 logs per toran (rolling)",
      "Expires unless claimed",
      "Defaults only (no sensitive field opt-ins)",
      "Payloads are not logged",
      "See what an agent or tool actually sent to this API",
    ],
    cta: "Create a toran",
    ctaHref: "/try",
    highlighted: false,
  },
  {
    name: "Free",
    label: "Free (signed in)",
    price: "$0",
    period: "",
    description: "More history for day-to-day debugging.",
    features: [
      "Latest 2,500 logs per toran (rolling)",
      "Saved response replay (up to 5 snapshots per toran)",
      "Up to 5 torans",
      "Optional payload body logging (sensitive headers stay redacted)",
      "Reasonable usage caps",
      "Debug agent tool calls without inspecting prompts",
    ],
    cta: "Get Started",
    ctaHref: "/login",
    highlighted: false,
  },
  {
    name: "Pro",
    label: "Pro",
    price: "$29",
    period: "/ month",
    description: "Longer history for when issues surface later.",
    features: [
      "Latest 25,000 logs per toran (rolling)",
      "Saved response replay (up to 50 snapshots per toran)",
      "Up to 20 torans",
      "Higher usage caps",
      "Log export",
      "Customize sensitive field logging (IP, identifiers, geo)",
      "Advanced traffic analysis: segment traffic and summarize paths, latency, size, and errors",
      "Keep enough history for intermittent agent failures",
      "Email support",
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
    description: "For production continuity and locality.",
    features: [
      "Latest 250,000 logs per toran (rolling)",
      "Saved response replay (up to 500 snapshots per toran)",
      "Up to 100 torans",
      "Very high usage caps",
      "Multi-region edge selection",
      "Customize sensitive field logging (IP, identifiers, geo)",
      "Advanced traffic analysis: segment traffic and summarize paths, latency, size, and errors",
      "Long-running production agents need continuity",
      "Priority email support",
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
  "Cancel anytime",
  "Sensitive headers and query values are redacted by default",
  "Saved response replay is explicit and out-of-band - toran never serves cached responses on live traffic",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-3xl font-bold text-sky-600 dark:text-sky-400"
          >
            <img src="/logo.png" alt="toran" className="h-10 w-10" />
            toran
          </Link>
          <Link
            href="/try"
            className="bg-sky-600 dark:bg-sky-500 px-4 py-2 text-sm text-white dark:text-zinc-950 hover:bg-sky-700 dark:hover:bg-sky-400"
          >
            Create a toran
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Pay for how much history you want
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            toran charges for history depth and continuity - not requests, not performance. No surprise overages.
          </p>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Each paid tier includes everything in the tiers below it, plus more.
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`border p-6 ${
                tier.highlighted
                  ? "border-sky-500 dark:border-sky-400"
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
                    <span className="text-sky-600 dark:text-sky-400">-</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.ctaHref}
                className={`mt-8 block w-full py-2 text-center text-sm ${
                  tier.highlighted
                    ? "bg-sky-600 dark:bg-sky-500 text-white dark:text-zinc-950 hover:bg-sky-700 dark:hover:bg-sky-400"
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
          <h2 className="text-xl font-bold">Pricing rules</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {rules.map((rule) => (
              <div
                key={rule}
                className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400"
              >
                <span className="text-sky-600 dark:text-sky-400">-</span>
                {rule}
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer className="mt-32" />
    </div>
  );
}
