import { prisma } from "@/lib/prisma"
import { sendWelcomeEmail, sendEmailInBackground } from "@/lib/email"
import { notifyStaffNewMember } from "@/lib/staff-alerts"
import { recordOrganisationalRegistration } from "@/lib/membership-organisational-register"
import { syncMembershipTierOnSignup } from "@/lib/membership-tier-notify"
import { MEMBERSHIP_TIERS } from "@/lib/membership-tier"
import { MEMBERSHIP_REGISTER_INTENT } from "@/lib/membership-register-intent"

export async function activateVerifiedRegistration(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      registrationIntent: true,
    },
  })

  if (!user?.emailVerified || !user.registrationIntent) return

  const isOrganisational =
    user.registrationIntent === MEMBERSHIP_REGISTER_INTENT.ORGANISATIONAL
  const claim = await prisma.user.updateMany({
    where: {
      id: user.id,
      emailVerified: { not: null },
      registrationIntent: user.registrationIntent,
    },
    data: { registrationIntent: null },
  })
  if (claim.count !== 1) return

  try {
    await notifyStaffNewMember({
      id: user.id,
      name: user.name || user.email,
      email: user.email,
    })

    await syncMembershipTierOnSignup({
      userId: user.id,
      email: user.email,
      name: user.name,
      options: {
        explicitIntent: isOrganisational
          ? MEMBERSHIP_REGISTER_INTENT.ORGANISATIONAL
          : null,
        defaultCommunity: true,
      },
    })

    if (isOrganisational) {
      await recordOrganisationalRegistration({
        email: user.email,
        name: user.name,
      })
    } else {
      const profile = await prisma.memberProfile.findUnique({
        where: { userId: user.id },
        select: { membershipTier: true },
      })
      const tier = profile?.membershipTier
      const skipGenericWelcome =
        tier === MEMBERSHIP_TIERS.STAR_CONNECT ||
        tier === MEMBERSHIP_TIERS.ORGANISATIONAL

      if (!skipGenericWelcome) {
        sendEmailInBackground(
          () => sendWelcomeEmail({ to: user.email, name: user.name }),
          "welcome"
        )
      }
    }
  } catch (error) {
    await prisma.user.updateMany({
      where: { id: user.id, registrationIntent: null },
      data: { registrationIntent: user.registrationIntent },
    })
    throw error
  }
}
