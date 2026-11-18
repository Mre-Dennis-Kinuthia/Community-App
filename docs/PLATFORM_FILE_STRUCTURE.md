# Community and Admin Platform File Structure

This guide maps the main folders and files in the member-facing Community
Platform and staff-facing Admin Platform. It is a practical overview, not a
complete listing of every source file.

## Repository layout

The platforms are maintained in separate project folders:

```text
Community-App/
├── frontend/                 # Production Community web app (Next.js)
├── backend/                  # Minimal standalone health-check placeholder
├── docs/                     # Platform and operations documentation
├── BACKEND.md
├── SETUP.md
└── README.md

Community-app-admin/
├── app/                      # Admin UI and Admin API (Next.js)
├── components/               # Admin UI components
├── lib/                      # API client, auth, domain logic, Prisma
├── prisma/                   # Synced Prisma schema and migrations
├── scripts/                  # Schema sync and maintenance scripts
├── tests/                    # Admin tests
├── docs/
├── BACKEND.md
├── SETUP.md
└── README.md
```

The folder names and file locations below are relative to the indicated
repository root. The Community App's actual Next.js application is in
`Community-App/frontend/`. The Admin App's Next.js application is at the
`Community-app-admin/` root.

## Community Platform (`Community-App/frontend/`)

```text
frontend/
├── app/                      # Next.js App Router: pages, layouts, API routes
│   ├── api/                  # Member/public API route handlers
│   │   ├── auth/
│   │   ├── bookings/
│   │   ├── community/
│   │   ├── events/
│   │   ├── membership/
│   │   ├── news/
│   │   ├── profile/
│   │   ├── projects/
│   │   └── ...               # billing, experts, notifications, etc.
│   ├── dashboard/            # Member dashboard pages
│   ├── events/               # Event pages and dynamic event details
│   ├── community/            # Member directory and profiles
│   ├── booking/              # Workspace booking and payment pages
│   ├── profile/              # Member profile UI
│   ├── projects/
│   ├── news/
│   ├── layout.tsx            # Root app layout
│   └── page.tsx              # Home page
├── components/               # Reusable UI grouped by feature
│   ├── auth/
│   ├── booking/
│   ├── community/
│   ├── events/
│   ├── membership/
│   ├── profile/
│   └── ui/                   # Shared low-level UI elements
├── lib/                      # Domain logic, helpers, server/client utilities
│   ├── hooks/
│   ├── email/
│   ├── integrations/
│   ├── newsletter/
│   ├── prisma.ts             # Community Prisma client
│   └── ...                   # Auth, bookings, membership, events, etc.
├── prisma/
│   ├── schema.prisma         # Source-of-truth shared database schema
│   └── migrations/           # Community-owned database migrations
├── public/                   # Images, icons, PWA assets, documents
├── scripts/                  # Database, asset, and maintenance scripts
├── styles/                   # Global and shared styles
├── tests/                    # Community App tests
├── types/                    # Shared TypeScript types
├── auth.ts                   # NextAuth configuration and callbacks
├── auth.config.ts            # Auth configuration
├── middleware.ts             # Request middleware
├── package.json              # Scripts and dependencies
├── next.config.mjs
└── tsconfig.json
```

### Community route conventions

- A UI route is represented by a `page.tsx`, for example
  `app/events/page.tsx`.
- A dynamic route uses a bracketed segment, for example
  `app/events/[id]/page.tsx`.
- An API endpoint is implemented by a `route.ts` under `app/api/`, for
  example `app/api/profile/route.ts` or
  `app/api/events/[id]/register/route.ts`.
- API route files handle HTTP methods and call application logic in `lib/`;
  shared React UI belongs in `components/`.

### Community backend placeholder

The top-level `Community-App/backend/` directory is not the main API backend
used by the Community Platform. Its current `src/index.js` provides only
minimal `/health` and `/version` smoke-check endpoints. The production
Community APIs are Next.js route handlers in
`Community-App/frontend/app/api/`.

## Admin Platform (`Community-app-admin/`)

