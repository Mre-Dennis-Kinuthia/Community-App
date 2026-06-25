# Domain Modules

The IHN Community platform is organised into four domains. Each domain maps to `lib/` folders in both **Community-App** (member) and **Community-app-admin** (staff).

## Domains

| Domain | Purpose | lib folder |
|--------|---------|------------|
| **Community** | Members, events, news, partners, programs, notifications | Existing code in `lib/`, `components/` |
| **Space** | Inventory, bookings, check-ins, desk assignments, visitors | `lib/space/` |
| **Finance** | Subscriptions, invoices, payments, reminders, exports | `lib/finance/` |
| **Operations** | Maintenance, cleaning, vendors, deliveries, utilities | `lib/operations/` |

## Integrations

Cross-cutting adapters (M-Pesa, accounting, access control) live in `lib/integrations/`.

## Feature flags

| Flag | Domain |
|------|--------|
| `spaceInventory` | Space |
| `visitorManagement` | Space |
| `deliveryManagement` | Operations |
| `operationsModule` | Operations |
| `accessControl` | Integrations |
| `advancedReporting` | Finance + Space |

Flags default to `false`. Enable in staging before production rollout.

## Schema source of truth

`Community-App/frontend/prisma/schema.prisma` — sync to admin via `npm run db:sync-schema` in Community-app-admin.
