// Hook for availability data - fetches from API
import { useState, useMemo, useEffect } from "react"

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
  const [isLoading, setIsLoading] = useState(false)

  // Fetch unavailable dates on mount
  useEffect(() => {
    async function fetchUnavailableDates() {
      try {
        setIsLoading(true)
        // Fetch availability for today to get unavailable dates
        const today = new Date().toISOString().split("T")[0]
        const params = new URLSearchParams()
        params.set("date", today)
        params.set("resourceType", resourceType || "hot-desk")
        if (workspaceId) params.set("workspaceId", workspaceId)
        const response = await fetch(`/api/availability?${params.toString()}`)
        
        if (response.ok) {
          const data = await response.json()
          setUnavailableDates(
            data.unavailableDates.map((d: string) => new Date(d))
          )
          setDatesWithBookings(
            (data.datesWithBookings || []).map((d: string) => new Date(d))
          )
          if (data.nextAvailable) {
            setNextAvailable(new Date(data.nextAvailable))
          }
        }
      } catch (error) {
        console.error("[useAvailability] Error fetching unavailable dates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUnavailableDates()
  }, [resourceType])

  // Fetch available slots when date is selected
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([])
      return
    }

    async function fetchSlots() {
      try {
        setIsLoading(true)
        const dateStr = selectedDate.toISOString().split("T")[0]
        const params = new URLSearchParams()
        params.set("date", dateStr)
        params.set("resourceType", resourceType || "hot-desk")
        if (workspaceId) params.set("workspaceId", workspaceId)
        const response = await fetch(`/api/availability?${params.toString()}`)
        
        if (response.ok) {
          const data = await response.json()
          setAvailableSlots(data.availableSlots || [])
        }
      } catch (error) {
        console.error("[useAvailability] Error fetching slots:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlots()
  }, [selectedDate, resourceType])

  // Format slots for compatibility
  const slots = useMemo(() => {
    if (!selectedDate) return []
    
    return availableSlots.map(slot => ({
      date: selectedDate,
      time: slot.time,
      available: slot.available,
      resourceType: (resourceType || "hot-desk") as AvailabilitySlot["resourceType"]
    }))
  }, [selectedDate, availableSlots, resourceType])

  return {
    slots,
    unavailableDates,
    datesWithBookings,
    nextAvailable,
    selectedDate,
    setSelectedDate,
    isLoading,
  }
}

