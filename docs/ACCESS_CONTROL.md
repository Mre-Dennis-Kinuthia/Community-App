# Access Control Integration

Adapter pattern for door badges, turnstiles, and building access — **no vendor API is wired until hardware is chosen**.

## Architecture

```
Booking confirm / cancel ──┐
Check-in POST ─────────────┼──► lib/integrations/access-control.ts
                           │         │
                           │         ▼
                           │   AccessControlProvider (interface)
                           │         │
                           │    NullAccessProvider (default, no-op)
                           │         │
                           │    [Future: KisiProvider, BrivoProvider, …]
                           │
AccessControlIntegration (DB config, isActive)
```

## Provider interface

Located at `Community-App/frontend/lib/integrations/access-control.ts`:

- `grantAccess(ctx)` — called when a booking is confirmed or a member checks in
- `revokeAccess(ctx)` — called when a booking is cancelled

`AccessGrantContext` includes `userId`, `locationId`, `spaceAssetId`, `bookingId`, `checkInId`, and optional validity window.

## Default behaviour

- Feature flag `accessControl` defaults to **`false`**
- `NullAccessProvider` is used — all grant/revoke calls are no-ops
- No external network calls

## Enabling a real provider (future)

1. Choose hardware vendor (Kisi, Brivo, Salto, etc.)
2. Implement `AccessControlProvider` for that vendor
3. Register provider in `loadActiveProvider()` when `AccessControlIntegration.provider` matches
4. Insert row in `access_control_integrations` with `isActive: true` and vendor config JSON
5. Set `accessControl: true` in feature flags (staging first)

## Admin UI

**Settings → Integrations** (`/dashboard/settings/integrations`) shows connection status when `accessControl` flag is on.

API: `GET /api/admin/integrations/access-control`

## Hooks (member app)

| Event | File | Action |
|-------|------|--------|
| Check-in | `app/api/check-in/route.ts` | `syncAccessForCheckIn` |
| Booking created (confirmed) | `app/api/bookings/route.ts` | `syncAccessForBooking` |
| Booking cancelled | `app/api/bookings/[id]/route.ts` | `syncAccessForBooking` (revoke) |

## Security notes

- Store API keys in environment variables or encrypted config — never in client bundles
- Audit grant/revoke in `audit_logs` when a real provider is added
- Scope access to booking window + check-in day only