```text
Community-app-admin/
├── app/
│   ├── api/
│   │   ├── admin/            # Staff-protected Admin API endpoints
│   │   │   ├── auth/
│   │   │   ├── members/
│   │   │   ├── events/
│   │   │   ├── bookings/
│   │   │   ├── news/
│   │   │   ├── membership/
│   │   │   └── ...           # billing, space, reports, operations, etc.
│   │   └── cron/             # Scheduled publishing/reminder endpoints
│   ├── dashboard/            # Staff dashboard route segments
│   │   ├── community/
│   │   ├── content/
│   │   ├── programs/
│   │   ├── space/
│   │   ├── operations/
│   │   ├── membership/
│   │   ├── reports/
│   │   └── settings/
│   ├── front-desk/           # Front-desk UI
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── admin/                # Dashboard, content, space, settings panels
│   ├── events/
│   ├── newsletter/
│   └── ui/                   # Shared low-level UI elements
├── lib/
│   ├── integrations/         # External access-control/accounting integrations
│   ├── operations/
│   ├── space/
│   ├── finance/
│   ├── reports/
│   ├── email/
│   ├── newsletter/
│   ├── prisma.ts             # Admin Prisma client
│   ├── api-client.ts         # Browser client for same-origin /api/admin/*
│   ├── admin-permissions.ts  # Resource permissions and role checks
│   └── admin-session-core.ts # Admin JWT/cookie helpers
├── prisma/
│   ├── schema.prisma         # Committed copy synced from Community schema
│   └── migrations/           # Admin-specific/shared migration history
├── scripts/                  # Schema sync, admin setup, integrations
├── tests/                    # Unit and integration-focused tests
├── docs/                     # Admin operations and design documentation
├── middleware.ts             # UI route protection/redirects
├── prisma.config.ts          # Prisma CLI datasource configuration
├── package.json
├── next.config.mjs
└── tsconfig.json
```

### Admin route conventions

- Staff pages live below `app/dashboard/`; for example,
  `app/dashboard/community/members/page.tsx`.
- Admin API handlers live below `app/api/admin/`; for example,
  `app/api/admin/members/route.ts` and
  `app/api/admin/members/[id]/route.ts`.
- Scheduled endpoints live below `app/api/cron/`.
- The dashboard browser API client calls relative, same-origin paths such as
  `/api/admin/members`. Those calls are handled by this Admin App, not
  proxied to the Community App.

## How the structures fit together

```text
Member UI
  Community-App/frontend/app/
       │ calls
       ▼
  Community-App/frontend/app/api/
       │ uses
       ▼
  Community-App/frontend/lib/prisma.ts ─┐
                                        ├── Shared PostgreSQL database
Staff UI                                │
  Community-app-admin/app/dashboard/    │
       │ calls                          │
       ▼                                │
  Community-app-admin/lib/api-client.ts │
       │ requests /api/admin/*          │
       ▼                                │
  Community-app-admin/app/api/admin/    │
       │ uses                           │
       ▼                                │
  Community-app-admin/lib/prisma.ts ───┘
```

The Community Prisma schema is the source of truth. The Admin App keeps a
committed schema copy at `Community-app-admin/prisma/schema.prisma`, updated
with its `scripts/sync-prisma-schema.ts` script. Schema changes and database
migrations should follow the workflow in
[PLATFORM_RELATIONSHIPS.md](./PLATFORM_RELATIONSHIPS.md).

## Where to start when changing something

| Change | Start here |
|---|---|
| Member-facing page | `Community-App/frontend/app/` |
| Member-facing API | `Community-App/frontend/app/api/` |
| Community business logic | `Community-App/frontend/lib/` |
| Shared member UI | `Community-App/frontend/components/` |
| Staff dashboard page | `Community-app-admin/app/dashboard/` |
| Staff API endpoint | `Community-app-admin/app/api/admin/` |
| Admin API call from UI | `Community-app-admin/lib/api-client.ts` |
| Admin-specific UI panel | `Community-app-admin/components/admin/` |
| Shared database model | `Community-App/frontend/prisma/schema.prisma` |
| Admin schema copy | `Community-app-admin/prisma/schema.prisma` |
| Database migration | `Community-App/frontend/prisma/migrations/` |
| Admin authorization | `Community-app-admin/lib/admin-permissions.ts` and `app/api/admin/middleware.ts` |

## Related documentation

- [Platform relationships](./PLATFORM_RELATIONSHIPS.md) — shared database,
  APIs, and authentication.
- [Community setup](../SETUP.md) — local development and deployment.
- [Admin setup](../../Community-app-admin/SETUP.md) — Admin App local
  development and deployment.
