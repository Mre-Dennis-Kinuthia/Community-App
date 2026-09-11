import { z } from "zod"
import { parseMemberSocialLinks } from "@/lib/member-social-links"
import { formatNairobiRange } from "@/lib/expert-availability"

export const EXPERT_SECTOR_SUGGESTIONS = [
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

export const EXPERT_EXPERTISE_SUGGESTIONS = [
  "Strategy",
  "Fundraising",
  "Climate",
  "Agriculture",
  "Health",
  "Education",
  "Gender",
  "Youth",
  "Policy",
  "Communications",
  "Monitoring & evaluation",
  "Product",
  "Legal",
  "Finance",
] as const

export const EXPERT_INITIATIVE_SUGGESTIONS = [
  "AECF",
  "Climate action",
  "Inclusive entrepreneurship",
  "Circular economy",
  "Food systems",
  "Digital inclusion",
  "Community programmes",
  "Star Connect",
] as const

export const EXPERT_MEETING_FORMATS = ["virtual", "in-person", "either"] as const
export type ExpertMeetingFormat = (typeof EXPERT_MEETING_FORMATS)[number]

export const EXPERT_REQUEST_TYPES = ["clinic", "services"] as const
export type ExpertRequestType = (typeof EXPERT_REQUEST_TYPES)[number]

export const EIR_DASHBOARD_PATH = "/dashboard/eir"
export const EIR_INVITE_PREFIX = "eir-invite:"

export const EXPERT_MEETING_STATUSES = [
  "pending",
  "confirmed",
  "declined",
  "cancelled",
] as const
export type ExpertMeetingStatus = (typeof EXPERT_MEETING_STATUSES)[number]

export const EXPERT_MEETING_TICKET_CATEGORY = "experts-in-residence"

const CUID_PATTERN = /^c[a-z0-9]{20,32}$/i

export function generateExpertSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return base.slice(0, 80) || "expert"
}

export function isExpertCuid(param: string): boolean {
  return CUID_PATTERN.test(param)
}

export function expertPublicParamWhere(param: string): { id: string } | { slug: string } {
  const p = decodeURIComponent(param).trim()
  if (isExpertCuid(p)) return { id: p }
  return { slug: p.toLowerCase() }
}

export function expertPublicPath(expert: { id: string; slug?: string | null }): string {
  return `/experts/${expert.slug || expert.id}`
}

export function normalizeTagList(tags: Array<string | null | undefined> | undefined | null): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of tags ?? []) {
    if (typeof raw !== "string") continue
    const tag = raw.trim()
    if (!tag) continue
    const key = tag.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(tag)
  }
  return out
}

export function meetingFormatLabel(format: string): string {
  switch (format) {
    case "virtual":
      return "Virtual"
    case "in-person":
      return "In person at the Hub"
    case "either":
      return "Virtual or in person"
    default:
      return format
  }
}

export function expertRequestTypeLabel(type: string): string {
  switch (type) {
    case "clinic":
      return "1-on-1 clinic"
    case "services":
      return "Services"
    default:
      return type
  }
}

export const meetingRequestSchema = z.object({
  topic: z.string().trim().min(3, "Add a short topic").max(160),
  message: z
    .string()
    .trim()
    .min(20, "Tell the expert a little more about what you need (at least 20 characters)")
    .max(2000),
  preferredTimes: z.string().trim().max(400).optional().or(z.literal("")),
  scheduledAt: z.union([z.string().datetime(), z.literal("")]).optional(),
  meetingFormat: z.enum(EXPERT_MEETING_FORMATS).default("virtual"),
  requestType: z.enum(EXPERT_REQUEST_TYPES).default("clinic"),
})

export type MeetingRequestInput = z.infer<typeof meetingRequestSchema>

export const expertEventCreateSchema = z.object({
  title: z.string().trim().min(3, "Enter a session title").max(160),
  description: z.string().trim().min(20, "Add a short description").max(8000),
  startDate: z.string().min(1, "Choose a start time"),
  endDate: z.string().optional().or(z.literal("")),
  onlineUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^https?:\/\//i.test(val), "Use a full meeting link (https://…)"),
  visibility: z.enum(["public", "members"]).default("members"),
  tags: z.array(z.string()).optional(),
})

