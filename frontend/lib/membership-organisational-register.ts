import { prisma } from "@/lib/prisma"
import type { OrganisationalRegistrationPayload } from "@/lib/email/membership-organisational"
import {
  buildOrganisationalRegistrationPlainText,
  sendOrganisationalRegistrationStaffEmail,
  sendOrganisationalRegistrationWelcomeEmail,
} from "@/lib/email/membership-organisational"
import { ORGANISATIONAL_PLAN_NAME } from "@/lib/membership-inquiry"
import {
  isEmailConfigured,
  sendEmailsInBackground,
  type SendEmailResult,
} from "@/lib/email/send"

const TICKET_CATEGORY = "organisational-registration"

function ticketMemberField(params: OrganisationalRegistrationPayload): string {
  const name = params.name?.trim()
  return name ? `${name} <${params.email}>` : params.email
}

/** Idempotent staff ticket + welcome/staff emails for organisational sign-ups */
export async function recordOrganisationalRegistration(
  params: OrganisationalRegistrationPayload
): Promise<{ emailsQueued: boolean; alreadyRecorded: boolean }> {
  const email = params.email.toLowerCase().trim()
  const payload: OrganisationalRegistrationPayload = {
    email,
    name: params.name?.trim() || null,
  }

  const existing = await prisma.supportTicket.findFirst({
    where: {
      category: TICKET_CATEGORY,
      member: { contains: email },
    },
    select: { id: true },
  })

  if (existing) {
    return { emailsQueued: false, alreadyRecorded: true }
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      member: ticketMemberField(payload),
      subject: `${ORGANISATIONAL_PLAN_NAME} membership — platform registration`,
      description: buildOrganisationalRegistrationPlainText(payload),
      status: "open",
      priority: "high",
      category: TICKET_CATEGORY,
    },
  })

  const { notifyStaffSupportTicketCreated } = await import("@/lib/staff-alerts")
  void notifyStaffSupportTicketCreated(ticket)

  const emailsQueued = queueOrganisationalRegistrationEmails(payload)
  return { emailsQueued, alreadyRecorded: false }
}

export function queueOrganisationalRegistrationEmails(
  payload: OrganisationalRegistrationPayload
): boolean {
  if (!isEmailConfigured()) {
    console.error(
      "[ORGANISATIONAL] Email not configured. Registration recorded; no emails sent."
    )
    return false
  }

  sendEmailsInBackground([
    {
      send: () => sendOrganisationalRegistrationStaffEmail(payload),
      context: "organisational-registration-staff",
    },
    {
      send: () => sendOrganisationalRegistrationWelcomeEmail(payload),
      context: "organisational-registration-welcome",
    },
  ])

  return true
}

/** Synchronous send for scripts/tests only */
export async function sendOrganisationalRegistrationEmailsNow(
  payload: OrganisationalRegistrationPayload
): Promise<{ staff: SendEmailResult; welcome: SendEmailResult }> {
  const staff = await sendOrganisationalRegistrationStaffEmail(payload)
  const welcome = await sendOrganisationalRegistrationWelcomeEmail(payload)
  return { staff, welcome }
}
