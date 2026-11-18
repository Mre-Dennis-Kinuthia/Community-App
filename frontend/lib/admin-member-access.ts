import { prisma } from "@/lib/prisma"
import { syncMembershipTierOnSignup } from "@/lib/membership-tier-notify"
import {
  hashEmailActionToken,
  issueEmailActionToken,
} from "@/lib/email-action-tokens"

const ADMIN_ACCESS_TTL_MS = 5 * 60 * 1000
const ADMIN_ACCESS_PURPOSE = "admin-member-access"

type AdminRecord = {
  id: string
  email: string
  name: string | null
}

/**
 * Find or create a member User for an admin (JIT — no manual registration).
 */
export async function ensureMemberUserForAdmin(admin: AdminRecord) {
  const email = admin.email.toLowerCase().trim()
  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: admin.name || email.split("@")[0],
        emailVerified: new Date(),
      },
    })

    await prisma.memberProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        skills: [],
        availability: [],
        interests: [],
      },
      update: {},
    })

    await syncMembershipTierOnSignup({
      userId: user.id,
      email,
      name: user.name,
      options: { defaultCommunity: true },
    }).catch((error) => {
      console.error("[ADMIN MEMBER ACCESS] Tier sync failed:", error)
    })

    return user
  }

  await prisma.memberProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      skills: [],
      availability: [],
      interests: [],
    },
    update: {},
  })

  return user
}

export async function createAdminMemberAccessToken(userId: string) {
  const { token } = await issueEmailActionToken({
    purpose: ADMIN_ACCESS_PURPOSE,
    subjectId: userId,
    expiresAt: new Date(Date.now() + ADMIN_ACCESS_TTL_MS),
  })
  return token
}

export async function consumeAdminMemberAccessToken(token: string) {
  const user = await prisma.$transaction(async (tx) => {
    const record = await tx.emailActionToken.findFirst({
      where: {
        purpose: ADMIN_ACCESS_PURPOSE,
        tokenHash: hashEmailActionToken(token),
        expiresAt: { gt: new Date() },
      },
      select: { id: true, subjectId: true, tokenHash: true },
    })

    if (!record) return null

    const consumed = await tx.emailActionToken.deleteMany({
      where: {
        id: record.id,
        tokenHash: record.tokenHash,
        expiresAt: { gt: new Date() },
      },
    })
    if (consumed.count !== 1) return null

    return tx.user.findUnique({
      where: { id: record.subjectId },
      select: { id: true, email: true, name: true, image: true },
    })
  })

  return user
}
