import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { recordOrganisationalRegistration } from "@/lib/membership-organisational-register"
import { syncMembershipTierOnSignup } from "@/lib/membership-tier-notify"
import { MEMBERSHIP_REGISTER_INTENT } from "@/lib/membership-register-intent"
import { ORGANISATIONAL_DISCOVERY_CALL_URL } from "@/lib/membership-inquiry"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"

const NEW_ACCOUNT_WINDOW_MS = 24 * 60 * 60 * 1000

/** Apply organisational tier + staff notification after OAuth or onboarding. */
export async function POST() {
  const session = await auth()
  const email = session?.user?.email?.toLowerCase().trim()
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = await resolveUserIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, createdAt: true, email: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await syncMembershipTierOnSignup({
    userId,
    email: user.email,
    name: user.name,
    options: {
      explicitIntent: MEMBERSHIP_REGISTER_INTENT.ORGANISATIONAL,
      defaultCommunity: true,
    },
  })

  const ageMs = Date.now() - user.createdAt.getTime()
  const isNewAccount = ageMs <= NEW_ACCOUNT_WINDOW_MS

  let emailsQueued = false
  let alreadyRecorded = false

  if (isNewAccount) {
    const result = await recordOrganisationalRegistration({
      email: user.email,
      name: user.name,
    })
    emailsQueued = result.emailsQueued
    alreadyRecorded = result.alreadyRecorded
  }

  return NextResponse.json({
    message: !isNewAccount
      ? "Organisational membership applied to your profile."
      : alreadyRecorded
        ? "Already notified."
        : emailsQueued
          ? "Partnerships team notified. Check your email for next steps."
          : "Registration recorded. Confirmation email could not be sent (mail not configured).",
    emailsQueued,
    alreadyRecorded,
    skippedStaffEmail: !isNewAccount,
    discoveryCallUrl: ORGANISATIONAL_DISCOVERY_CALL_URL,
  })
}
