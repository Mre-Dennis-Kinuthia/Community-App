/**
 * Apply newsletter v2 columns (renderedHtml, failCount, send status).
 * Usage: npx tsx --env-file=.env.local scripts/apply-newsletter-v2.ts
 */
import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
config({ path: resolve(root, ".env.local") })
config({ path: resolve(root, ".env") })

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL
if (!connectionString) {
  console.error("Set DATABASE_URL or DIRECT_URL")
  process.exit(1)
}

const sql = neon(connectionString)

async function trySql(label: string, fn: () => Promise<unknown>) {
  try {
    await fn()
    console.log(`  ok: ${label}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/already exists|duplicate/i.test(message)) {
      console.log(`  skip: ${label}`)
      return
    }
    throw error
  }
}

async function main() {
  console.log("[apply-newsletter-v2] Applying…")
  await trySql("renderedHtml", () => sql`
    ALTER TABLE "newsletter_campaigns"
    ADD COLUMN IF NOT EXISTS "renderedHtml" TEXT
  `)
  await trySql("failCount", () => sql`
    ALTER TABLE "newsletter_campaigns"
    ADD COLUMN IF NOT EXISTS "failCount" INTEGER NOT NULL DEFAULT 0
  `)
  await trySql("send status", () => sql`
    ALTER TABLE "newsletter_sends"
    ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending'
  `)
  await trySql("send lastError", () => sql`
    ALTER TABLE "newsletter_sends"
    ADD COLUMN IF NOT EXISTS "lastError" TEXT
  `)
  console.log("[apply-newsletter-v2] Done")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
