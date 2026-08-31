import {
  hasRequiredDirectoryBio,
  hasRequiredSegmentation,
  memberTypeRequiresOrganization,
  type OnboardingProfileSlice,
} from "@/lib/member-segmentation"

export type ProfileCompletenessSlice = OnboardingProfileSlice & {
  bio?: string | null
  skills?: string[]
  interests?: string[]
  availability?: string[]
  image?: string | null
  linkedin?: string | null
}

export type ProfileCompletenessItem = {
  id: string
  label: string
  complete: boolean
  optional?: boolean
  action?: string
}

export function getProfileCompleteness(profile: ProfileCompletenessSlice): {
  items: ProfileCompletenessItem[]
  completed: number
  total: number
  percent: number
} {
  const items: ProfileCompletenessItem[] = [
    {
      id: "segmentation",
      label: "Member type, role & sector",
      complete: hasRequiredSegmentation(profile),
      action: "Add your member type, role, and sector so you appear in directory filters.",
    },
    {
      id: "bio",
      label: "Bio",
      complete: hasRequiredDirectoryBio(profile.bio),
      action: "Write a short intro so members know how to collaborate with you.",
    },
    {
      id: "photo",
      label: "Profile photo",
      complete: Boolean(profile.image?.trim()),
      action: "Add a photo or pick an avatar so people recognize you.",
    },
    {
      id: "skills",
      label: "Skills",
      complete: (profile.skills?.length ?? 0) > 0,
      action: "Add skills to show up in community search.",
    },
    {
      id: "interests",
      label: "Interests",
      complete: (profile.interests?.length ?? 0) > 0,
      action: "Share what you care about to improve recommendations.",
    },
    {
      id: "availability",
      label: "Open to",
      complete: (profile.availability?.length ?? 0) > 0,
      action: "Let others know what kinds of collaboration you want.",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      complete: Boolean(profile.linkedin?.trim()),
      optional: true,
      action: "Optional — link your LinkedIn for credibility.",
    },
  ]

  if (profile.memberType && memberTypeRequiresOrganization(profile.memberType)) {
    items.splice(1, 0, {
      id: "organization",
      label: "Organization",
      complete: Boolean(profile.organization?.trim()),
      action: "Enter your organization or institution.",
    })
  }

  const required = items.filter((item) => !item.optional)
  const completed = required.filter((item) => item.complete).length
  const total = required.length
  const percent = total === 0 ? 100 : Math.round((completed / total) * 100)

  return { items, completed, total, percent }
}

export function validateProfileOrganization(data: {
  memberType: string
  organization: string
}): string | null {
  if (memberTypeRequiresOrganization(data.memberType) && !data.organization.trim()) {
    return "Enter your organization or institution for your selected member type."
  }
  return null
}
