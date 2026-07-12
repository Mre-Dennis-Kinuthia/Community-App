import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit"
import { consumeEmailVerificationToken } from "@/lib/email-verification"

const schema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  token: z.string().min(1),
})

/**
 * POST /api/auth/verify-email
 * Confirm a member's email using the link from the verification email.
 */
export async function POST(request: NextRequest) {
  const ip = clientIpFromRequest(request)
  const limited = rateLimit(`verify-email:${ip}`, {
    limit: 20,
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
    const { email, token } = schema.parse(body)
    const result = await consumeEmailVerificationToken(email, token)

    if (!result.ok) {
      if (result.reason === "already_verified") {
        return NextResponse.json({
          message: "Your email is already verified. You can sign in.",
          alreadyVerified: true,
        })
      }
      return NextResponse.json(
        { error: "Invalid or expired verification link. Request a new one from the login page." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: "Email verified successfully. You can sign in.",
      verified: true,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }
    console.error("[VERIFY EMAIL]", error)
    return NextResponse.json(
      { error: "Failed to verify email. Please try again." },
      { status: 500 }
    )
  }
}
