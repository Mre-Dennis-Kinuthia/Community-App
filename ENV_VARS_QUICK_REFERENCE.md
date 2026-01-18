# Environment Variables - Quick Reference

## 🎯 TL;DR - What You Need to Set

### Community App (Vercel)
```
DATABASE_URL = [Your Neon connection string]
AUTH_SECRET = [Generate with: openssl rand -base64 32]
```

### Admin App (Vercel)
```
DATABASE_URL = [Same as Community App - shared database]
```

---

## 📝 Step-by-Step

### 1. Generate AUTH_SECRET

Run this command:
```bash
openssl rand -base64 32
```

Copy the output (it will be something like: `VlzbZyJ6cy5+87X+3kGP6vpv0gUfNUeY33CoG5+69Vs=`)

### 2. Set Community App Variables

1. Go to: https://vercel.com/dashboard
2. Click on your **Community App** project
3. Go to: **Settings** → **Environment Variables**
4. Click **Add New**

   **Variable 1:**
   - Name: `DATABASE_URL`
   - Value: `postgresql://neondb_owner:npg_pAfRKFZNP6m1@ep-lively-cloud-ahj4g1s0-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - Environments: ✅ Production ✅ Preview ✅ Development
   - Click **Save**

   **Variable 2:**
   - Name: `AUTH_SECRET`
   - Value: `[paste the generated secret from step 1]`
   - Environments: ✅ Production ✅ Preview ✅ Development
   - Click **Save**

5. **Redeploy:**
   - Go to **Deployments** tab
   - Click `...` on latest deployment
   - Click **Redeploy**
   - Wait for deployment to complete

### 3. Set Admin App Variables

1. Go to: https://vercel.com/dashboard
2. Click on your **Admin App** project
3. Go to: **Settings** → **Environment Variables**
4. Click **Add New**

   **Variable:**
   - Name: `DATABASE_URL`
   - Value: `[Same connection string as Community App]` - Both apps share the same database
   - Environments: ✅ Production ✅ Preview ✅ Development
   - Click **Save**

5. **Redeploy:**
   - Go to **Deployments** tab
   - Click `...` on latest deployment
   - Click **Redeploy**
   - Wait for deployment to complete

---

## ✅ Verification

### Check Community App
Visit: `https://your-community-app.vercel.app/api/auth/health`

Should show:
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

### Check Admin App
1. Open: `https://your-admin-app.vercel.app/login`
2. Open browser console (F12)
3. Look for: `[API CLIENT] Making request:`
4. Should show: `url: "https://impacthubnairobi-app.vercel.app/api/..."`
5. Should NOT show: `url: "http://localhost:3000/..."`

---

## 🔍 Finding Your URLs

### Community App URL
- Vercel Dashboard → Community App → **Deployments** → Latest deployment
- Copy the URL (e.g., `https://impacthubnairobi-app.vercel.app`)

### Admin App URL
- Vercel Dashboard → Admin App → **Deployments** → Latest deployment
- Copy the URL (e.g., `https://impacthubnairobi-app-admin.vercel.app`)

### Neon Database URL
- Neon Dashboard → Your Project → **Connection Details**
- Copy the connection string
- Format: `postgresql://user:password@host/database?sslmode=require`

---

## 🚨 Troubleshooting

**"AUTH_SECRET is not set"**
→ Set it in Vercel and redeploy

**"DATABASE_URL is not set"**
→ Set it in Vercel and redeploy

**Admin app calling localhost:3000**
→ Set `NEXT_PUBLIC_COMMUNITY_APP_URL` in Admin App Vercel settings and redeploy

**CORS errors**
→ Make sure `NEXT_PUBLIC_COMMUNITY_APP_URL` is set in Admin App and both apps are redeployed

---

**Remember:** Always redeploy after setting environment variables! 🚀
