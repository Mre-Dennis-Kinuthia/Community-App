/**
 * Curated onboarding / directory values for member segmentation.
 * Stored on MemberProfile: memberType, organization, industry (sector), role, interests (goals).
 */

import { hasRequiredPhone } from "@/lib/member-phone"
import {
  normalizeLinkedInUrl,
  parseMemberSocialLinks,
} from "@/lib/member-social-links"

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

/** Suggested skills shown during Connect onboarding. Members can also add their own. */
export const SUGGESTED_SKILLS = [
  "Product",
  "Engineering",
  "Design",
  "Operations",
  "Fundraising",
  "Marketing",
  "Community building",
  "Research",
  "Policy",
  "Finance",
  "Sales",
  "Partnerships",
] as const

/** Canonical availability values for onboarding and profile (includes legacy extras). */
export const AVAILABILITY_OPTIONS = [
  ...ENGAGEMENT_PREFERENCES,
  "Seeking mentorship",
  "Offering mentorship",
  "Open to partnerships",
  "Looking for volunteers",
] as const

/** Short intro word cap (onboarding + profile). */
export const BIO_MAX_WORDS = 500
/** Character safety net so 500 words are not cut off mid-sentence. */
export const BIO_MAX_LENGTH = 20_000
/** Long enough to describe work — blocks empty or one-word bios. */
export const BIO_MIN_LENGTH = 40

export function countBioWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

/** Keep the first `maxWords` words; preserves spacing while typing. */
export function clampBioToMaxWords(text: string, maxWords = BIO_MAX_WORDS): string {
  const tokens = text.match(/(\s+|\S+)/g)
  if (!tokens) return text
  let words = 0
  let out = ""
  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      if (words >= maxWords) break
      out += token
      continue
    }
    if (words >= maxWords) break
    words += 1
    out += token
  }
  return out
}

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

/** Organisation is required for every Connect onboarding path. */
export function memberTypeRequiresOrganization(_memberType?: string): boolean {
  return true
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
  bio?: string | null
  interests?: string[] | null
  availability?: string[] | null
  phone?: string | null
  location?: string | null
  skills?: string[] | null
  linkedin?: string | null
  image?: string | null
}

export function onboardingSliceFromProfile(profile: {
  industry?: string | null
  memberType?: string | null
  role?: string | null
  organization?: string | null
  bio?: string | null
  interests?: string[] | null
  availability?: string[] | null
  phone?: string | null
  location?: string | null
  skills?: string[] | null
  socialLinks?: unknown
  user?: { image?: string | null } | null
}): OnboardingProfileSlice {
  return {
    industry: profile.industry,
    memberType: profile.memberType,
    role: profile.role,
    organization: profile.organization,
    bio: profile.bio,
    interests: profile.interests,
    availability: profile.availability,
    phone: profile.phone,
    location: profile.location,
    skills: profile.skills,
    linkedin: parseMemberSocialLinks(profile.socialLinks).linkedin,
    image: profile.user?.image,
  }
}

export function hasRequiredSegmentation(profile: OnboardingProfileSlice): boolean {
  const sector = profile.industry?.trim()
  const memberType = profile.memberType?.trim()
  const role = profile.role?.trim()

  if (!sector || !memberType || !role) return false
  if (!profile.organization?.trim()) return false

  return true
}

export function hasRequiredDirectoryBio(bio: string | null | undefined): boolean {
  return (bio?.trim().length ?? 0) >= BIO_MIN_LENGTH
}

export function hasRequiredLocation(location: string | null | undefined): boolean {
  return (location?.trim().length ?? 0) >= 2
}

export function hasRequiredLinkedIn(linkedin: string | null | undefined): boolean {
  return Boolean(linkedin && normalizeLinkedInUrl(linkedin))
}

export function hasRequiredSkills(skills: string[] | null | undefined): boolean {
  return skills?.some((item) => item.trim()) ?? false
}

export function hasRequiredPhoto(image: string | null | undefined): boolean {
  return Boolean(image?.trim())
}

/** True when required segmentation + directory intro fields are set. */
export function isOnboardingComplete(profile: OnboardingProfileSlice): boolean {
  if (!hasRequiredSegmentation(profile)) return false
  if (!hasRequiredDirectoryBio(profile.bio)) return false
  if (!(profile.interests?.some((item) => item.trim()) ?? false)) return false
  if (!(profile.availability?.some((item) => item.trim()) ?? false)) return false
  if (!hasRequiredPhone(profile.phone)) return false
  if (!hasRequiredLocation(profile.location)) return false
  if (!hasRequiredLinkedIn(profile.linkedin)) return false
  if (!hasRequiredSkills(profile.skills)) return false
  if (!hasRequiredPhoto(profile.image)) return false
  return true
}

export function validateOnboardingStep1(data: {
  memberType: string
  sector: string
  role: string
  organization: string
  location: string
  image?: string
  requireOrganization?: boolean
}): string | null {
  if (!data.memberType) return "Select how you identify in the community."
  if (!data.sector) return "Select your primary sector or focus area."
  if (!data.role) return "Select your primary role."
  if (!data.organization.trim()) {
    return "Enter your organisation or venture name."
  }
  if (!hasRequiredLocation(data.location)) {
    return "Enter your city or country."
  }
  if (!hasRequiredPhoto(data.image)) {
    return "Add a photo or pick an avatar so members can recognize you."
  }
  return null
}

export function validateOnboardingStep2(data: {
  goals: string[]
  availability: string[]
  bio: string
  linkedin: string
  skills: string[]
}): string | null {
  if (!data.goals.some((goal) => goal.trim())) {
    return "Select at least one reason you are here."
  }
  if (!data.availability.some((item) => item.trim())) {
    return "Select at least one option you are open to."
  }
  if (!hasRequiredSkills(data.skills)) {
    return "Add at least one skill so members can find you."
  }
  if (!data.linkedin.trim()) {
    return "Add your LinkedIn profile so the community can find you."
  }
  if (!hasRequiredLinkedIn(data.linkedin)) {
    return "Enter a valid LinkedIn profile URL (e.g. linkedin.com/in/yourname)."
  }
  const bioLength = data.bio.trim().length
  if (bioLength < BIO_MIN_LENGTH) {
    return `Write a short intro (${BIO_MIN_LENGTH}+ characters) so members know how to work with you.`
  }
  if (countBioWords(data.bio) > BIO_MAX_WORDS) {
    return `Keep your short intro to ${BIO_MAX_WORDS} words or fewer.`
  }
  return null
}
