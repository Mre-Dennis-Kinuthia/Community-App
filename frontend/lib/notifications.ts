import { prisma } from "@/lib/prisma"

export interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type?: "info" | "success" | "warning" | "error"
  category?: string
  actionUrl?: string
  relatedId?: string
  relatedType?: string
}

/**
 * Create a notification for a user
 * This is a utility function that can be used throughout the app
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || "info",
        category: params.category || null,
        actionUrl: params.actionUrl || null,
        relatedId: params.relatedId || null,
        relatedType: params.relatedType || null,
      },
    })

    console.log("[NOTIFICATIONS] Created notification:", notification.id)
    return notification
  } catch (error) {
    console.error("[NOTIFICATIONS] Error creating notification:", error)
    // Don't throw - notifications are non-critical
    return null
  }
}

/**
 * Create notifications for multiple users (broadcast)
 */
export async function createBroadcastNotification(
  userIds: string[],
  params: Omit<CreateNotificationParams, "userId">
) {
  try {
    const notifications = await Promise.all(
      userIds.map((userId) =>
        prisma.notification.create({
          data: {
            userId,
            title: params.title,
            message: params.message,
            type: params.type || "info",
            category: params.category || null,
            actionUrl: params.actionUrl || null,
            relatedId: params.relatedId || null,
            relatedType: params.relatedType || null,
          },
        })
      )
    )

    console.log("[NOTIFICATIONS] Created", notifications.length, "broadcast notifications")
    return notifications
  } catch (error) {
    console.error("[NOTIFICATIONS] Error creating broadcast notifications:", error)
    return []
  }
}

/**
 * Notification templates for common events
 */
export const NotificationTemplates = {
  bookingConfirmed: (bookingId: string, resourceType: string, date: string) => ({
    title: "Booking Confirmed",
    message: `Your ${resourceType} booking for ${date} has been confirmed.`,
    type: "success" as const,
    category: "booking",
    actionUrl: `/dashboard/bookings/${bookingId}`,
    relatedId: bookingId,
    relatedType: "booking",
  }),

  bookingCancelled: (bookingId: string, resourceType: string, date: string) => ({
    title: "Booking Cancelled",
    message: `Your ${resourceType} booking for ${date} has been cancelled.`,
    type: "info" as const,
    category: "booking",
    actionUrl: `/dashboard/bookings`,
    relatedId: bookingId,
    relatedType: "booking",
  }),

  eventReminder: (eventId: string, eventTitle: string, startDate: string) => ({
    title: "Event Reminder",
    message: `Don't forget: ${eventTitle} starts ${startDate}.`,
    type: "info" as const,
    category: "event",
    actionUrl: `/events/${eventId}`,
    relatedId: eventId,
    relatedType: "event",
  }),

  eventRegistration: (eventId: string, eventTitle: string) => ({
    title: "Event Registration",
    message: `You've successfully registered for ${eventTitle}.`,
    type: "success" as const,
    category: "event",
    actionUrl: `/events/${eventId}`,
    relatedId: eventId,
    relatedType: "event",
  }),

  newsPublished: (newsId: string, newsTitle: string) => ({
    title: "New Article Published",
    message: `A new article "${newsTitle}" has been published.`,
    type: "info" as const,
    category: "news",
    actionUrl: `/news/${newsId}`,
    relatedId: newsId,
    relatedType: "news",
  }),

  paymentRequired: (bookingId: string, amount: number) => ({
    title: "Payment Required",
    message: `Payment of KES ${amount.toFixed(2)} is required for your booking.`,
    type: "warning" as const,
    category: "payment",
    actionUrl: `/dashboard/bookings/${bookingId}/payment`,
    relatedId: bookingId,
    relatedType: "booking",
  }),
}
