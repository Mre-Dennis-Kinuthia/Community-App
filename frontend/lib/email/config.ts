import { HUB_CONTACT_EMAIL } from "@/lib/hub-contact"

export function getEmailFrom(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    `Impact Hub Nairobi <${HUB_CONTACT_EMAIL}>`
  )
}

export function getEmailStaffTo(): string {
  return process.env.EMAIL_STAFF_TO?.trim() || HUB_CONTACT_EMAIL
}
