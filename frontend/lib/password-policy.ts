/** Password rules aligned with NIST SP 800-63B / OWASP (length + blocklist, not composition rules). */

import {
  getPasswordStrengthError,
  MIN_PASSWORD_STRENGTH_SCORE,
  PASSWORD_STRENGTH_LABELS,
} from "@/lib/password-strength"

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export const PASSWORD_MIN_STRENGTH_LABEL =
  PASSWORD_STRENGTH_LABELS[MIN_PASSWORD_STRENGTH_SCORE]

export const PASSWORD_REQUIREMENTS_LINES = [
  `At least ${PASSWORD_MIN_LENGTH} characters (up to ${PASSWORD_MAX_LENGTH}).`,
  `Strength must reach at least "${PASSWORD_MIN_STRENGTH_LABEL}" on the meter.`,
  "Avoid common or predictable passwords (e.g. password, 12345678).",
  "Checked against known data breaches when you sign up.",
  "Use a unique passphrase or a password manager.",
] as const

export const PASSWORD_PWNED_MESSAGE =
  "This password has appeared in a data breach. Choose a different one."

type PasswordValidationOptions = {
  email?: string
  name?: string
}

type PasswordValidationResult = { ok: true } | { ok: false; message: string }

/** Top breached / predictable passwords (8+ chars). Compared case-insensitively. */
const BLOCKED_PASSWORDS = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "87654321",
  "11111111",
  "00000000",
  "88888888",
  "99999999",
  "password",
  "password1",
  "password12",
  "password123",
  "passw0rd",
  "passw0rd1",
  "qwerty123",
  "qwertyui",
  "qwerty12",
  "admin123",
  "admin1234",
  "welcome1",
  "welcome12",
  "welcome123",
  "letmein1",
  "letmein123",
  "iloveyou",
  "sunshine",
  "princess",
  "football",
  "baseball",
  "dragon12",
  "monkey123",
  "master123",
  "hello123",
  "changeme",
  "trustno1",
  "abcdefgh",
  "abc12345",
  "default1",
  "access123",
  "computer",
  "superman",
  "batman12",
  "starwars",
  "whatever",
  "qazwsxed",
  "zxcvbnm1",
  "asdfghjk",
  "1q2w3e4r",
  "1qaz2wsx",
  "impacthub",
  "impacthub1",
  "community",
  "nairobi1",
])

function normalizePassword(password: string): string {
  return password.trim().toLowerCase()
}

function isAllSameCharacter(password: string): boolean {
  if (password.length < 2) return false
  const first = password[0]
  return [...password].every((char) => char === first)
}

function isMonotonicSequence(password: string): boolean {
  if (password.length < PASSWORD_MIN_LENGTH) return false
  const chars = [...password]
  const codes = chars.map((char) => char.charCodeAt(0))
  const ascending = codes.every((code, index) => index === 0 || code === codes[index - 1] + 1)
  const descending = codes.every((code, index) => index === 0 || code === codes[index - 1] - 1)
  return ascending || descending
}

function emailLocalPart(email: string): string {
  return email.split("@")[0]?.toLowerCase().trim() ?? ""
}

function matchesEmail(password: string, email: string): boolean {
  const local = emailLocalPart(email)
  if (!local || local.length < 3) return false
  const normalized = normalizePassword(password)
  return normalized === local || normalized.includes(local)
}

export function validatePassword(
  password: string,
  options: PasswordValidationOptions = {}
): PasswordValidationResult {
  if (!password) {
    return { ok: false, message: "Password is required" }
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    }
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return {
      ok: false,
      message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
    }
  }

  const normalized = normalizePassword(password)

  if (BLOCKED_PASSWORDS.has(normalized)) {
    return {
      ok: false,
      message: "This password is too common. Choose something less predictable.",
    }
  }

  if (isAllSameCharacter(password)) {
    return {
      ok: false,
      message: "Password cannot be a single repeated character.",
    }
  }

  if (/^\d+$/.test(password) && isMonotonicSequence(password)) {
    return {
      ok: false,
      message: "Avoid simple number sequences like 12345678.",
    }
  }

  if (/^[a-z]+$/i.test(password) && isMonotonicSequence(password)) {
    return {
      ok: false,
      message: "Avoid simple letter sequences like abcdefgh.",
    }
  }

  if (options.email && matchesEmail(password, options.email)) {
    return {
      ok: false,
      message: "Password cannot match or contain your email address.",
    }
  }

  const strengthError = getPasswordStrengthError(password, {
    email: options.email,
    name: options.name,
  })
  if (strengthError) {
    return { ok: false, message: strengthError }
  }

  return { ok: true }
}

export function getPasswordValidationError(
  password: string,
  options: PasswordValidationOptions = {}
): string | null {
  const result = validatePassword(password, options)
  return result.ok ? null : result.message
}

export async function validatePasswordAsync(
  password: string,
  options: PasswordValidationOptions = {}
): Promise<PasswordValidationResult> {
  const syncResult = validatePassword(password, options)
  if (!syncResult.ok) return syncResult

  try {
    const { isPasswordPwned } = await import("@/lib/hibp")
    const pwned = await isPasswordPwned(password)
    if (pwned) {
      return { ok: false, message: PASSWORD_PWNED_MESSAGE }
    }
  } catch (error) {
    console.error("[PASSWORD] HIBP check failed:", error)
  }

  return { ok: true }
}
