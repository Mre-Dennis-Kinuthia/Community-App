# Setup & Configuration — Impact Hub (web + admin)

Member web app (`Community-App/frontend`, port **3000**) and staff admin app (`Community-app-admin`, port **3001**) share one Neon PostgreSQL database.

| Doc | Purpose |
|-----|---------|
| This file | Shared production URLs, staging, OAuth, env vars, schema sync |
| [Community-app-admin/SETUP.md](../Community-app-admin/SETUP.md) | Admin-only Vercel, cron, preview pairing |
| [LAUNCH_SIGNOFF.md](../LAUNCH_SIGNOFF.md) | Go-live checklist (Section 11) |
| [LAUNCH_TODO.md](../LAUNCH_TODO.md) | Implementation tracker |

---

## Production URLs

Set these in Vercel and custom DNS when ready.

| App | Vercel project (default) | Production URL | Local |
|-----|--------------------------|----------------|-------|
| **Member web** | `impacthubnairobi-app` | `https://impacthubnairobi-app.vercel.app` | `http://localhost:3000` |
| **Staff admin** | `impacthubnairobi-app-admin` | `https://impacthubnairobi-app-admin.vercel.app` | `http://localhost:3001` |

**Custom domains (when configured):** point each Vercel project to your domain and update all env vars below to use `https://` custom URLs instead of `*.vercel.app`.

**Health checks**

| Endpoint | App |
|----------|-----|
| `GET /api/health` | Web — `{ ok: true }` |
| `GET /api/auth/health` | Web — Auth + DB config |
| `GET /api/admin/auth/me` (no cookie) | Admin — **401** |

---

## Quick start (local)

**Community App** (port 3000):

```bash
cd Community-App/frontend
cp .env.example .env.local
npm install
npm run dev
```

**Admin App** (port 3001):

```bash
cd Community-app-admin
cp .env.example .env.local
npm install
npm run dev
```

### Local `.env.local`

