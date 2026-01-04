import Link from "next/link";
import { Footer } from "@/components/footer";
import { DEFAULT_LOG_FILTERS } from "@/lib/log-filters";

export default function DefaultsPage() {
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
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Defaults
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            This page describes how toran behaves out of the box. Defaults are intentionally conservative and designed to minimize data collection while preserving debuggability.
          </p>

          <div className="mt-12 space-y-10">
            {/* Read-only by default */}
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Read-only by default
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                toran observes outbound HTTP traffic and does not retry, cache, block, or modify requests or responses.
                Removing toran is always as simple as reverting your base URL.
              </p>
            </section>

            {/* What is never logged */}
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                What is never logged
              </h2>
              <ul className="mt-3 list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2">
                <li>Authorization headers, API keys, or tokens</li>
                <li>Cookie values</li>
                <li>Prompt contents, model internals, or agent reasoning</li>
              </ul>
            </section>

            {/* Log Filters Section */}
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Default Log Filters
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                toran automatically redacts common sensitive fields from logs. Values for these fields are replaced with <code className="text-sm bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">[REDACTED]</code> before being stored.
              </p>

              {/* Request Filters */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-3">
                  Request Headers
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {DEFAULT_LOG_FILTERS.request
                    .filter((f) => f.location === "header")
                    .map((filter) => (
                      <div
                        key={filter.field}
                        className="flex items-center gap-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded"
                      >
                        <code className="text-sky-600 dark:text-sky-400">
                          {filter.field}
                        </code>
                      </div>
                    ))}
                </div>
              </div>

              {/* Response Filters */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-3">
                  Response Headers
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {DEFAULT_LOG_FILTERS.response
                    .filter((f) => f.location === "header")
                    .map((filter) => (
                      <div
                        key={filter.field}
                        className="flex items-center gap-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded"
                      >
                        <code className="text-sky-600 dark:text-sky-400">
                          {filter.field}
                        </code>
                      </div>
                    ))}
                </div>
              </div>
            </section>

            {/* Sensitive headers (off by default) */}
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Sensitive headers (off by default)
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Headers that may identify a person or device are excluded by default and only logged when you explicitly enable them.
              </p>
              <ul className="mt-3 list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2">
                <li>Client IP and forwarded identity headers (for example, <code className="font-mono text-xs">x-forwarded-for</code>)</li>
                <li>User, account, or device identifiers</li>
                <li>Geo or location headers</li>
              </ul>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Customizing sensitive logging defaults is available on authenticated plans.
              </p>
            </section>

            {/* Query Parameters */}
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Query Parameter Values
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                By default, all query parameter <strong>values</strong> are redacted. Parameter names are preserved for debugging, but values are replaced with <code className="text-sm bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">[REDACTED]</code>.
              </p>
              <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <div className="text-sm font-mono">
                  <span className="text-zinc-500">Example:</span>
                  <div className="mt-2 text-zinc-600 dark:text-zinc-400">
                    <span className="text-zinc-400">?</span>
                    <span className="text-sky-600 dark:text-sky-400">api_key</span>
                    <span className="text-zinc-400">=</span>
                    <span className="text-yellow-600 dark:text-yellow-400">[REDACTED]</span>
                    <span className="text-zinc-400">&amp;</span>
                    <span className="text-sky-600 dark:text-sky-400">user_id</span>
                    <span className="text-zinc-400">=</span>
                    <span className="text-yellow-600 dark:text-yellow-400">[REDACTED]</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Body Logging */}
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Request &amp; Response Bodies
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                By default, request and response bodies are <strong>not logged</strong>. You can enable body logging in your toran settings if needed for debugging.
              </p>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                When body logging is enabled, binary responses are automatically base64-encoded.
              </p>
            </section>

            {/* Customization */}
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Customization
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                You can customize these defaults in your toran settings:
              </p>
              <ul className="mt-3 list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2">
                <li>Add filters to redact additional fields</li>
                <li>Remove default filters if you need to log specific fields</li>
                <li>Enable response body logging</li>
              </ul>
            </section>

            {/* Responsibility and control */}
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Responsibility and control
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                You control what traffic is routed through toran and which fields are logged.
                If you enable logging of additional headers or payloads, you are responsible for ensuring that collection and processing complies with applicable laws and third-party terms.
              </p>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                For a broader explanation of how toran processes data, see our <Link href="/privacy" className="text-sky-600 dark:text-sky-400 hover:underline">Privacy Policy</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer className="mt-32" />
    </div>
  );
}
