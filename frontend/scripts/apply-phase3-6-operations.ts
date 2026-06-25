/**
 * Apply Phases 3–6 schema: operations, surveys, announcements, access control
 * Usage: npx tsx --env-file=.env.local scripts/apply-phase3-6-operations.ts
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

const sql = neon(connectionString)

async function trySql(query: TemplateStringsArray, ...values: unknown[]) {
  try {
    await sql(query, ...values)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("already exists") || msg.includes("duplicate")) return
    throw err
  }
}

async function main() {
  await trySql`CREATE TYPE "MaintenanceCategory" AS ENUM ('internet', 'cleaning', 'printer', 'hvac', 'other')`
  await trySql`CREATE TYPE "MaintenancePriority" AS ENUM ('low', 'medium', 'high', 'urgent')`
  await trySql`CREATE TYPE "MaintenanceStatus" AS ENUM ('open', 'in_progress', 'resolved', 'cancelled')`
  await trySql`CREATE TYPE "CleaningFrequency" AS ENUM ('daily', 'weekly')`
  await trySql`CREATE TYPE "SurveyStatus" AS ENUM ('draft', 'active', 'closed')`
  await trySql`CREATE TYPE "AnnouncementType" AS ENUM ('normal', 'pinned', 'urgent')`

  await sql`
    CREATE TABLE IF NOT EXISTS "maintenance_tickets" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "category" "MaintenanceCategory" NOT NULL,
      "priority" "MaintenancePriority" NOT NULL DEFAULT 'medium',
      "status" "MaintenanceStatus" NOT NULL DEFAULT 'open',
      "location_id" TEXT NOT NULL,
      "space_asset_id" TEXT,
      "assigned_to" TEXT,
      "reported_by" TEXT,
      "resolved_at" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "maintenance_tickets_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS "maintenance_tickets_status_idx" ON "maintenance_tickets"("status")`
  await sql`CREATE INDEX IF NOT EXISTS "maintenance_tickets_location_id_idx" ON "maintenance_tickets"("location_id")`

  await sql`
    CREATE TABLE IF NOT EXISTS "vendors" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "contact_email" TEXT,
      "contact_phone" TEXT,
      "service_type" TEXT NOT NULL,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS "cleaning_schedules" (
      "id" TEXT NOT NULL,
      "location_id" TEXT NOT NULL,
      "zone_id" TEXT,
      "frequency" "CleaningFrequency" NOT NULL,
      "day_of_week" INTEGER,
      "assigned_vendor_id" TEXT,
      "notes" TEXT,
      "is_active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "cleaning_schedules_pkey" PRIMARY KEY ("id")
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS "utility_inventory" (
      "id" TEXT NOT NULL,
      "location_id" TEXT NOT NULL,
      "item_type" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "serial_number" TEXT,
      "last_serviced_at" TIMESTAMP(3),
      "next_service_due" TIMESTAMP(3),
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "utility_inventory_pkey" PRIMARY KEY ("id")
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS "surveys" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "questions" JSONB NOT NULL,
      "status" "SurveyStatus" NOT NULL DEFAULT 'draft',
      "target_audience" TEXT,
      "starts_at" TIMESTAMP(3),
      "ends_at" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS "survey_responses" (
      "id" TEXT NOT NULL,
      "survey_id" TEXT NOT NULL,
      "user_id" TEXT NOT NULL,
      "answers" JSONB NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
    )
  `
  await trySql`CREATE UNIQUE INDEX IF NOT EXISTS "survey_responses_survey_id_user_id_key" ON "survey_responses"("survey_id", "user_id")`

  await sql`
    CREATE TABLE IF NOT EXISTS "access_control_integrations" (
      "id" TEXT NOT NULL,
      "provider" TEXT NOT NULL,
      "config" JSONB NOT NULL DEFAULT '{}',
      "is_active" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "access_control_integrations_pkey" PRIMARY KEY ("id")
    )
  `

  await sql`
    ALTER TABLE "news_posts"
    ADD COLUMN IF NOT EXISTS "announcement_type" "AnnouncementType" NOT NULL DEFAULT 'normal'
  `
  await sql`
    ALTER TABLE "news_posts"
    ADD COLUMN IF NOT EXISTS "pin_until" TIMESTAMP(3)
  `
  await sql`CREATE INDEX IF NOT EXISTS "news_posts_announcement_type_publishedAt_idx" ON "news_posts"("announcement_type", "publishedAt")`

  console.log("Phase 3–6 schema applied successfully.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
