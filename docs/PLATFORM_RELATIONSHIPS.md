# Community and Admin Platform Relationships

This document describes how the member-facing Community App and staff-facing
Admin App connect to each other, their APIs, and the database.

## At a glance

The two applications are separate Next.js deployments, but they share one
PostgreSQL database. Each application has its own API routes and Prisma client;
the Admin App does not proxy its data operations through the Community App.

```text
Member browser
    │
    ▼
Community App (Next.js; frontend/)
    ├── /api/* ──► Community API handlers
    │                 │
    │                 ▼
    │              Prisma
    │                 │
    │                 └──────────────┐
    │                                ▼
    │                       Shared PostgreSQL
    │                       (Neon in deployment)
    │                                ▲
    │                 ┌──────────────┘
    │                 │
Staff browser         │
    │                 │
    ▼                 │
Admin App (Next.js)   │
    └── /api/admin/* ─► Admin API handlers ──► Prisma
```

In the deployed setup, these are separate Vercel projects. Locally, the
Community App typically runs on port `3000` and the Admin App on port `3001`.
The shared-database behavior depends on both apps' `DATABASE_URL` values
pointing to the same database branch for that environment.

## Application responsibilities

| Area | Community App | Admin App |
|---|---|---|
| Main users | Members and public visitors | Hub staff and administrators |
| UI | Member profiles, directory, events, bookings, projects, billing, and content | Member management, content management, operations, finance, and reporting |
| API routes | `Community-App/frontend/app/api/` | `Community-app-admin/app/api/admin/` |
| Data access | Community API handlers use the Community App Prisma client | Admin API handlers use the Admin App Prisma client |
| Database | Shared PostgreSQL database | Same shared PostgreSQL database |
| App base URL setting | `ADMIN_APP_URL` is used for staff-related links where configured | `NEXT_PUBLIC_COMMUNITY_APP_URL` is used for Community App links and member-platform handoff, not as an API proxy |

Admin dashboard requests use same-origin paths such as `/api/admin/members`.
The API client in the Admin App sends those requests to Admin App route
handlers, which authorize the staff request and then read or write the shared
database. Community App requests similarly go to its own route handlers, such
as `/api/profile` and `/api/events`.

The shared database is the data integration point. It is not a shared API:
each app has its own routes, request validation, authorization, and response
shape. For example, staff event-management requests go to
`/api/admin/events`, while the member-facing event list goes to `/api/events`.

## Database and schema ownership

The Community App schema at
[`frontend/prisma/schema.prisma`](../frontend/prisma/schema.prisma) is the
source of truth. The Admin App keeps a committed copy at
`Community-app-admin/prisma/schema.prisma`; its `db:sync-schema` script copies
the Community schema and removes datasource URLs for Prisma 7 compatibility.
The Admin App uses its own `prisma.config.ts` to resolve its database URL.

Both apps generate their own Prisma client from the same logical model set.
They do not have separate per-app copies of member, booking, or content data:
an Admin App write to a shared model is visible to the Community App the next
time its API queries that database. There is no separate API synchronization
or data replication step.

### Main shared records

| Data | Main model/table | Relationship and use |
|---|---|---|
| Member account | `User` / `users` | Central member identity. Related to bookings, subscriptions, payments, notifications, and project ownership. |
| Member profile | `MemberProfile` / `member_profiles` | Optional one-to-one profile; `userId` is unique and references `User.id`. Holds public directory and membership details. |
| Staff account | `AdminUser` / `admin_users` | Separate staff identity and role record used by Admin App login and authorization. It is not the same model as a member `User`. |
| Events | `Event` / `events` | Created and managed by staff; read by the Community App according to visibility and deletion state. |
| Event registrations | `EventRegistration` / `event_registrations` | Belongs to an event. Can represent a guest; `userId` is optional. |
| Workspace bookings | `WorkspaceBooking` / `workspace_bookings` | Belongs to a member `User`; can also reference a space asset and a payment. |
| Projects | `Project` / `projects` | May reference a founder `User`; staff manage review and publication state. |
| News | `NewsPost` / `news_posts` | Staff-authored content; optional `authorId` references `AdminUser`. Published posts are available to Community App routes. |
| Membership and payments | `Subscription`, `Payment`, and related models | Subscriptions belong to members; payments may reference a subscription, booking, or event registration. |
| Notifications | `Notification` / `notifications` | Optional `userId` targets a member; a null user can represent a broadcast. |

These are representative relationships, not an exhaustive ERD. Refer to the
Prisma schema for the authoritative fields, indexes, and foreign keys. Some
IDs used by workflows are application-level references rather than declared
foreign-key relations.

### Core identity and data relationships

```text
User (users)
  ├── 0..1 MemberProfile (member_profiles; unique userId)
  ├── many WorkspaceBooking (workspace_bookings)
  ├── many Subscription (subscriptions)
  ├── many Payment (payments)
  ├── many Notification (notifications)
  └── many Project as founder (projects; optional founderId)

AdminUser (admin_users)
  ├── many NewsPost as author (news_posts; optional authorId)
  └── staff role used by Admin App authorization

Event (events)
  └── many EventRegistration (event_registrations; optional member userId)

WorkspaceBooking ── optional Payment
Subscription ────── many Payment
EventRegistration ─ optional Payment
```

