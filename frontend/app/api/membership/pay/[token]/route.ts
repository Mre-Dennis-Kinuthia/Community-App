import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { resolveUserForMembership, serializePaymentLink } from "@/lib/membership-billing"
import { initiateMembershipPayment } from "@/lib/membership-automation"
import { z } from "zod"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(
  request: NextRequest,
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
      return NextResponse.json({ error: "Payment link not found" }, { status: 404, headers: corsHeaders(request) })
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
      { headers: corsHeaders(request) }
    )
  } catch (error) {
    console.error("[MEMBERSHIP PAY] GET error:", error)
    return NextResponse.json({ error: "Failed to load payment link" }, { status: 500, headers: corsHeaders(request) })
  }
}

const payBodySchema = z.object({
  email: z.string().email().optional(),
  name: z.string().max(200).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = payBodySchema.parse(await request.json().catch(() => ({})))
    const session = await auth()

    const link = await prisma.membershipPaymentLink.findUnique({
      where: { token },
      include: { plan: true },
    })

    if (!link) {
      return NextResponse.json({ error: "Payment link not found" }, { status: 404, headers: corsHeaders(request) })
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
          { status: 403, headers: corsHeaders(request) }
        )
      }
    } else {
      if (!body.email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400, headers: corsHeaders(request) })
      }
      payerEmail = body.email.toLowerCase().trim()
      if (payerEmail !== recipientEmail) {
        return NextResponse.json(
          { error: `Use the email address this link was sent to (${link.recipientEmail}).` },
          { status: 400, headers: corsHeaders(request) }
        )
      }
      payerName = body.name?.trim() || payerName
    }

    const userId = await resolveUserForMembership(prisma, {
      email: payerEmail,
      name: payerName,
      existingUserId: session?.user?.id ?? link.userId,
    })

    const checkout = await initiateMembershipPayment(prisma, {
      userId,
      email: payerEmail,
      plan: link.plan,
      amount: link.amount,
      currency: link.currency,
      membershipPaymentLinkId: link.id,
      successPath: `/pay/${token}?paid=1`,
    })

    return NextResponse.json(
      {
        message: checkout.message,
        pending: checkout.pending,
        paymentId: checkout.paymentId,
        authorizationUrl: checkout.authorizationUrl,
        loginUrl: `/login?email=${encodeURIComponent(payerEmail)}&redirect=/billing`,
      },
      { headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    console.error("[MEMBERSHIP PAY] POST error:", error)
    const message = error instanceof Error ? error.message : "Payment failed"
    const status = message.includes("not configured")
      ? 503
      : message.includes("not found")
        ? 404
        : message.includes("expired") || message.includes("used")
          ? 400
          : 500
    return NextResponse.json({ error: message }, { status, headers: corsHeaders(request) })
  }
}
