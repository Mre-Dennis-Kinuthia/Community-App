/** Primary staff / notification email (overridable via EMAIL_STAFF_TO). */
export const HUB_CONTACT_EMAIL = "Nairobi.Membership@impacthub.net"

/** Display name shown in the From header. */
export const HUB_EMAIL_FROM_NAME = "Impact Hub Nairobi"

/** Public-facing contact on marketing pages and footers. */
export const HUB_PUBLIC_EMAIL = "nairobi@impacthub.net"

/** Public phone line for Impact Hub Nairobi. */
export const HUB_PUBLIC_PHONE = "+254 708 298 856"

/** Tel href for click-to-call links. */
export const HUB_PUBLIC_PHONE_HREF = "tel:+254708298856"

/**
 * Physical mailing address for marketing email footers (CAN-SPAM / ESP norms).
 * Override with HUB_MAILING_ADDRESS env if the hub relocates.
 */
export const HUB_MAILING_ADDRESS =
  process.env.HUB_MAILING_ADDRESS?.trim() ||
  "Impact Hub Nairobi, Senteu Plaza, Galana Road, Kilimani, Nairobi, Kenya"