**`Community-App/frontend/.env.local`:**

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."   # openssl rand -base64 32
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# Optional: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
# Optional: RESEND_API_KEY, EMAIL_FROM
```

**`Community-app-admin/.env.local`:**

```env
DATABASE_URL="postgresql://..."   # same database as web
ADMIN_SESSION_SECRET="..."        # openssl rand -base64 32
NEXT_PUBLIC_COMMUNITY_APP_URL="http://localhost:3000"
CRON_SECRET="..."                 # optional locally
```

---

## Staging & preview deploys

### Recommended: separate Neon branch for non-production

Using one production database for Vercel **Preview** deploys risks test data and migrations affecting real users.

1. [Neon Console](https://console.neon.tech) → your project → **Branches** → create branch `staging` (or `preview`).
2. Copy the **staging** connection string.
3. In **both** Vercel projects → **Settings** → **Environment Variables**:
   - Set `DATABASE_URL` for **Preview** (and optionally **Development**) to the staging connection string.
   - Keep **Production** on the production Neon branch connection string.
4. Run migrations against staging once:  
   `cd Community-App/frontend && DATABASE_URL="<staging-url>" npx prisma migrate deploy`
5. Seed staging admin:  
   `cd Community-app-admin && npm run admin:create -- admin@ihn.test 'TestAdmin123!' super_admin`

**Acceptable shortcut (small teams):** single Neon branch for all environments — document the risk and never run destructive tests on production.

### Branch → Vercel environment

| Git branch | Vercel | Typical URL pattern |
|------------|--------|---------------------|
| `main` | Production | `impacthubnairobi-app.vercel.app`, `impacthubnairobi-app-admin.vercel.app` |
| `develop` | Preview (persistent staging) | `*-git-develop-*.vercel.app` |
| `launch/*` PRs | Preview per PR | `*-git-<branch>-*.vercel.app` |

Enable **Preview Deployments** on both projects (Settings → Git).

### Pair admin preview with web preview

Admin needs the **exact** member app URL for each preview environment:

| Vercel project | Variable | Production value | Preview value |
|----------------|----------|------------------|---------------|
| **Admin** | `NEXT_PUBLIC_COMMUNITY_APP_URL` | `https://impacthubnairobi-app.vercel.app` | URL of the **web** preview for the same PR/branch |
| **Web** (optional) | `ADMIN_APP_URL` / `NEXT_PUBLIC_ADMIN_APP_URL` | `https://impacthubnairobi-app-admin.vercel.app` | Admin preview URL if you link back to staff tools |

**Per-PR workflow**

1. Open the Vercel deployment for the **web** PR → copy **Visit** URL.
2. Admin project → Environment Variables → **Preview** → set `NEXT_PUBLIC_COMMUNITY_APP_URL` to that URL.  
   *Tip:* For a stable staging pair, use the `develop` branch preview URLs on both projects instead of every PR.
3. **Redeploy admin** after changing `NEXT_PUBLIC_*` (required for Next.js embed).

Admin API routes live on the **admin** host (`/api/admin/*`); they do not go through the member app. Staff duplicate routes under `Community-App/frontend/app/api/admin/` were removed for launch.

---

## Environment variables (Vercel)

Configure **Production**, **Preview**, and **Development** scopes per variable in each project.

### Member web (`impacthubnairobi-app`)

| Variable | Required | Production | Preview / staging |
|----------|----------|------------|-------------------|
| `DATABASE_URL` | Yes | Neon **production** branch | Neon **staging** branch (recommended) |
| `AUTH_SECRET` | Yes | 32+ chars | May differ from prod |
| `NEXT_PUBLIC_APP_URL` | Yes (prod) | `https://impacthubnairobi-app.vercel.app` | Web preview URL |
| `GOOGLE_CLIENT_ID` | No | Production OAuth client | Same client + preview redirect URI (below) |
| `GOOGLE_CLIENT_SECRET` | No | | |
| `RESEND_API_KEY` | For password reset | Production key | Staging key or same |
| `EMAIL_FROM` | For password reset | `noreply@yourdomain.org` | |
| `ADMIN_APP_URL` | No | `https://impacthubnairobi-app-admin.vercel.app` | Admin preview URL |

### Staff admin (`impacthubnairobi-app-admin`)

| Variable | Required | Production | Preview / staging |
|----------|----------|------------|-------------------|
| `DATABASE_URL` | Yes | Same Neon branch as web (per environment) | Staging branch with web |
| `ADMIN_SESSION_SECRET` | Yes | 32+ chars | Staging-specific secret |
| `NEXT_PUBLIC_COMMUNITY_APP_URL` | Yes | `https://impacthubnairobi-app.vercel.app` | **Exact web preview URL** |
| `CRON_SECRET` | Yes in prod | Strong secret | Set for preview cron tests |

Generate secrets:

```bash
openssl rand -base64 32
```

Never commit secrets to git. Redeploy both apps after changing env vars.

---

## Google OAuth (member web)

Used for “Continue with Google” on `/login` and `/register`.

### 1. Google Cloud Console

[APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials) → **OAuth client ID** → **Web application**.

### 2. Authorized redirect URIs

Add **every** environment users will sign in from:

| Environment | Redirect URI |
|-------------|----------------|
| Local | `http://localhost:3000/api/auth/callback/google` |
| Production | `https://impacthubnairobi-app.vercel.app/api/auth/callback/google` |
| Staging (`develop` preview) | `https://<your-web-develop-preview>.vercel.app/api/auth/callback/google` |

**PR previews:** Google does not support wildcard redirect URIs. Choose one:

- **A (recommended):** Only enable Google sign-in on production + stable `develop` preview — add that preview’s exact URL to Google Console.
- **B:** Skip Google on ephemeral PR previews; use email/password only.
- **C:** Add each PR preview URL manually when testing OAuth on a PR (tedious).

### 3. Authorized JavaScript origins (optional but recommended)

- `http://localhost:3000`
- `https://impacthubnairobi-app.vercel.app`
- Your `develop` preview origin (no path): `https://impacthubnairobi-app-git-develop-*.vercel.app`

### 4. Vercel

Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to the **web** project for the scopes you use → **Redeploy**.

---

## Vercel deployment checklist (both apps)

### Member web

| Setting | Value |
|---------|--------|
| Root Directory | `frontend` (if repo root is `Community-App`) |
| Production branch | `main` |
| Build | `npm run build` |
| Node | 20.x |

1. Environment variables (table above) for Production + Preview + Development  
2. Redeploy after changes  

### Staff admin

| Setting | Value |
|---------|--------|
| Root Directory | `.` (admin repo root) |
| Production branch | `main` |
| Build | `npm run build` |

See [Community-app-admin/SETUP.md](../Community-app-admin/SETUP.md) for cron and admin verification.

---

## Branch protection (GitHub)

Apply to **both** repositories (`Community-App` and `Community-app-admin`) on branches `main` and `develop`:

1. **Require a pull request before merging**
2. **Require status checks:** `CI / quality` (workflow name in each repo)
3. **Require branches to be up to date**
4. **Do not allow bypassing** (include administrators for launch discipline)
5. **Dismiss stale approvals** when new commits are pushed
6. **Restrict direct pushes** to `main` / `develop`

Step-by-step:  
- Web: `Community-App/frontend/.github/branch-protection-rules.md`  
- Admin: `Community-app-admin/.github/branch-protection-rules.md`

---

## Launch sign-off meeting

Before announcing go-live:

1. Complete [LAUNCH_SIGNOFF.md](../LAUNCH_SIGNOFF.md) (Section 11 criteria).
2. Run smoke tests from `HUBSTACK_LAUNCH_STRATEGY.md` Section 7 (~30 min).
3. Record sign-off names and production URLs in `LAUNCH_SIGNOFF.md`.
4. Confirm production env vars on Vercel match this doc.

---

## Database & Prisma

Both apps use Prisma against the **same** database. Migrations run **only** from the member web app.

```
Community-App/frontend (Prisma)  ──┐
                                    ├──▶  Neon PostgreSQL
Community-app-admin (Prisma)     ──┘
```

| File | Role |
|------|------|
| `Community-App/frontend/prisma/schema.prisma` | **Source of truth** |
| `Community-app-admin/prisma/schema.prisma` | Synced copy — do not edit by hand |

```bash
# Migrate (web only)
cd Community-App/frontend
npm run db:migrate

# Sync schema to admin
npm run db:sync-schema
cd ../../Community-app-admin && npm run db:assert-schema
```

Watch mode during development: `npm run db:sync-schema:watch` (from `frontend`).

---

## CORS & cross-app origins

- **Admin app** serves its own `/api/admin/*` routes (no member-app admin API at launch).
- **Member app** `middleware-cors.ts` may still allow `impacthubnairobi` `*.vercel.app` origins for legacy or member API use from admin previews if needed.
- Set `ADMIN_APP_URL` on the **web** project if you need an explicit admin origin allowlist.

**Verify admin in production:** DevTools → Network → admin UI requests go to the **admin** host, not `localhost:3000`.

---

## Verification

### Web

```bash
curl -s https://impacthubnairobi-app.vercel.app/api/health
curl -s https://impacthubnairobi-app.vercel.app/api/auth/health
```

### Admin

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  https://impacthubnairobi-app-admin.vercel.app/api/admin/news
# Expect 401 without session cookie
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `AUTH_SECRET is not set` | Web Vercel env → redeploy |
| `ADMIN_SESSION_SECRET` missing | Admin Vercel env → redeploy |
| Admin links open wrong web URL | Fix `NEXT_PUBLIC_COMMUNITY_APP_URL` on admin → redeploy |
| Google OAuth `redirect_uri_mismatch` | Add exact callback URL in Google Console for that host |
| Preview admin can’t reach data | Check preview `DATABASE_URL` points to staging Neon branch |
| Schema errors on admin build | `npm run db:sync-schema` from web; commit admin `schema.prisma` |
| Password reset emails not sent | Set `RESEND_API_KEY` + `EMAIL_FROM` on web Vercel |

---

## Quick links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Neon Console](https://console.neon.tech)
- [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials)
- [LAUNCH_SIGNOFF.md](../LAUNCH_SIGNOFF.md)
