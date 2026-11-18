import { createHmac } from "node:crypto"
import { prisma } from "@/lib/prisma"

export type PersistentRateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number }

let lastCleanupAt = 0

function rateLimitSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error("AUTH_SECRET is required for shared rate limiting")
  }
  return secret
}

function hashRateLimitKey(key: string): string {
  return createHmac("sha256", rateLimitSecret()).update(key).digest("hex")
}

export async function persistentRateLimit(
  key: string,
  options: { limit: number; windowMs: number }
): Promise<PersistentRateLimitResult> {
  const now = new Date()
  if (now.getTime() - lastCleanupAt > 10 * 60 * 1000) {
    await prisma.rateLimitBucket.deleteMany({ where: { expiresAt: { lte: now } } })
    lastCleanupAt = now.getTime()
  }
  const expiresAt = new Date(now.getTime() + options.windowMs)
  const bucketKey = hashRateLimitKey(key)
  const rows = await prisma.$queryRaw<
    Array<{ count: number; expires_at: Date }>
  >`
    INSERT INTO "rate_limit_buckets" ("key", "count", "expires_at", "updated_at")
    VALUES (${bucketKey}, 1, ${expiresAt}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "rate_limit_buckets"."expires_at" <= ${now} THEN 1
        ELSE "rate_limit_buckets"."count" + 1
      END,
      "expires_at" = CASE
        WHEN "rate_limit_buckets"."expires_at" <= ${now} THEN ${expiresAt}
        ELSE "rate_limit_buckets"."expires_at"
      END,
      "updated_at" = ${now}
    RETURNING "count", "expires_at"
  `

  const bucket = rows[0]
  if (!bucket) {
    throw new Error("Could not read persistent rate limit bucket")
  }
  if (bucket.count > options.limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(
        1,
        Math.ceil((new Date(bucket.expires_at).getTime() - now.getTime()) / 1000)
      ),
    }
  }
  return { ok: true, remaining: options.limit - bucket.count }
}
