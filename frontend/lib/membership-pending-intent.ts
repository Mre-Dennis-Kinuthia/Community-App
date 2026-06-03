/** Client-side flag set on org register before OAuth completes */
export const ORGANISATIONAL_SIGNUP_PENDING_KEY = "ih_organisational_signup_pending"

export function markOrganisationalSignupPending(): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(ORGANISATIONAL_SIGNUP_PENDING_KEY, "1")
  } catch {
    /* ignore */
  }
}

export function clearOrganisationalSignupPending(): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(ORGANISATIONAL_SIGNUP_PENDING_KEY)
  } catch {
    /* ignore */
  }
}

export function hasOrganisationalSignupPending(): boolean {
  if (typeof window === "undefined") return false
  try {
    return sessionStorage.getItem(ORGANISATIONAL_SIGNUP_PENDING_KEY) === "1"
  } catch {
    return false
  }
}
