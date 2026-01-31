import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { z } from "zod"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { randomUUID } from "crypto"

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
 * Initiate M-Pesa STK Push payment.
 * Payment model is optional; returns a payment reference so booking flow can continue.
 * TODO: Add Payment model to schema and persist; integrate Safaricom Daraja API for real STK push.
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

    const body = await request.json()
    const { phoneNumber, amount, description } = mpesaPaymentSchema.parse(body)

    // TODO: Integrate with Safaricom Daraja API STK Push
    // 1. Call Daraja STK Push endpoint with phoneNumber, amount
    // 2. Store checkout request ID when Payment model exists
    // 3. Poll/callback for payment status
    const paymentId = randomUUID()

    return NextResponse.json(
      {
        message: "M-Pesa payment initiated. Please check your phone to complete the payment.",
        paymentId,
        payment: {
          id: paymentId,
          amount,
          currency: "KES",
          method: "mpesa",
          status: "pending",
          metadata: { phoneNumber, description: description || "Payment via M-Pesa" },
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
