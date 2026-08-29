import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { createNotification, NotificationTemplates } from "@/lib/notifications"
import { sendNewBookingStaffEmail, sendEmailInBackground } from "@/lib/email"
import { buildMembershipSummary } from "@/lib/membership-profile"
import { applyMembershipBookingBenefits } from "@/lib/membership-booking-benefits"
import { canBookHotDesk, resolveAllowanceState, startOfAllowanceMonth } from "@/lib/membership-tier"
import {
  calculateBookingEndTime,
  checkBookingSlotAvailable,
  normalizeBookingStartTime,
} from "@/lib/booking-slot"

const bookingSchema = z.object({
  resourceType: z.enum(["hot-desk", "meeting-room", "private-office", "event-space"]),
  date: z.string().transform((str) => new Date(str)),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  duration: z.enum(["hourly", "half-day", "full-day", "monthly"]),
  meetingRoomHours: z.number().min(1).max(8).optional(), // For meeting room capacity-based booking
  meetingRoomCapacity: z.enum(["1-4", "1-10", "1-35"]).optional(),
  pastriesPax: z.number().int().min(1).max(200).optional(),
  basePrice: z.number().min(0),
  addOnsPrice: z.number().min(0).default(0),
  totalPrice: z.number().min(0),
  addOns: z.array(z.string()).default([]),
  notes: z.string().optional(),
  workspaceId: z.string().default("impact-hub-nairobi"),
  spaceAssetId: z.string().optional(),
})

async function resolveUserIdFromSession(session: Awaited<ReturnType<typeof auth>>) {
  const sessionUser = session?.user
  if (!sessionUser) return null

  // Best-effort: try to match by session user id first.
  if (typeof sessionUser.id === "string") {
    const existing = await prisma.user.findUnique({ where: { id: sessionUser.id } })
    if (existing) return existing.id
  }

  // Fallback: match by email (create the user if it doesn't exist).
  const email = typeof sessionUser.email === "string" ? sessionUser.email.toLowerCase().trim() : null
  if (!email) return null

  const upserted = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: typeof sessionUser.name === "string" ? sessionUser.name : null,
      image: typeof (sessionUser as any).image === "string" ? (sessionUser as any).image : null,
    },
    update: {
      name: typeof sessionUser.name === "string" ? sessionUser.name : undefined,
      image: typeof (sessionUser as any).image === "string" ? (sessionUser as any).image : undefined,
    },
  })

  return upserted.id
}

