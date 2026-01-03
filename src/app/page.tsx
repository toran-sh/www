import Link from "next/link";
import { Footer } from "@/components/footer";

const features = [
  {
    title: "Agent Tool Visibility",
    description:
      "Understand what an AI agent or tool actually sent to an upstream API, and how the API responded.",
  },
  {
    title: "Live Request Logs",
    description:
      "Watch API calls as they happen. See method, path, status code, and timing in real-time.",
  },
  {
    title: "Error Detection",
    description:
      "Instantly spot failed requests with status codes and error classification.",
  },
  {
    title: "Requests & Headers",
    description:
      "See method, path + query, status, and headers. Sensitive headers and query values are redacted by default.",
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
          <div className="flex items-center gap-6">
            <Link
              href="/examples"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Examples
            </Link>
            <Link
              href="/login"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Sign in
            </Link>
          </div>
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
            Everything you need to understand requests to a specific API
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

        {/* Trust Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Safe by design</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-semibold">One toran per tool</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Each toran is bound to a single upstream API. Use one toran per tool to inspect behavior independently.
              </p>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-semibold">Saved response replay</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Replay a captured request using a saved response snapshot. No upstream call is made, and live traffic is never affected.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            toran does not inspect prompts, model internals, or agent reasoning. By default, request and response payloads are not logged - payload logging is controlled by rules.
          </p>
        </section>


        {/* How It Works Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">How it works</h2>
          <div className="mt-6 border border-zinc-200 dark:border-zinc-800 p-6">
            <ol className="space-y-4 text-zinc-600 dark:text-zinc-400 list-none">
              <li className="flex gap-3">
                <span className="font-mono text-cyan-600 dark:text-cyan-400">
                  1.
                </span>
                Enter the upstream base URL you want to inspect and get a unique toran URL
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-cyan-600 dark:text-cyan-400">
                  2.
                </span>
                Replace the upstream URL with toran URL in your app config, code, or agent tool settings
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-cyan-600 dark:text-cyan-400">
                  3.
                </span>
                Run your app, tests, or agent and watch outbound requests stream live
              </li>
            </ol>
            <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
              Requests sent via toran pass through it transparently, allowing live inspection as they happen. Sensitive headers and query values are redacted by default.
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
              Each toran is bound to one upstream base URL.
            </p>
          </div>
        </section>

        {/* Still Not Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">What toran is not</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            toran is intentionally narrow. It helps you understand API behavior without becoming part of your system.
          </p>
          <div className="mt-6 border border-zinc-200 dark:border-zinc-800 p-6">
            <ul className="space-y-3 text-zinc-600 dark:text-zinc-400 list-none">
              {[
                "An API gateway or proxy that changes behavior",
                "A full observability or APM platform",
                "Required production infrastructure",
                "A traffic controller that retries, caches, or rate-limits",
              ].map((goal) => (
                <li key={goal} className="flex gap-3">
                  <span className="font-mono text-cyan-600 dark:text-cyan-400">
                    -
                  </span>
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center">
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

      <Footer />
    </div>
  );
}
