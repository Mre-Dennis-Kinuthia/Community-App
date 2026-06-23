import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  buildBookingIcsInviteContent,
  icsFilenameForBooking,
} from "@/lib/booking-calendar"

async function resolveUserIdFromSession(session: Awaited<ReturnType<typeof auth>>) {
  const sessionUser = session?.user
  if (!sessionUser) return null

  if (typeof sessionUser.id === "string") {
    const existing = await prisma.user.findUnique({ where: { id: sessionUser.id } })
    if (existing) return existing.id
  }

  const email = typeof sessionUser.email === "string" ? sessionUser.email.toLowerCase().trim() : null
  if (!email) return null

  const user = await prisma.user.findUnique({ where: { email } })
  return user?.id ?? null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = await resolveUserIdFromSession(session)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await Promise.resolve(params)
    const booking = await prisma.workspaceBooking.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (booking.resourceType !== "meeting-room") {
      return NextResponse.json(
        { error: "Calendar invites are only available for meeting room bookings" },
        { status: 400 }
      )
    }

    const ics = buildBookingIcsInviteContent(
      {
        id: booking.id,
        resourceType: booking.resourceType,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        addOns: booking.addOns,
        addOnsPrice: booking.addOnsPrice,
      },
      {
        attendeeEmail: booking.user?.email,
        attendeeName: booking.user?.name,
      }
    )

    if (!ics) {
      return NextResponse.json({ error: "Failed to generate calendar file" }, { status: 500 })
    }

    const filename = icsFilenameForBooking(booking.resourceType)

    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("[BOOKING CALENDAR ICS] Error:", error)
    return NextResponse.json({ error: "Failed to generate calendar file" }, { status: 500 })
  }
}
