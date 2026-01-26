import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { z } from "zod"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const registrationSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

/**
 * POST /api/events/[id]/register
 * Register for an event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth()
    const resolvedParams = await Promise.resolve(params)
    const { id: eventId } = resolvedParams

    // Get event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    // Check if event is in the past
    if (event.startDate < new Date()) {
      return NextResponse.json(
        { error: "Cannot register for past events" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    
    // Get email from body or session and normalize to lowercase
    const rawEmail = body.email || session?.user?.email
    const email = rawEmail ? String(rawEmail).toLowerCase().trim() : null
    const name = body.name || session?.user?.name || null

    if (!email) {
      return NextResponse.json(
        { error: "Email is required for registration" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Get userId from session or look up by email
    let userId: string | null = null
    if (session?.user?.id) {
      userId = session.user.id
    } else if (email) {
      // Try to find user by email for guest registrations
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })
      userId = user?.id || null
    }

    // Check capacity if set
    if (event.capacity) {
      const currentRegistrations = await prisma.eventRegistration.count({
        where: {
          eventId,
          status: { not: "cancelled" },
        },
      })

      if (currentRegistrations >= event.capacity) {
        return NextResponse.json(
          { error: "Event is at full capacity" },
          { status: 400, headers: corsHeaders }
        )
      }
    }

    // Check if user is already registered
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        email: email,
        status: { not: "cancelled" },
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: "Already registered for this event" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId: userId,
        email: email,
        name: name || null,
        status: "registered",
      },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            location: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: "Successfully registered for event",
        registration: {
          id: registration.id,
          event: registration.event,
          status: registration.status,
        },
      },
      { status: 201, headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[EVENT REGISTRATION API] Error:", error)
    console.error("[EVENT REGISTRATION API] Error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid registration data",
          details: error.errors,
        },
        { status: 400, headers: corsHeaders }
      )
    }

    // Provide more detailed error in development
    const errorMessage = process.env.NODE_ENV === "development" 
      ? error?.message || "Failed to register for event"
      : "Failed to register for event"

    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === "development" && { details: error?.message }),
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
