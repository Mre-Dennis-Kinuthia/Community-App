/**
 * Curated onboarding / directory values for member segmentation.
 * Stored on MemberProfile: memberType, organization, industry (sector), role, interests (goals).
 */

export const MEMBER_TYPES = [
  { value: "entrepreneur", label: "Entrepreneur / Founder" },
  { value: "employee", label: "Employee / Professional" },
  { value: "student", label: "Student / Researcher" },
  { value: "investor", label: "Investor" },
  { value: "partner", label: "Partner / NGO / Government" },
  { value: "freelancer", label: "Freelancer / Consultant" },
  { value: "other", label: "Other" },
] as const

export type MemberTypeValue = (typeof MEMBER_TYPES)[number]["value"]

export const IMPACT_SECTORS = [
  "Agriculture & Food Systems",
  "Circularity & Waste",
  "Climate & Energy",
  "E-Mobility & Transport",
  "Digitization & Tech",
  "Gender Equity & Inclusion",
  "Health & Wellbeing",
  "Education & Skills",
  "Finance & Inclusion",
  "Creative Economy",
  "General / Cross-sector",
  "Other",
] as const

export const PRIMARY_ROLES = [
  "Founder / Co-founder",
  "CEO / Executive",
  "Product & Innovation",
  "Operations",
  "Marketing & Growth",
  "Finance",
  "Engineering / Tech",
  "Design",
  "Program / Project Lead",
  "Research",
  "Student",
  "Investor",
  "Other",
] as const

export const ENGAGEMENT_GOALS = [
  "Find collaborators",
  "Programs & acceleration",
  "Book workspace",
  "Attend events",
  "Seek mentorship",
  "Offer mentorship",
  "Funding & investment",
  "Strategic partnerships",
  "Learn & network",
] as const

export const ENGAGEMENT_PREFERENCES = [
  "Open to collaboration",
  "Open to projects",
  "Available for events",
  "Open to speaking",
] as const

/** Canonical availability values for onboarding and profile (includes legacy extras). */
export const AVAILABILITY_OPTIONS = [
  ...ENGAGEMENT_PREFERENCES,
  "Seeking mentorship",
  "Offering mentorship",
  "Open to partnerships",
  "Looking for volunteers",
] as const

export const BIO_MAX_LENGTH = 280

/** Legacy availability strings saved before options were unified. */
const LEGACY_AVAILABILITY_ALIASES: Record<string, string> = {
  "open to collaboration": "Open to collaboration",
  "seeking mentorship": "Seeking mentorship",
  "offering mentorship": "Offering mentorship",
  "open to partnerships": "Open to partnerships",
  "looking for volunteers": "Looking for volunteers",
}

export function normalizeAvailabilityValue(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  const alias = LEGACY_AVAILABILITY_ALIASES[trimmed.toLowerCase()]
  return alias ?? trimmed
}

export function normalizeAvailabilityList(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const normalized = normalizeAvailabilityValue(value)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
  }
  return result
}

/** Options shown in edit UI: canonical list plus any legacy values already on the profile. */
export function availabilityOptionsForEdit(current: string[]): string[] {
  const options = new Set<string>(AVAILABILITY_OPTIONS)
  for (const value of current) {
    const normalized = normalizeAvailabilityValue(value)
    if (normalized) options.add(normalized)
  }
  return [...options]
}

const ORG_REQUIRED_TYPES: MemberTypeValue[] = ["employee", "partner", "student"]

export function memberTypeRequiresOrganization(memberType: string): boolean {
  return ORG_REQUIRED_TYPES.includes(memberType as MemberTypeValue)
}

export function getMemberTypeLabel(value: string | null | undefined): string | null {
  if (!value) return null
  return MEMBER_TYPES.find((m) => m.value === value)?.label ?? value
}

export type OnboardingProfileSlice = {
  industry?: string | null
  memberType?: string | null
  role?: string | null
  organization?: string | null
}

/** True when required segmentation fields are set (post-onboarding). */
export function isOnboardingComplete(profile: OnboardingProfileSlice): boolean {
  const sector = profile.industry?.trim()
  const memberType = profile.memberType?.trim()
  const role = profile.role?.trim()

  if (!sector || !memberType || !role) return false

  if (memberTypeRequiresOrganization(memberType) && !profile.organization?.trim()) {
    return false
  }

  return true
}

export function validateOnboardingStep1(data: {
  memberType: string
  sector: string
  role: string
  organization: string
  requireOrganization?: boolean
}): string | null {
  if (!data.memberType) return "Select how you identify in the community."
  if (!data.sector) return "Select your primary sector or focus area."
  if (!data.role) return "Select your primary role."
  const needsOrg =
    data.requireOrganization || memberTypeRequiresOrganization(data.memberType)
  if (needsOrg && !data.organization.trim()) {
    return "Enter your organization or institution."
  }
  return null
}
