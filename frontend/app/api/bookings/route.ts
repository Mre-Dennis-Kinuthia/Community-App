import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bookingSchema = z.object({
  resourceType: z.enum(["hot-desk", "meeting-room", "private-office"]),
  date: z.string().transform((str) => new Date(str)),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  duration: z.enum(["hourly", "half-day", "full-day"]),
  basePrice: z.number().min(0),
  addOnsPrice: z.number().min(0).default(0),
  totalPrice: z.number().min(0),
  addOns: z.array(z.string()).default([]),
  notes: z.string().optional(),
  workspaceId: z.string().default("impact-hub-nairobi"),
})

// Calculate end time based on start time and duration
function calculateEndTime(startTime: string, duration: string): string {
  const [hours, minutes] = startTime.split(":").map(Number)
  let hoursToAdd = 1 // default hourly
  
  if (duration === "half-day") {
    hoursToAdd = 4
  } else if (duration === "full-day") {
    hoursToAdd = 8
  }
  
  const endHours = (hours + hoursToAdd) % 24
  return `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

export async function POST(request: NextRequest) {
  try {
    console.log("[BOOKING API] Received booking request")
    
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      console.log("[BOOKING API] Unauthorized - no session")
      return NextResponse.json(
        { error: "Unauthorized. Please log in to book a workspace." },
        { status: 401 }
      )
    }

    const userId = session.user.id
    console.log("[BOOKING API] User ID:", userId)

    // Parse and validate request body
    const body = await request.json()
    console.log("[BOOKING API] Request body:", {
      resourceType: body.resourceType,
      date: body.date,
      startTime: body.startTime,
      duration: body.duration,
      totalPrice: body.totalPrice,
    })

    const validatedData = bookingSchema.parse(body)
    const endTime = calculateEndTime(validatedData.startTime, validatedData.duration)

    // Check for conflicting bookings (same resource, date, and overlapping time)
    const bookingDate = new Date(validatedData.date)
    const startOfDay = new Date(bookingDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(bookingDate)
    endOfDay.setHours(23, 59, 59, 999)

    const conflictingBooking = await prisma.workspaceBooking.findFirst({
      where: {
        resourceType: validatedData.resourceType,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: "cancelled",
        },
        OR: [
          {
            // Start time overlaps
            startTime: {
              gte: validatedData.startTime,
              lt: endTime,
            },
          },
          {
            // End time overlaps
            endTime: {
              gt: validatedData.startTime,
              lte: endTime,
            },
          },
        ],
      },
    })

    if (conflictingBooking) {
      console.log("[BOOKING API] Conflicting booking found:", conflictingBooking.id)
      return NextResponse.json(
        {
          error: "This time slot is already booked. Please select a different time.",
          conflictingBooking: {
            id: conflictingBooking.id,
            startTime: conflictingBooking.startTime,
            endTime: conflictingBooking.endTime,
          },
        },
        { status: 409 }
      )
    }

    // Create booking
    console.log("[BOOKING API] Creating booking...")
    const booking = await prisma.workspaceBooking.create({
      data: {
        userId,
        resourceType: validatedData.resourceType,
        date: bookingDate, // Use the properly formatted date
        startTime: validatedData.startTime,
        endTime,
        duration: validatedData.duration,
        basePrice: validatedData.basePrice,
        addOnsPrice: validatedData.addOnsPrice,
        totalPrice: validatedData.totalPrice,
        addOns: validatedData.addOns,
        notes: validatedData.notes,
        workspaceId: validatedData.workspaceId,
        status: "confirmed", // Auto-confirm for now
        paymentStatus: "pending", // Payment integration can be added later
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    console.log("[BOOKING API] Booking created successfully:", {
      id: booking.id,
      resourceType: booking.resourceType,
      date: booking.date,
      totalPrice: booking.totalPrice,
    })

    return NextResponse.json(
      {
        message: "Booking confirmed successfully",
        booking: {
          id: booking.id,
          resourceType: booking.resourceType,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          duration: booking.duration,
          totalPrice: booking.totalPrice,
          status: booking.status,
          createdAt: booking.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[BOOKING API] Error occurred:", error)

    if (error instanceof z.ZodError) {
      console.log("[BOOKING API] Validation errors:", error.errors)
      return NextResponse.json(
        {
          error: "Invalid booking data",
          details: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    // Check for Prisma unique constraint or other database errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as { code: string; message: string }
      console.error("[BOOKING API] Prisma error:", prismaError.code, prismaError.message)
      return NextResponse.json(
        { error: "Database error", details: prismaError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create booking. Please try again." },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch user's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("id")
    const status = searchParams.get("status")
    const upcoming = searchParams.get("upcoming") === "true"

    // If booking ID is provided, fetch specific booking
    if (bookingId) {
      const booking = await prisma.workspaceBooking.findUnique({
        where: { id: bookingId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        )
      }

      // Verify the booking belongs to the user
      if (booking.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        )
      }

      return NextResponse.json({ booking }, { status: 200 })
    }

    // Otherwise, fetch user's bookings
    const where: any = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    if (upcoming) {
      where.date = {
        gte: new Date(),
      }
    }

    const bookings = await prisma.workspaceBooking.findMany({
      where,
      orderBy: {
        date: "asc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ bookings }, { status: 200 })
  } catch (error) {
    console.error("[BOOKING API] Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}
