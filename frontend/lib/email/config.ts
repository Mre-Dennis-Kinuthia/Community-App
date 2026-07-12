import { HUB_CONTACT_EMAIL, HUB_EMAIL_FROM_NAME } from "@/lib/hub-contact"

export function getEmailFrom(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    `${HUB_EMAIL_FROM_NAME} <${HUB_CONTACT_EMAIL}>`
  )
}

export function getEmailStaffTo(): string {
  return process.env.EMAIL_STAFF_TO?.trim() || HUB_CONTACT_EMAIL
}
