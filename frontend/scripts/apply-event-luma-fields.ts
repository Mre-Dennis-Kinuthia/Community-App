/**
 * Apply events Luma + registration provider columns via Neon serverless driver.
 * Usage: npx tsx --env-file=.env.local scripts/apply-event-luma-fields.ts
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
  await sql`
    ALTER TABLE "events"
    ADD COLUMN IF NOT EXISTS "registrationProvider" TEXT NOT NULL DEFAULT 'platform'
  `
  await sql`
    ALTER TABLE "events"
    ADD COLUMN IF NOT EXISTS "lumaEventUrl" TEXT
  `
  await sql`
    ALTER TABLE "events"
    ADD COLUMN IF NOT EXISTS "lumaEventId" TEXT
  `
  await sql`
    CREATE INDEX IF NOT EXISTS "events_lumaEventId_idx" ON "events" ("lumaEventId")
  `
  await sql`
    CREATE INDEX IF NOT EXISTS "events_registrationProvider_idx" ON "events" ("registrationProvider")
  `
  console.log("[apply-event-luma-fields] Luma columns are ready on events")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
