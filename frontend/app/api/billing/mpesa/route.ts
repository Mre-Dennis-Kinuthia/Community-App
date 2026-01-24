import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
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

/**
 * POST /api/billing/mpesa
 * Initiate M-Pesa STK Push payment
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

    // TODO: Integrate with actual M-Pesa API (Safaricom Daraja API)
    // For now, create a payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        currency: "KES",
        method: "mpesa",
        status: "pending",
        metadata: {
          phoneNumber,
          description: description || "Payment via M-Pesa",
        },
      },
    })

    // In production, this would:
    // 1. Call Safaricom Daraja API STK Push endpoint
    // 2. Store the checkout request ID
    // 3. Poll for payment status
    // 4. Update payment record when confirmed

    return NextResponse.json(
      {
        message: "M-Pesa payment initiated. Please check your phone to complete the payment.",
        paymentId: payment.id,
        payment,
      },
      { status: 201, headers: corsHeaders }
    )
  } catch (error: any) {
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