### How member management reads the shared data

For example, the Admin App's member-list route queries `prisma.user` and
selects each user's profile and counts of bookings, projects, and
subscriptions. The Community App's profile route authenticates a member,
resolves their `User.id`, and reads or updates the associated profile. These
are separate API handlers operating on the same `users` and
`member_profiles` tables.

## Authentication and authorization

Authentication is shared at the database-record level only where the relevant
record is shared; browser sessions and authorization mechanisms remain
separate.

### Community App

- Uses NextAuth with credentials and its own session configuration.
- Member credentials and identity are stored on `User` (`users`).
- Member API handlers authenticate the Community App session before allowing
  personal data changes.
- The Community App session secret is `AUTH_SECRET`.

### Admin App

- Staff credentials and role are stored separately on `AdminUser`
  (`admin_users`).
- Admin login issues an HTTP-only `admin_session` JWT cookie, signed with
  `ADMIN_SESSION_SECRET`.
- Admin API routes use `requireAdminForResource` and role-based permissions
  to protect staff operations.
- `AUTH_SECRET` and `ADMIN_SESSION_SECRET` serve different sessions and must
  not be treated as interchangeable.

### Super-admin member-platform handoff

The Admin App has a deliberate, limited handoff for a super-admin opening the
member platform:

1. A super-admin requests member-platform access through an Admin API route.
2. The Admin App ensures a corresponding `User` exists for the staff email
   (creating it if necessary) and issues a short-lived, single-use token in a
   `VerificationToken` record.
3. The Community App consumes that token and establishes its own NextAuth
   session for the corresponding member `User`.

This is not a shared cookie or general-purpose session bridge. The `AdminUser`
and `User` remain separate records; the provisioning flow associates them by
email and does not define a database foreign key between them.

## Typical data flows

### Staff publishes an event

```text
Admin dashboard
  → POST /api/admin/events
  → Admin authentication + events write permission
  → validate and write Event through Prisma
  → shared events table
  → Community GET /api/events reads eligible events
```

### Member updates their profile

```text
Community member UI
  → PUT /api/profile
  → validate Community App session and profile input
  → update User fields and upsert MemberProfile through Prisma
  → shared users / member_profiles tables
  → Admin member routes can read the updated values
```

### Staff manages a member

```text
Admin dashboard
  → GET or PUT /api/admin/members/{id}
  → Admin session + members permission
  → query or update User and its MemberProfile
  → Community App sees the changed records on later queries
```

## Environment and schema-change workflow

### Database configuration

For each environment, configure both apps to use the intended same database
branch:

- Community App: `DATABASE_URL`
- Admin App: `DATABASE_URL`

Production and preview deployments should normally use separate Neon branches.
Do not point a preview app at production just to make the two apps connect.
`NEXT_PUBLIC_COMMUNITY_APP_URL` configures the Admin App's links to the
Community App; it does not select or connect to the database.

### Changing the shared schema

1. Edit `Community-App/frontend/prisma/schema.prisma`.
2. Add and review a migration in the Community App.
3. Apply the migration once to the intended database branch; do not have both
   apps independently migrate the same database.
4. Sync the Admin schema with `npm run db:sync-schema` from
   `Community-app-admin`.
5. Generate Prisma clients in both applications and commit the Admin schema
   copy with the schema change.
6. Deploy both apps with matching schema/client versions.

The schema sync and assertion scripts live in
`Community-app-admin/scripts/sync-prisma-schema.ts` and
`Community-app-admin/scripts/assert-schema-in-sync.ts`. In CI or an isolated
Admin App checkout, the committed Admin schema is used when the sibling
Community App schema is unavailable; therefore keep that copy current.

## Source files

- Repository structure: [PLATFORM_FILE_STRUCTURE.md](./PLATFORM_FILE_STRUCTURE.md)
- Community App schema: [`frontend/prisma/schema.prisma`](../frontend/prisma/schema.prisma)
- Community App Prisma client: [`frontend/lib/prisma.ts`](../frontend/lib/prisma.ts)
- Community App authentication: [`frontend/auth.ts`](../frontend/auth.ts)
- Community App profile API: [`frontend/app/api/profile/route.ts`](../frontend/app/api/profile/route.ts)
- Community App events API: [`frontend/app/api/events/route.ts`](../frontend/app/api/events/route.ts)
- Admin App setup and database guidance: `Community-app-admin/SETUP.md`
- Admin App Prisma client and schema synchronization: `Community-app-admin/lib/prisma.ts`, `Community-app-admin/scripts/sync-prisma-schema.ts`
- Admin App API client and member routes: `Community-app-admin/lib/api-client.ts`, `Community-app-admin/app/api/admin/members/`
- Admin App permissions and member-platform handoff: `Community-app-admin/lib/admin-permissions.ts`, `Community-app-admin/app/api/admin/auth/member-access/`

## Existing backend-guide note

The Community App's top-level `BACKEND.md` contains older architecture and
roadmap notes. For the current relationship between the two deployed apps,
use this document and the current setup guides; verify implementation details
against the source files listed above.
