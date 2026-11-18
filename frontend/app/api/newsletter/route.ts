import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { requestNewsletterSubscription } from "@/lib/newsletter"
import { persistentRateLimit } from "@/lib/persistent-rate-limit"
import { clientIpFromRequest } from "@/lib/rate-limit"
import { validateEmailAddress } from "@/lib/email-validation"

const schema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  source: z.string().trim().max(64).optional(),
})

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source } = schema.parse(body)

    const emailValidation = validateEmailAddress(email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: "Please enter a valid, non-disposable email address." },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    const limited = await persistentRateLimit(
      `newsletter:ip:${clientIpFromRequest(request)}`,
      { limit: 5, windowMs: 60 * 60 * 1000 }
    )
    const emailLimit = await persistentRateLimit(
      `newsletter:email:${emailValidation.email}`,
      { limit: 3, windowMs: 60 * 60 * 1000 }
    )
    const exceeded = !limited.ok ? limited : !emailLimit.ok ? emailLimit : null
    if (exceeded) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            ...corsHeaders(request),
            "Retry-After": String(exceeded.retryAfterSec),
          },
        }
      )
    }

    await requestNewsletterSubscription({ email: emailValidation.email, source })

    return NextResponse.json(
      {
        success: true,
        message: "If this address can subscribe, a confirmation email has been sent.",
      },
      { headers: corsHeaders(request) }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400, headers: corsHeaders(request) }
      )
    }
    console.error("[newsletter] Subscribe error:", error)
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
