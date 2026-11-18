import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { clientIpFromRequest } from "@/lib/rate-limit"
import { issueEmailVerificationForEmail } from "@/lib/email-verification"
import { persistentRateLimit } from "@/lib/persistent-rate-limit"
import { validateEmailAddress } from "@/lib/email-validation"

const schema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
})

/**
 * POST /api/auth/resend-verification
 * Resend the email verification link for an unverified account.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = schema.parse(body)
    const validation = validateEmailAddress(email)
    if (!validation.valid) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }
    const limits = await Promise.all([
      persistentRateLimit(`resend-verification:ip:${clientIpFromRequest(request)}`, {
        limit: 5,
        windowMs: 60 * 60 * 1000,
      }),
      persistentRateLimit(`resend-verification:email:${validation.email}`, {
        limit: 3,
        windowMs: 60 * 60 * 1000,
      }),
    ])
    const exceeded = limits.find((limit) => !limit.ok)
    if (exceeded && !exceeded.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(exceeded.retryAfterSec) } }
      )
    }
    const result = await issueEmailVerificationForEmail(validation.email)

    // Always return a generic success for unknown emails (avoid account enumeration)
    if (!result.ok) {
      return NextResponse.json({
        message: "If an unverified account exists for that email, a verification link has been sent.",
      })
    }

    if (result.reason === "already_verified") {
      return NextResponse.json({
        message: "This email is already verified. You can sign in.",
        alreadyVerified: true,
      })
    }

    if (!result.emailed) {
      return NextResponse.json(
        {
          error:
            result.reason === "email_not_configured"
              ? "Email is not configured on the server."
              : "Could not send verification email. Please try again later.",
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      message: "Verification email sent. Check your inbox.",
      emailed: true,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid email" },
        { status: 400 }
      )
    }
    console.error("[RESEND VERIFICATION]", error)
    return NextResponse.json(
      { error: "Failed to resend verification email." },
      { status: 500 }
    )
  }
}
