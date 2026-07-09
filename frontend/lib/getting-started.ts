const DISMISSED_KEY = "hasDismissedGettingStarted"
const WELCOME_SEEN_KEY = "hasSeenWelcome"

export function hasDismissedGettingStarted(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(DISMISSED_KEY) === "true"
}

export function dismissGettingStarted(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(DISMISSED_KEY, "true")
}

export function hasSeenWelcome(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(WELCOME_SEEN_KEY) === "true"
}

export function markWelcomeSeen(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(WELCOME_SEEN_KEY, "true")
  sessionStorage.removeItem("onboardingJustCompleted")
}

/** After profile onboarding, show the welcome tour again on next dashboard visit. */
export function resetWelcomeForNewMember(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(WELCOME_SEEN_KEY)
  localStorage.removeItem(DISMISSED_KEY)
}

/** Show the dashboard getting-started card for new members. */
export function shouldShowGettingStarted(onboardingComplete: boolean): boolean {
  if (!onboardingComplete) return false
  return !hasDismissedGettingStarted()
}
