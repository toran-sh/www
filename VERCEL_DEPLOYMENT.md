# Vercel Deployment Guide

This guide explains how to deploy the Toran WWW project to Vercel.

## Prerequisites

- Vercel account
- MongoDB Atlas account
- Resend account (for email)
- Redis instance (Upstash, Redis Cloud, or self-hosted)

## Setup Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Redis

You need a Redis instance for gateway configuration storage.

#### Option A: Upstash Redis (Recommended)
1. Sign up at [Upstash](https://upstash.com)
2. Create a new Redis database
3. Copy the **REDIS_URL** connection string
4. Add to Vercel environment variables

#### Option B: Redis Cloud
1. Sign up at [Redis Cloud](https://redis.com/try-free/)
2. Create a free database
3. Copy the connection string
4. Add to Vercel environment variables

#### Option C: Self-Hosted Redis
- Set up Redis on your infrastructure
- Ensure it's accessible from Vercel's serverless functions
- Use connection string: `redis://[username:password@]host:port`

### 4. Configure Environment Variables

Set the following environment variables in your Vercel project settings or via CLI:

#### Required Environment Variables

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=toran

# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here

# Application URL (Optional - auto-detected from request if not set)
# Only set this if you need to override automatic domain detection
# APP_URL=https://your-domain.vercel.app

# Redis Configuration
# Format: redis://[[username:]password@]host[:port][/db-number]
REDIS_URL=redis://username:password@host:port
```

#### Setting Environment Variables via CLI

```bash
vercel env add MONGODB_URI
vercel env add MONGODB_DATABASE
vercel env add RESEND_API_KEY
vercel env add REDIS_URL
# APP_URL is optional - only add if you need to override domain detection
# vercel env add APP_URL
```

#### Setting Environment Variables via Dashboard

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development environments

### 5. Deploy to Vercel

#### Option A: Deploy via CLI

```bash
# Development deployment
npm run dev

# Production deployment
npm run deploy
```

#### Option B: Deploy via GitHub Integration (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel dashboard
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `www/dist`
   - **Install Command**: `npm install`
4. Add environment variables in project settings
5. Deploy

### 6. Initialize MongoDB Collections

After first deployment, run the setup scripts:

```bash
# Set environment variables locally
export MONGODB_URI="your_mongodb_uri"
export MONGODB_DATABASE="toran"

# Initialize collections and indexes
npm run setup:mongodb

# Optionally seed sample data
npm run seed:data
```

## Project Structure for Vercel

```
toran-www/
├── api/                      # Vercel API Routes (serverless functions)
│   ├── auth/
│   │   ├── login.ts         # Magic link login endpoint
│   │   ├── verify.ts        # Token verification endpoint
│   │   ├── session.ts       # Session check endpoint
│   │   └── logout.ts        # Logout endpoint
│   ├── gateway-config/
│   │   └── [subdomain].ts   # Gateway config fetch endpoint
│   ├── gateways.ts          # Gateway CRUD endpoint
│   ├── logs.ts              # Logs endpoint (receive from proxy)
│   └── utils/
│       ├── mongodb.ts       # MongoDB connection utility
│       ├── kv.ts            # Vercel KV adapter
│       └── gateway-flatten.ts  # Gateway flattening utility
│
├── www/                     # React frontend (Vite build)
│   ├── src/                 # React components, pages, hooks
│   ├── dist/                # Build output (served as static site)
│   └── package.json
│
├── shared/                  # Shared TypeScript types
│   └── src/types.ts
│
├── vercel.json              # Vercel configuration
├── package.json             # Root package.json
└── VERCEL_DEPLOYMENT.md     # This file
```

## API Routes

All API routes are serverless functions deployed to Vercel:

- `POST /api/auth/login` - Send magic link
- `POST /api/auth/verify` - Verify token and create session
- `GET /api/auth/session` - Check session status
- `POST /api/auth/logout` - Destroy session
- `GET /api/gateways` - List all gateways
- `POST /api/gateways` - Create gateway
- `GET /api/gateways?id=:id` - Get gateway by ID
- `PUT /api/gateways?id=:id` - Update gateway
- `DELETE /api/gateways?id=:id` - Delete gateway
- `GET /api/gateway-config/:subdomain` - Fetch gateway config from KV
- `POST /api/logs` - Receive logs from proxy
- `GET /api/logs` - Fetch logs for dashboard

## Storage

### MongoDB Atlas
Stores:
- Gateway configurations
- Routes
- Logs (30-day TTL)
- Magic links (15-minute TTL)
- Sessions (24-hour inactivity TTL)

### Redis
Stores:
- Flattened gateway configs (read by proxy worker)
- Key format: `gateway:config:{subdomain}`
- Recommended: Upstash Redis (serverless-friendly, free tier available)

## Development

### Local Development

```bash
# Start Vercel development server (simulates serverless functions)
npm run dev

# This will start:
# - Vite dev server for React frontend (www)
# - Vercel serverless functions (api/)
```

Access the app at: `http://localhost:3000`

### Testing API Routes Locally

The Vercel CLI simulates the production environment locally, including:
- Environment variables from `.env` file or Vercel project
- Serverless function execution
- KV storage (with local simulation)

## Deployment Workflow

### Automatic Deployment (GitHub Integration)

1. Push to `main` branch → Production deployment
2. Push to other branches → Preview deployment
3. Pull requests → Preview deployment with unique URL

### Manual Deployment

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## Monitoring and Logs

### View Logs

```bash
# Tail production logs
vercel logs --follow

# View specific deployment logs
vercel logs <deployment-url>
```

### Dashboard

Monitor deployments, functions, and analytics in the Vercel dashboard:
- https://vercel.com/dashboard

## Differences from Cloudflare Pages

| Feature | Cloudflare Pages | Vercel |
|---------|-----------------|--------|
| **API Functions** | Pages Functions (`functions/api/*.ts`) | API Routes (`api/*.ts`) |
| **KV Storage** | Cloudflare KV (`env.GATEWAY_CONFIG`) | Redis (`ioredis`) |
| **Environment** | `env` object in function context | `process.env` |
| **Types** | `PagesFunction<Env>` | `VercelRequest, VercelResponse` |
| **Deployment** | `wrangler pages deploy` | `vercel --prod` |

## Troubleshooting

### Build Failures

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation succeeds locally

### Runtime Errors

- Check function logs: `vercel logs --follow`
- Verify environment variables are set correctly
- Test locally with `vercel dev`

### Redis Connection Issues

- Ensure Redis instance is running and accessible
- Check REDIS_URL environment variable is set correctly
- Verify Redis connection string format
- Test connection with `redis-cli` if using self-hosted

### MongoDB Connection Issues

- Check MongoDB Atlas IP whitelist (allow all: `0.0.0.0/0`)
- Verify `MONGODB_URI` is correct
- Ensure database user has read/write permissions

## Cost Considerations

### Vercel Free Tier Includes:
- 100 GB bandwidth
- 6,000 build minutes
- Unlimited API requests
- Serverless function executions (up to limits)

### Redis (Upstash):
- Free tier: 10,000 commands/day, 256 MB storage
- Serverless-friendly with global replication
- Paid tiers available for higher usage

### Recommendations:
- Monitor usage in Vercel dashboard
- Use caching to reduce API calls
- Optimize serverless function execution time

## Support

For Vercel-specific issues:
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support

For project-specific issues:
- Check the main README.md
- Review Cloudflare to Vercel migration notes
