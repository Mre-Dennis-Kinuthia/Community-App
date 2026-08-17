import type { Prisma, PrismaClient } from "@prisma/client"
import {
  generatePaystackReference,
  initializeTransaction,
  isPaystackConfigured,
  paystackCallbackUrl,
} from "@/lib/paystack"

export type StartPaystackCheckoutParams = {
  userId: string
  email: string
  amount: number
  currency?: string
  metadata: Record<string, unknown> & {
    type: "membership" | "booking" | "event_registration"
    successPath?: string
  }
  bookingId?: string
  eventRegistrationId?: string
  /** Extra fields stored on Payment.metadata */
  paymentMeta?: Record<string, unknown>
}

export type StartPaystackCheckoutResult = {
  paymentId: string
  reference: string
  authorizationUrl: string
  pending: true
  message: string
}

/**
 * Creates or refreshes a pending Payment and returns a Paystack authorization URL.
 * Throws if Paystack is not configured.
 */
export async function startPaystackCheckout(
  prisma: PrismaClient,
  params: StartPaystackCheckoutParams
): Promise<StartPaystackCheckoutResult> {
  if (!isPaystackConfigured()) {
    throw new Error("Paystack is not configured. Set PAYSTACK_SECRET_KEY.")
  }

  if (params.amount <= 0) {
    throw new Error("Amount must be greater than zero")
  }

  const reference = generatePaystackReference()
  const successPath = params.metadata.successPath
  const metadata = {
    ...params.paymentMeta,
    ...params.metadata,
    successPath,
  } as Prisma.InputJsonValue

  let paymentId: string

  if (params.bookingId) {
    const existing = await prisma.payment.findUnique({
      where: { bookingId: params.bookingId },
    })
    if (existing?.status === "completed") {
      throw new Error("This booking is already paid")
    }
    if (existing) {
      await prisma.payment.update({
        where: { id: existing.id },
        data: {
          status: "pending",
          method: "paystack",
          amount: params.amount,
          currency: params.currency ?? "KES",
          transactionId: reference,
          metadata,
        },
      })
      paymentId = existing.id
    } else {
      const created = await prisma.payment.create({
        data: {
          userId: params.userId,
          amount: params.amount,
          currency: params.currency ?? "KES",
          method: "paystack",
          status: "pending",
          transactionId: reference,
          bookingId: params.bookingId,
          metadata,
        },
      })
      paymentId = created.id
    }
  } else if (params.eventRegistrationId) {
    const existing = await prisma.payment.findUnique({
      where: { eventRegistrationId: params.eventRegistrationId },
    })
    if (existing?.status === "completed") {
      throw new Error("This registration is already paid")
    }
    if (existing) {
      await prisma.payment.update({
        where: { id: existing.id },
        data: {
          status: "pending",
          method: "paystack",
          amount: params.amount,
          currency: params.currency ?? "KES",
          transactionId: reference,
          metadata,
        },
      })
      paymentId = existing.id
    } else {
      const created = await prisma.payment.create({
        data: {
          userId: params.userId,
          amount: params.amount,
          currency: params.currency ?? "KES",
          method: "paystack",
          status: "pending",
          transactionId: reference,
          eventRegistrationId: params.eventRegistrationId,
          metadata,
        },
      })
      paymentId = created.id
    }
  } else {
    const created = await prisma.payment.create({
      data: {
        userId: params.userId,
        amount: params.amount,
        currency: params.currency ?? "KES",
        method: "paystack",
        status: "pending",
        transactionId: reference,
        metadata,
      },
    })
    paymentId = created.id
  }

  try {
    const checkout = await initializeTransaction({
      email: params.email,
      amountKes: params.amount,
      reference,
      currency: params.currency ?? "KES",
      callbackUrl: paystackCallbackUrl(),
      metadata: {
        paymentId,
        type: params.metadata.type,
        ...(params.bookingId ? { bookingId: params.bookingId } : {}),
        ...(params.eventRegistrationId
          ? { eventRegistrationId: params.eventRegistrationId }
          : {}),
      },
    })

    return {
      paymentId,
      reference,
      authorizationUrl: checkout.authorizationUrl,
      pending: true,
      message: "Complete payment on Paystack to finish checkout.",
    }
  } catch (err) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "failed",
        metadata: {
          ...(typeof metadata === "object" && metadata !== null ? metadata : {}),
          initError: err instanceof Error ? err.message : "initialize failed",
        } as Prisma.InputJsonValue,
      },
    })
    throw err
  }
}
