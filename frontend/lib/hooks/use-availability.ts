// Hook for availability data - fetches from API
import { useState, useMemo, useEffect } from "react"
import { formatLocalYMD } from "@/lib/date-booking"
import { defaultBusinessHourSlots } from "@/lib/booking-time-slots"

export interface AvailabilitySlot {
  date: Date
  time: string
  available: boolean
  resourceType: "hot-desk" | "meeting-room" | "private-office"
}

export interface AvailabilityData {
  slots: AvailabilitySlot[]
  unavailableDates: Date[]
  datesWithBookings: Date[] // For hot desks - dates with bookings but not blocked
  nextAvailable: Date | null
}

export function useAvailability(workspaceId: string, resourceType?: string) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([])
  const [datesWithBookings, setDatesWithBookings] = useState<Date[]>([])
  const [nextAvailable, setNextAvailable] = useState<Date | null>(null)
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([])
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Fetch unavailable dates when resource or workspace changes
  useEffect(() => {
    let cancelled = false

    async function fetchUnavailableDates() {
      try {
        setIsLoadingCalendar(true)
        const today = formatLocalYMD(new Date())
        const resource = resourceType || "hot-desk"
        const params = new URLSearchParams()
        params.set("date", today)
        params.set("resourceType", resource)
        if (workspaceId) params.set("workspaceId", workspaceId)
        const response = await fetch(`/api/availability?${params.toString()}`)

        if (!cancelled && response.ok) {
          const data = await response.json()
          setUnavailableDates(data.unavailableDates.map((d: string) => new Date(d)))
          setDatesWithBookings((data.datesWithBookings || []).map((d: string) => new Date(d)))
          if (data.nextAvailable) {
            setNextAvailable(new Date(data.nextAvailable))
          }
        }
      } catch (error) {
        console.error("[useAvailability] Error fetching unavailable dates:", error)
      } finally {
        if (!cancelled) setIsLoadingCalendar(false)
      }
    }

    void fetchUnavailableDates()
    return () => {
      cancelled = true
    }
  }, [resourceType, workspaceId])

  // Fetch slot-level availability when a day is selected
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([])
      return
    }

    const resource = resourceType || "hot-desk"

    // Meeting rooms: show default grid immediately so the UI never feels "empty" while fetching.
    if (resource === "meeting-room") {
      setAvailableSlots(defaultBusinessHourSlots())
    } else {
      setAvailableSlots([])
    }

    const ac = new AbortController()

    ;(async () => {
      try {
        setIsLoadingSlots(true)
        const dateStr = formatLocalYMD(selectedDate)
        const params = new URLSearchParams()
        params.set("date", dateStr)
        params.set("resourceType", resource)
        if (workspaceId) params.set("workspaceId", workspaceId)
        const response = await fetch(`/api/availability?${params.toString()}`, { signal: ac.signal })

        if (!ac.signal.aborted && response.ok) {
          const data = await response.json()
          setAvailableSlots(Array.isArray(data.availableSlots) ? data.availableSlots : [])
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") return
        console.error("[useAvailability] Error fetching slots:", error)
      } finally {
        if (!ac.signal.aborted) setIsLoadingSlots(false)
      }
    })()

    return () => ac.abort()
  }, [selectedDate, resourceType, workspaceId])

  const slots = useMemo(() => {
    if (!selectedDate) return []

    const resource = resourceType || "hot-desk"

    return availableSlots.map((slot) => ({
      date: selectedDate,
      time: slot.time,
      available: slot.available,
      resourceType: resource as AvailabilitySlot["resourceType"],
    }))
  }, [selectedDate, availableSlots, resourceType])

  return {
    slots,
    unavailableDates,
    datesWithBookings,
    nextAvailable,
    selectedDate,
    setSelectedDate,
    isLoading: isLoadingCalendar || isLoadingSlots,
    isLoadingSlots,
    isLoadingCalendar,
  }
}
