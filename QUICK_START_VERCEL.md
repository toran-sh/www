# Quick Start Guide - Vercel Deployment

Get your Toran WWW project deployed to Vercel in minutes.

## Prerequisites

- [Vercel account](https://vercel.com/signup) (free tier works)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier works)
- [Resend](https://resend.com) account for email (free tier works)

## 5-Minute Setup

### Step 1: Clone and Install (1 min)

```bash
git clone <your-repo>
cd toran-www
npm install
```

### Step 2: Set Up MongoDB Atlas (2 min)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Go to **Database Access** → Create a database user
3. Go to **Network Access** → Add IP: `0.0.0.0/0` (allow all)
4. Click **Connect** → **Connect your application**
5. Copy the connection string

Initialize database:
```bash
export MONGODB_URI="your_connection_string"
export MONGODB_DATABASE="toran"
npm run setup:mongodb
```

### Step 3: Deploy to Vercel (2 min)

#### Option A: Deploy via CLI (Fastest)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

When prompted:
- Project name: `toran-www` (or your choice)
- Directory: `.` (current directory)
- Continue with settings? **Yes**

#### Option B: Deploy via GitHub (Recommended for CI/CD)

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **Add New** → **Project**
4. Import your GitHub repository
5. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `www/dist`
   - **Install Command**: `npm install`
6. Click **Deploy**

### Step 4: Configure Environment Variables

In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add these variables for **Production**, **Preview**, and **Development**:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=toran
RESEND_API_KEY=re_your_api_key_here
APP_URL=https://your-project.vercel.app
```

Or via CLI:
```bash
vercel env add MONGODB_URI
vercel env add MONGODB_DATABASE
vercel env add RESEND_API_KEY
vercel env add APP_URL
```

### Step 5: Create Vercel KV Database

1. In Vercel Dashboard, go to **Storage** tab
2. Click **Create Database** → **KV**
3. Name it `toran-kv`
4. Click **Create**
5. Link to your project (environment variables added automatically)

### Step 6: Get Resend API Key

1. Sign up at [Resend](https://resend.com/signup)
2. Go to **API Keys**
3. Create new API key
4. Copy and add to Vercel environment variables
5. Verify your domain or use test mode

### Step 7: Redeploy (if needed)

After adding environment variables:
```bash
vercel --prod
```

## Verify Deployment

1. **Check frontend**: Visit your Vercel URL
2. **Test API**: `curl https://your-project.vercel.app/api/gateways`
3. **Test auth**: Try logging in with magic link

## Local Development

```bash
# Pull environment variables from Vercel
vercel env pull

# Start local dev server
npm run dev
```

Access at: `http://localhost:3000`

## Troubleshooting

### Build fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are installed: `npm install`

### API routes return 500
- Check function logs: `vercel logs --follow`
- Verify environment variables are set correctly
- Check MongoDB connection string

### KV errors
- Ensure Vercel KV database is created and linked
- Check KV environment variables exist

### Email not sending
- Verify Resend API key is correct
- Check Resend dashboard for errors
- Ensure sending domain is verified

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure environment variables
3. ✅ Create KV database
4. ✅ Test the application
5. 🔄 Configure custom domain (optional)
6. 🔄 Set up monitoring and alerts
7. 🔄 Update proxy to use new API endpoints

## Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel KV**: https://vercel.com/docs/storage/vercel-kv
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Resend**: https://resend.com/docs

## Common Commands

```bash
# Local development
npm run dev

# Deploy to production
npm run deploy

# View logs
vercel logs --follow

# Pull environment variables
vercel env pull

# List deployments
vercel ls

# Open Vercel dashboard
vercel
```

## Support

If you encounter issues:
1. Check logs: `vercel logs --follow`
2. Review environment variables
3. Test locally with `vercel dev`
4. Check Vercel documentation
5. Open an issue on GitHub

---

**That's it! Your Toran WWW is now live on Vercel! 🎉**
