import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { generateCheckInCode } from "@/lib/event-checkin"
import { prisma } from "@/lib/prisma"
import {
  countConfirmedRegistrations,
  resolveRegistrationStatusForEvent,
} from "@/lib/event-registrations"
import {
  parseRegistrationQuestions,
  validateRegistrationAnswers,
  isPaidEvent,
} from "@/lib/event-questions"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { z } from "zod"

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
    const { id: eventId } = resolvedParams

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
        status: { in: ["registered", "waitlisted", "attended"] },
      },
      select: {
        id: true,
        status: true,
        checkInCode: true,
        paymentStatus: true,
        createdAt: true,
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
    const { id: eventId } = resolvedParams

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

    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        email,
        status: { in: ["registered", "waitlisted", "attended"] },
      },
    })

    if (existingRegistration) {
      const message =
        existingRegistration.status === "waitlisted"
          ? "You are already on the waitlist for this event"
          : "Already registered for this event"
      return NextResponse.json(
        { error: message },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    const confirmedCount = await countConfirmedRegistrations(prisma, eventId)

    let status: "registered" | "waitlisted"
    try {
      status = resolveRegistrationStatusForEvent(event, confirmedCount)
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
          },
        },
      },
    })

    const message =
      status === "waitlisted"
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
    const { id: eventId } = resolvedParams

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
        status: { in: ["registered", "waitlisted"] },
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
