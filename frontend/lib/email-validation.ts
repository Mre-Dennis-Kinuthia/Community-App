import { domainToASCII } from "node:url"
import { isDisposableEmail } from "disposable-email-domains-js"

const EMAIL_PATTERN =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i

const RESERVED_DOMAINS = [
  "example.com",
  "example.org",
  "example.net",
  "test",
  "invalid",
  "example",
  "localhost",
  "local",
]

const KNOWN_DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "yopmail.com",
  "yopmail.fr",
  "guerrillamail.com",
  "guerrillamail.net",
  "10minutemail.com",
  "10minutemail.net",
  "temp-mail.org",
]

export type EmailValidationResult =
  | { valid: true; email: string }
  | { valid: false; reason: "invalid" | "reserved" | "disposable" }

function isDomainOrSubdomain(domain: string, blockedDomain: string): boolean {
  return domain === blockedDomain || domain.endsWith(`.${blockedDomain}`)
}

export function validateEmailAddress(input: string): EmailValidationResult {
  const email = input.trim().toLowerCase()
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { valid: false, reason: "invalid" }
  }

  const atIndex = email.lastIndexOf("@")
  const localPart = email.slice(0, atIndex)
  const domain = domainToASCII(email.slice(atIndex + 1)).toLowerCase()
  if (
    localPart.length > 64 ||
    !domain ||
    domain.length > 253 ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..")
  ) {
    return { valid: false, reason: "invalid" }
  }

  if (RESERVED_DOMAINS.some((blocked) => isDomainOrSubdomain(domain, blocked))) {
    return { valid: false, reason: "reserved" }
  }

  if (
    KNOWN_DISPOSABLE_DOMAINS.some((blocked) =>
      isDomainOrSubdomain(domain, blocked)
    ) ||
    isDisposableEmail(email)
  ) {
    return { valid: false, reason: "disposable" }
  }

  return { valid: true, email: `${localPart}@${domain}` }
}
