/**
 * Run `prisma migrate deploy` only when DIRECT_URL points at a non-pooler host.
 * Skips on Vercel when only DATABASE_URL (pooler) is set — avoids P1002 advisory lock timeout.
 *
 * Set DIRECT_URL in Vercel to the Neon *direct* host (no `-pooler` in the hostname)
 * if you want migrations during build. Otherwise apply SQL via:
 *   npm run db:apply-stored-images
 *   npm run db:apply-membership-links
 * or Neon Console.
 */
import { config } from "dotenv"
import { execSync } from "node:child_process"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
config({ path: resolve(root, ".env.local") })
config({ path: resolve(root, ".env") })

const direct = process.env.DIRECT_URL?.trim()

if (!direct) {
  console.log(
    "[optional-migrate] Skipping migrate deploy: DIRECT_URL is not set (pooler DATABASE_URL cannot take advisory locks)."
  )
  process.exit(0)
}

if (direct.includes("-pooler")) {
  console.log(
    "[optional-migrate] Skipping migrate deploy: DIRECT_URL must use the direct Neon host, not the pooler."
  )
  process.exit(0)
}

const host = direct.match(/@([^/]+)/)?.[1] ?? "unknown"
console.log(`[optional-migrate] Running prisma migrate deploy via ${host}`)

execSync("npx prisma migrate deploy", {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: direct,
  },
})
