export type BookingVerifyPayload = {
  resourceType: string
  date: string
  startTime: string
  duration: string
  workspaceId: string
  spaceAssetId?: string
  meetingRoomHours?: number
}

export async function verifyBookingSlotAvailable(
  payload: BookingVerifyPayload
): Promise<{ available: boolean; reason?: string }> {
  const res = await fetch("/api/bookings/verify-availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = (await res.json()) as { available?: boolean; reason?: string; error?: string }

  if (!res.ok) {
    return { available: false, reason: data.error || "Could not verify availability" }
  }

  if (data.available) {
    return { available: true }
  }

  return { available: false, reason: data.reason || "This time slot is no longer available." }
}
