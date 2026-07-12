import { HUB_CONTACT_EMAIL, HUB_EMAIL_FROM_NAME } from "@/lib/hub-contact"

export type EmailFromParts = {
  name: string
  address: string
}

/** Parse `Name <email@x>` or bare email into parts. */
export function parseEmailFrom(value: string): EmailFromParts {
  const trimmed = value.trim()
  const match = trimmed.match(/^(.*?)\s*<([^>]+)>\s*$/)
  if (match) {
    const name = match[1].trim().replace(/^["']|["']$/g, "")
    const address = match[2].trim()
    return {
      name: name || HUB_EMAIL_FROM_NAME,
      address: address || HUB_CONTACT_EMAIL,
    }
  }
  if (trimmed.includes("@")) {
    return { name: HUB_EMAIL_FROM_NAME, address: trimmed }
  }
  return { name: HUB_EMAIL_FROM_NAME, address: HUB_CONTACT_EMAIL }
}

export function getEmailFromParts(): EmailFromParts {
  const raw = process.env.EMAIL_FROM?.trim()
  if (!raw) {
    return { name: HUB_EMAIL_FROM_NAME, address: HUB_CONTACT_EMAIL }
  }
  return parseEmailFrom(raw)
}

/** Always includes the display name, e.g. `Impact Hub Nairobi <Nairobi.Membership@impacthub.net>`. */
export function getEmailFrom(): string {
  const { name, address } = getEmailFromParts()
  return `${name} <${address}>`
}

export function getEmailStaffTo(): string {
  return process.env.EMAIL_STAFF_TO?.trim() || HUB_CONTACT_EMAIL
}