export async function POST(request: NextRequest) {
  try {
    console.log("[BOOKING API] Received booking request")
    
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      console.log("[BOOKING API] Unauthorized - no session")
      return NextResponse.json(
        { error: "Unauthorized. Please log in to book a workspace." },
        { status: 401 }
      )
    }

    const userId = await resolveUserIdFromSession(session)
    if (!userId) {
      console.log("[BOOKING API] Unauthorized - unable to resolve user")
      return NextResponse.json(
        { error: "Unauthorized. Please log in to book a workspace." },
        { status: 401 }
      )
    }
    console.log("[BOOKING API] Resolved User ID:", userId)

    // Parse and validate request body
    const body = await request.json()
    console.log("[BOOKING API] Request body:", {
      resourceType: body.resourceType,
      date: body.date,
      startTime: body.startTime,
      duration: body.duration,
      totalPrice: body.totalPrice,
    })

    const parsed = bookingSchema.parse(body)
    const validatedData =
      parsed.resourceType === "meeting-room"
        ? parsed
        : { ...parsed, addOns: [] as string[], addOnsPrice: 0, pastriesPax: undefined }

    const memberProfile = await prisma.memberProfile.findUnique({
      where: { userId },
      select: {
        membershipTier: true,
        meetingRoomFreeMinutesUsed: true,
        meetingRoomAllowancePeriodStart: true,
      },
    })

    const membership = buildMembershipSummary(memberProfile)
    const tier = membership.tier

    if (
      validatedData.resourceType === "hot-desk" &&
      !canBookHotDesk(tier)
    ) {
      return NextResponse.json(
        {
          error:
            "Hot desk booking is not available for your membership. You already have workspace access — book a meeting room instead.",
        },
        { status: 403 }
      )
    }

    const allowance = resolveAllowanceState({
      tier,
      meetingRoomFreeMinutesUsed: memberProfile?.meetingRoomFreeMinutesUsed ?? 0,
      meetingRoomAllowancePeriodStart:
        memberProfile?.meetingRoomAllowancePeriodStart ?? null,
    })

    const priced = applyMembershipBookingBenefits({
      tier,
      allowance,
      resourceType: validatedData.resourceType,
      meetingRoomHours: validatedData.meetingRoomHours,
      basePrice: validatedData.basePrice,
      addOnsPrice: validatedData.addOnsPrice,
    })

    if (Math.abs(priced.totalPrice - validatedData.totalPrice) > 1) {
      return NextResponse.json(
        {
          error: "Booking price mismatch. Please refresh the page and try again.",
          expectedTotal: priced.totalPrice,
          membershipDiscount: priced.membershipDiscount,
        },
        { status: 400 }
      )
    }
    
    if (validatedData.addOns.includes("pastries")) {
      const pax = validatedData.pastriesPax
      if (typeof pax !== "number" || !Number.isFinite(pax) || pax < 1) {
        return NextResponse.json(
          { error: "Please provide the number of people (PAX) for pastries." },
          { status: 400 }
        )
      }
    }

    const normalizedStart = normalizeBookingStartTime(
      validatedData.resourceType,
      validatedData.duration,
      validatedData.startTime
    )
    if ("error" in normalizedStart) {
      return NextResponse.json({ error: normalizedStart.error }, { status: 400 })
    }

    const startTime = normalizedStart.startTime
    const endTime = calculateBookingEndTime(
      startTime,
      validatedData.duration,
      validatedData.resourceType,
      validatedData.meetingRoomHours
    )
    
    console.log("[BOOKING API] Calculated times:", {
      startTime,
      endTime,
      duration: validatedData.duration,
      resourceType: validatedData.resourceType,
    })

    const bookingDate = new Date(validatedData.date)
    const slotAvailability = await checkBookingSlotAvailable(prisma, {
      userId,
      resourceType: validatedData.resourceType,
      date: bookingDate,
      startTime,
      duration: validatedData.duration,
      meetingRoomHours: validatedData.meetingRoomHours,
      workspaceId: validatedData.workspaceId,
      spaceAssetId: validatedData.spaceAssetId,
    })

    if (!slotAvailability.available) {
      return NextResponse.json({ error: slotAvailability.reason }, { status: 409 })
    }

    const requiresPayment = priced.totalPrice > 0
    const bookingStatus = "pending"
    const paymentStatus = requiresPayment ? "pending" : "not_required"

    // Create booking
    console.log("[BOOKING API] Creating booking...")
    const booking = await prisma.workspaceBooking.create({
      data: {
        userId,
        resourceType: validatedData.resourceType,
        date: bookingDate, // Use the properly formatted date
        startTime: startTime, // Use the validated/calculated start time
        endTime,
        duration: validatedData.duration,
        basePrice: validatedData.basePrice,
        addOnsPrice: validatedData.addOnsPrice,
        listPrice: priced.listPrice,
        membershipDiscount: priced.membershipDiscount,
        freeMeetingRoomMinutesApplied: priced.freeMeetingRoomMinutesApplied,
        totalPrice: priced.totalPrice,
        addOns: validatedData.addOns,
        notes: validatedData.notes,
        workspaceId: validatedData.workspaceId,
        spaceAssetId: validatedData.spaceAssetId ?? null,
        status: bookingStatus,
        paymentStatus,
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

    if (priced.freeMeetingRoomMinutesApplied > 0 && memberProfile) {
      const periodStart = startOfAllowanceMonth()
      const resetUsed =
        !memberProfile.meetingRoomAllowancePeriodStart ||
        memberProfile.meetingRoomAllowancePeriodStart.getTime() <
          periodStart.getTime()
      const usedBase = resetUsed ? 0 : memberProfile.meetingRoomFreeMinutesUsed
      await prisma.memberProfile.update({
        where: { userId },
        data: {
          meetingRoomFreeMinutesUsed:
            usedBase + priced.freeMeetingRoomMinutesApplied,
          meetingRoomAllowancePeriodStart: periodStart,
        },
      })
    }

    console.log("[BOOKING API] Booking created successfully:", {
      id: booking.id,
      resourceType: booking.resourceType,
      date: booking.date,
      totalPrice: booking.totalPrice,
      membershipDiscount: booking.membershipDiscount,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    })

    const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    await createNotification({
      userId,
      ...NotificationTemplates.bookingReceived(
        booking.id,
        booking.resourceType.replace("-", " "),
        formattedDate
      ),
      skipEmail: true,
    })

    if (booking.user?.email) {
      sendEmailInBackground(
        () =>
          sendNewBookingStaffEmail({
            memberEmail: booking.user!.email!,
            memberName: booking.user!.name,
            notes: booking.notes,
            bookingId: booking.id,
            resourceType: booking.resourceType,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            totalPrice: Number(booking.totalPrice),
            addOns: booking.addOns,
            addOnsPrice: booking.addOnsPrice,
            pastriesPax: validatedData.pastriesPax,
          }),
        "booking-staff"
      )
    } else {
      console.warn("[BOOKING API] No member email — staff alert not sent:", booking.id)
    }

    return NextResponse.json(
      {
        message:
          "Booking submitted. The hub team will confirm availability shortly.",
        booking: {
          id: booking.id,
          resourceType: booking.resourceType,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          duration: booking.duration,
          totalPrice: booking.totalPrice,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          createdAt: booking.createdAt,
          addOns: booking.addOns,
          addOnsPrice: booking.addOnsPrice,
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
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    const userId = await resolveUserIdFromSession(session)
    if (!userId) {
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
      if (booking.userId !== userId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        )
      }

      return NextResponse.json({ booking }, { status: 200 })
    }

    // Otherwise, fetch user's bookings
    const where: any = {
        userId,
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
        spaceAsset: {
          select: {
            id: true,
            name: true,
            type: true,
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
