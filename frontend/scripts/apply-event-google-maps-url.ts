/**
 * Add optional Google Maps URL column on events for precise venue pins.
 * Usage: npx tsx --env-file=.env.local scripts/apply-event-google-maps-url.ts
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
    ADD COLUMN IF NOT EXISTS "google_maps_url" TEXT
  `
  console.log("[apply-event-google-maps-url] events.google_maps_url is ready")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
