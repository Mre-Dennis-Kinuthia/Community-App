// Mock hook for availability data
import { useState, useMemo } from "react"

export interface AvailabilitySlot {
  date: Date
  time: string
  available: boolean
  resourceType: "hot-desk" | "meeting-room" | "private-office"
}

export interface AvailabilityData {
  slots: AvailabilitySlot[]
  unavailableDates: Date[]
  nextAvailable: Date | null
}

export function useAvailability(workspaceId: string, resourceType?: string) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Mock unavailable dates (weekends and some random dates)
  const unavailableDates = useMemo(() => {
    const dates: Date[] = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      // Block weekends
      if (date.getDay() === 0 || date.getDay() === 6) {
        dates.push(date)
      }
      // Randomly block some dates
      if (Math.random() > 0.7) {
        dates.push(date)
      }
    }
    return dates
  }, [])

  // Mock available slots
  const slots = useMemo(() => {
    if (!selectedDate) return []
    
    const timeSlots = [
      "09:00", "10:00", "11:00", "12:00", "13:00", 
      "14:00", "15:00", "16:00", "17:00"
    ]
    
    return timeSlots.map(time => ({
      date: selectedDate,
      time,
      available: Math.random() > 0.2, // 80% availability
      resourceType: (resourceType || "hot-desk") as AvailabilitySlot["resourceType"]
    }))
  }, [selectedDate, resourceType])

  const nextAvailable = useMemo(() => {
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      if (!unavailableDates.some(d => d.getTime() === date.getTime())) {
        return date
      }
    }
    return null
  }, [unavailableDates])

  return {
    slots,
    unavailableDates,
    nextAvailable,
    selectedDate,
    setSelectedDate,
    isLoading: false,
  }
}

