import { z } from "zod"

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

export function normalizeTagList(tags: string[] | undefined | null): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of tags ?? []) {
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

export type PublicExpert = {
  id: string
  slug: string
  name: string
  title: string
  organization: string | null
  bio: string
  photoUrl: string | null
  expertise: string[]
  initiatives: string[]
  bookingUrl: string | null
  linkedInUrl: string | null
  isFeatured: boolean
  eventsCount: number
}

export function mapPublicExpert(row: {
  id: string
  slug: string
  name: string
  title: string
  organization: string | null
  bio: string
  photoUrl: string | null
  expertise: string[]
  initiatives: string[]
  bookingUrl: string | null
  linkedInUrl: string | null
  isFeatured: boolean
  _count?: { events?: number }
}): PublicExpert {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    title: row.title,
    organization: row.organization,
    bio: row.bio,
    photoUrl: row.photoUrl,
    expertise: row.expertise ?? [],
    initiatives: row.initiatives ?? [],
    bookingUrl: row.bookingUrl,
    linkedInUrl: row.linkedInUrl,
    isFeatured: row.isFeatured,
    eventsCount: row._count?.events ?? 0,
  }
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
