export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  ).replace(/\/$/, "")
}

export function getNewsArticleUrl(postId: string): string {
  return `${getAppBaseUrl()}/news/${postId}`
}

export function getDashboardBookingUrl(bookingId: string): string {
  return `${getAppBaseUrl()}/dashboard/bookings/${bookingId}`
}
