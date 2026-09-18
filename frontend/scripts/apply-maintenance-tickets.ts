/**
 * Create maintenance_tickets (admin operations board).
 * The table was missing from Phase 3–6 apply, so prisma.maintenanceTicket
 * was undefined on the generated client.
 *
 * Usage: npx tsx --env-file=.env.local scripts/apply-maintenance-tickets.ts
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
console.log(`[apply-maintenance-tickets] Connecting to ${host}`)

const sql = neon(connectionString)

async function tryStep(name: string, statement: string) {
  try {
    await sql.query(statement)
    console.log(`[apply-maintenance-tickets] OK: ${name}`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (
      msg.includes("already exists") ||
      msg.includes("duplicate") ||
      msg.includes("duplicate_object")
    ) {
      console.log(`[apply-maintenance-tickets] Skip (exists): ${name}`)
      return
    }
    throw err
  }
}

async function main() {
  await tryStep(
    "MaintenanceCategory",
    `CREATE TYPE "MaintenanceCategory" AS ENUM ('internet', 'cleaning', 'printer', 'hvac', 'other')`
  )
  await tryStep(
    "MaintenancePriority",
    `CREATE TYPE "MaintenancePriority" AS ENUM ('low', 'medium', 'high', 'urgent')`
  )
  await tryStep(
    "MaintenanceStatus",
    `CREATE TYPE "MaintenanceStatus" AS ENUM ('open', 'in_progress', 'resolved', 'cancelled')`
  )

  await sql.query(`
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
  `)
  console.log("[apply-maintenance-tickets] OK: maintenance_tickets table")

  await tryStep(
    "maintenance_tickets_status_idx",
    `CREATE INDEX IF NOT EXISTS "maintenance_tickets_status_idx" ON "maintenance_tickets"("status")`
  )
  await tryStep(
    "maintenance_tickets_priority_idx",
    `CREATE INDEX IF NOT EXISTS "maintenance_tickets_priority_idx" ON "maintenance_tickets"("priority")`
  )
  await tryStep(
    "maintenance_tickets_location_id_idx",
    `CREATE INDEX IF NOT EXISTS "maintenance_tickets_location_id_idx" ON "maintenance_tickets"("location_id")`
  )
  await tryStep(
    "maintenance_tickets_space_asset_id_idx",
    `CREATE INDEX IF NOT EXISTS "maintenance_tickets_space_asset_id_idx" ON "maintenance_tickets"("space_asset_id")`
  )
  await tryStep(
    "maintenance_tickets_reported_by_idx",
    `CREATE INDEX IF NOT EXISTS "maintenance_tickets_reported_by_idx" ON "maintenance_tickets"("reported_by")`
  )
  await tryStep(
    "maintenance_tickets_createdAt_idx",
    `CREATE INDEX IF NOT EXISTS "maintenance_tickets_createdAt_idx" ON "maintenance_tickets"("createdAt")`
  )

  await tryStep(
    "maintenance_tickets_location_id_fkey",
    `ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_location_id_fkey"
      FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE`
  )
  await tryStep(
    "maintenance_tickets_space_asset_id_fkey",
    `ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_space_asset_id_fkey"
      FOREIGN KEY ("space_asset_id") REFERENCES "space_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE`
  )
  await tryStep(
    "maintenance_tickets_reported_by_fkey",
    `ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_reported_by_fkey"
      FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`
  )

  const verify = await sql.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'maintenance_tickets'
     ORDER BY ordinal_position`
  )
  console.log(
    "[apply-maintenance-tickets] Columns:",
    verify.map((r: { column_name: string }) => r.column_name).join(", ") || "(none)"
  )
  console.log("[apply-maintenance-tickets] maintenance_tickets is ready.")
}

main().catch((err) => {
  console.error("[apply-maintenance-tickets] Failed:", err instanceof Error ? err.message : err)
  process.exit(1)
})
