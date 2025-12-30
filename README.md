# Toran - High-Performance Reverse Proxy

A high-performance reverse proxy service built on Cloudflare Workers with a React admin dashboard. Map subdomains under `*.toran.dev` to any destination server with full request/response logging.

## Features

- **Reverse Proxy**: Forward requests from `*.toran.dev` subdomains to any destination
- **Full Transparency**: All headers, query params, and request bodies are forwarded
- **Request/Response Logging**: Complete logging of all proxied requests
- **Admin Dashboard**: React webapp for managing subdomain mappings and viewing logs
- **High Performance**: Cloudflare Workers edge computing with optional KV caching
- **MongoDB Storage**: Flexible storage for mappings and logs

## Architecture

```
Client Request → *.toran.dev
                     ↓
            Cloudflare Worker
                     ↓
         Parse subdomain → Query MongoDB → Forward to destination
                     ↓                           ↓
         Log request/response (async)     Return response to client
```

## Project Structure

```
toran/
├── worker/          # Cloudflare Worker (TypeScript)
├── webapp/          # Admin dashboard (React + TypeScript)
├── shared/          # Shared TypeScript types
└── README.md
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
