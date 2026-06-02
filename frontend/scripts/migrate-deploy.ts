/**
 * Run migrations using DIRECT_URL (Neon direct host) when set.
 * Usage: npm run db:deploy
 */
import { config } from "dotenv"
import { execSync } from "node:child_process"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
config({ path: resolve(root, ".env.local") })
config({ path: resolve(root, ".env") })

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL
if (!url) {
  console.error("Set DATABASE_URL or DIRECT_URL in .env.local")
  process.exit(1)
}

const host = url.match(/@([^/]+)/)?.[1] ?? "unknown"
console.log(`[migrate-deploy] Using host: ${host}`)

execSync("npx prisma migrate deploy", {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: url,
  },
})
