import Link from "next/link";

const features = [
  {
    title: "Live Request Logs",
    description:
      "Watch API calls as they happen. See method, path, status code, and timing in real-time.",
  },
  {
    title: "Headers & Metadata",
    description:
      "Inspect request and response headers with automatic redaction of authorization tokens.",
  },
  {
    title: "Error Detection",
    description:
      "Instantly spot failed requests with status codes and error classification.",
  },
  {
    title: "Response Timing",
    description:
      "See exactly how long each call took. Identify slow responses at a glance.",
  },
];

export default function Home() {
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
            href="/login"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Sign in
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            See your outbound API calls.{" "}
            <span className="text-cyan-600 dark:text-cyan-400">Live.</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            toran lets you watch real API traffic as it happens - without SDKs,
            agents, or logging setup.
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            AI agents are opaque until they hit real tools. toran shows what the agent actually sent to each API - and what came back.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/try"
              className="bg-cyan-600 dark:bg-cyan-500 px-6 py-3 text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400"
            >
              Create your first toran
            </Link>
            <span className="text-zinc-500">no sign-up required</span>
          </div>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-500">
            Replace the base URL in your tool or client, run your app, tests, or agent, and see traffic live in your browser.
          </p>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-20">
          <h2 className="text-2xl font-bold">What you get</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Everything you need to understand your API traffic
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="border border-zinc-200 dark:border-zinc-800 p-6"
              >
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Examples Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Try it with any API</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Replace a tool or client base URL and see requests instantly
          </p>
          <div className="mt-6 space-y-4">
            <div className="border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-semibold">Example tool: GitHub API</h3>
              <code className="mt-3 block bg-zinc-100 dark:bg-zinc-900 p-4 text-sm font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                curl https://&lt;your-toran&gt;.toran.sh/repos/octocat/hello-world
              </code>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-semibold">Example tool: OpenAI API</h3>
              <code className="mt-3 block bg-zinc-100 dark:bg-zinc-900 p-4 text-sm font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                https://&lt;your-toran&gt;.toran.sh/v1/chat/completions
              </code>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">How it works</h2>
          <div className="mt-6 border border-zinc-200 dark:border-zinc-800 p-6">
            <ol className="space-y-4 text-zinc-600 dark:text-zinc-400">
              <li className="flex gap-3">
                <span className="font-mono text-cyan-600 dark:text-cyan-400">
                  1.
                </span>
                Enter your upstream API URL to create a toran
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-cyan-600 dark:text-cyan-400">
                  2.
                </span>
                Replace your API base URL with your toran URL
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-cyan-600 dark:text-cyan-400">
                  3.
                </span>
                Run your app or tests and watch requests stream in
              </li>
            </ol>
            <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
              Requests sent through toran are routed through our proxy for live
              inspection. Authorization headers are redacted by default.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-xl font-semibold">Pattern: one toran per tool</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              AI agents often use multiple tools (GitHub, OpenAI, internal APIs). Create one toran per tool API to see each tool’s real behavior independently.
            </p>
          </div>
        </section>

        {/* Trust Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Safe by design</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-semibold">Read-only inspection</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                toran is read-only by design - no request or response mutation, no hidden behavior, and no production dependency.
              </p>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-semibold">Remove anytime</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Change your base URL back to the original and toran is out of
                the picture.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            toran does not inspect prompts, model internals, or agent reasoning. It shows HTTP calls to external APIs.
          </p>
        </section>

        {/* Upgrade Teaser */}
        <section className="mt-16">
          <div className="border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950 p-6">
            <h2 className="text-lg font-semibold">Want more?</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Sign up for free to keep your torans forever. Upgrade to Pro for
              longer log retention and payload capture.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Create a free account
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Ready to see your API traffic?</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            No sign-up required. Create a toran in seconds.
          </p>
          <Link
            href="/try"
            className="mt-4 inline-block bg-cyan-600 dark:bg-cyan-500 px-6 py-3 text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400"
          >
            Create your first toran
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto mt-20 border-t border-zinc-200 dark:border-zinc-800 px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-zinc-500">
              Live outbound API inspector - see what your code and AI agents actually sent, and why it failed.
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
