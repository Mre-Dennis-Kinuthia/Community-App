/**
 * Apply member_profiles.phone via Neon serverless driver.
 * Usage: npx tsx --env-file=.env.local scripts/apply-member-profile-phone.ts
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
    ALTER TABLE "member_profiles"
    ADD COLUMN IF NOT EXISTS "phone" TEXT
  `

  const cols = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'member_profiles' AND column_name = 'phone'
  `
  console.log("[apply-member-profile-phone] Column phone is ready:", cols)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
