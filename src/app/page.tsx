import Link from "next/link";

const features = [
  {
    title: "Request/Response Mutations",
    description: "Modify headers, query parameters, and body content using JSON mapping, JSONPath, templates, or custom JavaScript functions.",
  },
  {
    title: "Intelligent Caching",
    description: "Cache responses with flexible configuration options (path, method, headers, query params, body) and automatic TTL expiration.",
  },
  {
    title: "Gateway Variables",
    description: "Store API keys, base URLs, and secrets at the gateway level for template-based reference in routes.",
  },
  {
    title: "Path Parameters",
    description: "Support dynamic routes with parameters (/users/:id) and wildcards (/api/*) for value extraction in mutations.",
  },
  {
    title: "Conditional Mutations",
    description: "Apply mutations based on header values, query parameters, request paths, HTTP methods, or response status codes.",
  },
  {
    title: "Full Observability",
    description: "Comprehensive logging with execution breakdown, timing analysis, cache tracking, and mutation counts.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold text-cyan-600 dark:text-cyan-400">
            <img src="/logo.png" alt="toran" className="h-6 w-6" />
            toran
          </div>
          <Link
            href="/login"
            className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            API Accelerator & Debugger as a{" "}
            <span className="text-cyan-600 dark:text-cyan-400">Service</span>
          </h1>
          <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
            Transform, cache, and route API requests with powerful mutations.
            Built on Cloudflare Workers for global edge performance.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="bg-cyan-600 dark:bg-cyan-500 px-6 py-3 text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400"
            >
              Get Started Free
            </Link>
            <a
              href="#features"
              className="border border-zinc-300 dark:border-zinc-700 px-6 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32">
          <h2 className="text-2xl font-bold">Features</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Everything you need to manage and transform your API traffic
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="border border-zinc-200 dark:border-zinc-800 p-6"
              >
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="mt-32">
          <h2 className="text-2xl font-bold">Use Cases</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-semibold">Auth Header Injection</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Automatically inject authentication headers from gateway variables.
              </p>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-semibold">Request Transformation</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Transform request bodies for legacy API compatibility.
              </p>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-semibold">Response Filtering</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Filter response data using JSONPath expressions.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-32">
          <h2 className="text-2xl font-bold">Ready to get started?</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Join developers using toran to power their API integration.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block bg-cyan-600 dark:bg-cyan-500 px-6 py-3 text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400"
          >
            Start Building Now
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto mt-32 border-t border-zinc-200 dark:border-zinc-800 px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-sm text-zinc-500">
            Built with Cloudflare Workers, MongoDB, and React
          </div>
          <div className="text-sm text-zinc-500">
            toran - API Accelerator & Debugger
          </div>
        </div>
      </footer>
    </div>
  );
}
