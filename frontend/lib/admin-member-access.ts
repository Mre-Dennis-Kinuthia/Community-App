import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth-utils"
import { syncMembershipTierOnSignup } from "@/lib/membership-tier-notify"

const ADMIN_ACCESS_TTL_MS = 5 * 60 * 1000
const ADMIN_ACCESS_PREFIX = "admin-member-access:"

type AdminRecord = {
  id: string
  email: string
  name: string | null
  password: string | null
}

/**
 * Find or create a member User for an admin (JIT — no manual registration).
 */
export async function ensureMemberUserForAdmin(admin: AdminRecord) {
  if (!admin.password) {
    throw new Error("ADMIN_INVITE_PENDING")
  }

  const email = admin.email.toLowerCase().trim()
  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: admin.name || email.split("@")[0],
        password: admin.password,
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

  if (!user.password) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { password: admin.password, emailVerified: user.emailVerified ?? new Date() },
    })
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

/**
 * Verify admin credentials and return the linked member user.
 */
export async function authenticateAdminForMemberPlatform(
  emailInput: string,
  password: string
) {
  const email = emailInput.toLowerCase().trim()
  const admin = await prisma.adminUser.findUnique({ where: { email } })

  if (!admin?.password) {
    return null
  }

  const valid = await verifyPassword(password, admin.password)
  if (!valid) {
    return null
  }

  const user = await ensureMemberUserForAdmin(admin)
  return { user, admin }
}

export async function createAdminMemberAccessToken(userId: string) {
  const token = randomBytes(32).toString("hex")
  const identifier = `${ADMIN_ACCESS_PREFIX}${userId}`

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  })

  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires: new Date(Date.now() + ADMIN_ACCESS_TTL_MS),
    },
  })

  return token
}

export async function consumeAdminMemberAccessToken(token: string) {
  const record = await prisma.verificationToken.findFirst({
    where: {
      token,
      identifier: { startsWith: ADMIN_ACCESS_PREFIX },
      expires: { gt: new Date() },
    },
  })

  if (!record) {
    return null
  }

  const userId = record.identifier.slice(ADMIN_ACCESS_PREFIX.length)

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: record.identifier,
        token: record.token,
      },
    },
  })

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, image: true },
  })
}
