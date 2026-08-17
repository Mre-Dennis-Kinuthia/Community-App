import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { startPaystackCheckout } from "@/lib/paystack-checkout"
import { isPaystackConfigured } from "@/lib/paystack"
import { z } from "zod"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const bodySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("booking"),
    bookingId: z.string().min(1),
  }),
  z.object({
    type: z.literal("event_registration"),
    eventRegistrationId: z.string().min(1),
  }),
])

/**
 * POST /api/billing/paystack/initialize
 * Start Paystack checkout for an existing pending booking or event registration.
 * Membership uses /api/billing/subscribe or /api/membership/pay/[token] instead.
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

    if (body.type === "booking") {
      const booking = await prisma.workspaceBooking.findFirst({
        where: { id: body.bookingId, userId: session.user.id },
      })
      if (!booking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404, headers: corsHeaders(request) })
      }
      if (booking.paymentStatus === "paid") {
        return NextResponse.json(
          { error: "Booking is already paid", bookingId: booking.id },
          { status: 400, headers: corsHeaders(request) }
        )
      }
      if (booking.totalPrice <= 0) {
        return NextResponse.json(
          { error: "This booking does not require payment" },
          { status: 400, headers: corsHeaders(request) }
        )
      }

      const checkout = await startPaystackCheckout(prisma, {
        userId: session.user.id,
        email: session.user.email,
        amount: booking.totalPrice,
        metadata: {
          type: "booking",
          successPath: `/booking/success?id=${booking.id}`,
        },
        bookingId: booking.id,
      })

      return NextResponse.json(
        {
          paymentId: checkout.paymentId,
          authorizationUrl: checkout.authorizationUrl,
          pending: true,
          message: checkout.message,
        },
        { headers: corsHeaders(request) }
      )
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: { id: body.eventRegistrationId },
      include: { event: { select: { price: true, currency: true, title: true, id: true } } },
    })
    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404, headers: corsHeaders(request) }
      )
    }
    if (registration.userId && registration.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: corsHeaders(request) })
    }
    if (
      !registration.userId &&
      registration.email.toLowerCase() !== session.user.email.toLowerCase()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: corsHeaders(request) })
    }
    if (registration.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Registration is already paid" },
        { status: 400, headers: corsHeaders(request) }
      )
    }
    const price = registration.event.price ?? 0
    if (price <= 0) {
      return NextResponse.json(
        { error: "This event does not require payment" },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    const checkout = await startPaystackCheckout(prisma, {
      userId: session.user.id,
      email: session.user.email,
      amount: price,
      currency: registration.event.currency || "KES",
      metadata: {
        type: "event_registration",
        successPath: `/events/${registration.event.id}?paid=1`,
      },
      eventRegistrationId: registration.id,
      paymentMeta: {
        eventId: registration.event.id,
        eventTitle: registration.event.title,
      },
    })

    return NextResponse.json(
      {
        paymentId: checkout.paymentId,
        authorizationUrl: checkout.authorizationUrl,
        pending: true,
        message: checkout.message,
      },
      { headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    console.error("[PAYSTACK INITIALIZE]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400, headers: corsHeaders(request) }
      )
    }
    const message = error instanceof Error ? error.message : "Failed to start payment"
    const status = message.includes("not configured") ? 503 : 500
    return NextResponse.json({ error: message }, { status, headers: corsHeaders(request) })
  }
}
