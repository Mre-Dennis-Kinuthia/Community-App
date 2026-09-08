export const ONBOARDING_REQUIRED_CODE = "ONBOARDING_REQUIRED"

/** Default is on: a direct event link can be used before profile onboarding is finished. */
export function eventAllowsJoinWithoutOnboarding(event: {
  allowJoinWithoutOnboarding?: boolean | null
}): boolean {
  return event.allowJoinWithoutOnboarding !== false
}
