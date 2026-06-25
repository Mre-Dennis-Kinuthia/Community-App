import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"
import { sendEmailInBackground } from "@/lib/email/send"
import {
  sendVisitorRegisteredEmail,
  sendVisitorRegisteredStaffEmail,
} from "@/lib/email/messages"

function getAdminFrontDeskUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_ADMIN_APP_URL?.trim() ||
    process.env.ADMIN_APP_URL?.trim() ||
    ""
  return base ? `${base.replace(/\/$/, "")}/dashboard/space/visitors` : ""
}

type VisitorNotifyPayload = {
  id: string
  name: string
  company: string | null
  purpose: string | null
  expectedAt: Date
  hostUserId: string
  location: { name: string } | null
}

export async function notifyVisitorRegistered(visitor: VisitorNotifyPayload) {
  const host = await prisma.user.findUnique({
    where: { id: visitor.hostUserId },
    select: { email: true, name: true },
  })

  await createNotification({
    userId: visitor.hostUserId,
    title: "Visitor registered",
    message: `${visitor.name} is expected on ${visitor.expectedAt.toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}.`,
    type: "info",
    category: "visitor",
    actionUrl: "/dashboard/visitors",
  })

  if (host?.email) {
    sendEmailInBackground(
      () =>
        sendVisitorRegisteredEmail({
          to: host.email!,
          hostName: host.name,
          visitorName: visitor.name,
          expectedAt: visitor.expectedAt,
        }),
      "visitor-registered-host"
    )
  }

  sendEmailInBackground(
    () =>
      sendVisitorRegisteredStaffEmail({
        visitorName: visitor.name,
        hostName: host?.name,
        hostEmail: host?.email,
        expectedAt: visitor.expectedAt,
        locationName: visitor.location?.name,
        company: visitor.company,
        purpose: visitor.purpose,
        registeredBy: "member",
        frontDeskUrl: getAdminFrontDeskUrl(),
      }),
    "visitor-registered-staff"
  )
}