export type ExpertEventCreateInput = z.infer<typeof expertEventCreateSchema>

export const DEFAULT_EIR_TITLE = "Expert in Residence"

export type PublicExpert = {
  id: string
  slug: string
  name: string
  title: string
  organization: string | null
  industry: string | null
  industries: string[]
  location: string | null
  bio: string
  photoUrl: string | null
  expertise: string[]
  initiatives: string[]
  bookingUrl: string | null
  linkedInUrl: string | null
  websiteUrl: string | null
  availabilityEnabled: boolean
  sessionDurationMinutes: number
  isFeatured: boolean
  eventsCount: number
}

export type SessionAgendaInput = {
  expertName: string
  expertTitle?: string | null
  requesterName: string
  topic: string
  message: string
  requestType: string
  meetingFormat: string
  durationMinutes?: number | null
  scheduledAt?: string | Date | null
  scheduledEndAt?: string | Date | null
}

export function generateSessionAgenda(input: SessionAgendaInput) {
  const typeLabel = expertRequestTypeLabel(input.requestType)
  const formatLabel = meetingFormatLabel(input.meetingFormat)
  const duration = input.durationMinutes && input.durationMinutes > 0 ? input.durationMinutes : 45
  const when =
    input.scheduledAt && input.scheduledEndAt
      ? formatNairobiRange(
          new Date(input.scheduledAt).toISOString(),
          new Date(input.scheduledEndAt).toISOString()
        )
      : "To be confirmed"

  const context = input.message.trim()
  const purpose = context.split(/\n+/)[0]?.slice(0, 240) || input.topic

  const intro =
    duration >= 60
      ? [
          "1. Welcome & goals (8 min)",
          "2. Context and current challenge (12 min)",
          "3. Advice, options, and working session (28 min)",
          "4. Next steps and follow-up (12 min)",
        ]
      : duration <= 30
        ? [
            "1. Goal for this session (5 min)",
            "2. Challenge and constraints (8 min)",
            "3. Advice and options (12 min)",
            "4. Next steps (5 min)",
          ]
        : [
            "1. Context & goals (5 min)",
            "2. Current challenge (10 min)",
            "3. Options & advice (20 min)",
            "4. Next steps & follow-up (10 min)",
          ]

  return [
    `Session agenda — ${input.topic}`,
    "",
    `Mentor: ${input.expertName}${input.expertTitle ? ` · ${input.expertTitle}` : ""}`,
    `Member: ${input.requesterName}`,
    `Type: ${typeLabel}`,
    `When: ${when}`,
    `Format: ${formatLabel}`,
    `Duration: ${duration} minutes`,
    "",
    "Purpose",
    purpose,
    "",
    `Suggested flow (${duration} min)`,
    ...intro,
    "",
    "Prep for the member",
    "- Share any relevant docs, links, or metrics ahead of time.",
    "- Arrive with 1–2 specific questions.",
    "- Note what a useful outcome looks like after this session.",
    "",
    "Prep for the mentor",
    "- Review the member’s topic and context below.",
    "- Identify 2–3 practical next steps they can take this week.",
    "",
    "Member context",
    context,
  ].join("\n")
}

export type ExpertMemberOverlay = {
  name?: string | null
  image?: string | null
  profile?: {
    bio?: string | null
    organization?: string | null
    industry?: string | null
    role?: string | null
    location?: string | null
    skills?: string[] | null
    socialLinks?: unknown
  } | null
} | null

function firstText(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const trimmed = value?.trim()
    if (trimmed) return trimmed
  }
  return null
}

