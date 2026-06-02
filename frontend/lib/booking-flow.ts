import type { ResourceType } from "@/components/booking/resource-selector"
import type { MeetingRoomCapacity } from "@/components/booking/meeting-room-selector"
import type { BookingDuration } from "@/components/booking/time-selector"

export type BookingFlowStepId =
  | "space"
  | "room"
  | "date"
  | "time"
  | "extras"
  | "checkout"

export interface BookingFlowStep {
  id: BookingFlowStepId
  label: string
}

export interface BookingFlowState {
  resource: ResourceType | null
  meetingRoomCapacity: MeetingRoomCapacity | null
  meetingRoomHours: number
  selectedDate: Date | null
  selectedTime: string | null
  selectedDuration: BookingDuration
  isValidBooking: boolean
}

export function getBookingFlowSteps(resource: ResourceType | null): BookingFlowStep[] {
  if (!resource || resource === "private-office" || resource === "event-space") {
    return [
      { id: "space", label: "Space" },
      { id: "checkout", label: "Request" },
    ]
  }
  if (resource === "meeting-room") {
    return [
      { id: "space", label: "Space" },
      { id: "room", label: "Room" },
      { id: "date", label: "Date" },
      { id: "time", label: "Time" },
      { id: "extras", label: "Extras" },
    ]
  }
  return [
    { id: "space", label: "Space" },
    { id: "date", label: "Date" },
    { id: "extras", label: "Extras" },
  ]
}

export function isStepComplete(stepId: BookingFlowStepId, state: BookingFlowState): boolean {
  switch (stepId) {
    case "space":
      return Boolean(state.resource)
    case "room":
      if (state.resource !== "meeting-room") return true
      return Boolean(state.meetingRoomCapacity) && state.meetingRoomHours > 0
    case "date":
      if (state.resource === "private-office" || state.resource === "event-space") return true
      return Boolean(state.selectedDate)
    case "time":
      if (state.resource === "hot-desk") return Boolean(state.selectedDate)
      if (state.resource !== "meeting-room") return true
      return Boolean(state.selectedTime)
    case "extras":
    case "checkout":
      return state.isValidBooking
    default:
      return false
  }
}

export function getCurrentStepId(state: BookingFlowState): BookingFlowStepId {
  if (state.isValidBooking) return "checkout"
  const steps = getBookingFlowSteps(state.resource)
  for (const step of steps) {
    if (step.id === "checkout") continue
    if (!isStepComplete(step.id, state)) return step.id
  }
  return steps[0]?.id ?? "space"
}

export function resolveStepStatus(
  stepId: BookingFlowStepId,
  state: BookingFlowState
): "complete" | "current" | "upcoming" {
  if (state.isValidBooking && stepId !== "checkout") return "complete"
  if (stepId === "checkout") return state.isValidBooking ? "current" : "upcoming"

  const current = getCurrentStepId(state)
  const steps = getBookingFlowSteps(state.resource)
  const stepIndex = steps.findIndex((s) => s.id === stepId)
  const currentIndex = steps.findIndex((s) => s.id === current)

  if (stepIndex < currentIndex || isStepComplete(stepId, state)) return "complete"
  if (stepId === current) return "current"
  return "upcoming"
}
