# Space Inventory Migration Guide

This guide explains how to migrate from **type-based bookings** (`resourceType` on `WorkspaceBooking`) to **asset-linked bookings** (`spaceAssetId`).

## Overview

| Before | After |
|--------|-------|
| Book "meeting-room" (generic) | Book "Meeting Room 2" (specific asset) |
| `Workspace` = marketing listing | `Location` → `Floor` → `Zone` → `SpaceAsset` = operational inventory |
| No daily check-in | `CheckIn` model for hub attendance |

Legacy bookings with `spaceAssetId = null` continue to work when `spaceInventory` flag is off or for historical data.

## Step 1 — Run database migration

```bash
cd Community-App/frontend
npx prisma migrate dev --name add_space_inventory
cd ../../Community-app-admin
npm run db:sync-schema
npx prisma generate
```

## Step 2 — Seed initial inventory

```bash
cd Community-App/frontend
npx tsx scripts/seed-space-inventory.ts
```

This creates for each active `Workspace`:
- One `Location` linked via `workspaceId`
- One `Floor` (Ground Floor)
- Two `Zone`s (Open Workspace, Meeting Rooms)
- Default assets: hot desk area, 3 meeting rooms, 1 private office

Customize assets in **Admin → Space → Inventory** after seeding.

## Step 3 — Enable feature flag (staging first)

In both apps' `lib/feature-flags.ts`:

```typescript
spaceInventory: true,
```

Deploy to staging and verify:
- Admin inventory CRUD
- Member booking shows asset picker
- Check-in on dashboard
- Attendance → Spaces tab shows daily check-ins

## Step 4 — Map existing bookings (optional)

Historical bookings do not need backfilling. To link future behaviour:

1. Ensure meeting room assets exist with names matching your ops terminology
2. New bookings will use `spaceAssetId` when members pick a specific space
3. Admin bookings list shows asset name when present

Optional backfill script (manual): match `resourceType = meeting-room` bookings to a default meeting room asset by date range — only if you need historical utilisation per room.

## Step 5 — Desk assignments

For organisational members with fixed desks:

1. Admin → Space → Assignments
2. Enter member user ID + select dedicated desk asset
3. Member sees assigned desk on dashboard

## Rollback

Set `spaceInventory: false` in feature flags. APIs return 404; UI routes redirect. Data remains in database.

## Models reference

```
Location
  └── Floor
       └── Zone
            └── SpaceAsset
                 ├── WorkspaceBooking.spaceAssetId (optional)
                 └── DeskAssignment (permanent desk)
CheckIn (daily hub attendance)
```
