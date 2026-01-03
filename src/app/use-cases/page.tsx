import Link from "next/link";
import { Footer } from "@/components/footer";

const useCases = [
  {
    title: "Debug AI Agents",
    description:
      "AI agents make autonomous API calls that are hard to trace. toran shows exactly what your agent sent to each tool and what came back - without modifying agent code.",
    benefits: [
      "See the exact payload your agent constructed",
      "Verify tool responses match expectations",
      "Debug multi-step agent workflows",
      "Catch malformed requests before they cause failures",
    ],
  },
  {
    title: "Understand MCP Tool Calls",
    description:
      "MCP tools abstract outbound HTTP behind agent behavior. toran shows the exact requests and responses each MCP tool produced so you can debug failures and unexpected behavior without instrumenting your agent.",
    benefits: [
      "See the exact HTTP requests an MCP tool made",
      "Inspect responses, status codes, and timing",
      "Debug vendor failures and protocol edge cases",
      "Share precise evidence when reporting issues",
    ],
  },
  {
    title: "Test API Integrations",
    description:
      "When integrating a new API, you need to see what's actually being sent and received. toran gives you instant visibility without adding logging code.",
    benefits: [
      "Verify request format matches API docs",
      "Inspect response structure and status codes",
      "Debug authentication issues",
      "Compare expected vs actual behavior",
    ],
  },
  {
    title: "Monitor Webhooks",
    description:
      "Webhooks are fire-and-forget - when they fail, you often don't know why. Route outbound webhook calls through toran to capture every detail.",
    benefits: [
      "See exactly what payload was sent",
      "Verify delivery and response codes",
      "Debug signature and header issues",
      "Replay failed webhooks with captured data",
    ],
  },
  {
    title: "Troubleshoot Third-Party APIs",
    description:
      "When a vendor API misbehaves, you need proof. toran captures the raw request and response so you can share exactly what happened.",
    benefits: [
      "Document API behavior for support tickets",
      "Identify rate limiting or throttling",
      "Catch unexpected response changes",
      "Compare behavior across environments",
    ],
  },
  {
    title: "Debug SDK Behavior",
    description:
      "SDKs abstract away HTTP details, but sometimes you need to see what's happening underneath. toran reveals the actual API calls your SDK makes.",
    benefits: [
      "Understand SDK request patterns",
      "Verify SDK is using correct endpoints",
      "Debug SDK configuration issues",
      "Identify unnecessary API calls",
    ],
  },
  {
    title: "Validate CI/CD Pipelines",
    description:
      "When your pipeline makes API calls (deployments, notifications, artifact uploads), toran helps you verify they're working correctly.",
    benefits: [
      "Verify deployment API calls succeed",
      "Debug notification delivery issues",
      "Inspect artifact upload requests",
      "Catch pipeline configuration errors",
    ],
  },
];

export default function UseCasesPage() {
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
            href="/login"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Sign in
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Use Cases
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            toran helps you see what&apos;s really happening when your code talks to
            APIs. Here&apos;s how teams use it.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="mt-12 space-y-8">
          {useCases.map((useCase) => (
            <section
              key={useCase.title}
              className="border border-zinc-200 dark:border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold">{useCase.title}</h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                {useCase.description}
              </p>
              <ul className="mt-4 space-y-2">
                {useCase.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 text-zinc-600 dark:text-zinc-400">
                    <span className="font-mono text-sky-600 dark:text-sky-400">
                      -
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <h2 className="text-2xl font-bold">Ready to see your API traffic?</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            No sign-up required. Create a toran in seconds.
          </p>
          <Link
            href="/try"
            className="mt-4 inline-block bg-sky-600 dark:bg-sky-500 px-6 py-3 text-white dark:text-zinc-950 hover:bg-sky-700 dark:hover:bg-sky-400"
          >
            Create your first toran
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
