import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { serializeSubscription } from "@/lib/membership-billing"
import { initiateMembershipPayment } from "@/lib/membership-automation"
import { z } from "zod"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const bodySchema = z.object({
  planId: z.string().min(1),
  phoneNumber: z.string().min(9).max(20),
})

/**
 * POST /api/billing/subscribe
 * Logged-in member starts or renews monthly membership on an active plan.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
    }

    const body = bodySchema.parse(await request.json())
    const plan = await prisma.plan.findFirst({
      where: { id: body.planId, isActive: true },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found or inactive" }, { status: 400, headers: corsHeaders })
    }

    const checkout = await initiateMembershipPayment(prisma, {
      userId: session.user.id,
      plan,
      amount: plan.price,
      currency: plan.currency,
      phoneNumber: body.phoneNumber,
    })

    return NextResponse.json(
      {
        message: checkout.message,
        pending: checkout.pending,
        paymentId: checkout.paymentId,
        subscription: checkout.subscription
          ? serializeSubscription(checkout.subscription)
          : undefined,
      },
      { status: checkout.pending ? 202 : 201, headers: corsHeaders }
    )
  } catch (error: unknown) {
    console.error("[BILLING SUBSCRIBE] Error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.errors }, { status: 400, headers: corsHeaders })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to subscribe" },
      { status: 500, headers: corsHeaders }
    )
  }
}
