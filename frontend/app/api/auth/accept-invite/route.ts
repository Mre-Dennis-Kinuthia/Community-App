import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth-utils"
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit"
import { validatePasswordAsync } from "@/lib/password-policy"
import {
  consumeMemberInviteToken,
  validateMemberInviteToken,
} from "@/lib/member-invite"
import { sendWelcomeEmail, sendNewAccountStaffEmail, sendEmailInBackground } from "@/lib/email"
import { MEMBERSHIP_TIERS } from "@/lib/membership-tier"

const acceptInviteSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase().trim()),
  token: z.string().min(1),
  password: z.string(),
})

/**
 * POST /api/auth/accept-invite
 * Set password for an invited member and activate their platform account.
 */
export async function POST(request: NextRequest) {
  const ip = clientIpFromRequest(request)
  const limited = rateLimit(`accept-invite:${ip}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  })
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    )
  }

  try {
    const body = await request.json()
    const { email, token, password } = acceptInviteSchema.parse(body)

    const validation = await validateMemberInviteToken(email, token)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const passwordResult = await validatePasswordAsync(password, { email })
    if (!passwordResult.ok) {
      return NextResponse.json({ error: passwordResult.message }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invite account not found. Ask your community manager to send a new invite." },
        { status: 404 }
      )
    }

    if (user.password) {
      return NextResponse.json(
        { error: "This account already has a password. Sign in instead." },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailVerified: new Date(),
      },
    })

    await consumeMemberInviteToken(email, token)

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
      sendEmailInBackground(
        () => sendNewAccountStaffEmail({ email: user.email, name: user.name }),
        "new-account-staff"
      )
    }

    return NextResponse.json({
      message: "Password created. You can sign in now.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }
    console.error("[ACCEPT INVITE]", error)
    return NextResponse.json(
      { error: "Failed to activate account. Please try again." },
      { status: 500 }
    )
  }
}