export function mapPublicExpert(
  row: {
    id: string
    slug: string
    name: string
    title: string
    organization: string | null
    industry?: string | null
    industries?: string[]
    location?: string | null
    bio: string
    photoUrl: string | null
    expertise: string[]
    initiatives: string[]
    bookingUrl: string | null
    linkedInUrl: string | null
    websiteUrl?: string | null
    availabilityEnabled?: boolean
    sessionDurationMinutes?: number
    isFeatured: boolean
    _count?: { events?: number }
    user?: ExpertMemberOverlay
  },
  overlay?: ExpertMemberOverlay
): PublicExpert {
  const member = overlay ?? row.user ?? null
  const profile = member?.profile
  const social = parseMemberSocialLinks(profile?.socialLinks)
  const industries = normalizeTagList([
    profile?.industry,
    ...(row.industries ?? []),
    row.industry,
  ])

  return {
    id: row.id,
    slug: row.slug,
    name: firstText(member?.name, row.name) ?? row.name,
    title: row.title,
    organization: firstText(profile?.organization, row.organization),
    industries,
    industry: industries[0] ?? null,
    location: firstText(profile?.location, row.location),
    bio: firstText(profile?.bio, row.bio) ?? row.bio,
    photoUrl: firstText(member?.image, row.photoUrl),
    expertise: normalizeTagList([...(row.expertise ?? []), ...(profile?.skills ?? [])]),
    initiatives: row.initiatives ?? [],
    bookingUrl: row.bookingUrl,
    linkedInUrl: firstText(social.linkedin, row.linkedInUrl),
    websiteUrl: firstText(social.website, row.websiteUrl),
    availabilityEnabled: row.availabilityEnabled ?? false,
    sessionDurationMinutes: row.sessionDurationMinutes ?? 45,
    isFeatured: row.isFeatured,
    eventsCount: row._count?.events ?? 0,
  }
}

export type ExpertProfileSyncPatch = {
  name?: string
  image?: string | null
  bio?: string | null
  role?: string | null
  organization?: string | null
  industry?: string | null
  industries?: string[]
  location?: string | null
  skills?: string[]
  linkedInUrl?: string | null
  websiteUrl?: string | null
}

export function buildExpertProfileSyncData(
  expert: { title: string; expertise: string[]; industries?: string[] },
  patch: ExpertProfileSyncPatch
) {
  const data: {
    name?: string
    photoUrl?: string | null
    bio?: string
    title?: string
    organization?: string | null
    industry?: string | null
    industries?: string[]
    location?: string | null
    expertise?: string[]
    linkedInUrl?: string | null
    websiteUrl?: string | null
  } = {}

  if (patch.name !== undefined && patch.name.trim()) data.name = patch.name.trim()
  if (patch.image !== undefined) data.photoUrl = patch.image
  if (patch.bio !== undefined) {
    const bio = patch.bio?.trim() ?? ""
    if (bio) data.bio = bio
  }
  if (patch.role?.trim()) {
    const currentTitle = expert.title.trim()
    if (!currentTitle || currentTitle === DEFAULT_EIR_TITLE) {
      data.title = patch.role.trim()
    }
  }
  if (patch.organization !== undefined) {
    data.organization = patch.organization?.trim() || null
  }
  if (patch.industries) {
    const industries = normalizeTagList(patch.industries)
    data.industries = industries
    data.industry = industries[0] ?? null
  } else if (patch.industry !== undefined) {
    const industries = normalizeTagList([...(expert.industries ?? []), patch.industry])
    data.industries = industries
    data.industry = industries[0] ?? null
  }
  if (patch.location !== undefined) {
    data.location = patch.location?.trim() || null
  }
  if (patch.skills?.length) {
    data.expertise = normalizeTagList([...(expert.expertise ?? []), ...patch.skills])
  }
  if (patch.linkedInUrl !== undefined) {
    data.linkedInUrl = patch.linkedInUrl
  }
  if (patch.websiteUrl !== undefined) {
    data.websiteUrl = patch.websiteUrl?.trim() || null
  }

  return data
}

export function mapPublicExpertEvent(event: {
  id: string
  title: string
  slug: string | null
  shortCode: string | null
  description: string
  startDate: Date
  endDate: Date | null
  locationType: string
  onlineUrl: string | null
  imageUrl: string | null
  visibility: string
}) {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    shortCode: event.shortCode,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    locationType: event.locationType,
    onlineUrl: event.onlineUrl,
    imageUrl: event.imageUrl,
    visibility: event.visibility,
  }
}
