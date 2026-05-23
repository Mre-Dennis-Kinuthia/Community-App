/**
 * Simple in-memory rate limiter for auth endpoints (per server instance).
 * For multi-instance production, prefer Upstash Redis or Vercel KV.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number }

export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs })
    return { ok: true, remaining: options.limit - 1 }
  }

  if (bucket.count >= options.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    return { ok: false, retryAfterSec }
  }

  bucket.count += 1
  return { ok: true, remaining: options.limit - bucket.count }
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown"
  return request.headers.get("x-real-ip") || "unknown"
}
