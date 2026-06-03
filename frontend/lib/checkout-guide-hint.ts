import type { ResourceType } from "@/components/booking/resource-selector"
import type { MeetingRoomCapacity } from "@/components/booking/meeting-room-selector"

export function getCheckoutGuideHint(params: {
  resource: ResourceType | null
  isValid: boolean
  selectedDate: Date | null
  selectedTime: string | null
  meetingRoomCapacity: MeetingRoomCapacity | null
}): string | null {
  const { resource, isValid, selectedDate, selectedTime, meetingRoomCapacity } = params
  if (!resource || resource === "private-office" || resource === "event-space") return null
  if (isValid) return null

  if (resource === "hot-desk") {
    if (!selectedDate) return "Pick a date on the calendar — checkout unlocks when your day is selected."
    return "Confirm your full-day booking, then use checkout below."
  }

  if (resource === "meeting-room") {
    if (!meetingRoomCapacity) return "Choose a room size first, then you'll pick a date and time."
    if (!selectedDate) return "Select a date — checkout is at the bottom once time is set."
    if (!selectedTime) return "Pick a start time — checkout will appear below when everything is set."
    return "Finish your selections, then checkout below."
  }

  return null
}

export function shouldShowCheckoutGuide(resource: ResourceType | null, isValid: boolean): boolean {
  if (!resource || resource === "private-office" || resource === "event-space") return false
  return true
}
