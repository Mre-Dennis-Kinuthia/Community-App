/**
 * Apply member_profiles.slug via Neon serverless driver.
 * Usage: npx tsx --env-file=.env.local scripts/apply-member-profile-slug.ts
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
    ADD COLUMN IF NOT EXISTS "slug" TEXT
  `
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "member_profiles_slug_key"
    ON "member_profiles"("slug")
  `
  await sql`
    CREATE INDEX IF NOT EXISTS "member_profiles_slug_idx"
    ON "member_profiles"("slug")
  `

  const cols = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'member_profiles' AND column_name = 'slug'
  `
  console.log("[apply-member-profile-slug] Column slug is ready:", cols)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
