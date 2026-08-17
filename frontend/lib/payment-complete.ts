import type { PrismaClient } from "@prisma/client"
import { completeMembershipPaymentById } from "@/lib/membership-automation"
import { verifyTransaction } from "@/lib/paystack"

export type PaymentPurpose = "membership" | "booking" | "event_registration"

type PaymentMeta = {
  type?: PaymentPurpose
  planId?: string
  membershipPaymentLinkId?: string
  successPath?: string
}

async function completeBookingPayment(prisma: PrismaClient, paymentId: string, bookingId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: { status: "completed" },
    })
    await tx.workspaceBooking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: "paid",
        status: "confirmed",
      },
    })
  })

  const booking = await prisma.workspaceBooking.findUnique({
    where: { id: bookingId },
    include: { user: { select: { id: true, email: true, name: true } } },
  })
  if (!booking) return

  try {
    const { createNotification, NotificationTemplates } = await import("@/lib/notifications")
    const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    await createNotification({
      userId: booking.userId,
      ...NotificationTemplates.bookingConfirmed(
        booking.id,
        booking.resourceType.replace("-", " "),
        formattedDate
      ),
      skipEmail: true,
    })
  } catch (err) {
    console.error("[PAYMENT] Booking notification failed:", err)
  }

  try {
    const { syncAccessForBooking } = await import("@/lib/integrations/access-control")
    await syncAccessForBooking(booking)
  } catch (err) {
    console.error("[PAYMENT] Access sync failed:", err)
  }

  if (booking.user?.email) {
    try {
      const { sendEmailInBackground, sendBookingConfirmationEmail, sendNewBookingStaffEmail } =
        await import("@/lib/email")
      const { buildBookingCalendarInvite } = await import("@/lib/booking-calendar")

      const isMeetingRoom = booking.resourceType === "meeting-room"
      const calendarInput = {
        id: booking.id,
        resourceType: booking.resourceType,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        addOns: booking.addOns,
        addOnsPrice: booking.addOnsPrice,
      }
      const calendarInvite = isMeetingRoom
        ? buildBookingCalendarInvite(calendarInput, {
            attendeeEmail: booking.user.email,
            attendeeName: booking.user.name,
          })
        : null

      const bookingEmailParams = {
        bookingId: booking.id,
        resourceType: booking.resourceType,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: Number(booking.totalPrice),
        listPrice: booking.listPrice != null ? Number(booking.listPrice) : null,
        membershipDiscount: Number(booking.membershipDiscount ?? 0),
        addOns: booking.addOns,
        addOnsPrice: booking.addOnsPrice,
        calendarInvite: calendarInvite ?? undefined,
      }

      sendEmailInBackground(
        () =>
          sendBookingConfirmationEmail({
            to: booking.user!.email!,
            name: booking.user!.name,
            ...bookingEmailParams,
          }),
        "booking-confirmation"
      )
      sendEmailInBackground(
        () =>
          sendNewBookingStaffEmail({
            memberEmail: booking.user!.email!,
            memberName: booking.user!.name,
            notes: booking.notes,
            ...bookingEmailParams,
          }),
        "booking-staff"
      )
    } catch (err) {
      console.error("[PAYMENT] Booking emails failed:", err)
    }
  }
}

async function completeEventRegistrationPayment(
  prisma: PrismaClient,
  paymentId: string,
  eventRegistrationId: string
) {
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: { status: "completed" },
    })
    await tx.eventRegistration.update({
      where: { id: eventRegistrationId },
      data: { paymentStatus: "paid" },
    })
  })
}

/**
 * Mark a pending payment completed and fulfill the linked domain object.
 * Idempotent when already completed.
 */
export async function completePaymentById(prisma: PrismaClient, paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment) throw new Error("Payment not found")

  const meta = payment.metadata as PaymentMeta | null
  const type = meta?.type

  if (payment.status === "completed") {
    return {
      alreadyCompleted: true as const,
      type,
      paymentId: payment.id,
      successPath: meta?.successPath,
      bookingId: payment.bookingId,
      eventRegistrationId: payment.eventRegistrationId,
    }
  }

  if (type === "membership") {
    await completeMembershipPaymentById(prisma, payment.id)
    return {
      alreadyCompleted: false as const,
      type,
      paymentId: payment.id,
      successPath: meta?.successPath ?? "/billing",
    }
  }

  if (type === "booking") {
    if (!payment.bookingId) throw new Error("Booking payment missing bookingId")
    await completeBookingPayment(prisma, payment.id, payment.bookingId)
    return {
      alreadyCompleted: false as const,
      type,
      paymentId: payment.id,
      bookingId: payment.bookingId,
      successPath: meta?.successPath ?? `/booking/success?id=${payment.bookingId}`,
    }
  }

  if (type === "event_registration") {
    if (!payment.eventRegistrationId) {
      throw new Error("Event payment missing eventRegistrationId")
    }
    await completeEventRegistrationPayment(prisma, payment.id, payment.eventRegistrationId)
    return {
      alreadyCompleted: false as const,
      type,
      paymentId: payment.id,
      eventRegistrationId: payment.eventRegistrationId,
      successPath: meta?.successPath ?? "/events",
    }
  }

  throw new Error(`Unknown payment type: ${type ?? "undefined"}`)
}

/** Verify with Paystack then complete. Used by webhook and callback. */
export async function completePaymentByReference(prisma: PrismaClient, reference: string) {
  const payment = await prisma.payment.findFirst({
    where: { transactionId: reference },
  })
  if (!payment) {
    throw new Error("Payment not found for reference")
  }

  if (payment.status === "completed") {
    return completePaymentById(prisma, payment.id)
  }

  const verified = await verifyTransaction(reference)
  if (verified.status !== "success") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "failed",
        metadata: {
          ...(payment.metadata as object),
          paystackStatus: verified.status,
          channel: verified.channel,
        },
      },
    })
    throw new Error(`Payment not successful (${verified.status})`)
  }

  const expectedKobo = Math.round(Number(payment.amount) * 100)
  if (verified.amount < expectedKobo) {
    throw new Error("Paid amount is less than expected")
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      metadata: {
        ...(payment.metadata as object),
        channel: verified.channel,
        paidAt: verified.paidAt,
      },
    },
  })

  return completePaymentById(prisma, payment.id)
}
