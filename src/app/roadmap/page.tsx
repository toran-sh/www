import Link from "next/link";

const sections = [
  {
    title: "Deeper inspection",
    items: [
      "Time-limited request and response bodies",
      "Explicit debug sessions with countdown timers",
      "Still opt-in, still reversible",
    ],
  },
  {
    title: "Read-only replay",
    items: [
      "Re-run captured requests out of band",
      "Never on the live traffic path",
      "Clearly labeled as replay",
    ],
  },
  {
    title: "Agent-aware debugging",
    items: [
      "Group related calls into call trees",
      "See which upstream call caused a failure",
      "No agent orchestration or mutation",
    ],
  },
  {
    title: "Longer memory",
    items: [
      "Extended retention windows",
      "Exportable logs",
      "Still not observability",
    ],
  },
];

const nonGoals = [
  "An API gateway",
  "Observability or APM",
  "Required production infrastructure",
  "A traffic controller",
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
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
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            What&apos;s coming next
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Only after Phase 1 is proven in real usage.
          </p>
        </div>

        {/* Feature Sections */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.title}
              className="border border-zinc-200 dark:border-zinc-800 p-6"
            >
              <h2 className="font-semibold">{section.title}</h2>
              <ul className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    <span className="text-cyan-600 dark:text-cyan-400">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Non-Goals */}
        <section className="mt-20">
          <h2 className="text-xl font-bold">Still not:</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {nonGoals.map((goal) => (
              <div
                key={goal}
                className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400"
              >
                <span className="text-zinc-400 dark:text-zinc-600">-</span>
                {goal}
              </div>
            ))}
          </div>
        </section>

        {/* Closing */}
        <section className="mt-20">
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-zinc-700 dark:text-zinc-300">
              toran will only add power when it does not reduce trust.
            </p>
          </div>
        </section>

        {/* Feedback Link */}
        <section className="mt-12">
          <p className="text-sm text-zinc-500">
            Have a use case?{" "}
            <a
              href="mailto:feedback@toran.sh"
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Tell us what broke.
            </a>
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto mt-32 border-t border-zinc-200 dark:border-zinc-800 px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-zinc-500">
              Live outbound API inspector - see, search, and understand calls
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
