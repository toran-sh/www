import Link from "next/link";
import { Footer } from "@/components/footer";

const popularApis = [
  {
    name: "Stripe",
    description: "Swap the base URL where your Stripe client is configured.",
    places: "Common places: environment config, HTTP client wrapper, agent tool base URL.",
  },
  {
    name: "OpenAI",
    description: "Swap the base URL in your OpenAI client/tool configuration.",
    places: "Common places: tool definition base URL, SDK baseURL, proxy/base URL setting.",
  },
  {
    name: "GitHub",
    description: "Swap the API base URL for REST calls.",
    places: "Common places: API client config, env var, agent tool base URL.",
  },
  {
    name: "Twilio",
    description: "Swap the base URL for outbound Twilio HTTP calls.",
    places: "Common places: HTTP client layer, service wrapper, agent tool base URL.",
  },
  {
    name: "Slack",
    description: "Swap the Slack Web API base URL where requests are constructed.",
    places: "Common places: HTTP client config, wrapper service, agent tool base URL.",
  },
];

const codeExamples = [
  {
    language: "Node.js",
    code: `const BASE_URL = "https://<toran_id>.toran.sh";

const response = await fetch(\`\${BASE_URL}/v1/endpoint\`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data: "..." }),
});`,
  },
  {
    language: "Python",
    code: `import requests

BASE_URL = "https://<toran_id>.toran.sh"

response = requests.post(
    f"{BASE_URL}/v1/endpoint",
    json={"data": "..."}
)`,
  },
  {
    language: "Go",
    code: `baseURL := "https://<toran_id>.toran.sh"

resp, err := http.Post(
    baseURL+"/v1/endpoint",
    "application/json",
    bytes.NewBuffer(jsonData),
)`,
  },
  {
    language: "curl",
    code: `BASE_URL="https://<toran_id>.toran.sh"

curl -X POST "$BASE_URL/v1/endpoint" \\
  -H "Content-Type: application/json" \\
  -d '{"data": "..."}'`,
  },
];

export default function ExamplesPage() {
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Examples
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Replace one upstream base URL with your toran URL. No SDKs, agents,
            or logging setup.
          </p>
        </div>

        {/* Section A: Universal pattern */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">The universal pattern</h2>
          <div className="mt-6 border border-zinc-200 dark:border-zinc-800 p-6">
            <pre className="bg-zinc-100 dark:bg-zinc-900 p-4 text-sm font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto">
              <code>
{`Before: https://api.vendor.com
After:  https://<toran_id>.toran.sh`}
              </code>
            </pre>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              You can make this change in app config, an SDK/client
              configuration, or agent tool settings.
            </p>
          </div>
        </section>

        {/* Section B: Popular APIs */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Popular APIs</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Where teams usually swap the base URL.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {popularApis.map((api) => (
              <div
                key={api.name}
                className="border border-zinc-200 dark:border-zinc-800 p-6"
              >
                <h3 className="font-semibold text-lg">{api.name}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {api.description}
                </p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                  {api.places}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section C: Popular languages */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Popular languages (minimal examples)</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            These examples only show the base URL change.
          </p>
          <div className="mt-6 border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
            {codeExamples.map((example) => (
              <div key={example.language}>
                <h3 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                  {example.language}
                </h3>
                <pre className="bg-zinc-100 dark:bg-zinc-900 p-4 text-sm font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                  <code>{example.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Section D: Agents */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold">Agents and tools</h2>
          <div className="mt-6 border border-zinc-200 dark:border-zinc-800 p-6">
            <ul className="space-y-3 text-zinc-600 dark:text-zinc-400 list-none">
              <li className="flex gap-3">
                <span className="font-mono text-cyan-600 dark:text-cyan-400">-</span>
                Set the tool's base URL to your toran URL.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-cyan-600 dark:text-cyan-400">-</span>
                Run the agent. Watch tool calls stream live.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-cyan-600 dark:text-cyan-400">-</span>
                Change it back when you're done — fully reversible.
              </li>
            </ul>
            <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
              toran is read-only by design: no request/response mutation, no
              retries, no caching.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <Link
            href="/try"
            className="inline-block bg-cyan-600 dark:bg-cyan-500 px-6 py-3 text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400"
          >
            Create your first toran
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
