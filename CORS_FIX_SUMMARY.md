# CORS Fix Summary

## Problem
Admin App deployed on Vercel (`https://impacthubnairobi-app-admin.vercel.app`) was trying to access `http://localhost:3000` and getting CORS errors.

## Solution Implemented

### 1. Dynamic CORS Headers
- Created `middleware-cors.ts` to handle CORS dynamically
- Allows requests from:
  - `http://localhost:3001` (local dev)
  - `https://impacthubnairobi-app-admin.vercel.app` (production)
  - Any Vercel preview deployment matching the pattern

### 2. OPTIONS Preflight Handling
- Added `OPTIONS` handlers to all admin API routes
- Handles CORS preflight requests properly

### 3. API Client URL Detection
- Updated API client to detect environment and use correct URL:
  - Localhost → `http://localhost:3000`
  - Vercel → `https://impacthubnairobi-app.vercel.app`
  - Can be overridden with `NEXT_PUBLIC_COMMUNITY_APP_URL` env var

### 4. CORS Headers on All Responses
- All admin API responses now include CORS headers
- Headers are added dynamically based on request origin

## Files Modified

### Community App
- ✅ `middleware-cors.ts` - CORS helper functions
- ✅ `app/api/admin/auth/login/route.ts` - Added OPTIONS + CORS headers
- ✅ `app/api/admin/dashboard/metrics/route.ts` - Added OPTIONS + CORS headers
- ✅ `app/api/admin/members/route.ts` - Added OPTIONS + CORS headers
- ✅ `app/api/admin/bookings/route.ts` - Added OPTIONS + CORS headers
- ✅ `next.config.mjs` - Removed static CORS (now handled dynamically)

### Admin App
- ✅ `lib/api-client.ts` - Dynamic URL detection, uses production URL on Vercel
- ✅ `README_ADMIN_SETUP.md` - Updated with production setup instructions

## Required Actions

### For Production Deployment

1. **Set Environment Variable in Admin App (Vercel):**
   ```
   NEXT_PUBLIC_COMMUNITY_APP_URL=https://impacthubnairobi-app.vercel.app
   ```
   - Go to Vercel Dashboard → Admin App → Settings → Environment Variables
   - Add the variable for **Production** environment
   - Redeploy the admin app

2. **Set Environment Variable in Community App (Vercel) - Optional:**
   ```
   ADMIN_APP_URL=https://impacthubnairobi-app-admin.vercel.app
   ```
   - This helps with CORS origin validation
   - Not strictly required (CORS middleware handles it dynamically)

## Testing

### Local Development
```bash
# Terminal 1: Community App
cd Community-App/frontend
npm run dev  # Runs on port 3000

# Terminal 2: Admin App
cd Community-app-admin
npm run dev  # Runs on port 3001
```

### Production
1. Deploy both apps to Vercel
2. Set `NEXT_PUBLIC_COMMUNITY_APP_URL` in Admin App
3. Test login at `https://impacthubnairobi-app-admin.vercel.app/login`

## Verification

Check browser console for:
- ✅ No CORS errors
- ✅ API requests going to correct URL (not localhost in production)
- ✅ Successful API responses

Check Network tab:
- ✅ OPTIONS preflight requests return 200
- ✅ Actual requests include CORS headers
- ✅ `Access-Control-Allow-Origin` matches admin app origin
