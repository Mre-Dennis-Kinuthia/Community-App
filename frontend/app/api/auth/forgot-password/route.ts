import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { issuePasswordResetForEmail } from "@/lib/password-reset"
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit"

const schema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
})

const GENERIC_MESSAGE = "If an account exists, we sent a reset link."

/**
 * POST /api/auth/forgot-password
 */
export async function POST(request: NextRequest) {
  const ip = clientIpFromRequest(request)
  const limited = rateLimit(`forgot-password:${ip}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  })
  if (!limited.ok) {
    return NextResponse.json(
      { message: GENERIC_MESSAGE },
      {
        status: 200,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    )
  }

  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.AUTH_URL ||
      request.nextUrl.origin

    const result = await issuePasswordResetForEmail(email, { baseUrl })

    if (result.ok && result.emailed) {
      console.log("[FORGOT PASSWORD] Reset email queued for", result.email)
      if (process.env.NODE_ENV === "development") {
        console.log("[FORGOT PASSWORD] Reset URL:", result.resetUrl)
      }
    } else if (result.ok && !result.emailed) {
      console.error(
        "[FORGOT PASSWORD] No email sent:",
        result.reason,
        "for",
        result.email
      )
    } else if (!result.ok) {
      console.log("[FORGOT PASSWORD] No matching account for password reset request")
    }

    return NextResponse.json({ message: GENERIC_MESSAGE })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: GENERIC_MESSAGE })
    }
    console.error("[FORGOT PASSWORD]", error)
    return NextResponse.json({ message: GENERIC_MESSAGE })
  }
}
