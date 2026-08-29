export async function startBookingPaystack(bookingId: string): Promise<string> {
  const payRes = await fetch("/api/billing/paystack/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "booking", bookingId }),
  })
  const payData = await payRes.json()
  if (!payRes.ok) throw new Error(payData.error || "Could not start payment")
  if (!payData.authorizationUrl) throw new Error("Missing Paystack checkout URL")
  return payData.authorizationUrl as string
}

export function bookingNeedsPayment(booking: {
  status: string
  paymentStatus?: string | null
  totalPrice: number | string
}): boolean {
  return (
    booking.status === "confirmed" &&
    (booking.paymentStatus || "").toLowerCase() === "pending" &&
    Number(booking.totalPrice) > 0
  )
}
