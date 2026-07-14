import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"
import {
  buildOrganisationalProfileCompletedPlainText,
  sendOrganisationalProfileCompletedStaffEmail,
  type OrganisationalProfileCompletedPayload,
} from "@/lib/email/membership-organisational-inquiry"
import { ORGANISATIONAL_PLAN_NAME } from "@/lib/membership-inquiry"
import { MEMBERSHIP_TIERS } from "@/lib/membership-tier"
import { isEmailConfigured, sendEmailInBackground } from "@/lib/email/send"

const PROFILE_COMPLETE_CATEGORY = "organisational-profile-complete"

/** Notify partnerships team when an organisational member finishes onboarding */
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

  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    prisma.memberProfile.findUnique({
      where: { userId },
      select: {
        membershipTier: true,
        organization: true,
        role: true,
        industry: true,
        location: true,
        interests: true,
        bio: true,
      },
    }),
  ])

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (profile?.membershipTier !== MEMBERSHIP_TIERS.ORGANISATIONAL) {
    return NextResponse.json({ message: "Not an organisational member." }, { status: 200 })
  }

  const payload: OrganisationalProfileCompletedPayload = {
    email: user.email,
    name: user.name,
    organization: profile?.organization,
    role: profile?.role,
    sector: profile?.industry,
    location: profile?.location,
    goals: profile?.interests ?? [],
    bio: profile?.bio,
  }

  const existing = await prisma.supportTicket.findFirst({
    where: {
      category: PROFILE_COMPLETE_CATEGORY,
      member: { contains: email },
    },
    select: { id: true },
  })

  if (existing) {
    return NextResponse.json({ message: "Already notified.", alreadyRecorded: true })
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      member: user.name?.trim()
        ? `${user.name.trim()} <${user.email}>`
        : user.email,
      subject: `${ORGANISATIONAL_PLAN_NAME} — profile complete — ${profile?.organization?.trim() || user.email}`,
      description: buildOrganisationalProfileCompletedPlainText(payload),
      status: "open",
      priority: "high",
      category: PROFILE_COMPLETE_CATEGORY,
    },
  })

  const { notifyStaffSupportTicketCreated } = await import("@/lib/staff-alerts")
  void notifyStaffSupportTicketCreated(ticket)

  let emailsQueued = false
  if (isEmailConfigured()) {
    sendEmailInBackground(
      () => sendOrganisationalProfileCompletedStaffEmail(payload),
      "organisational-profile-complete-staff"
    )
    emailsQueued = true
  }

  return NextResponse.json({
    message: emailsQueued
      ? "Partnerships team notified with your profile details."
      : "Profile recorded for partnerships follow-up.",
    emailsQueued,
    alreadyRecorded: false,
  })
}
