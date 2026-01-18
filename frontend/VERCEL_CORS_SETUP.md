# CORS Setup for Admin App Integration

## Problem

The Admin App (deployed on Vercel) needs to make API calls to the Community App. CORS (Cross-Origin Resource Sharing) must be configured to allow these requests.

## Solution

CORS is handled dynamically in each admin API route using `middleware-cors.ts`. This allows:
- Different origins for development vs production
- Support for Vercel preview deployments
- Proper handling of preflight OPTIONS requests

## Configuration

### Community App (Backend)

**Environment Variables (Vercel):**
- `ADMIN_APP_URL` (optional): Explicit admin app URL
- `NEXT_PUBLIC_ADMIN_APP_URL` (optional): Public admin app URL

**CORS Headers:**
- Automatically added to all `/api/admin/*` routes
- Allows requests from:
  - `http://localhost:3001` (local dev)
  - `https://impacthubnairobi-app-admin.vercel.app` (production)
  - Any Vercel preview deployment matching the pattern

### Admin App (Frontend)

**Environment Variables (Vercel):**
```
NEXT_PUBLIC_COMMUNITY_APP_URL=https://impacthubnairobi-app.vercel.app
```

**Important:** Set this in Vercel Dashboard → Settings → Environment Variables → Production

## How It Works

1. **Admin App makes request** → Community App API
2. **Browser sends preflight OPTIONS** → Community App checks origin
3. **Community App responds with CORS headers** → Allows the request
4. **Browser makes actual request** → Community App processes it

## Testing

### Local Development

1. Start Community App: `cd Community-App/frontend && npm run dev` (port 3000)
2. Start Admin App: `cd Community-app-admin && npm run dev` (port 3001)
3. Admin App should connect to `http://localhost:3000`

### Production

1. Deploy Community App to Vercel
2. Deploy Admin App to Vercel
3. Set `NEXT_PUBLIC_COMMUNITY_APP_URL` in Admin App's Vercel settings
4. Admin App should connect to production Community App URL

## Troubleshooting

### CORS Error: "Access-Control-Allow-Origin header has a value..."

**Cause:** The origin in the request doesn't match allowed origins.

**Solution:**
1. Check the actual origin in browser DevTools → Network tab
2. Add it to `allowedOrigins` in `middleware-cors.ts`
3. Or set `ADMIN_APP_URL` environment variable in Community App

### CORS Error: "Response to preflight request doesn't pass access control check"

**Cause:** OPTIONS request is not being handled properly.

**Solution:**
- All admin API routes now have OPTIONS handlers
- Check that `handleOptions` is being called

### API calls going to localhost in production

**Cause:** `NEXT_PUBLIC_COMMUNITY_APP_URL` not set in Vercel.

**Solution:**
1. Go to Vercel Dashboard → Admin App → Settings → Environment Variables
2. Add `NEXT_PUBLIC_COMMUNITY_APP_URL=https://impacthubnairobi-app.vercel.app`
3. Redeploy the admin app

## Security Notes

- CORS only allows specific origins (not `*`)
- Credentials are included (`Access-Control-Allow-Credentials: true`)
- All admin routes require authentication
- Rate limiting should be added for production
