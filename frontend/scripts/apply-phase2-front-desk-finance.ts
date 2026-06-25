/**
 * Apply Phase 2 schema: visitors, deliveries, invoice.last_reminder_at
 * Usage: npx tsx --env-file=.env.local scripts/apply-phase2-front-desk-finance.ts
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

async function main() {
  await sql`CREATE TYPE "VisitorStatus" AS ENUM ('expected', 'checked_in', 'checked_out', 'cancelled')`
  await sql`CREATE TYPE "DeliveryStatus" AS ENUM ('received', 'notified', 'picked_up')`

  await sql`
    CREATE TABLE IF NOT EXISTS "visitors" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT,
      "phone" TEXT,
      "company" TEXT,
      "host_user_id" TEXT NOT NULL,
      "expected_at" TIMESTAMP(3) NOT NULL,
      "purpose" TEXT,
      "status" "VisitorStatus" NOT NULL DEFAULT 'expected',
      "location_id" TEXT NOT NULL,
      "created_by" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS "visitors_host_user_id_idx" ON "visitors"("host_user_id")`
  await sql`CREATE INDEX IF NOT EXISTS "visitors_expected_at_idx" ON "visitors"("expected_at")`
  await sql`CREATE INDEX IF NOT EXISTS "visitors_status_idx" ON "visitors"("status")`
  await sql`CREATE INDEX IF NOT EXISTS "visitors_location_id_idx" ON "visitors"("location_id")`

  await sql`
    CREATE TABLE IF NOT EXISTS "visitor_check_ins" (
      "id" TEXT NOT NULL,
      "visitor_id" TEXT NOT NULL,
      "checked_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "checked_out_at" TIMESTAMP(3),
      "checked_in_by" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "visitor_check_ins_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS "visitor_check_ins_visitor_id_idx" ON "visitor_check_ins"("visitor_id")`
  await sql`CREATE INDEX IF NOT EXISTS "visitor_check_ins_checked_in_at_idx" ON "visitor_check_ins"("checked_in_at")`

  await sql`
    CREATE TABLE IF NOT EXISTS "deliveries" (
      "id" TEXT NOT NULL,
      "recipient_user_id" TEXT NOT NULL,
      "carrier" TEXT,
      "tracking_number" TEXT,
      "description" TEXT NOT NULL,
      "status" "DeliveryStatus" NOT NULL DEFAULT 'received',
      "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "picked_up_at" TIMESTAMP(3),
      "received_by" TEXT,
      "location_id" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS "deliveries_recipient_user_id_idx" ON "deliveries"("recipient_user_id")`
  await sql`CREATE INDEX IF NOT EXISTS "deliveries_status_idx" ON "deliveries"("status")`
  await sql`CREATE INDEX IF NOT EXISTS "deliveries_location_id_idx" ON "deliveries"("location_id")`
  await sql`CREATE INDEX IF NOT EXISTS "deliveries_received_at_idx" ON "deliveries"("received_at")`

  await sql`
    ALTER TABLE "invoices"
    ADD COLUMN IF NOT EXISTS "last_reminder_at" TIMESTAMP(3)
  `

  console.log("[apply-phase2] Front desk + finance schema applied")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
