# Vercel Deployment Setup

## Required Environment Variables

**⚠️ CRITICAL:** These environment variables MUST be set in Vercel for the app to work:

1. **DATABASE_URL** - Your Neon database connection string
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `DATABASE_URL` = `postgresql://neondb_owner:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require`
   - **Important:** Select all environments (Production, Preview, Development)

2. **AUTH_SECRET** - Secret for Auth.js (JWT signing and cookie encryption)
   - Generate with: `openssl rand -base64 32`
   - Example output: `VlzbZyJ6cy5+87X+3kGP6vpv0gUfNUeY33CoG5+69Vs=`
   - Add to Vercel environment variables
   - **Important:** Select all environments (Production, Preview, Development)
   - **Minimum length:** 32 characters

## How to Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter the variable name (e.g., `DATABASE_URL`)
6. Enter the value
7. **Select all environments** (Production, Preview, Development)
8. Click **Save**
9. **Redeploy** your application for changes to take effect

## Build Configuration

The project is configured to:
- Generate Prisma Client automatically (`postinstall` script)
- Use webpack instead of Turbopack (better Prisma compatibility)
- Include Prisma files in the build output

## Health Check Endpoint

After deployment, verify your configuration by visiting:
```
https://your-app.vercel.app/api/auth/health
```

This endpoint will show:
- ✅ Status: `healthy` if all environment variables are set
- ❌ Status: `unhealthy` if any are missing
- Detailed check results for each variable

## Troubleshooting

### Error: "500 Internal Server Error" on `/api/auth/session`

**Cause:** Missing `AUTH_SECRET` or `DATABASE_URL` environment variables.

**Solution:**
1. Check Vercel Dashboard → Settings → Environment Variables
2. Verify both `AUTH_SECRET` and `DATABASE_URL` are set
3. Verify they are enabled for **all environments** (Production, Preview, Development)
4. **Redeploy** your application after adding variables
5. Check the health endpoint: `/api/auth/health`

### Error: "DATABASE_URL is not set" during build

**Cause:** DATABASE_URL is not available during build (this is expected).

**Solution:**
- This is normal - the build uses a placeholder Prisma client
- At runtime, the real DATABASE_URL from Vercel environment variables will be used
- If you see this error at runtime, check that DATABASE_URL is set in Vercel

### Error: "AUTH_SECRET is not set"

**Cause:** AUTH_SECRET environment variable is missing.

**Solution:**
1. Generate a new secret: `openssl rand -base64 32`
2. Add it to Vercel environment variables
3. Redeploy your application

### After Adding Environment Variables

**⚠️ CRITICAL:** Environment variables are only loaded on NEW deployments!

After adding or updating environment variables in Vercel, you MUST redeploy:

1. Go to **Deployments** tab in Vercel Dashboard
2. Find your latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**
5. Select the same branch (usually `main`)
6. Wait for the deployment to complete (2-5 minutes)
7. Check `/setup-check` or `/api/auth/health` to verify

**Common mistake:** Adding variables but forgetting to redeploy. The old deployment still has the old environment (without your new variables).

## Verification Checklist

Before going live, verify:
- [ ] `DATABASE_URL` is set in Vercel (all environments)
- [ ] `AUTH_SECRET` is set in Vercel (all environments)
- [ ] Health check endpoint returns `healthy`: `/api/auth/health`
- [ ] Can access `/api/auth/session` without 500 errors
- [ ] Can register a new user
- [ ] Can log in with registered credentials
