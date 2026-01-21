# Environment Variables Guide

This document lists all environment variables needed for both the Community App and Admin App.

---

## 🌐 Community App (Backend) - Vercel

**Project:** `impacthubnairobi-app` (or your Community App project name)

### Required Variables

| Variable | Value | Description | Environments |
|----------|-------|-------------|--------------|
| `DATABASE_URL` | `postgresql://neondb_owner:password@ep-xxx.aws.neon.tech/neondb?sslmode=require` | Neon PostgreSQL connection string | **All** (Production, Preview, Development) |
| `AUTH_SECRET` | `[32+ character random string]` | Secret for Auth.js (JWT signing/encryption). Generate with: `openssl rand -base64 32` | **All** (Production, Preview, Development) |

### Optional Variables

| Variable | Value | Description | Environments |
|----------|-------|-------------|--------------|
| `GOOGLE_CLIENT_ID` | `[Google OAuth Client ID]` | Google OAuth Client ID for sign-in with Google (optional) | **All** (Production, Preview, Development) |
| `GOOGLE_CLIENT_SECRET` | `[Google OAuth Client Secret]` | Google OAuth Client Secret for sign-in with Google (optional) | **All** (Production, Preview, Development) |
| `ADMIN_APP_URL` | `https://impacthubnairobi-app-admin.vercel.app` | Admin app URL for CORS (optional, CORS handles it dynamically) | Production |
| `NEXT_PUBLIC_ADMIN_APP_URL` | `https://impacthubnairobi-app-admin.vercel.app` | Public admin app URL (optional) | Production |

### Setting Up Google OAuth

To enable "Sign in with Google":

1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the **Google+ API** (if not already enabled)
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Choose **Web application**
   - Add **Authorized redirect URIs**:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://your-domain.vercel.app/api/auth/callback/google`
     - Preview: `https://your-preview-url.vercel.app/api/auth/callback/google`
   - Copy the **Client ID** and **Client Secret**

2. **Add to Vercel Environment Variables:**
   - Add `GOOGLE_CLIENT_ID` with your Client ID
   - Add `GOOGLE_CLIENT_SECRET` with your Client Secret
   - Set for **Production**, **Preview**, and **Development** environments

3. **Redeploy** your app after adding the variables

### How to Set in Vercel

1. Go to: **Vercel Dashboard** → Your Community App Project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Add each variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string
   - **Environment**: Select **Production**, **Preview**, and **Development** (check all)
   - Click **Save**
4. Repeat for `AUTH_SECRET`
5. **Important:** After adding/updating variables, **redeploy** your app:
   - Go to **Deployments** tab
   - Click `...` on latest deployment
   - Click **Redeploy**
   - Select branch (usually `main` or `master`)

---

## 🔧 Admin App (Frontend) - Vercel

**Project:** `impacthubnairobi-app-admin` (or your Admin App project name)

### Required Variables

| Variable | Value | Description | Environments |
|----------|-------|-------------|--------------|
| `DATABASE_URL` | `[Same as Community App]` | **Shared Neon PostgreSQL connection string** - Both apps use the same database | **All** (Production, Preview, Development) |

### Optional Variables

| Variable | Value | Description | Environments |
|----------|-------|-------------|--------------|
| `NEXT_PUBLIC_COMMUNITY_APP_URL` | `https://impacthubnairobi-app.vercel.app` | Community App URL (for redirects/references, not required for API calls) | Production |

### How to Set in Vercel

1. Go to: **Vercel Dashboard** → Your Admin App Project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Add:
   - **Name**: `DATABASE_URL`
   - **Value**: `[Same connection string as Community App]` - Both apps share the same database
   - **Environment**: Select **Production**, **Preview**, and **Development** (check all)
   - Click **Save**
