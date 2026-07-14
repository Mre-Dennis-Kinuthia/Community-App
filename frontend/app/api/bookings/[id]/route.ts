import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { syncAccessForBooking } from "@/lib/integrations/access-control"
import { createNotification, NotificationTemplates } from "@/lib/notifications"
import { sendBookingCancelledEmail, sendEmailInBackground } from "@/lib/email"

async function resolveUserId(session: Awaited<ReturnType<typeof auth>>) {
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  return user?.id ?? null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = await resolveUserId(session)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = (await request.json()) as { status?: string }
    if (body.status !== "cancelled") {
      return NextResponse.json({ error: "Only cancellation is supported" }, { status: 400 })
    }

    const existing = await prisma.workspaceBooking.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const booking = await prisma.workspaceBooking.update({
      where: { id },
      data: { status: "cancelled" },
    })

    await syncAccessForBooking(booking).catch((err) => console.error("[ACCESS BOOKING CANCEL]", err))

    const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    await createNotification({
      userId,
      ...NotificationTemplates.bookingCancelled(
        booking.id,
        booking.resourceType.replace("-", " "),
        formattedDate
      ),
      skipEmail: true,
    })

    if (existing.user?.email) {
      sendEmailInBackground(
        () =>
          sendBookingCancelledEmail({
            to: existing.user!.email!,
            name: existing.user!.name,
            resourceType: booking.resourceType,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
          }),
        "booking-cancelled"
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("[BOOKING PATCH]", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
