/**
 * Allow event registration without completed onboarding (direct event links).
 * Usage: npx tsx --env-file=.env.local scripts/apply-event-allow-join-without-onboarding.ts
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
    ADD COLUMN IF NOT EXISTS "allowJoinWithoutOnboarding" BOOLEAN NOT NULL DEFAULT true
  `
  console.log("[apply-event-allow-join-without-onboarding] Column is ready on events")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
