import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { completePaymentByReference } from "@/lib/payment-complete"
import { getAppBaseUrl } from "@/lib/membership-billing"

/**
 * GET /api/billing/paystack/callback?reference=...
 * Paystack redirects here after checkout; we verify and send the user to the success path.
 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference")
  const base = getAppBaseUrl()

  if (!reference) {
    return NextResponse.redirect(`${base}/billing?payment=missing_reference`)
  }

  try {
    const result = await completePaymentByReference(prisma, reference)
    const path = result.successPath || "/dashboard"
    const sep = path.includes("?") ? "&" : "?"
    return NextResponse.redirect(`${base}${path.startsWith("/") ? path : `/${path}`}${sep}payment=success`)
  } catch (error) {
    console.error("[PAYSTACK CALLBACK]", error)
    return NextResponse.redirect(
      `${base}/billing?payment=failed&reason=${encodeURIComponent(
        error instanceof Error ? error.message : "failed"
      )}`
    )
  }
}
