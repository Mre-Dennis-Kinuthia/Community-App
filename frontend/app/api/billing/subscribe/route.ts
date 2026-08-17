import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { initiateMembershipPayment } from "@/lib/membership-automation"
import { isPaystackConfigured } from "@/lib/paystack"
import { z } from "zod"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const bodySchema = z.object({
  planId: z.string().min(1),
})

/**
 * POST /api/billing/subscribe
 * Logged-in member starts or renews monthly membership via Paystack.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isPaystackConfigured()) {
      return NextResponse.json(
        { error: "Paystack is not configured. Set PAYSTACK_SECRET_KEY." },
        { status: 503, headers: corsHeaders(request) }
      )
    }

    const session = await auth()
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders(request) })
    }

    const body = bodySchema.parse(await request.json())
    const plan = await prisma.plan.findFirst({
      where: { id: body.planId, isActive: true },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found or inactive" }, { status: 400, headers: corsHeaders(request) })
    }

    const checkout = await initiateMembershipPayment(prisma, {
      userId: session.user.id,
      email: session.user.email,
      plan,
      amount: plan.price,
      currency: plan.currency,
      successPath: "/billing?paid=1",
    })

    return NextResponse.json(
      {
        message: checkout.message,
        pending: checkout.pending,
        paymentId: checkout.paymentId,
        authorizationUrl: checkout.authorizationUrl,
      },
      { status: 202, headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    console.error("[BILLING SUBSCRIBE] Error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.errors }, { status: 400, headers: corsHeaders(request) })
    }
    const message = error instanceof Error ? error.message : "Failed to subscribe"
    const status = message.includes("not configured") ? 503 : 500
    return NextResponse.json({ error: message }, { status, headers: corsHeaders(request) })
  }
}
