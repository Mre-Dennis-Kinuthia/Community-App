import type { PrismaClient } from "@prisma/client"

const CUID_PATTERN = /^c[a-z0-9]{20,32}$/i

/** Route segments that must not be claimed as member slugs. */
const RESERVED_SLUGS = new Set([
  "recommendations",
  "me",
  "new",
  "search",
  "api",
])

export function generateMemberSlugFromName(name: string | null | undefined): string {
  const base = (name ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return base.slice(0, 60) || "member"
}

export function isMemberCuid(param: string): boolean {
  return CUID_PATTERN.test(param)
}

export function normalizeMemberSlug(param: string): string {
  return decodeURIComponent(param).trim().toLowerCase()
}

/**
 * Resolve a community URL param to a user (by cuid id or profile slug).
 * Returns null when not found.
 */
export async function findMemberByPublicParam(prisma: PrismaClient, param: string) {
  const p = normalizeMemberSlug(param)
  if (!p) return null

  const select = {
    id: true,
    name: true,
    email: true,
    image: true,
    createdAt: true,
    profile: true,
  } as const

  if (isMemberCuid(p)) {
    return prisma.user.findUnique({
      where: { id: p },
      select,
    })
  }

  const profile = await prisma.memberProfile.findUnique({
    where: { slug: p },
    select: { userId: true },
  })
  if (!profile) return null

  return prisma.user.findUnique({
    where: { id: profile.userId },
    select,
  })
}

/** Resolve only the user id for a public community param. */
export async function resolveMemberIdByPublicParam(
  prisma: PrismaClient,
  param: string
): Promise<string | null> {
  const p = normalizeMemberSlug(param)
  if (!p) return null

  if (isMemberCuid(p)) {
    const user = await prisma.user.findUnique({
      where: { id: p },
      select: { id: true },
    })
    return user?.id ?? null
  }

  const profile = await prisma.memberProfile.findUnique({
    where: { slug: p },
    select: { userId: true },
  })
  return profile?.userId ?? null
}

async function allocateUniqueSlug(
  prisma: PrismaClient,
  base: string,
  excludeUserId: string
): Promise<string> {
  let candidate = base
  let n = 2
  while (RESERVED_SLUGS.has(candidate) || isMemberCuid(candidate)) {
    candidate = `${base}-${n++}`
  }

  while (
    await prisma.memberProfile.findFirst({
      where: {
        slug: candidate,
        NOT: { userId: excludeUserId },
      },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${n++}`
  }

  return candidate
}

/**
 * Ensure the member has a unique public slug. Creates a profile row if missing.
 * Does not overwrite an existing slug when the name changes (stable URLs).
 */
export async function ensureMemberSlug(
  prisma: PrismaClient,
  user: { id: string; name?: string | null },
  options?: { forceFromName?: boolean }
): Promise<string> {
  const existing = await prisma.memberProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, slug: true },
  })

  if (existing?.slug && !options?.forceFromName) {
    return existing.slug
  }

  const base = generateMemberSlugFromName(user.name)
  const slug = await allocateUniqueSlug(prisma, base, user.id)

  if (existing) {
    if (existing.slug !== slug) {
      await prisma.memberProfile.update({
        where: { userId: user.id },
        data: { slug },
      })
    }
    return slug
  }

  await prisma.memberProfile.create({
    data: {
      userId: user.id,
      slug,
      skills: [],
      availability: [],
      interests: [],
    },
  })

  return slug
}

/** Path segment for community profile links. */
export function getCommunityMemberProfilePath(member: {
  id: string
  slug?: string | null
  profile?: { slug?: string | null } | null
}): string {
  const slug = member.slug ?? member.profile?.slug ?? null
  return `/community/${slug || member.id}`
}
