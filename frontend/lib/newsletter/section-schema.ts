import { z } from "zod"

export const newsletterAudienceSchema = z.enum([
  "subscribers",
  "members",
  "both",
])
export type NewsletterAudience = z.infer<typeof newsletterAudienceSchema>

export const newsletterCampaignStatusSchema = z.enum([
  "draft",
  "scheduled",
  "sending",
  "sent",
  "cancelled",
])
export type NewsletterCampaignStatus = z.infer<
  typeof newsletterCampaignStatusSchema
>

/** Empty CTA fields are treated as "no CTA" for draft saves. */
const ctaSchema = z.preprocess(
  (val) => {
    if (val == null || val === "") return undefined
    if (typeof val !== "object") return undefined
    const obj = val as { label?: unknown; url?: unknown }
    const label = typeof obj.label === "string" ? obj.label.trim() : ""
    const url = typeof obj.url === "string" ? obj.url.trim() : ""
    if (!label && !url) return undefined
    return { label: label || "Learn more", url: url || "/" }
  },
  z
    .object({
      label: z.string().min(1).max(80),
      url: z.string().min(1).max(2000),
    })
    .optional()
)

export const newsletterSectionSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().min(1),
    type: z.literal("header"),
    eyebrow: z.string().max(80).optional().nullable(),
    showLogo: z.boolean().optional(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("hero"),
    headline: z.string().min(1).max(200),
    subcopy: z.string().max(500).optional().nullable(),
    imageUrl: z.string().max(2000).optional().nullable(),
    cta: ctaSchema,
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("text"),
    html: z.string().min(1),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("image"),
    imageUrl: z.string().max(2000).optional().default(""),
    alt: z.string().max(200).optional().nullable(),
    caption: z.string().max(300).optional().nullable(),
    linkUrl: z.string().max(2000).optional().nullable(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("button"),
    label: z.string().min(1).max(80),
    url: z.string().min(1).max(2000),
    align: z.enum(["left", "center"]).optional(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("divider"),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("spacer"),
    size: z.enum(["sm", "md", "lg"]).optional(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("columns"),
    leftHtml: z.string().optional().default(""),
    rightHtml: z.string().optional().default(""),
    leftImageUrl: z.string().max(2000).optional().nullable(),
    rightImageUrl: z.string().max(2000).optional().nullable(),
    leftAlt: z.string().max(200).optional().nullable(),
    rightAlt: z.string().max(200).optional().nullable(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("news_card"),
    newsPostId: z.string().max(100).optional().nullable(),
    title: z.string().optional().nullable(),
    excerpt: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    url: z.string().optional().nullable(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("section_heading"),
    label: z.string().min(1).max(80),
    accent: z.enum(["maroon", "teal", "green", "navy"]).optional(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("event_card"),
    title: z.string().min(1).max(160),
    kicker: z.string().max(80).optional().nullable(),
    body: z.string().max(800).optional().nullable(),
    imageUrl: z.string().max(2000).optional().nullable(),
    dateLine: z.string().max(120).optional().nullable(),
    location: z.string().max(160).optional().nullable(),
    cta: ctaSchema,
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("footer"),
    showUnsubscribe: z.boolean().optional(),
    note: z.string().max(400).optional().nullable(),
  }),
])

export type NewsletterSection = z.infer<typeof newsletterSectionSchema>

export const newsletterSectionsSchema = z.array(newsletterSectionSchema)

export function parseNewsletterSections(raw: unknown): NewsletterSection[] {
  const parsed = newsletterSectionsSchema.safeParse(raw ?? [])
  if (!parsed.success) return []
  return parsed.data
}

export function newSectionId(): string {
  return `sec_${Math.random().toString(36).slice(2, 10)}`
}

export function defaultNewsletterSections(): NewsletterSection[] {
  return [
    {
      id: newSectionId(),
      type: "header",
      eyebrow: "Impact Hub Nairobi",
      showLogo: true,
    },
    {
      id: newSectionId(),
      type: "hero",
      headline: "Your community update",
      subcopy: "News, opportunities, and what's happening at the Hub.",
      imageUrl: "",
    },
    {
      id: newSectionId(),
      type: "text",
      html: "<p>Share your latest stories with members and subscribers.</p>",
    },
    {
      id: newSectionId(),
      type: "footer",
      showUnsubscribe: true,
      note: "You're receiving this because you subscribed to Impact Hub Nairobi updates.",
    },
  ]
}

export const NEWSLETTER_SECTION_ACCENTS = {
  maroon: { bar: "#812926", label: "#812926" },
  teal: { bar: "#41BED0", label: "#812926" },
  green: { bar: "#7EBB55", label: "#812926" },
  navy: { bar: "#0a1f38", label: "#0a1f38" },
} as const

export type NewsletterSectionAccent = keyof typeof NEWSLETTER_SECTION_ACCENTS

export function slugifyNewsletterTitle(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  return base || `newsletter-${Date.now().toString(36)}`
}

export const SECTION_TYPE_LABELS: Record<NewsletterSection["type"], string> = {
  header: "Header",
  hero: "Hero",
  text: "Text",
  image: "Image",
  button: "Button",
  divider: "Divider",
  spacer: "Spacer",
  columns: "Two columns",
  news_card: "News card",
  section_heading: "Section heading",
  event_card: "Event card",
  footer: "Footer",
}
