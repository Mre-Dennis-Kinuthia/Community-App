/**
 * Experts in Residence tables + Event.expertId when migrate deploy is skipped on Vercel.
 *
 * Usage: npm run db:apply-experts-in-residence
 */
import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
config({ path: resolve(root, ".env.local") })
config({ path: resolve(root, ".env") })

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL
if (!connectionString) {
  console.error("Set DATABASE_URL or DIRECT_URL in .env.local")
  process.exit(1)
}

const host = connectionString.match(/@([^/]+)/)?.[1] ?? "unknown"
console.log(`[apply-experts-in-residence] Connecting to ${host}`)

const sql = neon(connectionString)

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS "experts_in_residence" (
      "id" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "organization" TEXT,
      "industry" TEXT,
      "location" TEXT,
      "bio" TEXT NOT NULL,
      "photoUrl" TEXT,
      "expertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "initiatives" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "bookingUrl" TEXT,
      "linkedInUrl" TEXT,
      "userId" TEXT,
      "isPublished" BOOLEAN NOT NULL DEFAULT true,
      "isFeatured" BOOLEAN NOT NULL DEFAULT false,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      "deletedAt" TIMESTAMP(3),
      CONSTRAINT "experts_in_residence_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "experts_in_residence_slug_key" ON "experts_in_residence"("slug")`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "experts_in_residence_userId_key" ON "experts_in_residence"("userId")`
  await sql`CREATE INDEX IF NOT EXISTS "experts_in_residence_isPublished_idx" ON "experts_in_residence"("isPublished")`
  await sql`CREATE INDEX IF NOT EXISTS "experts_in_residence_isFeatured_idx" ON "experts_in_residence"("isFeatured")`
  await sql`CREATE INDEX IF NOT EXISTS "experts_in_residence_email_idx" ON "experts_in_residence"("email")`

  await sql`
    CREATE TABLE IF NOT EXISTS "expert_meeting_requests" (
      "id" TEXT NOT NULL,
      "expertId" TEXT NOT NULL,
      "requesterUserId" TEXT NOT NULL,
      "requesterEmail" TEXT NOT NULL,
      "requesterName" TEXT NOT NULL,
      "topic" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "preferredTimes" TEXT,
      "meetingFormat" TEXT NOT NULL DEFAULT 'virtual',
      "requestType" TEXT NOT NULL DEFAULT 'clinic',
      "status" TEXT NOT NULL DEFAULT 'pending',
      "ticketId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "expert_meeting_requests_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS "expert_meeting_requests_expertId_idx" ON "expert_meeting_requests"("expertId")`
  await sql`CREATE INDEX IF NOT EXISTS "expert_meeting_requests_requesterUserId_idx" ON "expert_meeting_requests"("requesterUserId")`
  await sql`CREATE INDEX IF NOT EXISTS "expert_meeting_requests_status_idx" ON "expert_meeting_requests"("status")`
  await sql`CREATE INDEX IF NOT EXISTS "expert_meeting_requests_createdAt_idx" ON "expert_meeting_requests"("createdAt")`

  await sql`
    DO $$ BEGIN
      ALTER TABLE "expert_meeting_requests"
        ADD CONSTRAINT "expert_meeting_requests_expertId_fkey"
        FOREIGN KEY ("expertId") REFERENCES "experts_in_residence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `

  await sql`
    DO $$ BEGIN
      ALTER TABLE "experts_in_residence"
        ADD CONSTRAINT "experts_in_residence_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `

  await sql`
    ALTER TABLE "events"
    ADD COLUMN IF NOT EXISTS "expertId" TEXT
  `
  await sql`CREATE INDEX IF NOT EXISTS "events_expertId_idx" ON "events"("expertId")`

  await sql`
    DO $$ BEGIN
      ALTER TABLE "events"
        ADD CONSTRAINT "events_expertId_fkey"
        FOREIGN KEY ("expertId") REFERENCES "experts_in_residence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `

  await sql`ALTER TABLE "experts_in_residence" ADD COLUMN IF NOT EXISTS "industry" TEXT`
  await sql`ALTER TABLE "experts_in_residence" ADD COLUMN IF NOT EXISTS "location" TEXT`
  await sql`ALTER TABLE "experts_in_residence" ADD COLUMN IF NOT EXISTS "industries" TEXT[] DEFAULT ARRAY[]::TEXT[]`
  await sql`ALTER TABLE "experts_in_residence" ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT`
  await sql`ALTER TABLE "experts_in_residence" ADD COLUMN IF NOT EXISTS "sessionDurationMinutes" INTEGER NOT NULL DEFAULT 45`
  await sql`ALTER TABLE "experts_in_residence" ADD COLUMN IF NOT EXISTS "availabilityEnabled" BOOLEAN NOT NULL DEFAULT false`

  await sql`
    UPDATE "experts_in_residence"
    SET "industries" = ARRAY["industry"]
    WHERE "industry" IS NOT NULL
      AND btrim("industry") <> ''
      AND (cardinality("industries") = 0 OR "industries" IS NULL)
  `

  await sql`
    CREATE TABLE IF NOT EXISTS "expert_availability_windows" (
      "id" TEXT NOT NULL,
      "expertId" TEXT NOT NULL,
      "weekday" INTEGER NOT NULL,
      "startTime" TEXT NOT NULL,
      "endTime" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "expert_availability_windows_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS "expert_availability_windows_expertId_idx" ON "expert_availability_windows"("expertId")`
  await sql`
    DO $$ BEGIN
      ALTER TABLE "expert_availability_windows"
        ADD CONSTRAINT "expert_availability_windows_expertId_fkey"
        FOREIGN KEY ("expertId") REFERENCES "experts_in_residence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `

  await sql`
    ALTER TABLE "expert_meeting_requests"
    ADD COLUMN IF NOT EXISTS "requestType" TEXT NOT NULL DEFAULT 'clinic'
  `
  await sql`ALTER TABLE "expert_meeting_requests" ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3)`
  await sql`ALTER TABLE "expert_meeting_requests" ADD COLUMN IF NOT EXISTS "scheduledEndAt" TIMESTAMP(3)`
  await sql`ALTER TABLE "expert_meeting_requests" ADD COLUMN IF NOT EXISTS "agenda" TEXT`
  await sql`CREATE INDEX IF NOT EXISTS "expert_meeting_requests_requestType_idx" ON "expert_meeting_requests"("requestType")`
  await sql`CREATE INDEX IF NOT EXISTS "expert_meeting_requests_scheduledAt_idx" ON "expert_meeting_requests"("scheduledAt")`

  const experts = await sql`SELECT COUNT(*)::int AS n FROM "experts_in_residence"`
  console.log("[apply-experts-in-residence] Ready. Experts:", experts[0]?.n ?? 0)
}

main().catch((err) => {
  console.error(
    "[apply-experts-in-residence] Failed:",
    err instanceof Error ? err.message : err
  )
  process.exit(1)
})
