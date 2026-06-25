# Feature Rollout Guide

Staged enablement for workspace platform expansion flags. **All flags default to `false` in production.**

## Flag dependency order

Enable in this sequence — each layer assumes the previous data model exists:

| Order | Flag | Prerequisite | Apply script |
|-------|------|--------------|--------------|
| 1 | `spaceInventory` | — | `npm run db:apply-space-inventory` |
| 2 | `visitorManagement` | Locations seeded | `npm run db:apply-phase2` |
| 2 | `deliveryManagement` | Locations seeded | `npm run db:apply-phase2` |
| 3 | `operationsModule` | Locations (optional assets) | `npm run db:apply-phase3-6` |
| 4 | `accessControl` | Bookings + check-in working | `npm run db:apply-phase3-6` |
| 5 | `advancedReporting` | Invoice/payment + space data | — |

Set flags in **both** apps:

- `Community-App/frontend/lib/feature-flags.ts`
- `Community-app-admin/lib/feature-flags.ts`

After schema changes: `cd Community-app-admin && npm run db:sync-schema && npx prisma generate`

## Smoke test checklist

### `spaceInventory`

- [ ] Admin: create location → floor → zone → asset
- [ ] Member: book workspace with asset picker
- [ ] Member: daily check-in on dashboard
- [ ] Admin: occupancy report at `/dashboard/analytics`

### `visitorManagement`

- [ ] Member: pre-register visitor at `/dashboard/visitors`
- [ ] Admin: walk-in + check-in at `/dashboard/space/visitors`
- [ ] Host receives notification

### `deliveryManagement`

- [ ] Admin: log package at `/dashboard/space/deliveries`
- [ ] Mark `notified` → member notification
- [ ] Member: view at `/dashboard/deliveries`

### `operationsModule`

- [ ] Member: `POST /api/maintenance-requests`
- [ ] Admin: resolve ticket at `/dashboard/operations/maintenance`
- [ ] Admin: CRUD vendors, cleaning schedules, utilities
- [ ] Admin: publish survey; member responds via `POST /api/surveys/[id]/respond`
- [ ] Pinned/urgent news appears on member dashboard

### `accessControl`

- [ ] Settings → Integrations shows "Not connected"
- [ ] Check-in and booking still work (no-op provider)
- [ ] No errors in logs for `[ACCESS CHECK-IN]` / `[ACCESS BOOKING]`

### `advancedReporting`

- [ ] `/dashboard/reports` loads all five tabs
- [ ] CSV export downloads per report
- [ ] Date range filter updates charts

## Rollback steps

1. Set the flag to `false` in both apps and deploy
2. Routes return 404; nav items hidden; existing data remains in DB
3. For schema rollback: restore DB snapshot (Neon branch) — do not drop tables in production without backup
4. If a cron or integration misbehaves: disable flag first, then fix forward

## Automated tests

```bash
cd Community-App/frontend
npm test
```

Covers happy-path logic for access control no-op, CSV accounting export, and report helpers.

## Recommended staging rollout

1. Week 1: `spaceInventory` only
2. Week 2: `visitorManagement` + `deliveryManagement`
3. Week 3: `operationsModule`
4. Week 4: `advancedReporting`
5. `accessControl` only after vendor selection (flag can stay off indefinitely)
