# Toran API Gateway

**API Gateway as a Service** built on Cloudflare Workers with MongoDB, offering powerful request/response mutations, intelligent caching, and full observability.

## Features

### 🔄 Request/Response Mutations
- **Header Mutations**: Add, set, remove, rename headers
- **Query Parameter Mutations**: Transform URL parameters
- **Body Mutations**: 4 transformation strategies
  - JSON Mapping: Simple field renaming
  - JSONPath: Complex data extraction
  - Templates: String templates with variables
  - JavaScript Functions: Custom transformation logic
- **Conditional Mutations**: Apply based on headers, query params, path, method, or status

### ⚡ Intelligent Caching
- Flexible vary-by configuration (path, method, headers, query, body)
- Automatic TTL expiration via Cloudflare KV
- Cache hit/miss tracking
- Conditional caching (status codes, body size)
- Pattern-based invalidation

### 🛤️ Advanced Routing
- Path parameters (`/users/:id`)
- Wildcard routes (`/api/*`)
- Priority-based matching
- Method-specific routes
- Config flattening with KV caching (1-hour TTL)

### 🔑 Gateway Variables
- Store API keys, base URLs, secrets
- Reference in mutations with `${variables.API_KEY}`
- Secret masking in UI and logs

### 📊 Full Observability
- Detailed request/response logs
- Execution timing breakdown
- Mutation counts tracking
- Cache hit/miss analytics
- 30-day log retention with auto-deletion

## Architecture

```
Client → subdomain.toran.dev
            ↓
    Cloudflare Worker Pipeline:
    1. Parse subdomain
    2. Load gateway (KV cached)
    3. Match route (regex)
    4. Check cache → return on hit
    5. Apply pre-mutations
    6. Proxy request
    7. Apply post-mutations
    8. Store in cache
    9. Log execution
    10. Return response
```

## Project Structure

```
toran/
├── worker/          # Cloudflare Worker (gateway engine)
├── admin/           # Admin UI (Cloudflare Pages)
├── marketing/       # Marketing site (Next.js)
├── shared/          # Shared TypeScript types
└── docs/            # Documentation
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Cloudflare account with Workers enabled
- MongoDB Atlas account (free tier works)
- Domain configured in Cloudflare (toran.dev)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB Atlas

1. Create a MongoDB Atlas cluster
2. Create database: `toran`
3. Create collections: `mappings` and `logs`
4. Enable Data API:
   - Go to Data API section in Atlas
   - Enable Data API
   - Generate an API key
   - Copy the API URL
5. Configure IP whitelist: Add `0.0.0.0/0` (allow Cloudflare Workers)

### 3. Configure Worker Secrets

```bash
cd worker
wrangler secret put MONGODB_API_URL
# Paste: https://data.mongodb-api.com/app/your-app-id/endpoint/data/v1

wrangler secret put MONGODB_API_KEY
# Paste your MongoDB Data API key

wrangler secret put MONGODB_DATABASE
# Enter: toran
```

### 4. Deploy Worker

```bash
npm run deploy:worker
```

### 5. Deploy Admin Webapp

```bash
npm run deploy:webapp
```

## Development

### Run Worker Locally

```bash
npm run dev:worker
```

The worker will be available at `http://localhost:8787`

### Run Webapp Locally

```bash
npm run dev:webapp
```

The webapp will open at `http://localhost:3000`

## Configuration

### Worker Configuration

Edit `worker/wrangler.toml` to configure routes:

```toml
routes = [
  { pattern = "*.toran.dev/*", zone_name = "toran.dev" }
]
```

### MongoDB Schema

#### Mappings Collection

```typescript
{
  subdomain: "api",                    // Subdomain to match
  destinationUrl: "https://api.example.com",
  active: true,                        // Enable/disable mapping
  preservePath: true,                  // Forward path to destination
  metadata: {
    name: "Production API",
    description: "Main API server",
    tags: ["production", "api"]
  }
}
```

#### Logs Collection

```typescript
{
  subdomain: "api",
  request: { method, url, headers, body, ... },
  response: { status, headers, body, ... },
  timing: { startedAt, completedAt, duration },
  error: { message, type }  // Optional
}
```

## Usage

### Creating a Mapping

1. Open the admin dashboard
2. Navigate to "Mappings" → "Create New"
3. Enter subdomain (e.g., "api")
4. Enter destination URL (e.g., "https://api.example.com")
5. Fill in metadata (name, description, tags)
6. Click "Create"

### Using the Proxy

Once a mapping is created:

```bash
# Request to subdomain
curl https://api.toran.dev/users

# Gets proxied to
https://api.example.com/users
```

All headers, query parameters, and request bodies are forwarded to the destination.

### Viewing Logs

1. Open the admin dashboard
2. Navigate to "Logs"
3. Use filters to find specific requests:
   - Filter by subdomain
   - Filter by date range
   - Filter by status code
   - Search by URL or IP

## Performance

- **Proxy Latency**: < 50ms overhead (excluding destination response time)
- **MongoDB Query**: < 20ms (< 1ms with KV caching enabled)
- **Logging**: Asynchronous, zero impact on response time
- **Scalability**: Automatic scaling via Cloudflare Workers

## Security

- Destination URLs are validated (HTTPS only)
- Sensitive headers (Authorization, Cookie) are sanitized from logs
- Admin dashboard requires authentication
- MongoDB credentials stored as Cloudflare secrets
- Rate limiting via Cloudflare dashboard

## Monitoring

- **Worker Analytics**: View in Cloudflare dashboard
- **Request Logs**: Stored in MongoDB for historical analysis
- **Live Logs**: Use `wrangler tail` for real-time logging

```bash
cd worker
wrangler tail
```

## Troubleshooting

### Worker not receiving requests

1. Verify domain is added to Cloudflare
2. Check routes in `wrangler.toml`
3. Ensure SSL/TLS is set to "Full" or "Full (Strict)"

### MongoDB connection errors

1. Verify API URL and API key are correct
2. Check IP whitelist includes `0.0.0.0/0`
3. Ensure Data API is enabled in MongoDB Atlas
4. Verify database name is correct

### Mapping not working

1. Check mapping is marked as `active: true`
2. Verify subdomain matches exactly (case-sensitive)
3. Check destination URL is valid and accessible
4. View logs for error details

## Contributing

This is a private project. For questions or issues, contact the development team.

## License

Proprietary - All rights reserved
