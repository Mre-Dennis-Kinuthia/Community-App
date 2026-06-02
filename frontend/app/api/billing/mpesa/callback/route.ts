import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { completeMembershipPaymentById } from "@/lib/membership-automation"

export const dynamic = "force-dynamic"

/**
 * Safaricom Daraja STK callback — completes pending membership payments.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const stkCallback = body?.Body?.stkCallback
    if (!stkCallback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
    }

    const resultCode = stkCallback.ResultCode
    const checkoutRequestId = stkCallback.CheckoutRequestID as string | undefined
    const metadata = stkCallback.CallbackMetadata?.Item as Array<{ Name: string; Value?: string }> | undefined

    if (resultCode !== 0) {
      console.warn("[MPESA CALLBACK] Failed STK:", stkCallback.ResultDesc)
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
    }

    let paymentId: string | undefined
    if (metadata) {
      const ref = metadata.find((i) => i.Name === "AccountReference")?.Value
      if (ref) paymentId = ref
    }

    if (!paymentId && checkoutRequestId) {
      const pending = await prisma.payment.findMany({
        where: { status: "pending", method: "mpesa" },
        orderBy: { createdAt: "desc" },
        take: 30,
      })
      const match = pending.find((p) => {
        const meta = p.metadata as { checkoutRequestId?: string } | null
        return meta?.checkoutRequestId === checkoutRequestId
      })
      paymentId = match?.id
    }

    if (paymentId && paymentId.length < 36) {
      const pending = await prisma.payment.findMany({
        where: { status: "pending", method: "mpesa" },
        orderBy: { createdAt: "desc" },
        take: 30,
      })
      const match = pending.find((p) => p.id.startsWith(paymentId!))
      paymentId = match?.id ?? paymentId
    }

    if (!paymentId) {
      console.warn("[MPESA CALLBACK] Could not resolve payment id")
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
    }

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
    if (!payment || payment.status !== "pending") {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
    }

    await completeMembershipPaymentById(prisma, payment.id)
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" })
  } catch (error) {
    console.error("[MPESA CALLBACK]", error)
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
  }
}
