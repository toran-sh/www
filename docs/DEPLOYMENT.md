# toran.dev API Accelerator & Debugger - Deployment Guide

Complete guide for deploying toran.dev to production.

## Prerequisites Checklist

- [ ] Node.js 18+ and npm 9+ installed
- [ ] Cloudflare account created
- [ ] MongoDB Atlas account created
- [ ] Domain added to Cloudflare (optional, for custom domain)
- [ ] Git repository set up

## Step 1: MongoDB Setup

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 Free tier works for testing)
3. Click "Create Database"
   - Database name: `toran`
   - Collection names will be created by script

### 1.2 Enable MongoDB Data API

1. In Atlas, navigate to **Data API** section
2. Click "Enable Data API"
3. Create an API Key:
   - Click "Create API Key"
   - Give it a name (e.g., "toran-worker")
   - Copy the API Key (you won't see it again!)
4. Copy the Data API URL (format: `https://data.mongodb-api.com/app/<APP-ID>/endpoint/data/v1`)

### 1.3 Configure Network Access

1. In Atlas, go to **Network Access**
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
   - This is required for Cloudflare Workers
4. Click "Confirm"

### 1.4 Run MongoDB Setup Script

```bash
# Install MongoDB driver
npm install mongodb --save-dev

# Set environment variables
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net"
export MONGODB_DATABASE="toran"

# Run setup script (creates collections and indexes)
node scripts/setup-mongodb.js
```

**Expected output:**
```
🔧 Setting up MongoDB for toran.dev API Accelerator & Debugger
📡 Connecting to MongoDB...
✅ Connected successfully

📦 Creating collections...
  ✓ Created gateways collection
  ✓ Created routes collection
  ✓ Created logs collection

🔍 Creating indexes...
  Gateways:
    ✓ subdomain (unique)
    ✓ userId
    ...

✅ MongoDB setup complete!
```

### 1.5 Seed Test Data

```bash
# Run seeding script (creates test gateway and routes)
node scripts/seed-data.js
```

**Expected output:**
```
🌱 Seeding test data for toran.dev API Accelerator & Debugger
✅ Connected to MongoDB

📦 Creating test gateway...
  ✓ Created gateway: test.toran.dev

🛤️  Creating test routes...
  ✓ Route 1: GET /posts/:id (cached)
  ✓ Route 2: GET /posts (with query mutations)
  ✓ Route 3: POST /posts (with body mutation)
  ✓ Route 4: * /users/* (wildcard)

✅ Seeding complete!
```

## Step 2: Cloudflare Worker Setup

### 2.1 Install Wrangler CLI

```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### 2.2 Create KV Namespace

```bash
# Create production KV namespace
wrangler kv:namespace create CACHE

# Create preview KV namespace (for wrangler dev)
wrangler kv:namespace create CACHE --preview
```

**Copy the output IDs** and update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "CACHE"
id = "abc123..."              # Your production ID
preview_id = "xyz789..."       # Your preview ID
```

### 2.3 Configure Worker Secrets

```bash
# MongoDB Data API URL
wrangler secret put MONGODB_API_URL
# Paste: https://data.mongodb-api.com/app/<APP-ID>/endpoint/data/v1

# MongoDB API Key
wrangler secret put MONGODB_API_KEY
# Paste: your-api-key-from-atlas

# Database name
wrangler secret put MONGODB_DATABASE
# Paste: toran

# Verify secrets are set
wrangler secret list
```

### 2.4 Test Worker Locally

```bash
# Run worker in development mode
npm run dev:worker

# In another terminal, test with curl:
curl "http://localhost:8787?subdomain=test" -H "Host: test.toran.dev"

# Or test with the test path:
curl "http://localhost:8787/posts/1?subdomain=test"
```

### 2.5 Deploy Worker to Production

```bash
# Deploy worker
npm run deploy:worker

# Or deploy all at once
npm run deploy:all
```

**Expected output:**
```
Uploading...
✨ Success! Deployed to https://toran-proxy.<account>.workers.dev
```

## Step 3: Admin UI Deployment

### 3.1 Configure Admin Environment

The admin UI needs a MongoDB connection string (not Data API).

1. In MongoDB Atlas, get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

2. Configure Pages environment variable:
   ```bash
   # Via Cloudflare Dashboard:
   # Pages > toran-admin > Settings > Environment variables
   # Add: MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/toran
   ```

### 3.2 Deploy Admin UI

```bash
# Build and deploy admin UI
npm run deploy:admin
```

**Expected output:**
```
✨ Success! Deployed to https://toran-admin.pages.dev
```

## Step 4: Marketing Site Deployment

```bash
# Build and deploy marketing site
npm run deploy:marketing
```

**Expected output:**
```
✨ Success! Deployed to https://toran-marketing.pages.dev
```

## Step 5: Configure Custom Domain (Optional)

### 5.1 Add Domain to Cloudflare

1. In Cloudflare Dashboard, go to "Websites"
2. Click "Add a site"
3. Enter your domain (e.g., `toran.dev`)
4. Follow the setup wizard

### 5.2 Configure Worker Routes

Update `wrangler.toml`:
```toml
routes = [
  { pattern = "*.toran.dev/*", zone_name = "toran.dev" }
]
```

Redeploy:
```bash
npm run deploy:worker
```

### 5.3 Configure DNS for Admin/Marketing

In Cloudflare DNS:
- Add CNAME: `admin.toran.dev` → `toran-admin.pages.dev`
- Add CNAME: `www.toran.dev` → `toran-marketing.pages.dev`

## Step 6: Verification & Testing

### 6.1 Test Worker Endpoints

```bash
# Test the seeded gateway and routes
curl https://test.toran.dev/posts/1

# Expected: JSON response from JSONPlaceholder
# Headers should include:
# X-Toran-Gateway: test
# X-Toran-Route: Get Post by ID
# X-Toran-Cache: MISS (first request)

# Second request should be cached
curl https://test.toran.dev/posts/1
# X-Toran-Cache: HIT
# X-Toran-Cache-Age: 5
```

### 6.2 Test Mutations

```bash
# Test query parameter mutation (adds _limit=10)
curl https://test.toran.dev/posts
# Should return 10 posts

# Test body mutation
curl -X POST https://test.toran.dev/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "content": "Body", "authorId": 1}'
# Body fields should be transformed
```

### 6.3 Check Logs in MongoDB

```javascript
// In MongoDB Compass or Atlas Data Explorer
db.logs.find({}).sort({createdAt: -1}).limit(10)

// Verify logs contain:
// - Request/response details
// - Execution timing
// - Cache hit/miss status
// - Mutations applied count
```

### 6.4 Test Admin UI

1. Visit your admin URL (e.g., `https://admin.toran.dev`)
2. Navigate to Gateways
3. You should see the "Test Gateway"
4. Click to view routes
5. Test the Request Tester tool

## Step 7: Production Checklist

### Security
- [ ] Rotate MongoDB API keys regularly
- [ ] Enable Cloudflare WAF rules
- [ ] Set up rate limiting
- [ ] Review CORS settings
- [ ] Audit secret variables in logs

### Monitoring
- [ ] Set up Cloudflare Workers analytics
- [ ] Monitor MongoDB Atlas metrics
- [ ] Set up alerts for errors
- [ ] Track cache hit rates
- [ ] Monitor response times

### Backup
- [ ] Enable MongoDB Atlas continuous backups
- [ ] Export gateway/route configs to git
- [ ] Document recovery procedures
- [ ] Test restore process

### Performance
- [ ] Review cache TTL settings
- [ ] Optimize route priorities
- [ ] Check MongoDB index usage
- [ ] Monitor KV namespace usage
- [ ] Review worker CPU limits

## Troubleshooting

### Worker Issues

**Error: "Gateway not found"**
- Verify gateway exists in MongoDB with correct subdomain
- Check gateway `active` field is `true`
- Clear KV cache: it may be stale

**Error: "MongoDB API error"**
- Verify MONGODB_API_URL is correct
- Check MONGODB_API_KEY is valid
- Ensure IP allowlist includes 0.0.0.0/0

**Cache not working**
- Verify KV namespace is configured in wrangler.toml
- Check route has `cache.enabled = true`
- Verify cache conditions are met (status code, body size)

### Admin UI Issues

**Can't connect to MongoDB**
- Verify MONGODB_URI environment variable
- Check MongoDB user has read/write permissions
- Ensure IP access from Pages is allowed

**Functions not working**
- Check Cloudflare Pages Functions are deployed
- Verify environment variables are set
- Check browser console for CORS errors

## Next Steps

1. **Add Authentication**: Implement auth for admin UI
2. **Create More Gateways**: Set up production gateways
3. **Configure Monitoring**: Set up alerts and dashboards
4. **Optimize Performance**: Review and tune cache settings
5. **Document APIs**: Create API documentation for your gateways

## Support

For issues or questions:
- Check the logs in MongoDB
- Use `wrangler tail` for real-time worker logs
- Review Cloudflare Workers analytics
- Check GitHub issues/discussions

---

**Congratulations!** 🎉 Your toran.dev API Accelerator & Debugger is now deployed and ready for production use.
