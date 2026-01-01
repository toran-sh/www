# Toran WWW

Next.js dashboard and API backend for Toran - the API Accelerator & Debugger.

## Architecture

Two separate applications work together:
- **toran-www**: This repo - Next.js dashboard & API
- **toran-proxy**: Edge proxy that calls this API

## Commands

```bash
npm run dev    # Development server
npm run build  # Production build
npm run start  # Start production server
npm run test   # Run tests
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── [subdomain]/
│   │   │   ├── configuration/route.ts  # GET - proxy fetches config here
│   │   │   └── log/route.ts            # POST - proxy sends logs here
│   │   ├── auth/
│   │   │   ├── send-magic-link/route.ts
│   │   │   ├── verify/route.ts
│   │   │   └── logout/route.ts
│   │   └── gateways/
│   │       ├── route.ts                # GET/POST gateways list
│   │       └── [id]/route.ts           # GET/PUT/DELETE single gateway
│   ├── dashboard/
│   │   ├── page.tsx                    # Dashboard with gateway management
│   │   ├── gateway-list.tsx
│   │   ├── add-gateway-form.tsx
│   │   ├── edit-gateway-modal.tsx
│   │   ├── delete-confirm-modal.tsx
│   │   └── logout-button.tsx
│   ├── login/page.tsx                  # Magic link login
│   ├── layout.tsx
│   └── page.tsx                        # Marketing homepage
├── components/
│   ├── theme-provider.tsx
│   └── theme-switcher.tsx
└── lib/
    ├── mongodb.ts                      # MongoDB client
    ├── tokens.ts                       # Session & magic link management
    └── subdomain.ts                    # Subdomain generation
```

## Database (MongoDB)

### Collections

**gateways**
```json
{
  "_id": "ObjectId",
  "subdomain": "abc123xyz",
  "upstreamBaseUrl": "https://api.example.com",
  "cacheTtl": 300,
  "user_id": "user@example.com",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**logs**
```json
{
  "_id": "ObjectId",
  "subdomain": "abc123xyz",
  "timestamp": "ISO string",
  "request": { "method": "GET", "path": "/", "query": {}, "headers": {}, "body": null },
  "response": { "status": 200, "headers": {}, "bodySize": 123 },
  "duration": 45,
  "createdAt": "Date"
}
```

**magic_links** (TTL: 15 min)
```json
{
  "token": "uuid",
  "email": "user@example.com",
  "expiresAt": "Date"
}
```

**sessions** (TTL: 7 days)
```json
{
  "token": "uuid",
  "email": "user@example.com",
  "expiresAt": "Date"
}
```

## API Endpoints

### Proxy Endpoints (called by toran-proxy)

**GET /api/[subdomain]/configuration**
- Returns gateway config for proxy
- Cache-Control: public, max-age=60
- Response: `{ upstreamBaseUrl, cacheTtl }`

**POST /api/[subdomain]/log**
- Stores request/response logs from proxy
- Request body: `{ timestamp, request, response, duration }`

### Gateway Management (dashboard)

**GET /api/gateways** - List user's gateways
**POST /api/gateways** - Create gateway
- Body: `{ upstreamBaseUrl, cacheTtl? }`
- Auto-generates subdomain

**GET /api/gateways/[id]** - Get single gateway
**PUT /api/gateways/[id]** - Update gateway
- Body: `{ upstreamBaseUrl, cacheTtl? }`

**DELETE /api/gateways/[id]** - Delete gateway

### Authentication

**POST /api/auth/send-magic-link** - Send login email
**GET /api/auth/verify?token=...** - Verify magic link
**POST /api/auth/logout** - Clear session

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `RESEND_API_KEY` | Yes | Resend API key for magic link emails |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL for magic link generation |

## Gateway Configuration

Each gateway has:
- **subdomain**: Auto-generated unique identifier (8-10 alphanumeric)
- **upstreamBaseUrl**: Target API URL to proxy to
- **cacheTtl**: Optional, seconds to cache upstream responses (null = no caching)

## Key Implementation Details

- **Magic link auth**: Passwordless via Resend email service
- **Multi-tenant**: Gateways scoped by user_id (email)
- **Subdomain routing**: Unique subdomain per gateway
- **Cache-Control**: Config endpoint returns 60s cache header for proxy
- **camelCase consistency**: API and DB both use camelCase (cacheTtl, not cache_ttl)

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- MongoDB
- Tailwind CSS 4
- Resend (email)
- Vitest (testing)
