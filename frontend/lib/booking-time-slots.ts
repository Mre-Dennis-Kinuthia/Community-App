/** Default hourly slots (09:00–17:00) shown optimistically while availability is loading. */
export function defaultBusinessHourSlots(): { time: string; available: boolean }[] {
  const out: { time: string; available: boolean }[] = []
  for (let hour = 9; hour < 18; hour++) {
    out.push({ time: `${String(hour).padStart(2, "0")}:00`, available: true })
  }
  return out
}
