import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { buildCheckInPayload, generateCheckInCode } from "@/lib/event-checkin"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import QRCode from "qrcode"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/events/[id]/ticket
 * Returns QR code data URL for the logged-in user's registration.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: corsHeaders(request) }
      )
    }

    const { id: eventId } = params
    const email = session.user.email.toLowerCase().trim()

    const registration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        email,
        status: { in: ["registered", "attended"] },
      },
      include: {
        event: {
          select: { title: true, startDate: true },
        },
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: "No ticket found for this event" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

    let checkInCode = registration.checkInCode
    if (!checkInCode) {
      checkInCode = generateCheckInCode()
      await prisma.eventRegistration.update({
        where: { id: registration.id },
        data: { checkInCode },
      })
    }

    const payload = buildCheckInPayload(eventId, registration.id, checkInCode)
    const qrDataUrl = await QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
    })

    return NextResponse.json(
      {
        ticket: {
          registrationId: registration.id,
          checkInCode,
          status: registration.status,
          eventTitle: registration.event.title,
          eventStartDate: registration.event.startDate,
          qrDataUrl,
        },
      },
      { headers: corsHeaders(request) }
    )
  } catch (error) {
    console.error("[EVENT TICKET API] Error:", error)
    return NextResponse.json(
      { error: "Failed to generate ticket" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
