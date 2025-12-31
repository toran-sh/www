# Vercel Migration Summary

This document summarizes the changes made to migrate the Toran WWW project from Cloudflare Pages to Vercel.

## Changes Made

### 1. New Files Created

#### API Routes (Vercel Serverless Functions)
- `api/gateways.ts` - Gateway CRUD operations
- `api/logs.ts` - Logs endpoint
- `api/auth/login.ts` - Magic link login
- `api/auth/verify.ts` - Token verification
- `api/auth/session.ts` - Session check
- `api/auth/logout.ts` - Logout
- `api/gateway-config/[subdomain].ts` - Gateway config fetch

#### Utility Files
- `api/utils/mongodb.ts` - MongoDB connection utility
- `api/utils/kv.ts` - Vercel KV adapter
- `api/utils/gateway-flatten.ts` - Gateway flattening (ported from Cloudflare)

#### Configuration Files
- `vercel.json` - Vercel project configuration
- `.vercelignore` - Files to exclude from deployment
- `VERCEL_DEPLOYMENT.md` - Detailed deployment guide
- `MIGRATION_SUMMARY.md` - This file

### 2. Modified Files

#### `package.json` (root)
- **Added dependencies**:
  - `@vercel/kv` - Vercel KV storage client
  - `@vercel/node` - Vercel serverless function types
  - Moved `mongodb` from devDependencies to dependencies
- **Updated scripts**:
  - `dev`: Changed from `npm run dev --workspace=www` to `vercel dev`
  - `build`: Changed from `npm run build --workspaces` to `cd www && npm run build`
  - `deploy`: Changed from `npm run deploy --workspace=www` to `vercel --prod`
- **Added devDependency**:
  - `vercel` - Vercel CLI for local development

#### `.env.example`
- Added Vercel-specific environment variables:
  - `RESEND_API_KEY` - For magic link emails
  - `APP_URL` - Application URL for magic links
  - `KV_*` - Vercel KV configuration (commented)

### 3. Architecture Changes

#### Storage Layer
**Before (Cloudflare):**
- Cloudflare KV accessed via `env.GATEWAY_CONFIG`
- Direct KV namespace binding in `wrangler.toml`

**After (Vercel):**
- Vercel KV accessed via `@vercel/kv` package
- KV adapter pattern for abstraction
- Configuration via environment variables

#### API Functions
**Before (Cloudflare Pages Functions):**
```typescript
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  // ...
}
```

**After (Vercel API Routes):**
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ...
}
```

#### Environment Variables
**Before (Cloudflare):**
- Accessed via `env` object passed to function
- Configured in `wrangler.toml` or via `wrangler secret`

**After (Vercel):**
- Accessed via `process.env`
- Configured in Vercel dashboard or via `vercel env` CLI

### 4. Key Differences

| Aspect | Cloudflare Pages | Vercel |
|--------|-----------------|--------|
| **Function Location** | `www/functions/api/*.ts` | `api/*.ts` (root level) |
| **Function Signature** | `PagesFunction<Env>` | `(req, res) => Promise<void>` |
| **Environment Access** | `context.env.VAR` | `process.env.VAR` |
| **KV Storage** | Cloudflare KV | Vercel KV (Redis) |
| **Request Object** | `Request` (Web API) | `VercelRequest` |
| **Response** | `new Response()` | `res.status().json()` |
| **Dynamic Routes** | `[param].ts` in functions | `[param].ts` in api |
| **Deployment** | `wrangler pages deploy` | `vercel --prod` |

## Files to Keep (Unchanged)

### Frontend (www/)
- All React components, pages, and hooks remain the same
- Vite configuration unchanged
- Build process unchanged
- Frontend API calls work the same (just different backend)

### Shared Types (shared/)
- All TypeScript types remain identical
- No changes needed

### Scripts
- `scripts/setup-mongodb.js` - Unchanged
- `scripts/seed-data.js` - Unchanged

### Cloudflare-Specific Files (Can be ignored/removed)
- `www/wrangler.toml` - No longer used (Cloudflare config)
- `www/functions/` - Replaced by root `api/` directory

## Deployment Workflow

### Old Workflow (Cloudflare)
```bash
cd www
npm run build
wrangler pages deploy
```

### New Workflow (Vercel)
```bash
# Option 1: Manual deployment
npm run build
npm run deploy

# Option 2: GitHub integration (automatic)
git push origin main  # Automatically deploys to production
```

## Environment Setup

### 1. Create Vercel KV Database
1. Go to Vercel dashboard → Storage
2. Create new KV database
3. Link to your project (environment variables auto-added)

### 2. Set Environment Variables
```bash
vercel env add MONGODB_URI
vercel env add MONGODB_DATABASE
vercel env add RESEND_API_KEY
vercel env add APP_URL
```

### 3. Initialize MongoDB
```bash
export MONGODB_URI="your_uri"
export MONGODB_DATABASE="toran"
npm run setup:mongodb
```

## Testing

### Local Development
```bash
npm install
npm run dev
```

This will:
- Start Vercel dev server (simulates serverless functions)
- Serve React frontend from `www/dist`
- Access at `http://localhost:3000`

### Testing API Routes
```bash
# Example: Test gateway creation
curl -X POST http://localhost:3000/api/gateways \
  -H "Content-Type: application/json" \
  -d '{"subdomain":"test","name":"Test","baseUrl":"https://example.com"}'
```

## Monitoring

### Vercel Dashboard
- Deployments: View build logs and deploy history
- Functions: Monitor serverless function execution
- Analytics: Track performance and usage
- Logs: Real-time function logs

### CLI
```bash
# Tail production logs
vercel logs --follow

# View specific deployment
vercel logs <deployment-url>
```

## Cost Comparison

### Cloudflare Pages
- **Free tier**: Unlimited bandwidth, 500 builds/month
- **Workers KV**: 100k reads/day, 1k writes/day free

### Vercel
- **Free tier**: 100 GB bandwidth, 6k build minutes, serverless functions
- **KV**: 256 MB storage, 3k commands/day free
- **Upgrade needed for**: Higher traffic, more KV usage

## Next Steps

1. **Test locally**: Run `npm run dev` and test all features
2. **Deploy to Vercel**: Run `npm run deploy` or connect GitHub
3. **Configure KV**: Create Vercel KV database and link to project
4. **Set environment variables**: Add all required env vars
5. **Initialize MongoDB**: Run setup scripts
6. **Test production**: Verify all endpoints work
7. **Update proxy**: Update proxy to point to new Vercel API endpoints

## Rollback Plan

If needed to rollback to Cloudflare:
1. Keep `www/functions/` directory
2. Use `wrangler.toml` configuration
3. Deploy with `wrangler pages deploy`
4. Update proxy to use Cloudflare endpoints

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel KV Docs**: https://vercel.com/docs/storage/vercel-kv
- **Vercel Support**: https://vercel.com/support
