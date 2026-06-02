import type { Plan } from "@prisma/client"
import { getAppBaseUrl } from "@/lib/membership-billing"
import { sendMembershipActivatedEmail } from "@/lib/email/membership-activated"
import { sendNewMembershipStaffEmail } from "@/lib/email/membership-staff"
import { isEmailConfigured, sendEmailInBackground } from "@/lib/email/send"

export type MembershipNotifySource = "self_serve" | "payment_link" | "admin_mark"

export function notifyMembershipActivated(params: {
  memberEmail: string
  memberName?: string | null
  plan: Plan
  periodEnd: Date
  amount: number
  currency: string
  method: string
  source: MembershipNotifySource
}) {
  if (!isEmailConfigured()) return

  const billingUrl = `${getAppBaseUrl()}/billing`

  sendEmailInBackground(
    () =>
      sendMembershipActivatedEmail({
        to: params.memberEmail,
        name: params.memberName,
        planName: params.plan.name,
        periodEnd: params.periodEnd,
        billingUrl,
      }),
    "membership-activated-member"
  )

  if (params.source !== "admin_mark") {
    sendEmailInBackground(
      () =>
        sendNewMembershipStaffEmail({
          memberEmail: params.memberEmail,
          memberName: params.memberName,
          planName: params.plan.name,
          amount: params.amount,
          currency: params.currency,
          method: params.method,
          source: params.source === "payment_link" ? "payment_link" : "self_serve",
          periodEnd: params.periodEnd,
        }),
      "membership-activated-staff"
    )
  }
}
