# Toran WWW - Admin Panel & API

Admin panel and API for Toran API Gateway. Manages MongoDB, writes flattened configs to KV, and receives logs from the proxy.

**Note**: The proxy is now in a separate repository: [toran-proxy](https://github.com/kxbnb/toran-proxy)

## 🎯 What is Toran?

Toran allows you to create and manage custom subdomains (e.g., `api.toran.dev`, `staging.toran.dev`) that act as gateways to your backend services. Each subdomain is a fully managed reverse proxy with:

- **Auto-generated subdomains** (8-12 character random strings)
- **Path preservation** - Requests to `xyz.toran.dev/users/123` forward to `your-backend.com/users/123`
- **Request/response logging** with detailed analytics
- **Magic link authentication** for the admin panel
- **Dark/light/system theme** support

## 📁 Project Structure

```
toran-www/
├── src/                # React frontend source
│   ├── components/      # React components (Layout, Dashboard, etc.)
│   ├── pages/           # Page components (Login, AuthVerify)
│   ├── hooks/           # React hooks (useAuth, useTheme)
│   └── index.css        # Theme system with CSS variables
│
├── public/             # Static assets (logo, favicons, etc.)
│
├── api/                # Vercel API Routes (serverless functions)
│   ├── auth/            # Magic link authentication endpoints
│   ├── gateways.ts      # Gateway CRUD + Redis write
│   ├── logs.ts          # Receive logs from proxy
│   ├── gateway-config/  # Gateway config API
│   └── utils/           # Shared utilities (MongoDB, Redis, etc.)
│
├── shared/             # Shared TypeScript types
│   └── src/types.ts     # Gateway, Route, Log types
│
├── scripts/            # Setup and utility scripts
│   ├── setup-mongodb.js # Initialize MongoDB collections
│   └── seed-data.js     # Seed sample data
│
├── dist/               # Build output (gitignored)
├── index.html          # Entry HTML file
├── vite.config.ts      # Vite configuration
└── vercel.json         # Vercel deployment config
```

**Proxy Repository**: [toran-proxy](https://github.com/kxbnb/toran-proxy) - Separate stateless worker

## 🚀 How It Works

### Request Flow

```
User Request → xyz.toran.dev
       ↓
[Cloudflare Worker - Proxy]
       ↓
1. Extract subdomain: "xyz"
2. Fetch gateway config from KV (Redis-like storage)
3. Forward request to destination URL
4. Send log to WWW API endpoint
5. Return response to user
```

### Architecture Components

1. **Proxy Worker** (`*.toran.dev`)
   - Lightweight, stateless reverse proxy
   - Reads gateway configs from KV only (no database access)
   - Performs reverse proxying with path preservation
   - Sends logs to WWW logging endpoint via HTTP POST
   - Dependencies: KV namespace only

2. **WWW (Admin + API)** (`admin.toran.dev`)
   - Manages gateway configurations (create, view, delete)
   - Writes flattened configs to Redis on create/update
   - Receives logs from proxy via POST /api/logs
   - Magic link authentication (passwordless)
   - Request logs viewer with analytics
   - Dark/light mode theming
   - Responsive UI

3. **Redis Storage**
   - Key format: `gateway:config:{subdomain}`
   - Value: Flattened gateway configuration (JSON)
   - Shared between Proxy (read) and WWW (write)
   - No expiration (configs persist until deleted)

4. **MongoDB Database** (WWW only)
   - `gateways` collection: Gateway configurations
   - `routes` collection: Route definitions with mutations
   - `logs` collection: Request/response logs (30-day TTL)
   - `magic_links` collection: Auth tokens (15-minute TTL)
   - `sessions` collection: User sessions (24-hour inactivity TTL)

## 🛠️ Tech Stack

### Proxy
- **Runtime**: Cloudflare Workers (Edge compute)
- **Language**: TypeScript
- **Storage**: Cloudflare KV (gateway configs, read-only)
- **Dependencies**: None (no database, no external APIs except WWW logging)

### WWW (Admin + API)
- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **Styling**: CSS Custom Properties (theme system)
- **Build**: Vite 7
- **Hosting**: Vercel
- **API**: Vercel Serverless Functions
- **Database**: MongoDB Atlas (via standard driver)
- **Storage**: Redis (gateway configs, read-write)
- **Auth**: Magic link via Resend

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas account
- Redis instance (Upstash, Redis Cloud, or self-hosted)
- Vercel account
- Resend account (for email)

### 1. Clone and Install

```bash
git clone <repository>
cd toran
npm install
```

### 2. Set Up MongoDB

```bash
# Initialize MongoDB collections and indexes
npm run setup:mongodb

# Optionally seed sample data
npm run seed:data
```

### 3. Configure Environment Variables

#### WWW (Vercel environment variables)
Set these in your Vercel project dashboard or via `.env.local` for local development:

- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DATABASE` - Database name (default: toran)
- `RESEND_API_KEY` - Resend API key for magic link emails
- `REDIS_URL` - Redis connection string (e.g., `redis://default:password@host:port`)
- `APP_URL` - (Optional) Admin panel URL - auto-detected from request if not set

#### Proxy (separate repository)
See [toran-proxy](https://github.com/kxbnb/toran-proxy) for proxy configuration instructions.

### 4. Deploy

```bash
# Deploy WWW (admin panel + API)
npm run deploy
```

**Proxy Deployment**: See [toran-proxy](https://github.com/kxbnb/toran-proxy) repository

## 🎮 Usage

### Creating a Gateway (Subdomain)

1. Log in to admin panel: https://admin.toran.dev
2. Enter your email → receive magic link
3. Click "Create New Mapping"
4. Fill in:
   - **Destination URL**: Your backend URL (e.g., `https://api.example.com`)
   - **Name**: Human-readable name (e.g., "Production API")
   - **Description**: Optional description
   - **Tags**: Optional comma-separated tags
5. Click "Create Mapping"
6. Your subdomain is auto-generated (e.g., `xyz123abc.toran.dev`)

### Using Your Gateway

```bash
# Original backend:
curl https://api.example.com/users

# Via Toran gateway:
curl https://xyz123abc.toran.dev/users

# Path is preserved:
curl https://xyz123abc.toran.dev/users/123?filter=active
# → Proxies to: https://api.example.com/users/123?filter=active
```

### Viewing Logs

1. Go to "Logs" in admin panel
2. Filter by:
   - Subdomain
   - Date range
   - Status code
   - Method
3. Click any log to see full request/response details

## 🔐 Authentication

### Magic Link Flow

1. User enters email on `/login`
2. System generates secure token (32 bytes random)
3. Email sent via Resend with magic link
4. User clicks link → `/auth/verify?token=xxx`
5. Token validated, session created (24-hour expiry)
6. HTTP-only cookie set with session ID
7. User redirected to dashboard

### Security Features

- ✅ Tokens expire after 15 minutes
- ✅ Tokens are single-use (deleted after verification)
- ✅ Sessions expire after 24 hours of inactivity
- ✅ HTTP-only cookies (not accessible via JavaScript)
- ✅ Secure flag (HTTPS only)
- ✅ SameSite=Lax (allows magic links from email)

## 🎨 Theme System

The admin panel supports three theme modes:

- **Light Mode**: Traditional light theme
- **Dark Mode**: Dark gray/black backgrounds
- **System**: Auto-detects OS preference and updates in real-time

Themes use CSS custom properties for seamless switching:
```css
/* Light theme */
--bg-primary: #ffffff
--text-primary: #111827

/* Dark theme */
--bg-primary: #111827
--text-primary: #f9fafb
```

Theme preference is saved to localStorage and accessible via floating widget in bottom-right corner.

## 📊 MongoDB Schema

### Gateways Collection
```typescript
{
  _id: ObjectId,
  subdomain: string,              // "xyz123abc"
  destinationUrl: string,         // "https://api.example.com"
  name: string,                   // "Production API"
  description: string,
  tags: string[],
  active: boolean,                // Always true
  preservePath: boolean,          // Always true
  metadata: {
    ipAddress: string,
    userAgent: string,
    createdBy: string             // Email
  },
  stats: {
    totalRequests: number,
    lastRequestAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Logs Collection (30-day TTL)
```typescript
{
  _id: ObjectId,
  subdomain: string,
  request: {
    method: string,
    url: string,
    headers: Record<string, string>,
    body: string,                 // Truncated to 10KB
    timestamp: Date
  },
  response: {
    status: number,
    headers: Record<string, string>,
    body: string,                 // Truncated to 10KB
    timestamp: Date
  },
  duration: number,               // Milliseconds
  error: string?,
  createdAt: Date,
  expiresAt: Date                 // Auto-delete after 30 days
}
```

### Sessions Collection (24-hour inactivity TTL)
```typescript
{
  _id: ObjectId,
  sessionId: string,              // Random 64-char hex
  email: string,
  createdAt: Date,
  lastActivity: Date              // Updated on each request
}
```

### Magic Links Collection (15-minute TTL)
```typescript
{
  _id: ObjectId,
  email: string,
  token: string,                  // Random 64-char hex
  createdAt: Date,
  expiresAt: Date                 // 15 minutes from creation
}
```

## 🔧 Development

### Local Development

```bash
# Start WWW (admin panel + API) locally
npm run dev
```

**Proxy Development**: See [toran-proxy](https://github.com/kxbnb/toran-proxy) repository

### Project Scripts

```bash
npm run dev                 # Start WWW dev server
npm run deploy              # Deploy WWW to Cloudflare Pages
npm run build               # Build all workspaces
npm run setup:mongodb       # Initialize MongoDB collections
npm run seed:data           # Seed sample gateway data
npm run setup:all           # Run all setup scripts
```

## 🌐 Deployment

### WWW Deployment

**Via Manual Deploy:**
```bash
npm run deploy
```

**Via GitHub Integration (Recommended):**
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Build command: `npm run build`
   - Build output: `/dist`
   - Root directory: `/`
3. Set environment variables in Vercel dashboard
4. Push to main branch → auto-deploy

### Proxy Deployment

See [toran-proxy](https://github.com/kxbnb/toran-proxy) repository for proxy deployment instructions.

### Environment Variables

Required environment variables for Vercel deployment:
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DATABASE` - Database name (default: toran)
- `RESEND_API_KEY` - Resend API key for magic link emails
- `REDIS_URL` - Redis connection string (replaces KV storage)
- `APP_URL` - (Optional) Admin panel URL - auto-detected from request if not set

## 📝 Key Features

### Proxy Features
- ✅ Subdomain-based routing (`*.toran.dev`)
- ✅ Path preservation (e.g., `/users/123` → backend `/users/123`)
- ✅ Request/response logging to MongoDB
- ✅ Auto-generated subdomains (8-12 chars)
- ✅ Edge deployment (global CDN via Cloudflare)

### Admin Panel Features
- ✅ Magic link authentication (passwordless)
- ✅ Gateway CRUD operations
- ✅ Request logs viewer with filters
- ✅ Dark/light/system theme toggle
- ✅ Responsive design (mobile-friendly)
- ✅ Auto-deploy via GitHub integration

### Planned Features (Phase 2+)
- [ ] Request/response transformations (mutations)
- [ ] Advanced caching with TTL
- [ ] Rate limiting per gateway
- [ ] Custom domains (CNAME support)
- [ ] API key authentication
- [ ] Webhook forwarding
- [ ] Analytics dashboard
- [ ] Team collaboration

## 🧠 For AI Agents (Claude, etc.)

### Project Context
This repository contains **toran-www**, the admin panel and API for Toran API Gateway.

**Structure**:
1. **src/** - React admin panel (Vite + React)
2. **api/** - Vercel serverless functions
3. **shared/** - Shared TypeScript types

**Related Repository**:
- **toran-proxy** - Separate repo with the stateless Cloudflare Worker proxy

### Architecture Principles

**Separation of Concerns:**
- **Proxy**: Only reads from Redis, sends logs to WWW. No database access.
- **WWW**: Manages MongoDB, writes to Redis, receives logs from proxy.
- **Redis**: Single source of truth for gateway configs, shared between proxy and WWW.

**Data Flow:**
- **Config writes**: User → WWW → MongoDB → Redis (flattened)
- **Config reads**: Proxy → Redis → Response
- **Logging**: Proxy → WWW API → MongoDB

### Common Tasks

**Add a new API endpoint:**
- Create file in `api/<endpoint>.ts`
- Export Vercel handler function
- Access via `/api/<endpoint>`
- Can access MongoDB and Redis via `api/utils/` helpers

**Modify proxy logic:**
- See [toran-proxy](https://github.com/kxbnb/toran-proxy) repository
- Proxy reads from Redis for gateway configs
- Proxy sends logs to WWW (via WWW_API_URL)

**Update gateway config schema:**
1. Edit `shared/src/types/gateway.ts` or `route.ts`
2. Update `api/utils/gateway-flatten.ts` to flatten new fields
3. Update proxy to use new fields
4. Types are automatically shared via workspace

**Add a new React component:**
- Create in `src/components/`
- Import and use in pages
- Follow existing patterns (useAuth, useTheme hooks)

### Architecture Decisions

**Why Cloudflare Workers for Proxy?**
- Edge compute (fast globally)
- Serverless (no infrastructure management)
- Low latency for reverse proxy workload
- Handles high traffic efficiently

**Why separate Proxy and WWW?**
- Proxy is lightweight and fast (no database overhead)
- WWW handles complex operations (MongoDB queries, config flattening)
- Better separation of concerns
- Easier to scale independently

**Why Redis for configs?**
- Sub-millisecond read latency
- Industry-standard key-value store
- Multiple hosting options (Upstash, Redis Cloud, self-hosted)
- Perfect for read-heavy proxy workload
- Easy to integrate with both Cloudflare Workers and Vercel

**Why MongoDB?**
- TTL indexes for auto-cleanup (logs, sessions, magic links)
- Flexible schema for future features
- Atlas free tier sufficient for moderate usage
- Rich querying for logs and analytics

**Why Magic Link Auth?**
- No password management complexity
- Secure (short-lived tokens)
- Better UX (one-click login)

**Why Monorepo?**
- Shared types across proxy and WWW
- Atomic commits for related changes
- Easier to maintain single source of truth

## 📖 Documentation Files

- `README.md` - This file (overview)
- `AUTH_SETUP.md` - Authentication setup guide (if exists)
- `CLOUDFLARE_AUTO_DEPLOY.md` - GitHub auto-deployment setup (if exists)

## 🔗 Related Repositories

- **[toran-proxy](https://github.com/kxbnb/toran-proxy)** - Stateless Cloudflare Worker proxy

## 🤝 Contributing

1. Make changes in appropriate directory (`src/`, `api/`, `shared/`)
2. Test locally with `npm run dev`
3. Commit with descriptive message
4. Push to GitHub (auto-deploys to Vercel if configured)

## 📄 License

Private project - All rights reserved

## 🙋 Support

For issues or questions, refer to the documentation files or check Vercel and Cloudflare Workers documentation.

---

**Built with ❤️ using Vercel, Cloudflare Workers, React, Redis, and MongoDB**
