import { randomBytes } from "crypto"
import type { PrismaClient } from "@prisma/client"

const CUID_PATTERN = /^c[a-z0-9]{20,32}$/i
const SHORT_CODE_PATTERN = /^[a-z0-9]{6,10}$/i

export function generateSlugFromTitle(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return base.slice(0, 80) || "event"
}

export function generateEventShortCode(): string {
  return randomBytes(5).toString("base64url").replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase()
}

export function isEventCuid(param: string): boolean {
  return CUID_PATTERN.test(param)
}

export function isEventShortCode(param: string): boolean {
  return SHORT_CODE_PATTERN.test(param) && param.length <= 10 && !isEventCuid(param)
}

/** Build Prisma where clause for public URL segment (id, shortCode, or slug). */
export function eventPublicParamWhere(param: string) {
  const p = decodeURIComponent(param).trim()
  if (isEventCuid(p)) {
    return { id: p }
  }
  if (isEventShortCode(p)) {
    return { shortCode: p.toLowerCase() }
  }
  return { slug: p.toLowerCase() }
}

export async function findEventByPublicParam(
  prisma: PrismaClient,
  param: string
) {
  const p = decodeURIComponent(param).trim()
  if (isEventCuid(p)) {
    return prisma.event.findFirst({ where: { id: p, deletedAt: null } })
  }
  if (isEventShortCode(p)) {
    const byCode = await prisma.event.findFirst({
      where: { shortCode: p.toLowerCase(), deletedAt: null },
    })
    if (byCode) return byCode
  }
  return prisma.event.findFirst({
    where: { slug: p.toLowerCase(), deletedAt: null },
  })
}

export async function ensureEventSlugAndShortCode(
  prisma: PrismaClient,
  event: { id: string; title: string; slug: string | null; shortCode: string | null }
): Promise<{ slug: string; shortCode: string }> {
  let slug = event.slug
  let shortCode = event.shortCode

  if (!slug) {
    const base = generateSlugFromTitle(event.title)
    slug = base
    let n = 1
    while (
      await prisma.event.findFirst({
        where: { slug, NOT: { id: event.id } },
        select: { id: true },
      })
    ) {
      slug = `${base}-${n++}`
    }
  }

  if (!shortCode) {
    let attempts = 0
    do {
      shortCode = generateEventShortCode()
      attempts++
    } while (
      attempts < 10 &&
      (await prisma.event.findFirst({
        where: { shortCode, NOT: { id: event.id } },
        select: { id: true },
      }))
    )
  }

  if (slug !== event.slug || shortCode !== event.shortCode) {
    await prisma.event.update({
      where: { id: event.id },
      data: { slug, shortCode },
    })
  }

  return { slug, shortCode }
}
