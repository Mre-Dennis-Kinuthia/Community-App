import { createNotification, STAFF_ALERT_CATEGORY } from "@/lib/notifications"
import { getAdminAppBaseUrl } from "@/lib/app-url"

export { STAFF_ALERT_CATEGORY }

/** In-app alerts shown in the admin navbar bell (userId null + this category). */

export async function createStaffAlert(params: {
  title: string
  message: string
  actionUrl?: string
  relatedId?: string
  relatedType?: string
  type?: "info" | "success" | "warning" | "error"
}) {
  return createNotification({
    userId: null,
    title: params.title,
    message: params.message,
    type: params.type || "info",
    category: STAFF_ALERT_CATEGORY,
    actionUrl: params.actionUrl,
    relatedId: params.relatedId,
    relatedType: params.relatedType,
    // Dedicated staff emails are sent separately (e.g. ticket staff email + CC).
    skipEmail: true,
  })
}

export async function notifyStaffSupportTicketCreated(ticket: {
  id: string
  member: string
  subject: string
  priority?: string | null
  category?: string | null
}) {
  const isWorkspace = ticket.category === "workspace-inquiry"
  return createStaffAlert({
    title: isWorkspace ? "New workspace inquiry" : "New support ticket",
    message: `${ticket.subject} — ${ticket.member}`,
    actionUrl: `${getAdminAppBaseUrl()}/dashboard/support`,
    relatedId: ticket.id,
    relatedType: "support_ticket",
    type: "warning",
  })
}

export async function notifyStaffNewBooking(booking: {
  id: string
  member: string
  resourceLabel: string
  dateLabel: string
}) {
  return createStaffAlert({
    title: "Booking needs confirmation",
    message: `${booking.resourceLabel} · ${booking.member} · ${booking.dateLabel}`,
    actionUrl: `${getAdminAppBaseUrl()}/dashboard/bookings/${booking.id}`,
    relatedId: booking.id,
    relatedType: "booking",
    type: "warning",
  })
}

export async function notifyStaffBookingCancelled(booking: {
  id: string
  member: string
  resourceLabel: string
  cancelledBy: string
}) {
  return createStaffAlert({
    title: "Booking cancelled",
    message: `${booking.resourceLabel} · ${booking.member} · cancelled by ${booking.cancelledBy}`,
    actionUrl: `${getAdminAppBaseUrl()}/dashboard/bookings/${booking.id}`,
    relatedId: booking.id,
    relatedType: "booking",
    type: "warning",
  })
}

export async function notifyStaffBookingPaid(booking: {
  id: string
  member: string
  resourceLabel: string
}) {
  return createStaffAlert({
    title: "Booking payment received",
    message: `${booking.resourceLabel} · ${booking.member}`,
    actionUrl: `${getAdminAppBaseUrl()}/dashboard/bookings/${booking.id}`,
    relatedId: booking.id,
    relatedType: "booking",
    type: "success",
  })
}

export async function notifyStaffNewMember(member: {
  id?: string
  name: string
  email: string
}) {
  return createStaffAlert({
    title: "New member signed up",
    message: `${member.name} · ${member.email}`,
    actionUrl: member.id
      ? `${getAdminAppBaseUrl()}/dashboard/community/members/${member.id}`
      : `${getAdminAppBaseUrl()}/dashboard/community/members`,
    relatedId: member.id,
    relatedType: "member",
    type: "info",
  })
}

export async function notifyStaffEventRegistration(event: {
  eventId: string
  eventTitle: string
  member: string
  status: string
}) {
  const pending = event.status === "pending" || event.status === "waitlisted"
  return createStaffAlert({
    title: pending ? `Event ${event.status}` : "Event registration",
    message: `${event.eventTitle} · ${event.member}`,
    actionUrl: `${getAdminAppBaseUrl()}/dashboard/content/events/${event.eventId}`,
    relatedId: event.eventId,
    relatedType: "event",
    type: pending ? "warning" : "info",
  })
}
