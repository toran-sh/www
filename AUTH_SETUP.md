# Toran Admin Authentication Setup Guide

Magic link authentication has been successfully implemented! Here's how to complete the setup:

## 1. Get a Resend API Key

Resend is used to send magic link emails.

1. Go to [resend.com](https://resend.com) and sign up for a free account
2. Navigate to API Keys section
3. Create a new API key
4. Copy the API key (starts with `re_...`)

## 2. Set Environment Variables in Cloudflare Pages

You need to set these environment variables in the Cloudflare Pages dashboard:

### Via Wrangler CLI:

```bash
cd admin

# Set Resend API key
wrangler pages secret put RESEND_API_KEY --project-name=toran-admin
# Paste your Resend API key when prompted

# Set App URL (production URL of admin panel)
wrangler pages secret put APP_URL --project-name=toran-admin
# Enter: https://toran-admin.pages.dev
```

### Via Cloudflare Dashboard:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **toran-admin** → **Settings** → **Environment variables**
3. Add the following variables for **Production**:
   - `RESEND_API_KEY`: Your Resend API key
   - `APP_URL`: `https://toran-admin.pages.dev`

## 3. Configure Resend Domain (Optional but Recommended)

By default, emails will be sent from `noreply@toran.dev`. To use your own domain:

1. In Resend dashboard, go to **Domains**
2. Add your domain and verify DNS records
3. Update the email sender in `/admin/functions/api/auth/login.ts`:
   ```typescript
   from: 'Toran Admin <noreply@yourdomain.com>',
   ```

## 4. MongoDB Collections Created

The following collections were automatically created in your MongoDB database:

- **`magic_links`**: Stores temporary magic link tokens (auto-expires after 15 minutes)
- **`sessions`**: Stores user sessions (auto-expires after 24 hours of inactivity)

## 5. How It Works

### Login Flow:
1. User enters email on `/login`
2. System generates secure token and stores in `magic_links` collection
3. Email with magic link sent via Resend
4. User clicks link → redirected to `/auth/verify?token=xxx`
5. System validates token, creates session, sets HTTP-only cookie
6. User redirected to dashboard

### Session Management:
- Session stored in HTTP-only, Secure, SameSite=Strict cookie
- Last activity timestamp updated on each request
- Auto-logout after 24 hours of inactivity (MongoDB TTL index)
- Manual logout via "Logout" button in header

### Security Features:
- ✅ Magic links expire after 15 minutes
- ✅ Tokens are single-use (deleted after verification)
- ✅ Sessions expire after 24 hours of inactivity
- ✅ HTTP-only cookies (not accessible via JavaScript)
- ✅ Secure flag (HTTPS only)
- ✅ SameSite=Strict (CSRF protection)
- ✅ Email used as user identifier

## 6. Testing the Authentication

Once environment variables are set:

1. Visit: `https://toran-admin.pages.dev/login`
2. Enter your email address
3. Check your email for the magic link
4. Click the link to log in
5. You should be redirected to the dashboard
6. Try logging out using the "Logout" button

## 7. API Endpoints

The following auth endpoints are available:

- `POST /api/auth/login` - Request magic link
- `GET /api/auth/verify?token=xxx` - Verify magic link and create session
- `GET /api/auth/session` - Check if user is authenticated
- `POST /api/auth/logout` - Destroy session

## 8. Deployment URLs

- **Admin Panel**: https://toran-admin.pages.dev
- **Latest deployment**: https://d3694a96.toran-admin.pages.dev

## Troubleshooting

### Emails not sending:
1. Check that `RESEND_API_KEY` is set correctly
2. Verify Resend account is active
3. Check Cloudflare Pages Functions logs

### Session not persisting:
1. Ensure cookies are enabled in browser
2. Check that `APP_URL` matches the actual URL you're accessing
3. Verify MongoDB `sessions` collection exists

### Magic link expired:
- Magic links expire after 15 minutes
- Request a new login link

## Next Steps

- Add user management (allow/deny specific emails)
- Add role-based access control (admin, viewer, etc.)
- Add audit logging for authentication events
- Configure email templates with custom branding
