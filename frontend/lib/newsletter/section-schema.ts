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

const ctaSchema = z
  .object({
    label: z.string().min(1).max(80),
    url: z.string().min(1).max(2000),
  })
  .optional()

export const newsletterSectionSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().min(1),
    type: z.literal("header"),
    eyebrow: z.string().max(80).optional(),
    showLogo: z.boolean().optional().default(true),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("hero"),
    headline: z.string().min(1).max(200),
    subcopy: z.string().max(500).optional(),
    imageUrl: z.string().max(2000).optional(),
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
    imageUrl: z.string().min(1).max(2000),
    alt: z.string().max(200).optional(),
    caption: z.string().max(300).optional(),
    linkUrl: z.string().max(2000).optional(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("button"),
    label: z.string().min(1).max(80),
    url: z.string().min(1).max(2000),
    align: z.enum(["left", "center"]).optional().default("center"),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("divider"),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("spacer"),
    size: z.enum(["sm", "md", "lg"]).optional().default("md"),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("columns"),
    leftHtml: z.string().min(1),
    rightHtml: z.string().min(1),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("news_card"),
    newsPostId: z.string().max(100).optional().default(""),
    title: z.string().optional(),
    excerpt: z.string().optional(),
    imageUrl: z.string().optional(),
    url: z.string().optional(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("footer"),
    showUnsubscribe: z.boolean().optional().default(true),
    note: z.string().max(400).optional(),
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
      subcopy: "News, opportunities, and what’s happening at the Hub.",
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
      note: "You’re receiving this because you subscribed to Impact Hub Nairobi updates.",
    },
  ]
}

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
  footer: "Footer",
}
