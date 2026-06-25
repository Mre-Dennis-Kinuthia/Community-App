# IHN Community Platform — Restructure & Implementation Guide

> **Purpose:** Gap analysis, architecture plan, and **one-shot Cursor prompts** for expanding the IHN Community platform into a full workspace management system.
>
> **Apps covered:** `Community-App` (member portal, port 3000) · `Community-app-admin` (staff console, port 3001)
>
> **Last updated:** June 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture](#current-architecture)
3. [Operational Priorities Gap Analysis](#operational-priorities-gap-analysis)
4. [What We Already Do Well](#what-we-already-do-well)
5. [Proposed Domain Restructure](#proposed-domain-restructure)
6. [Build vs. Buy Decision](#build-vs-buy-decision)
7. [Phased Roadmap Overview](#phased-roadmap-overview)
8. [What Not to Build](#what-not-to-build)
9. [One-Shot Implementation (Cursor Prompts)](#one-shot-implementation-cursor-prompts)
10. [Schema Reference](#schema-reference)
11. [Admin Navigation Restructure](#admin-navigation-restructure)
12. [Feature Flags](#feature-flags)

---

## Executive Summary

The IHN Community app already covers **~40–45%** of a full workspace management wishlist, concentrated in:

- Community & member portal
- Membership tiers & M-Pesa billing
- Basic workspace booking (by resource type, not specific assets)
- Events, news, notifications

It is **not yet** a workspace operations system. The biggest gaps are:

- Space inventory (floors, desks, rooms as trackable assets)
- Visitor management & daily check-in
- Delivery / mailroom
- Facilities & maintenance operations
- Deep billing reports & accounting integration
- Occupancy / utilisation analytics

**Recommended approach:** Hybrid — expand IHN Community App in phases rather than replacing it with OfficeRnD/Nexudus. Use third-party integrations only where build cost is high and differentiation is low (e.g. access control hardware, optional visitor kiosk).

---

## Current Architecture

```
Community-App (:3000)  ──Prisma──►  Neon PostgreSQL  ◄──Prisma──  Community-app-admin (:3001)
     │                                                                      │
     └── Member APIs (/app/api/*)                          Admin APIs (/app/api/admin/*)
```

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16, React 19, TypeScript |
| Database | Neon PostgreSQL via Prisma |
| Auth (members) | Auth.js / next-auth v5, JWT sessions |
| Auth (admin) | Separate `admin_users` table, bcrypt + JWT cookie |
| Payments | M-Pesa Daraja STK Push |
| Email | Gmail SMTP / Resend |
| Hosting | Vercel (cron jobs for membership) |

**Key models today:**

- `Workspace` — marketing/config listing (not inventory)
- `WorkspaceBooking` — `resourceType` string (`hot-desk`, `meeting-room`, `private-office`)
- `Plan`, `Subscription`, `Payment`, `Invoice` — membership billing
- `SupportTicket` — member helpdesk (not facilities)
- `Event`, `EventRegistration` — event check-in via QR code

**Schema source of truth:** `Community-App/frontend/prisma/schema.prisma` (synced to admin via `scripts/sync-prisma-schema.ts`)

---

## Operational Priorities Gap Analysis

| Priority Area | Current State | Coverage | Gap |
|---------------|---------------|----------|-----|
| Visitor management & check-in | Event QR check-in only | ~10% | No visitor model, pre-registration, host notifications, front-desk flow |
| Space inventory management | `Workspace` listings | ~20% | No floors, zones, desks, rooms, or assets as inventory |
| Desk/office assignment & occupancy | Bookings by `resourceType` enum | ~25% | No permanent desk assignment, seat maps, real-time occupancy |
| Meeting room & desk booking | Full flow + availability + M-Pesa | **~80%** | Works for type-based booking; not tied to specific rooms/desks |
| Delivery management | — | 0% | Not built |
| Access control integration | Admin RBAC only | 0% | No door/badge/turnstile integration |
| Billing & accounting | Plans, subscriptions, invoices, M-Pesa | **~60%** | No QuickBooks/Xero sync; shallow refund/aging reports |
| Operations & maintenance | `SupportTicket` (helpdesk) | ~15% | No facilities tickets, cleaning, vendors, utilities |
| Community & communication | News, events, directory, notifications | **~75%** | No internal chat, surveys, dedicated announcements |
| Reporting & analytics | Dashboard KPIs only | ~25% | No occupancy, utilisation, retention, traffic analytics |
| Member portal | Dashboard, profile, bookings, billing | **~85%** | Strong |

---

## What We Already Do Well

Compared to OfficeRnD ($170–300/mo), Nexudus ($150/mo), Coworks ($149/mo), Cobot ($60/mo), Vizitor ($36–72/mo):

| Strength | IHN Community App | Commercial tools |
|----------|-------------------|------------------|
| Community directory & connections | Native, tailored | Weak or add-on |
| Events + Luma integration | Built | Varies |
| News & content | Built | Basic announcements |
| Kenya-specific billing (M-Pesa) | Built | Often Stripe-only |
| Membership tiers & benefits | Built | Standard |
| Brand & UX control | Full | Limited |
| Cost at 50 users | Hosting only (~$0–50/mo) | $60–300/mo |

Commercial tools win on: space inventory, visitor logs, deliveries, access control, facilities ops, and financial reporting.

---

## Proposed Domain Restructure

Reorganise the platform around **four domains**:

```
┌─────────────────────────────────────────────────────────────┐
│                    IHN Community Platform                    │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Community   │    Space     │   Finance    │  Facilities    │
│   Domain     │  Operations  │   Domain     │  & Ops Domain  │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ Members      │ Inventory    │ Subscriptions│ Maintenance    │
│ Events       │ Bookings     │ Invoices     │ Cleaning       │
│ News         │ Check-ins    │ Payments     │ Deliveries     │
│ Partners     │ Visitors     │ Reminders    │ Vendors        │
│ Programs     │ Assignments  │ Exports      │ Utilities      │
│ Notifications│ Occupancy    │ Accounting   │ Incidents      │
└──────────────┴──────────────┴──────────────┴────────────────┘
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                              │
                    Community-App (member)
                    Community-app-admin (staff)
```

### Space inventory hierarchy (new)

```
Location (e.g. Impact Hub Nairobi)
  └── Floor
       └── Zone (open area, private wing)
            └── SpaceAsset (desk, meeting room, private office)
                 ├── type, capacity, amenities
                 ├── status (available, occupied, maintenance)
                 └── assignments (permanent/semi-permanent)
```

---

## Build vs. Buy Decision

| Approach | Best when | Trade-off |
|----------|-----------|-----------|
| **A. Expand IHN Community App** | Community + Kenya billing are core; ops team is small | 6–12 months to reach Nexudus-level ops |
| **B. Commercial platform + IHN for community** | Visitors, desks, access are top priority | $150–300/mo + integration; fragmented UX |
| **C. Hybrid (recommended)** | Want both community depth and ops speed | IHN for community/billing; integrate where needed |

**Recommendation:** Option C — phased build on IHN.

| Phase | Timeline | Focus |
|-------|----------|-------|
| Phase 1 | 0–3 months | Space inventory + asset-linked bookings + check-in |
| Phase 2 | 3–6 months | Visitors + deliveries + billing depth |
| Phase 3 | 6–9 months | Operations module + surveys + announcements |
| Phase 4 | 9–12 months | Access control (when hardware chosen) |
| Phase 5 | Ongoing | Reporting & analytics dashboard |

---

## Phased Roadmap Overview

### Phase 1 — Space Foundation
- `Location`, `Floor`, `Zone`, `SpaceAsset` models
- Asset-linked bookings (`spaceAssetId` on `WorkspaceBooking`)
- `DeskAssignment` for organisational members
- `CheckIn` for daily hub attendance
- Admin inventory CRUD + availability grid
- Basic occupancy report

### Phase 2 — Front Desk & Finance
- `Visitor` + `VisitorCheckIn` with host notifications
- `Delivery` model + mailroom UI
- Payment reminder cron (generalise membership cron)
- Invoice PDF generation
- Accounting CSV export

### Phase 3 — Operations & Communication
- `MaintenanceTicket`, `CleaningSchedule`, `Vendor`, `UtilityInventory`
- Surveys (extend notifications)
- Pinned/urgent announcements
- Admin operations module

### Phase 4 — Access Control
- `AccessControlIntegration` adapter pattern
- Sync member/booking status → door access
- Only after hardware vendor is selected

### Phase 5 — Reporting & Analytics
- Revenue, occupancy, room utilisation, retention, traffic
- Exportable reports in `/dashboard/reports`

---

## What Not to Build

| Feature | Recommendation |
|---------|----------------|
| Internal chat | Use Slack / WhatsApp / Telegram |
| Full accounting GL | Export to Xero / QuickBooks |
| Access control hardware | Integrate when vendor is chosen |
| Visitor kiosk UI | Vizitor ($36–72/mo) if needed before Phase 2 |

---

## One-Shot Implementation (Cursor Prompts)

Use **one prompt per session**. Paste into Cursor Agent mode. Each prompt is self-contained — the agent should read this doc, explore both codebases, and implement everything in that phase without further prompts.

**Before you start:** Tag both repos: `@Community-App/ @Community-app-admin/`

**Conventions (all prompts):**
- Schema source of truth: `Community-App/frontend/prisma/schema.prisma` → sync to admin
- Match existing patterns: Next.js App Router, Prisma, Zod, shadcn/Radix, admin RBAC
- All new UI/APIs behind feature flags (default `false`) — do not break existing behaviour
- Keep backward compatibility: legacy `resourceType` bookings must still work when `spaceInventory` is off

| Prompt | Scope | When to run |
|--------|-------|-------------|
| **Prompt 1** | Foundation + Space | First — highest priority |
| **Prompt 2** | Front desk + Finance | After Prompt 1 merges |
| **Prompt 3** | Operations + Comms + Reports + Hardening | After Prompt 2 merges |

> **Tip:** If a single prompt times out or hits context limits, say *"Continue from WORKSPACE_PLATFORM_RESTRUCTURE.md Prompt N — finish remaining items"* and the agent will pick up where it left off.

---

### Prompt 1 — Foundation + Space Operations

Copy everything inside the block below:

```
@Community-App/ @Community-app-admin/

Read Community-App/docs/WORKSPACE_PLATFORM_RESTRUCTURE.md fully. Implement Phase 0 + Phase 1 (Foundation + Space Operations) in both apps.

## Phase 0 — Foundation
1. Add feature flags (all default false): spaceInventory, visitorManagement, deliveryManagement, operationsModule, accessControl, advancedReporting. Sync to both apps. Add isFeatureEnabled() helper.
2. Restructure admin sidebar into domain groups: Dashboard, Community, Space, Finance, Operations (hidden), Settings. Conditionally show Space/Operations via flags.
3. Create lib/ domain folders in both apps: space/, finance/, operations/, integrations/ with index.ts stubs.
4. Add docs/DOMAIN_MODULES.md explaining the four domains.

## Phase 1 — Space Operations
### Schema (Community-App/frontend/prisma/schema.prisma)
Add models with cuid IDs, timestamps, indexes, @@map:
- Location (name, slug, address, timezone, isActive, optional workspaceId → Workspace)
- Floor (locationId, name, level, floorPlanImageUrl)
- Zone (floorId, name, type enum: open_area, private_wing, meeting_area, other)
- SpaceAsset (zoneId, name, slug, type enum: hot_desk, dedicated_desk, meeting_room, private_office, phone_booth, event_space, capacity, amenities Json, status enum: available, occupied, maintenance, reserved, isBookable, metadata Json)
- DeskAssignment (userId, spaceAssetId, startDate, endDate?, type permanent|hot_desk_pool, status active|ended — one active assignment per asset)
- CheckIn (userId, locationId, checkedInAt, checkedOutAt?, method app|admin|qr — no duplicate same-day per user per location)
- Add optional spaceAssetId FK on WorkspaceBooking (nullable, backward compatible)

Run migration. Sync schema to admin. Generate Prisma clients. Verify both apps build.

### Admin APIs (gate behind spaceInventory, 404 when off)
- CRUD: /api/admin/locations, floors, zones, assets (nested routes OK)
- CRUD: /api/admin/assignments
- GET/POST: /api/admin/check-ins (manual check-in)
- GET: /api/admin/reports/occupancy (check-ins, bookings by type, assets in maintenance)
Use Zod, admin RBAC (community_manager + super_admin for writes).

### Admin UI (spaceInventory flag)
- /dashboard/space/inventory — Locations → Floors → Zones → Assets tree/tabs with CRUD
- /dashboard/space/assignments — assign organisational members to desks/offices
- Update /dashboard/attendance — daily check-ins + existing event data
- /dashboard/analytics — basic occupancy chart (recharts)
Update sidebar Space group. Update lib/api-client.ts.

### Member app (spaceInventory flag)
- GET /api/space/assets?type=&date=&startTime=&duration= — available assets
- Update booking flow: after type+date, pick specific asset; pass spaceAssetId to POST /api/bookings
- Update availability logic: asset-level conflicts when spaceAssetId set, else legacy resourceType
- POST/GET /api/check-in — daily hub check-in
- Dashboard: show assigned desk if DeskAssignment active; check-in button

### Seed & docs
- scripts/seed-space-inventory.ts — bootstrap Location/Floor/Zone/Assets from existing Workspace records
- docs/SPACE_MIGRATION.md — migration guide for existing bookings

When done: list files changed, migration name, and which flags to enable for testing.
```

---

### Prompt 2 — Front Desk + Finance

Copy everything inside the block below:

```
@Community-App/ @Community-app-admin/

Read Community-App/docs/WORKSPACE_PLATFORM_RESTRUCTURE.md. Implement Phase 2 (Front Desk + Finance). Assume Phase 1 (space inventory, check-in) is already merged.

## Schema
Add models (Prisma conventions, migrate, sync to admin):
- Visitor (name, email?, phone?, company?, hostUserId, expectedAt, purpose?, status expected|checked_in|checked_out|cancelled, locationId, createdBy)
- VisitorCheckIn (visitorId, checkedInAt, checkedOutAt?, checkedInBy)
- Delivery (recipientUserId, carrier?, trackingNumber?, description, status received|notified|picked_up, receivedAt, pickedUpAt?, receivedBy, locationId)
- Invoice: add lastReminderAt (optional)

## Visitor management (visitorManagement flag)
Member: POST/GET /api/visitors — pre-register guests
Admin: CRUD /api/admin/visitors, check-in/check-out endpoints
On create → notify host (Notification + email). On check-in → "Your visitor has arrived."
Admin UI: /dashboard/space/visitors — today's list, walk-in form, one-click check-in/out, mobile-friendly for reception

## Deliveries (deliveryManagement flag)
Admin: GET/POST/PUT /api/admin/deliveries, /dashboard/space/deliveries mailroom UI
Member: GET /api/deliveries — my packages; Notification when status → notified

## Finance depth
1. Extend or add /api/cron/billing-reminders — overdue/due-soon invoices + expiring subscriptions; email + in-app notification; idempotent (no repeat within 7 days). Add to vercel.json cron. Document in docs/BILLING_REMINDERS.md.
2. Invoice PDF: GET /api/billing/invoices/[id]/pdf — generate PDF, store pdfUrl. Member download from /billing. Admin trigger from billing UI.
3. GET /api/admin/billing/export?from=&to=&format=csv — accounting export (invoices + payments). Button on billing page.
4. Wire billing dashboard tabs that currently return empty: refunds, cashflow, aging, tax receipts — use real Invoice/Payment data.

When done: list new routes, cron schedule, and flags to enable for testing.
```

---

### Prompt 3 — Operations, Comms, Reports & Launch

Copy everything inside the block below:

```
@Community-App/ @Community-app-admin/

Read Community-App/docs/WORKSPACE_PLATFORM_RESTRUCTURE.md. Implement Phases 3–6 (Operations, Comms, Access stubs, Reporting, Hardening). Assume Phases 1–2 are merged.

## Phase 3 — Operations (operationsModule flag)
### Schema
- MaintenanceTicket (title, description, category internet|cleaning|printer|hvac|other, priority, status, locationId, spaceAssetId?, assignedTo, reportedBy, resolvedAt) — separate from SupportTicket
- CleaningSchedule (locationId, zoneId?, frequency daily|weekly, dayOfWeek, assignedVendorId, notes, isActive)
- Vendor (name, contactEmail?, contactPhone?, serviceType, notes)
- UtilityInventory (locationId, itemType, name, serialNumber?, lastServicedAt?, nextServiceDue?, notes)
- Survey + SurveyResponse (title, questions Json, status, targetAudience, answers Json)
- NewsPost: add announcementType normal|pinned|urgent, pinUntil? (or minimal Announcement model if cleaner)

### Admin APIs + UI
- /api/admin/maintenance, cleaning-schedules, vendors, utilities — full CRUD
- /dashboard/operations/* — maintenance board, cleaning schedule, vendors, utilities
- Surveys: admin CRUD + response aggregate; member GET active + POST respond
- Pinned/urgent announcements on member dashboard

### Member (optional)
- POST/GET /api/maintenance-requests — facilities issues → MaintenanceTicket (not SupportTicket)

## Phase 4 — Access control stub (accessControl flag)
- lib/integrations/access-control.ts — AccessControlProvider interface + NullAccessProvider default
- AccessControlIntegration model (provider, config Json, isActive)
- Hooks on booking confirm/cancel and check-in → grant/revoke (no-op unless configured)
- docs/ACCESS_CONTROL.md — document adapter pattern; no vendor API until hardware chosen
- Admin Settings → Integrations section (status: not connected)

## Phase 5 — Reporting (advancedReporting flag)
GET /api/admin/reports/* with from, to, locationId params:
- revenue (MRR, booking revenue by month/tier)
- occupancy (check-ins, desk utilisation, peak hours)
- room-utilisation (bookings vs available hours per asset)
- retention (active subs, churn, lastActiveAt cohorts)
- traffic (visitors, deliveries, event attendance)

/dashboard/reports — date range picker, tabs, recharts, CSV export per report.

## Phase 6 — Hardening
1. docs/FEATURE_ROLLOUT.md — flag dependency order, smoke test checklist per flag, rollback steps
2. Minimal happy-path tests: asset booking, check-in, visitor check-in, delivery notify, maintenance resolve
3. Accounting adapter stub in lib/integrations/ — CsvAccountingExporter + XeroExporter TODO
4. Ensure all new features are behind flags; nothing enabled in production by default

When done: summary of all new models, routes, pages, docs, and recommended flag rollout order.
```

---

### Continue prompt (if a session runs out of context)

```
@Community-App/ @Community-app-admin/

Continue implementing Community-App/docs/WORKSPACE_PLATFORM_RESTRUCTURE.md.

I was running Prompt [1|2|3]. Check git status and what's already built vs what's still missing from that prompt's spec. Finish remaining items only — don't redo completed work. Run migrations, sync schema, verify builds, then list what's left (if anything).
```

---

## Schema Reference

### New models (all phases)

| Model | Phase | Purpose |
|-------|-------|---------|
| `Location` | 1 | Physical site |
| `Floor` | 1 | Building level |
| `Zone` | 1 | Area within floor |
| `SpaceAsset` | 1 | Desk, room, office |
| `DeskAssignment` | 1 | Permanent desk mapping |
| `CheckIn` | 1 | Daily hub attendance |
| `Visitor` | 2 | Expected/walk-in guest |
| `VisitorCheckIn` | 2 | Arrival/departure log |
| `Delivery` | 2 | Package tracking |
| `MaintenanceTicket` | 3 | Facilities issue |
| `CleaningSchedule` | 3 | Recurring cleaning |
| `Vendor` | 3 | Service provider |
| `UtilityInventory` | 3 | Equipment tracking |
| `Survey` | 3 | Member survey |
| `SurveyResponse` | 3 | Survey answers |
| `AccessControlIntegration` | 4 | Provider config |

### Modified models

| Model | Change |
|-------|--------|
| `WorkspaceBooking` | Add optional `spaceAssetId` FK |
| `Invoice` | Use `pdfUrl`; optional `lastReminderAt` |
| `NewsPost` | Optional `announcementType`, `pinUntil` |

---

## Admin Navigation Restructure

**Target sidebar structure:**

```
Dashboard
├── Community
│   ├── Members
│   ├── Events
│   ├── News
│   ├── Partners
│   ├── Programs
│   └── Notifications
├── Space                    [spaceInventory]
│   ├── Inventory
│   ├── Bookings
│   ├── Assignments
│   ├── Check-ins
│   └── Visitors             [visitorManagement]
│   └── Deliveries           [deliveryManagement]
├── Finance
│   ├── Billing
│   └── Membership
├── Operations               [operationsModule]
│   ├── Maintenance
│   ├── Cleaning
│   ├── Vendors
│   └── Utilities
├── Reports                    [advancedReporting]
└── Settings
    ├── Admin users
    ├── Integrations
    └── Audit logs
```

---

## Feature Flags

```typescript
// Community-App/frontend/lib/feature-flags.ts
// Community-app-admin/lib/feature-flags.ts (synced)

export const FEATURE_FLAGS = {
  // Existing
  programsAndResources: true,
  myProjects: false,
  investmentsDealflow: false,
  projectsAndInitiatives: false,

  // Workspace platform expansion
  spaceInventory: false,       // Phase 1
  visitorManagement: false,    // Phase 2
  deliveryManagement: false,   // Phase 2
  operationsModule: false,     // Phase 3
  accessControl: false,        // Phase 4
  advancedReporting: false,    // Phase 5
} as const;
```

**Rollout order:** `spaceInventory` → `visitorManagement` + `deliveryManagement` → `operationsModule` → `accessControl` → `advancedReporting`

---

## Quick Reference

1. **3 prompts total** — Foundation+Space → Front Desk+Finance → Ops+Reports+Launch
2. **Tag both repos:** `@Community-App/ @Community-app-admin/`
3. **After schema changes:** `cd Community-App/frontend && npx prisma migrate dev` then sync admin schema
4. **Test locally:** member `:3000`, admin `:3001`
5. **Enable flags one at a time** in staging before production
6. **Session ran long?** Use the Continue prompt at the bottom of the One-Shot section

---

## Related Docs

- [CONCEPT_NOTE_IMPACT_HUB_NAIROBI.md](./CONCEPT_NOTE_IMPACT_HUB_NAIROBI.md)
- [BOOKING_REMINDERS.md](./BOOKING_REMINDERS.md)
- [DOMAIN_MODULES.md](./DOMAIN_MODULES.md) *(created by Prompt 1)*

---

*Generated for Impact Hub Nairobi workspace platform expansion planning.*
