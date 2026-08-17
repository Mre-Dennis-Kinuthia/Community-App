import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyWebhookSignature } from "@/lib/paystack"
import { completePaymentByReference } from "@/lib/payment-complete"

/**
 * POST /api/billing/paystack/webhook
 * Configure this URL in the Paystack dashboard.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-paystack-signature")

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("[PAYSTACK WEBHOOK] Invalid signature")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let event: { event?: string; data?: { reference?: string } }
  try {
    event = JSON.parse(rawBody) as { event?: string; data?: { reference?: string } }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true, ignored: event.event ?? true })
  }

  const reference = event.data?.reference
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 })
  }

  try {
    await completePaymentByReference(prisma, reference)
    return NextResponse.json({ received: true, ok: true })
  } catch (error) {
    console.error("[PAYSTACK WEBHOOK] Complete failed:", error)
    // Still 200 so Paystack does not endlessly retry on business errors after verify fail
    return NextResponse.json({
      received: true,
      ok: false,
      error: error instanceof Error ? error.message : "complete failed",
    })
  }
}
