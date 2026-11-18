import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { confirmNewsletterSubscription } from "@/lib/newsletter"
import { persistentRateLimit } from "@/lib/persistent-rate-limit"
import { clientIpFromRequest } from "@/lib/rate-limit"

const schema = z.object({ token: z.string().min(1).max(256) })

export async function POST(request: NextRequest) {
  try {
    const limit = await persistentRateLimit(
      `newsletter-confirm:ip:${clientIpFromRequest(request)}`,
      { limit: 20, windowMs: 15 * 60 * 1000 }
    )
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
      )
    }

    const { token } = schema.parse(await request.json())
    const status = await confirmNewsletterSubscription(token)
    if (status === "invalid") {
      return NextResponse.json(
        { error: "This confirmation link is invalid or expired. Please subscribe again." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      confirmed: true,
      message:
        status === "already_confirmed"
          ? "This newsletter subscription is already confirmed."
          : "Your newsletter subscription is confirmed.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid confirmation link." }, { status: 400 })
    }
    console.error("[newsletter] Confirmation error:", error)
    return NextResponse.json(
      { error: "Could not confirm your subscription. Please try again." },
      { status: 500 }
    )
  }
}
