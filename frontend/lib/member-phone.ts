const MIN_DIGITS = 9
const MAX_DIGITS = 15

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "")
}

/** Canonical E.164-style value, or null if empty/invalid. Kenya 07xx local numbers become +254. */
export function normalizePhoneNumber(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const digits = phoneDigits(trimmed)
  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) return null

  if (trimmed.startsWith("+")) return `+${digits}`
  if (digits.startsWith("0") && digits.length === 10) return `+254${digits.slice(1)}`
  if (digits.startsWith("254") && digits.length >= 12) return `+${digits}`
  return `+${digits}`
}

export function validatePhoneInput(input: string): string | null {
  if (!input.trim()) return "Enter a mobile phone number."
  if (!normalizePhoneNumber(input)) {
    return "Enter a valid mobile number (e.g. 0712 345 678 or +254 712 345 678)."
  }
  return null
}

export function hasRequiredPhone(phone: string | null | undefined): boolean {
  return Boolean(phone && normalizePhoneNumber(phone))
}
