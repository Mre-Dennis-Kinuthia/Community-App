/** Query param `?intent=` on register / onboarding for membership tier context */
export const MEMBERSHIP_REGISTER_INTENT = {
  ORGANISATIONAL: "organisational",
} as const

export type MembershipRegisterIntent =
  (typeof MEMBERSHIP_REGISTER_INTENT)[keyof typeof MEMBERSHIP_REGISTER_INTENT]

export function parseMembershipRegisterIntent(
  value: string | null | undefined
): MembershipRegisterIntent | null {
  if (value === MEMBERSHIP_REGISTER_INTENT.ORGANISATIONAL) {
    return MEMBERSHIP_REGISTER_INTENT.ORGANISATIONAL
  }
  return null
}

export function isOrganisationalRegisterIntent(value: string | null | undefined): boolean {
  return parseMembershipRegisterIntent(value) === MEMBERSHIP_REGISTER_INTENT.ORGANISATIONAL
}