4. (Optional) Add `NEXT_PUBLIC_COMMUNITY_APP_URL` if you need to reference the Community App URL
5. **Important:** After adding, **redeploy** your admin app:
   - Go to **Deployments** tab
   - Click `...` on latest deployment
   - Click **Redeploy**
   - Select branch (usually `main` or `master`)

---

## 🔐 Generating AUTH_SECRET

The `AUTH_SECRET` must be at least 32 characters long. Generate it using:

```bash
openssl rand -base64 32
```

Example output:
```
VlzbZyJ6cy5+87X+3kGP6vpv0gUfNUeY33CoG5+69Vs=
```

**Important:**
- Use the **same** `AUTH_SECRET` for all environments (Production, Preview, Development)
- Keep it secret - never commit it to git
- If compromised, generate a new one and update all environments

---

## 📋 Quick Setup Checklist

### Community App
- [ ] `DATABASE_URL` - Neon PostgreSQL connection string
- [ ] `AUTH_SECRET` - Generated secret (32+ chars)
- [ ] `ADMIN_APP_URL` (optional) - Admin app URL for CORS
- [ ] Set for **all environments** (Production, Preview, Development)
- [ ] **Redeploy** after setting variables

### Admin App
- [ ] `NEXT_PUBLIC_COMMUNITY_APP_URL` - Community App production URL
- [ ] Set for **all environments** (Production, Preview, Development)
- [ ] **Redeploy** after setting variables

---

## 🧪 Verification

### Community App Health Check
After deployment, verify:
```
https://your-community-app.vercel.app/api/auth/health
```

Should return:
```json
{
  "status": "healthy",
  "checks": {
    "AUTH_SECRET": true,
    "AUTH_SECRET_VALID": true,
    "DATABASE_URL": true
  }
}
```

### Admin App Connection Test
1. Open browser console on admin app
2. Look for: `[API CLIENT] Making request:`
3. Should show: `url: "https://impacthubnairobi-app.vercel.app/api/..."`
4. Should NOT show: `url: "http://localhost:3000/..."`

---

## 🔄 Environment-Specific Values

### Development (Local)
For local development, use `.env.local` files:

**Community App** (`Community-App/frontend/.env.local`):
```env
DATABASE_URL="postgresql://neondb_owner:password@ep-xxx.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="your-generated-secret-here"
```

**Admin App** (`Community-app-admin/.env.local`):
```env
NEXT_PUBLIC_COMMUNITY_APP_URL=http://localhost:3000
```

### Production (Vercel)
Set in Vercel Dashboard as described above.

### Preview (Vercel)
Same as Production - Vercel automatically uses Production env vars for preview deployments unless you set Preview-specific ones.

---

## 🚨 Common Issues

### Issue: "AUTH_SECRET is not set"
**Solution:** 
- Check variable is set in Vercel
- Check it's enabled for the correct environment
- Redeploy after setting

### Issue: "DATABASE_URL is not set"
**Solution:**
- Verify Neon connection string is correct
- Check it's set for all environments
- Redeploy after setting

### Issue: Admin App calling localhost:3000
**Solution:**
- Set `NEXT_PUBLIC_COMMUNITY_APP_URL` in Admin App Vercel settings
- Make sure it's set for Production environment
- Redeploy Admin App

### Issue: CORS errors
**Solution:**
- Verify `NEXT_PUBLIC_COMMUNITY_APP_URL` is set in Admin App
- Check Community App CORS middleware is allowing the admin app origin
- Redeploy both apps

---

## 📝 Notes

- **`NEXT_PUBLIC_*`** variables are exposed to the browser (safe for public URLs)
- **Non-`NEXT_PUBLIC_*`** variables are server-only (keep secrets here)
- Environment variables are loaded at **build time** and **runtime**
- Changes require **redeployment** to take effect
- Use the same `AUTH_SECRET` across all environments for consistency

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Dashboard**: https://console.neon.tech
- **Community App Health Check**: `/api/auth/health`
- **Admin App Setup Check**: See `Community-app-admin/README_ADMIN_SETUP.md`
