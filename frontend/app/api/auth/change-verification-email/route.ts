import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth-utils"
import { clientIpFromRequest } from "@/lib/rate-limit"
import { persistentRateLimit } from "@/lib/persistent-rate-limit"
import { validateEmailAddress } from "@/lib/email-validation"
import { issueEmailVerificationForEmail } from "@/lib/email-verification"

const schema = z.object({
  currentEmail: z.string().email().transform((email) => email.toLowerCase().trim()),
  newEmail: z.string().email().transform((email) => email.toLowerCase().trim()),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json())
    const ipLimit = await persistentRateLimit(
      `change-verification-email:ip:${clientIpFromRequest(request)}`,
      { limit: 5, windowMs: 60 * 60 * 1000 }
    )
    if (!ipLimit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSec) } }
      )
    }

    const validation = validateEmailAddress(body.newEmail)
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Please enter a valid, non-disposable email address." },
        { status: 400 }
      )
    }

    const emailLimit = await persistentRateLimit(
      `change-verification-email:target:${validation.email}`,
      { limit: 3, windowMs: 60 * 60 * 1000 }
    )
    if (!emailLimit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfterSec) } }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: body.currentEmail },
      select: { id: true, name: true, password: true, emailVerified: true },
    })
    if (!user?.password || user.emailVerified) {
      return NextResponse.json(
        { error: "Unable to change this account's verification email." },
        { status: 400 }
      )
    }

    if (!(await verifyPassword(body.password, user.password))) {
      return NextResponse.json(
        { error: "Unable to change this account's verification email." },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { email: validation.email },
    })
    const result = await issueEmailVerificationForEmail(validation.email, {
      name: user.name,
    })

    return NextResponse.json({
      message: result.ok && result.emailed
        ? "A new verification link has been sent to your updated email address."
        : "Your email was updated, but we couldn't send a verification link. Please request another one.",
      emailed: result.ok && result.emailed,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Please check the email and password fields." }, { status: 400 })
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with the new email address already exists." },
        { status: 409 }
      )
    }
    console.error("[CHANGE VERIFICATION EMAIL]", error)
    return NextResponse.json(
      { error: "Could not update the verification email. Please try again." },
      { status: 500 }
    )
  }
}
