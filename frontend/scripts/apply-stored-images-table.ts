/**
 * Apply stored_images via Neon serverless driver (WebSocket/HTTP).
 * Use when `prisma migrate deploy` fails with P1001 from WSL.
 *
 * Usage: npm run db:apply-stored-images
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
console.log(`[apply-stored-images] Connecting to ${host}`)

const sql = neon(connectionString)

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS "stored_images" (
      "id" TEXT NOT NULL,
      "data" BYTEA NOT NULL,
      "mimeType" TEXT NOT NULL,
      "fileName" TEXT,
      "size" INTEGER NOT NULL,
      "category" TEXT NOT NULL,
      "userId" TEXT,
      "adminUserId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "stored_images_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS "stored_images_category_idx" ON "stored_images"("category")`
  await sql`CREATE INDEX IF NOT EXISTS "stored_images_userId_idx" ON "stored_images"("userId")`
  await sql`CREATE INDEX IF NOT EXISTS "stored_images_createdAt_idx" ON "stored_images"("createdAt")`

  const rows = await sql`SELECT COUNT(*)::int AS n FROM "stored_images"`
  console.log("[apply-stored-images] Table ready. Row count:", rows[0]?.n ?? 0)
  console.log("[apply-stored-images] Image uploads on production should work now.")
}

main().catch((err) => {
  console.error("[apply-stored-images] Failed:", err instanceof Error ? err.message : err)
  process.exit(1)
})
