import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Get availability for a specific date and resource type
 * Checks existing bookings to determine available time slots
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const resourceType = searchParams.get("resourceType") || "hot-desk"
    const workspaceId = searchParams.get("workspaceId") || undefined

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      )
    }

    const selectedDate = new Date(date)
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Get all bookings for this date, resource type and workspace (if provided)
    const bookings = await prisma.workspaceBooking.findMany({
      where: {
        resourceType: resourceType as string,
        ...(workspaceId && { workspaceId }),
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: "cancelled",
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    })

    // Generate time slots (9 AM to 5 PM)
    const timeSlots = []
    for (let hour = 9; hour < 18; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, "0")}:00`)
    }

    // Check which slots are available
    const availableSlots = timeSlots.map((time) => {
      // Check if this time slot conflicts with any booking
      const isBooked = bookings.some((booking) => {
        const bookingStart = booking.startTime
        const bookingEnd = booking.endTime || booking.startTime

        // Check if time falls within any booking
        return time >= bookingStart && time < bookingEnd
      })

      return {
        time,
        available: !isBooked,
      }
    })

    // Get unavailable dates and dates with bookings
    const today = new Date()
    const unavailableDates: string[] = []
    const datesWithBookings: string[] = [] // For hot desks - dates that have bookings but aren't blocked
    
    // Check next 30 days
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() + i)
      
      // Block weekends
      if (checkDate.getDay() === 0 || checkDate.getDay() === 6) {
        unavailableDates.push(checkDate.toISOString().split("T")[0])
        continue
      }

      const dateStart = new Date(checkDate)
      dateStart.setHours(0, 0, 0, 0)
      const dateEnd = new Date(checkDate)
      dateEnd.setHours(23, 59, 59, 999)

      const dateBookings = await prisma.workspaceBooking.count({
        where: {
          resourceType: resourceType as string,
          ...(workspaceId && { workspaceId }),
          date: {
            gte: dateStart,
            lte: dateEnd,
          },
          status: {
            not: "cancelled",
          },
        },
      })

      // For meeting rooms: block if all slots booked (8+ bookings)
      // For hot desks: mark as having bookings but don't block
      if (resourceType === "meeting-room") {
        if (dateBookings >= 8) {
          unavailableDates.push(checkDate.toISOString().split("T")[0])
        }
      } else if (resourceType === "hot-desk") {
        // Hot desks don't get blocked, but we track dates with bookings
        if (dateBookings > 0) {
          datesWithBookings.push(checkDate.toISOString().split("T")[0])
        }
      } else {
        // For other resource types (private-office), use same logic as meeting rooms
        if (dateBookings >= 8) {
          unavailableDates.push(checkDate.toISOString().split("T")[0])
        }
      }
    }

    // Find next available date
    let nextAvailable: string | null = null
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() + i)
      const dateStr = checkDate.toISOString().split("T")[0]
      
      if (!unavailableDates.includes(dateStr) && checkDate.getDay() !== 0 && checkDate.getDay() !== 6) {
        nextAvailable = dateStr
        break
      }
    }

    return NextResponse.json({
      date: date,
      resourceType,
      availableSlots,
      unavailableDates,
      datesWithBookings, // Dates with bookings (for hot desks - visual indicator only)
      nextAvailable,
    })
  } catch (error) {
    console.error("[AVAILABILITY API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    )
  }
}
