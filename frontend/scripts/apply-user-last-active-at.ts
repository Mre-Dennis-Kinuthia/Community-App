/**
 * Apply users.last_active_at via Neon serverless driver.
 * Usage: npx tsx --env-file=.env.local scripts/apply-user-last-active-at.ts
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
    ALTER TABLE "users"
    ADD COLUMN IF NOT EXISTS "last_active_at" TIMESTAMP(3)
  `
  console.log("[apply-user-last-active-at] Column last_active_at is ready on users")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
