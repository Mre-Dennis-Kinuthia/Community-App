# Shared Prisma Setup - Architecture Guide

## Overview

Both the **Community App** and **Admin App** now share the same Prisma schema and database connection. This provides:

- ✅ **Single source of truth** for database schema
- ✅ **Direct database access** from Admin App (no API overhead)
- ✅ **Type safety** across both applications
- ✅ **Consistent data models** between apps

## Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   Community App    │         │    Admin App        │
│   (Frontend)        │         │   (Frontend)        │
├─────────────────────┤         ├─────────────────────┤
│                     │         │                     │
│  Prisma Client      │         │  Prisma Client      │
│  (lib/prisma.ts)    │         │  (lib/prisma.ts)    │
│                     │         │                     │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           │                               │
           └───────────┬───────────────────┘
                       │
                       ▼
           ┌─────────────────────┐
           │   Shared Database   │
           │   (Neon PostgreSQL) │
           └─────────────────────┘
```

## File Structure

### Community App
```
Community-App/frontend/
├── prisma/
│   └── schema.prisma          # Shared schema
├── lib/
│   └── prisma.ts              # Prisma client instance
└── app/api/                   # API routes (for public access)
```

### Admin App
```
Community-app-admin/
├── prisma/
│   └── schema.prisma          # Same schema (copied/synced)
├── lib/
│   └── prisma.ts              # Prisma client instance
└── app/api/admin/             # Admin API routes (uses Prisma directly)
```

## Key Changes

### 1. Admin App Now Has Prisma

**Before:**
- Admin App → API calls → Community App → Prisma → Database

**After:**
- Admin App → Prisma → Database (direct)
- Community App → Prisma → Database (direct)

### 2. API Client Updated

The Admin App's `lib/api-client.ts` now calls **local API routes** instead of the Community App:

```typescript
// Before: Called Community App API
const url = `${COMMUNITY_APP_URL}/api/admin/members`

// After: Calls local Admin App API
const url = "/api/admin/members"
```

### 3. Admin API Routes

Admin App now has its own API routes that use Prisma directly:

- `/api/admin/auth/login` - Admin authentication
- `/api/admin/dashboard/metrics` - Dashboard statistics
- `/api/admin/members` - Member management
- `/api/admin/bookings` - Booking management
- (More routes to be added as needed)

## Environment Variables

### Community App
- `DATABASE_URL` - Neon connection string
- `AUTH_SECRET` - Auth.js secret

### Admin App
- `DATABASE_URL` - **Same Neon connection string** (shared database)
- (Optional) `NEXT_PUBLIC_COMMUNITY_APP_URL` - For redirects/references

## Keeping Schemas in Sync

The Prisma schemas are **automatically synced** using a sync script.

### Automatic Sync

The schema is automatically synced:
- ✅ **Before builds** - `npm run build` syncs automatically
- ✅ **After installs** - `npm install` syncs automatically
- ✅ **On demand** - `npm run db:sync-schema`
- ✅ **Watch mode** - `npm run db:sync-schema:watch` (for development)

### Manual Sync

If you need to sync manually:

**From Community App:**
```bash
npm run db:sync-schema
```

**From Admin App:**
```bash
npm run db:sync-schema
```

### Watch Mode (Development)

For active development, use watch mode to automatically sync on changes:

```bash
# In Community App
npm run db:sync-schema:watch
```

This watches `Community-App/frontend/prisma/schema.prisma` and automatically syncs to Admin App whenever it changes.

### Workflow

1. **Edit schema** in `Community-App/frontend/prisma/schema.prisma`
2. **Schema auto-syncs** (via build/install/watch)
3. **Generate Prisma Client** in both apps:
   ```bash
   # Community App
   npm run db:generate
   
   # Admin App
   cd ../../Community-app-admin
   npm run db:generate
   ```
4. **Run migrations** (from Community App only):
   ```bash
   npm run db:migrate
   ```

## Database Migrations

**Important:** Only run migrations from **one app** (preferably Community App) since they both connect to the same database.

```bash
# In Community App
cd Community-App/frontend
npm run db:migrate

# In Admin App (after schema sync)
cd Community-app-admin
npm run db:generate  # Just generate client, don't migrate
```

## Benefits

1. **Performance:** Admin App queries database directly (no API round-trip)
2. **Type Safety:** Both apps use the same Prisma types
3. **Consistency:** Single schema ensures data models match
4. **Flexibility:** Admin App can query any data without exposing API endpoints
5. **Development:** Easier to debug and develop admin features

## Migration Checklist

- [x] Copy Prisma schema to Admin App
- [x] Install Prisma dependencies in Admin App
- [x] Create `lib/prisma.ts` in Admin App
- [x] Update Admin App `package.json` with Prisma scripts
- [x] Create admin API routes using Prisma
- [x] Update API client to use local routes
- [x] Update environment variables documentation
- [ ] Keep schemas in sync (manual for now)
- [ ] Test admin login with Prisma
- [ ] Test dashboard metrics with Prisma
- [ ] Test member management with Prisma

## Next Steps

1. **Sync schemas** when making changes
2. **Run migrations** from Community App only
3. **Generate Prisma client** in both apps after schema changes
4. **Test thoroughly** to ensure both apps work correctly
