/**
 * Getting Started Documentation
 */

import Link from 'next/link';

export default function GettingStarted() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <nav className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            ← Back to Home
          </Link>
        </nav>

        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 prose prose-blue max-w-none">
          <h1>Getting Started with Toran</h1>

          <p className="lead">
            Learn how to set up and deploy your first API gateway in minutes.
          </p>

          <h2>Prerequisites</h2>
          <ul>
            <li>Node.js 18+ and npm 9+</li>
            <li>MongoDB Atlas account (free tier works)</li>
            <li>Cloudflare account</li>
          </ul>

          <h2>Step 1: Set Up MongoDB</h2>
          <p>
            Create a MongoDB Atlas cluster and enable the Data API. Follow the
            instructions in{' '}
            <code>docs/mongodb-setup.md</code> to create the required
            collections and indexes.
          </p>

          <pre>
            {`# Create collections
db.createCollection("gateways");
db.createCollection("routes");
db.createCollection("logs");

# Create indexes
db.gateways.createIndex({ subdomain: 1 }, { unique: true });
db.routes.createIndex({ gatewayId: 1, priority: -1 });
db.logs.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });`}
          </pre>

          <h2>Step 2: Configure Environment Variables</h2>
          <p>Set up your Cloudflare Worker secrets:</p>

          <pre>
            {`# Using Wrangler CLI
wrangler secret put MONGODB_API_URL
# Paste: https://data.mongodb-api.com/app/<APP-ID>/endpoint/data/v1

wrangler secret put MONGODB_API_KEY
# Paste: your-api-key-here

wrangler secret put MONGODB_DATABASE
# Paste: toran`}
          </pre>

          <h2>Step 3: Create Your First Gateway</h2>
          <p>Insert a test gateway into MongoDB:</p>

          <pre>
            {`db.gateways.insertOne({
  subdomain: "api",
  name: "Production API",
  description: "Main API gateway",
  baseUrl: "https://api.example.com",
  active: true,
  variables: {
    API_KEY: {
      value: "your-api-key",
      secret: true,
      description: "API authentication key"
    },
    BASE_URL: {
      value: "https://api.example.com",
      secret: false,
      description: "API base URL"
    }
  },
  defaults: {
    timeout: 30000,
    followRedirects: true,
    cacheEnabled: false,
    logLevel: "full"
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  stats: {
    totalRequests: 0,
    totalRoutes: 0,
    lastRequestAt: null
  }
});`}
          </pre>

          <h2>Step 4: Create a Route</h2>
          <p>Add a route to your gateway:</p>

          <pre>
            {`db.routes.insertOne({
  gatewayId: ObjectId("your-gateway-id"),
  path: "/users/:id",
  method: ["GET"],
  priority: 100,
  active: true,

  destination: {
    type: "proxy",
    url: "\${BASE_URL}/v1/users/\${params.id}",
    preservePath: false
  },

  parameters: {
    id: {
      type: "uuid",
      required: true,
      description: "User ID"
    }
  },

  preMutations: {
    headers: [{
      type: "add",
      key: "X-API-Key",
      value: "\${variables.API_KEY}"
    }]
  },

  postMutations: {
    headers: [{
      type: "add",
      key: "X-Gateway",
      value: "Toran"
    }]
  },

  cache: {
    enabled: true,
    ttl: 300,
    varyBy: {
      path: true,
      method: true,
      queryParams: [],
      headers: [],
      body: false
    },
    conditions: {
      statusCodes: [200]
    }
  },

  name: "Get User by ID",
  description: "Fetch user details",
  tags: ["users"],
  createdAt: new Date(),
  updatedAt: new Date(),
  stats: {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgDuration: 0,
    lastRequestAt: null
  }
});`}
          </pre>

          <h2>Step 5: Deploy the Worker</h2>
          <pre>
            {`# Deploy to Cloudflare Workers
npm run deploy:worker

# Your gateway will be available at:
# https://api.toran.dev/users/123`}
          </pre>

          <h2>Step 6: Test Your Gateway</h2>
          <p>Make a request to your gateway:</p>

          <pre>
            {`curl https://api.toran.dev/users/123

# Response headers will include:
# X-Toran-Gateway: api
# X-Toran-Route: Get User by ID
# X-Toran-Cache: MISS (first request)
# X-Gateway: Toran (from post-mutation)`}
          </pre>

          <h2>Next Steps</h2>
          <ul>
            <li>
              <strong>Deploy Admin UI</strong>: Manage gateways and routes
              visually
            </li>
            <li>
              <strong>Add More Routes</strong>: Configure different paths and
              methods
            </li>
            <li>
              <strong>Set Up Mutations</strong>: Transform requests and
              responses
            </li>
            <li>
              <strong>Monitor Logs</strong>: Track requests and performance
            </li>
          </ul>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 not-prose">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Need Help?
            </h3>
            <p className="text-blue-800">
              Check out the full documentation or open an issue on GitHub.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
