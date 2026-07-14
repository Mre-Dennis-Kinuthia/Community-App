import { createNotification } from "@/lib/notifications"
import { getAdminAppBaseUrl } from "@/lib/app-url"

/** In-app alerts shown in the admin navbar bell (userId null + this category). */
export const STAFF_ALERT_CATEGORY = "staff_alert"

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
