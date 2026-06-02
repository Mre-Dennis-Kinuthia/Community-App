import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import {
  fulfillMembershipPayment,
  resolveUserForMembership,
  serializePaymentLink,
} from "@/lib/membership-billing"
import { z } from "zod"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const link = await prisma.membershipPaymentLink.findUnique({
      where: { token },
      include: {
        plan: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })

    if (!link) {
      return NextResponse.json({ error: "Payment link not found" }, { status: 404, headers: corsHeaders })
    }

    if (link.status === "pending" && link.expiresAt < new Date()) {
      await prisma.membershipPaymentLink.update({
        where: { id: link.id },
        data: { status: "expired", updatedAt: new Date() },
      })
      link.status = "expired"
    }

    const session = await auth()

    return NextResponse.json(
      {
        link: serializePaymentLink(link),
        sessionEmail: session?.user?.email ?? null,
        sessionUserId: session?.user?.id ?? null,
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error("[MEMBERSHIP PAY] GET error:", error)
    return NextResponse.json({ error: "Failed to load payment link" }, { status: 500, headers: corsHeaders })
  }
}

const payBodySchema = z.object({
  email: z.string().email().optional(),
  name: z.string().max(200).optional(),
  phoneNumber: z.string().min(9).max(20),
  confirmOffline: z.boolean().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = payBodySchema.parse(await request.json())
    const session = await auth()

    const link = await prisma.membershipPaymentLink.findUnique({
      where: { token },
      include: { plan: true },
    })

    if (!link) {
      return NextResponse.json({ error: "Payment link not found" }, { status: 404, headers: corsHeaders })
    }

    const recipientEmail = link.recipientEmail.toLowerCase().trim()
    let payerEmail = recipientEmail
    let payerName = link.recipientName

    if (session?.user?.email) {
      payerEmail = session.user.email.toLowerCase().trim()
      payerName = session.user.name ?? payerName
      if (payerEmail !== recipientEmail) {
        return NextResponse.json(
          {
            error: `Sign in as ${link.recipientEmail} or use the email this link was sent to.`,
          },
          { status: 403, headers: corsHeaders }
        )
      }
    } else {
      if (!body.email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400, headers: corsHeaders })
      }
      payerEmail = body.email.toLowerCase().trim()
      if (payerEmail !== recipientEmail) {
        return NextResponse.json(
          { error: `Use the email address this link was sent to (${link.recipientEmail}).` },
          { status: 400, headers: corsHeaders }
        )
      }
      payerName = body.name?.trim() || payerName
    }

    const userId = await resolveUserForMembership(prisma, {
      email: payerEmail,
      name: payerName,
      existingUserId: session?.user?.id ?? link.userId,
    })

    const result = await fulfillMembershipPayment(prisma, {
      linkId: link.id,
      userId,
      method: "mpesa",
      phoneNumber: body.phoneNumber,
      transactionId: body.confirmOffline ? `offline-${Date.now()}` : `mpesa-pending-${Date.now()}`,
    })

    return NextResponse.json(
      {
        message:
          "Membership payment recorded. Your subscription is active. If M-Pesa did not complete, our team will confirm shortly.",
        subscription: {
          id: result.subscription.id,
          status: result.subscription.status,
          currentPeriodEnd: result.subscription.currentPeriodEnd.toISOString(),
          plan: { name: result.plan.name },
        },
        loginUrl: `/login?email=${encodeURIComponent(payerEmail)}`,
      },
      { headers: corsHeaders }
    )
  } catch (error: unknown) {
    console.error("[MEMBERSHIP PAY] POST error:", error)
    const message = error instanceof Error ? error.message : "Payment failed"
    const status = message.includes("not found") ? 404 : message.includes("expired") || message.includes("used") ? 400 : 500
    return NextResponse.json({ error: message }, { status, headers: corsHeaders })
  }
}
