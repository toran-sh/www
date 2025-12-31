# Cloudflare Pages Auto-Deployment Setup

This guide shows how to set up automatic deployments from GitHub to Cloudflare Pages for the toran.dev Admin panel.

## Benefits

✅ **Auto-deploy on git push** - No manual `wrangler` or `npm` commands needed
✅ **Preview deployments** - Every PR gets a unique preview URL
✅ **Rollback support** - Easy rollback to previous deployments
✅ **Build logs** - See build status and errors in Cloudflare dashboard

---

## Setup Instructions

### 1. Access Cloudflare Pages Dashboard

1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages** → **Pages**
3. Find your `toran-admin` project (or create new if starting fresh)

### 2. Connect to GitHub Repository

**If project already exists:**
1. Click on `toran-admin` project
2. Go to **Settings** → **Builds & deployments**
3. Under **Source**, you'll see the connected repository or option to connect

**If creating new project:**
1. Click **Create application** → **Pages** → **Connect to Git**
2. Authorize Cloudflare to access your GitHub account
3. Select repository: `kxbnb/toran`
4. Click **Begin setup**

### 3. Configure Build Settings

Set these configuration values:

```
Production branch: main

Framework preset: None

Build command: ./admin/build.sh

Build output directory: /admin/dist

Root directory (advanced): /
```

**Important:** Make sure to use `./admin/build.sh` as the build command. This script:
- Installs app dependencies
- Installs Functions dependencies (MongoDB driver)
- Builds the React app

### 4. Configure Environment Variables

Go to **Settings** → **Environment variables** and add these for **Production**:

| Variable Name      | Value                                           |
|-------------------|-------------------------------------------------|
| `MONGODB_URI`     | Your MongoDB Atlas connection string            |
| `MONGODB_DATABASE`| `toran`                                         |
| `RESEND_API_KEY`  | Your Resend API key (starts with `re_...`)     |
| `APP_URL`         | `https://admin.toran.dev`                       |
| `NODE_VERSION`    | `20` (optional, ensures Node 20.x)              |

**To add variables:**
1. Click **Add variable**
2. Select **Production** environment
3. Enter Variable name and Value
4. Click **Save**

### 5. Set Up Custom Domain (Optional)

1. Go to **Custom domains** tab
2. Click **Set up a custom domain**
3. Enter: `admin.toran.dev`
4. Follow DNS configuration instructions
5. Wait for SSL certificate to be provisioned

### 6. Trigger First Deployment

**Option A: Via Dashboard**
1. Go to **Deployments** tab
2. Click **Create deployment**
3. Select branch: `main`
4. Click **Deploy**

**Option B: Via Git Push** (recommended)
```bash
# Make any change and push to GitHub
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

The deployment will start automatically!

---

## How It Works

### Automatic Deployments

Once configured, Cloudflare Pages will:

1. **Watch your GitHub repository** for commits to `main` branch
2. **Automatically trigger builds** when code is pushed
3. **Run the build command** (`./admin/build.sh`)
4. **Deploy to production** if build succeeds
5. **Send notifications** about build status (optional)

### Workflow

```
Developer workflow:
1. Make changes locally
2. git commit -m "Your changes"
3. git push origin main
   ↓
   (Cloudflare automatically detects push)
   ↓
4. Cloudflare builds and deploys
5. Live at https://admin.toran.dev
```

### Preview Deployments

Every pull request automatically gets a preview deployment:

```
PR #123 → Deployed to: https://123.toran-admin.pages.dev
```

This lets you test changes before merging to production!

---

## Monitoring Deployments

### View Build Logs

1. Go to **Deployments** tab
2. Click on any deployment
3. View **Build log** to see:
   - npm install output
   - Build errors
   - Deployment status

### Deployment Status

Each deployment shows:
- ✅ **Success** - Deployed and live
- ❌ **Failed** - Build error (check logs)
- 🔄 **Building** - In progress
- ⏸️ **Canceled** - Manually stopped

### Rollback

To rollback to a previous version:
1. Go to **Deployments** tab
2. Find the working deployment
3. Click **⋮** → **Rollback to this deployment**
4. Confirm

---

## Troubleshooting

### Build Fails: "MongoDB not found"

**Cause:** Functions dependencies not installed
**Fix:** Ensure `./admin/build.sh` is the build command (includes `cd functions && npm install`)

### Build Fails: "Permission denied"

**Cause:** Build script not executable
**Fix:** Run locally: `chmod +x admin/build.sh && git add admin/build.sh && git commit && git push`

### Environment Variables Not Working

**Cause:** Variables not set for Production environment
**Fix:**
1. Go to **Settings** → **Environment variables**
2. Ensure variables are added under **Production** (not Preview)
3. Trigger a new deployment

### Custom Domain Not Working

**Cause:** DNS records not configured
**Fix:**
1. Go to **Custom domains** → Click on `admin.toran.dev`
2. Follow the DNS setup instructions
3. Add CNAME record to your DNS provider
4. Wait for DNS propagation (up to 24 hours)

---

## Disabling Manual Deployments

Once auto-deployment is set up, you can remove the manual deploy script from package.json:

**Before:**
```json
{
  "scripts": {
    "deploy": "npm run build && wrangler pages deploy"
  }
}
```

**After (optional):**
```json
{
  "scripts": {
    "deploy": "echo 'Auto-deployment enabled. Push to GitHub instead.'"
  }
}
```

This prevents accidental manual deployments that could conflict with the GitHub integration.

---

## Next Steps

✅ Configure build settings
✅ Add environment variables
✅ Push to GitHub
✅ Watch automatic deployment
✅ Set up custom domain (optional)
✅ Enable email notifications for build failures (optional)

**Your workflow is now:**
```bash
git add .
git commit -m "Update feature"
git push origin main
# Cloudflare automatically deploys! ✨
```

No more `npm run deploy` or `wrangler` commands needed!
