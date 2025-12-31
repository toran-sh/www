/**
 * toran.dev - Landing Page
 */

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              API Gateway as a Service
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Transform, cache, and route API requests with powerful mutations.
              Built on Cloudflare Workers for global edge performance.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/docs/getting-started"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Get Started
              </Link>
              <Link
                href="https://github.com/yourusername/toran"
                className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                View on GitHub
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Request/Response Mutations"
              description="Transform headers, query parameters, and body with 4 strategies: JSON mapping, JSONPath, templates, or custom JavaScript functions."
              icon="🔄"
            />
            <FeatureCard
              title="Intelligent Caching"
              description="Cache responses with flexible vary-by configuration (path, method, headers, query params, body). Automatic TTL expiration."
              icon="⚡"
            />
            <FeatureCard
              title="Gateway Variables"
              description="Store API keys, base URLs, and secrets at the gateway level. Reference them in routes with template syntax."
              icon="🔑"
            />
            <FeatureCard
              title="Path Parameters"
              description="Define dynamic routes with parameters (/users/:id) and wildcards (/api/*). Extract values for use in mutations."
              icon="🛤️"
            />
            <FeatureCard
              title="Conditional Mutations"
              description="Apply mutations based on conditions: header values, query params, request path, HTTP method, or response status."
              icon="🎯"
            />
            <FeatureCard
              title="Full Observability"
              description="Detailed logs with execution breakdown, timing analysis, cache hit/miss tracking, and mutation counts."
              icon="📊"
            />
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Common Use Cases
          </h2>

          <div className="space-y-6">
            <UseCase
              title="Add Authentication Headers"
              description="Inject API keys or tokens from gateway variables into proxied requests"
              code={`{
  "type": "add",
  "key": "Authorization",
  "value": "Bearer \${variables.API_KEY}"
}`}
            />
            <UseCase
              title="Transform Request Body"
              description="Rename fields for legacy API compatibility using JSON mapping"
              code={`{
  "type": "json-map",
  "jsonMap": {
    "firstName": "user.first_name",
    "email": "user.email_address"
  }
}`}
            />
            <UseCase
              title="Filter Response Data"
              description="Extract specific fields from response using JSONPath"
              code={`{
  "type": "json-path",
  "jsonPath": {
    "expression": "$.data.users[*].name",
    "target": "userNames"
  }
}`}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to transform your APIs?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Deploy your first gateway in minutes
          </p>
          <Link
            href="/docs/getting-started"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <p>
            Built with ❤️ by the toran.dev team.
            and React.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function UseCase({
  title,
  description,
  code,
}: {
  title: string;
  description: string;
  code: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
        {code}
      </pre>
    </div>
  );
}
