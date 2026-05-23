import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { corsHeaders, handleOptions } from "@/middleware-cors"

const mpesaPaymentSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  description: z.string().optional(),
})

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/** True when Safaricom Daraja credentials are configured for live STK push */
function isDarajaConfigured(): boolean {
  return Boolean(
    process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_SHORTCODE &&
      process.env.MPESA_PASSKEY
  )
}

/**
 * POST /api/billing/mpesa
 * Launch: records a pending payment; STK push is stubbed until Daraja is wired.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { phoneNumber, amount, description } = mpesaPaymentSchema.parse(body)

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: new Prisma.Decimal(amount),
        currency: "KES",
        method: "mpesa",
        status: "pending",
        metadata: {
          phoneNumber,
          description: description ?? "Payment via M-Pesa",
        },
      },
    })

    const darajaLive = isDarajaConfigured()

    return NextResponse.json(
      {
        message: darajaLive
          ? "M-Pesa payment initiated. Please check your phone to complete the payment."
          : "Payment recorded as pending. M-Pesa STK push is not live yet — use “Confirm booking (no payment)” on the booking page.",
        launchMode: darajaLive ? "daraja" : "stub",
        paymentId: payment.id,
        payment: {
          id: payment.id,
          amount: Number(payment.amount),
          currency: payment.currency,
          method: payment.method,
          status: payment.status,
          metadata: payment.metadata,
        },
      },
      { status: 201, headers: corsHeaders }
    )
  } catch (error: unknown) {
    console.error("[MPESA PAYMENT API] Error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payment data", details: error.errors },
        { status: 400, headers: corsHeaders }
      )
    }
    return NextResponse.json(
      { error: "Failed to initiate M-Pesa payment" },
      { status: 500, headers: corsHeaders }
    )
  }
}
