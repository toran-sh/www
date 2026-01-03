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
│   │   │   ├── verify-claim/route.ts   # Verify claim + link toran to user
│   │   │   ├── clear-session/route.ts
│   │   │   └── logout/route.ts
│   │   ├── trial/
│   │   │   ├── torans/route.ts         # POST - create trial toran
│   │   │   ├── [subdomain]/logs/route.ts # GET - trial logs
│   │   │   └── claim/route.ts          # POST - send claim email
│   │   └── torans/
│   │       ├── route.ts                # GET/POST torans list
│   │       ├── [id]/route.ts           # GET/PUT/DELETE single toran
│   │       └── by-subdomain/[subdomain]/
│   │           ├── logs/route.ts       # GET paginated logs
│   │           └── metrics/route.ts    # GET aggregated metrics
│   ├── dashboard/
│   │   ├── page.tsx                    # Dashboard with toran list
│   │   ├── toran-list.tsx
│   │   ├── add-toran-form.tsx
│   │   ├── logout-button.tsx
│   │   └── session-expired.tsx
│   ├── toran/
│   │   └── [subdomain]/
│   │       ├── layout.tsx              # Toran detail layout with sidebar
│   │       ├── page.tsx                # Metrics dashboard with charts
│   │       ├── logs/page.tsx           # Request logs with streaming
│   │       └── settings/page.tsx       # Settings + delete
│   ├── login/page.tsx                  # Magic link login
│   ├── try/
│   │   ├── page.tsx                    # Trial landing (redirects if logged in)
│   │   ├── create-trial-form.tsx
│   │   └── [subdomain]/
│   │       ├── page.tsx                # Trial logs view with claim CTA
│   │       └── claim-form.tsx
│   ├── layout.tsx
│   └── page.tsx                        # Marketing homepage
├── components/
│   ├── toran-sidebar.tsx               # Left nav (Dashboard, Logs, Settings)
│   ├── theme-provider.tsx
│   └── theme-switcher.tsx
└── lib/
    ├── mongodb.ts                      # MongoDB client
    ├── tokens.ts                       # Session & magic link management
    └── subdomain.ts                    # Subdomain generation
```

## Database (MongoDB)

### Collections

**users**
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "createdAt": "Date"
}
```

**gateways** (stores torans)
```json
{
  "_id": "ObjectId",
  "subdomain": "abc123xyz",
  "upstreamBaseUrl": "https://api.example.com",
  "cacheTtl": 300,
  "user_id": "ObjectId string | null",
  "trial_token": "string | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**claim_tokens** (TTL: 15 min)
```json
{
  "token": "uuid",
  "email": "user@example.com",
  "subdomain": "abc123xyz",
  "trialToken": "string",
  "expiresAt": "Date"
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
  "upstreamMetrics": { "ttfb": 30, "transfer": 10, "total": 45 },
  "cacheStatus": "HIT | MISS",
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

**sessions** (TTL: 7 days, sliding)
```json
{
  "token": "uuid",
  "userId": "ObjectId string (references users._id)",
  "expiresAt": "Date"
}
```

## API Endpoints

### Proxy Endpoints (called by toran-proxy)

**GET /api/[subdomain]/configuration**
- Returns toran config for proxy
- Cache-Control: public, max-age=60
- Response: `{ upstreamBaseUrl, cacheTtl }`

**POST /api/[subdomain]/log**
- Stores request/response logs from proxy (fire-and-forget, doesn't await MongoDB insert)
- Request body: `{ timestamp, request, response, duration, upstreamMetrics?, cacheStatus? }`

### Toran Management (dashboard)

**GET /api/torans** - List user's torans
**POST /api/torans** - Create toran
- Body: `{ upstreamBaseUrl, cacheTtl? }`
- Auto-generates subdomain

**GET /api/torans/[id]** - Get single toran
**PUT /api/torans/[id]** - Update toran
- Body: `{ upstreamBaseUrl, cacheTtl? }`

**DELETE /api/torans/[id]** - Delete toran

**GET /api/torans/by-subdomain/[subdomain]/logs** - Get paginated logs
- Query params: `page`, `limit`, `since` (for streaming)

**GET /api/torans/by-subdomain/[subdomain]/metrics** - Get aggregated metrics
- Query params: `range` (hour|day)

### Authentication

**POST /api/auth/send-magic-link** - Send login email
**GET /api/auth/verify?token=...** - Verify magic link
**GET /api/auth/verify-claim?token=...** - Verify claim, link toran to user, create session
**POST /api/auth/logout** - Clear session
**GET /api/auth/clear-session** - Clear cookie and redirect to login

### Trial (anonymous users)

**POST /api/trial/torans** - Create trial toran (no auth)
- Body: `{ upstreamBaseUrl, cacheTtl? }`
- Sets trial_session cookie
- Creates toran with user_id=null, trial_token set

**GET /api/trial/[subdomain]/logs** - Get logs for trial toran
- Requires trial_session cookie matching toran's trial_token
- Query params: `page`, `limit`, `since`

**POST /api/trial/claim** - Send claim email
- Body: `{ email, subdomain }`
- Requires trial_session cookie
- Sends email with claim link

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `RESEND_API_KEY` | Yes | Resend API key for magic link emails |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL for magic link generation |
| `TURNSTILE_SECRET_KEY` | Yes | Cloudflare Turnstile secret key (server-side) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes | Cloudflare Turnstile site key (client-side) |

## Toran Configuration

Each toran has:
- **subdomain**: Auto-generated unique identifier (8-10 alphanumeric)
- **upstreamBaseUrl**: Target API URL to proxy to
- **cacheTtl**: Optional, seconds to cache upstream responses (null = no caching)

## Key Implementation Details

- **Magic link auth**: Passwordless via Resend email service
- **User management**: findOrCreateUser creates user on first login, returns ObjectId
- **Multi-tenant**: Torans scoped by user_id (ObjectId string)
- **Subdomain routing**: Unique subdomain per toran
- **Cache-Control**: Config endpoint returns 60s cache header for proxy
- **Async logging**: Log endpoint doesn't await MongoDB insert (fire-and-forget)
- **camelCase consistency**: API and DB both use camelCase (cacheTtl, not cache_ttl)
- **Streaming logs**: Logs page auto-refreshes with `since` param for efficiency
- **Session handling**: SessionExpired component redirects to clear-session route
- **Metrics dashboard**: Uses Recharts for time-series visualization
- **Trial flow**: Anonymous users can create torans via /try, claim them via email to link to account

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- MongoDB
- Tailwind CSS 4
- Recharts (charts)
- Resend (email)
- Vitest (testing)
