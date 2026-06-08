import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { generateCheckInCode } from "@/lib/event-checkin"
import { prisma } from "@/lib/prisma"
import {
  countConfirmedRegistrations,
  resolveInitialRegistrationStatus,
} from "@/lib/event-registrations"
import {
  parseRegistrationQuestions,
  validateRegistrationAnswers,
  isPaidEvent,
} from "@/lib/event-questions"
import { findEventByPublicParam } from "@/lib/event-slug"
import { getEventPublicUrl } from "@/lib/event-url"
import { getEventCalendarLinks } from "@/lib/event-calendar"
import { isLumaRegistration } from "@/lib/luma"
import { sendEventRegistrationEmail, sendEventRegistrationCancelledEmail, sendEventRegistrationStaffEmail, sendEmailInBackground } from "@/lib/email"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { z } from "zod"

async function resolveEventId(param: string): Promise<string | null> {
  const event = await findEventByPublicParam(prisma, param)
  return event?.id ?? null
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const registrationSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  answers: z.record(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth()
    const resolvedParams = await Promise.resolve(params)
    const eventId = await resolveEventId(resolvedParams.id)
    if (!eventId) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

    if (!session?.user?.email) {
      return NextResponse.json(
        { registration: null },
        { headers: corsHeaders(request) }
      )
    }

    const email = session.user.email.toLowerCase().trim()
    const registration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        email,
        status: { in: ["registered", "waitlisted", "pending", "attended"] },
      },
      select: {
        id: true,
        status: true,
        checkInCode: true,
        paymentStatus: true,
        createdAt: true,
        answers: true,
      },
    })

    return NextResponse.json(
      { registration },
      { headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    console.error("[EVENT REGISTRATION API] GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch registration" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth()
    const resolvedParams = await Promise.resolve(params)
    const eventId = await resolveEventId(resolvedParams.id)
    if (!eventId) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

    if (event.startDate < new Date()) {
      return NextResponse.json(
        { error: "Cannot register for past events" },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    const body = await request.json().catch(() => ({}))
    const rawEmail = body.email || session?.user?.email
    const email = rawEmail ? String(rawEmail).toLowerCase().trim() : null
    const name = body.name || session?.user?.name || null
    const answers = (body.answers as Record<string, string>) ?? {}

    if (!email) {
      return NextResponse.json(
        { error: "Email is required for registration" },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    const questions = parseRegistrationQuestions(event.registrationQuestions)
    const answerError = validateRegistrationAnswers(questions, answers)
    if (answerError) {
      return NextResponse.json(
        { error: answerError },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    let userId: string | null = session?.user?.id ?? null
    if (!userId) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })
      userId = user?.id ?? null
    }

    if (event.registrationRequired === false) {
      return NextResponse.json(
        { error: "Registration is not required for this event" },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    if (isLumaRegistration(event.registrationProvider)) {
      return NextResponse.json(
        {
          error: "Registration is handled on Luma",
          lumaEventUrl: event.lumaEventUrl,
        },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        email,
        status: { in: ["registered", "waitlisted", "pending", "attended"] },
      },
    })

    if (existingRegistration) {
      const message =
        existingRegistration.status === "pending"
          ? "Your application is already pending review"
          : existingRegistration.status === "waitlisted"
            ? "You are already on the waitlist for this event"
            : "Already registered for this event"
      return NextResponse.json(
        { error: message },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    const confirmedCount = await countConfirmedRegistrations(prisma, eventId)

    let status: "registered" | "waitlisted" | "pending"
    try {
      status = resolveInitialRegistrationStatus(event, confirmedCount)
    } catch {
      return NextResponse.json(
        { error: "Event is at full capacity" },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        email,
        name: name || null,
        status,
        checkInCode: generateCheckInCode(),
        answers: questions.length > 0 ? answers : undefined,
        paymentStatus: isPaidEvent(event.price) ? "pending" : "not_required",
      },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            location: true,
            price: true,
            currency: true,
            timezone: true,
            slug: true,
            shortCode: true,
          },
        },
      },
    })

    const eventUrl = getEventPublicUrl({
      id: event.id,
      slug: event.slug,
      shortCode: event.shortCode,
    })

    const calendarLinks = getEventCalendarLinks(
      {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        timezone: event.timezone,
        location: event.location,
        locationType: event.locationType,
        onlineUrl: event.onlineUrl,
        slug: event.slug,
        shortCode: event.shortCode,
      },
      resolvedParams.id
    )

    sendEmailInBackground(
      () =>
        sendEventRegistrationEmail({
          to: email,
          name: name || null,
          eventTitle: event.title,
          eventStartDate: event.startDate,
          eventTimezone: event.timezone,
          eventUrl,
          status,
          calendarGoogleUrl: status === "registered" ? calendarLinks.google : undefined,
        }),
      "event-registration"
    )

    sendEmailInBackground(
      () =>
        sendEventRegistrationStaffEmail({
          memberEmail: email,
          memberName: name || null,
          eventTitle: event.title,
          eventStartDate: event.startDate,
          eventTimezone: event.timezone,
          status,
        }),
      "event-registration-staff"
    )

    const message =
      status === "pending"
        ? "Application submitted — the organizer will review your registration"
        : status === "waitlisted"
          ? "You have been added to the waitlist"
          : isPaidEvent(event.price)
            ? "Registered — payment can be completed at the venue (online payments coming soon)"
            : "Successfully registered for event"

    return NextResponse.json(
      {
        message,
        registration: {
          id: registration.id,
          event: registration.event,
          status: registration.status,
          checkInCode: registration.checkInCode,
          paymentStatus: registration.paymentStatus,
        },
        calendarLinks: status === "registered" ? calendarLinks : undefined,
      },
      { status: 201, headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    console.error("[EVENT REGISTRATION API] Error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid registration data", details: error.errors },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth()
    const resolvedParams = await Promise.resolve(params)
    const eventId = await resolveEventId(resolvedParams.id)
    if (!eventId) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: corsHeaders(request) }
      )
    }

    const email = session.user.email.toLowerCase().trim()
    const registration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        email,
        status: { in: ["registered", "waitlisted", "pending"] },
      },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            timezone: true,
            slug: true,
            shortCode: true,
          },
        },
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: "No active registration found" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

    await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: { status: "cancelled" },
    })

    sendEmailInBackground(
      () =>
        sendEventRegistrationCancelledEmail({
          to: email,
          name: registration.name,
          eventTitle: registration.event.title,
          eventStartDate: registration.event.startDate,
          eventTimezone: registration.event.timezone,
          eventUrl: getEventPublicUrl({
            id: eventId,
            slug: registration.event.slug,
            shortCode: registration.event.shortCode,
          }),
        }),
      "event-registration-cancelled"
    )

    return NextResponse.json(
      { message: "Registration cancelled" },
      { headers: corsHeaders(request) }
    )
  } catch (error) {
    console.error("[EVENT REGISTRATION API] DELETE error:", error)
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
