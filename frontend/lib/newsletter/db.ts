import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import { parseNewsletterSections, type NewsletterSection } from "./section-schema"

export type PublishedCampaignRow = {
  id: string
  title: string
  slug: string
  subject: string
  preheader: string | null
  brandPrimary: string | null
  brandAccent: string | null
  sentAt: Date | null
  sections: unknown
}

function getSql(): NeonQueryFunction<false, false> {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }
  return neon(connectionString)
}

export function coverFromSections(sections: NewsletterSection[]): string | null {
  for (const s of sections) {
    if (s.type === "hero" && s.imageUrl) return s.imageUrl
    if (s.type === "image" && s.imageUrl) return s.imageUrl
    if (s.type === "news_card" && s.imageUrl) return s.imageUrl
    if (s.type === "event_card" && s.imageUrl) return s.imageUrl
    if (s.type === "columns" && s.leftImageUrl) return s.leftImageUrl
    if (s.type === "columns" && s.rightImageUrl) return s.rightImageUrl
  }
  return null
}

export async function listSentCampaignsForMember(params: {
  skip: number
  limit: number
  userId: string
  email: string
}): Promise<{ rows: PublishedCampaignRow[]; total: number }> {
  const sql = getSql()
  const [rows, countRows] = await Promise.all([
    sql`
      SELECT
        DISTINCT c.id,
        c.title,
        c.slug,
        c.subject,
        c.preheader,
        c."brandPrimary",
        c."sentAt",
        c.sections
      FROM newsletter_campaigns c
      WHERE c."deletedAt" IS NULL
        AND c.status = 'sent'
        AND EXISTS (
          SELECT 1
          FROM newsletter_sends s
          WHERE s."campaignId" = c.id
            AND s.status = 'sent'
            AND (s."userId" = ${params.userId} OR lower(s.email) = lower(${params.email}))
        )
      ORDER BY c."sentAt" DESC NULLS LAST
      LIMIT ${params.limit}
      OFFSET ${params.skip}
    `,
    sql`
      SELECT COUNT(DISTINCT c.id)::int AS total
      FROM newsletter_campaigns c
      WHERE c."deletedAt" IS NULL
        AND c.status = 'sent'
        AND EXISTS (
          SELECT 1
          FROM newsletter_sends s
          WHERE s."campaignId" = c.id
            AND s.status = 'sent'
            AND (s."userId" = ${params.userId} OR lower(s.email) = lower(${params.email}))
        )
    `,
  ])

  return {
    rows: rows as PublishedCampaignRow[],
    total: countRows[0]?.total ?? 0,
  }
}

export async function getSentCampaignForMember(
  slug: string,
  params: { userId: string; email: string }
): Promise<PublishedCampaignRow | null> {
  const sql = getSql()
  const rows = await sql`
    SELECT
      c.id,
      c.title,
      c.slug,
      c.subject,
      c.preheader,
      c."brandPrimary",
      c."brandAccent",
      c."sentAt",
      c.sections
    FROM newsletter_campaigns c
    WHERE c.slug = ${slug}
      AND c."deletedAt" IS NULL
      AND c.status = 'sent'
      AND EXISTS (
        SELECT 1
        FROM newsletter_sends s
        WHERE s."campaignId" = c.id
          AND s.status = 'sent'
          AND (s."userId" = ${params.userId} OR lower(s.email) = lower(${params.email}))
      )
    LIMIT 1
  `
  return (rows[0] as PublishedCampaignRow | undefined) ?? null
}

export async function enrichNewsletterSections(
  sections: NewsletterSection[]
): Promise<NewsletterSection[]> {
  const newsIds = sections
    .filter((s) => s.type === "news_card" && s.newsPostId)
    .map((s) => (s as Extract<NewsletterSection, { type: "news_card" }>).newsPostId!)
    .filter(Boolean)

  if (newsIds.length === 0) return sections

  const sql = getSql()
  const posts = await sql`
    SELECT id, title, excerpt, "imageUrl", slug
    FROM news_posts
    WHERE id IN ${sql(newsIds)}
      AND "deletedAt" IS NULL
      AND status = 'published'
  `
  const byId = new Map(
    posts.map((p) => [
      p.id as string,
      p as {
        id: string
        title: string
        excerpt: string | null
        imageUrl: string | null
        slug: string | null
      },
    ])
  )

  return sections.map((section) => {
    if (section.type !== "news_card" || !section.newsPostId) return section
    const post = byId.get(section.newsPostId)
    if (!post) return section
    return {
      ...section,
      title: section.title || post.title,
      excerpt: section.excerpt || post.excerpt || undefined,
      imageUrl: section.imageUrl || post.imageUrl || undefined,
      url: `/news/${post.slug || post.id}`,
    }
  })
}

export function parseCampaignSections(raw: unknown): NewsletterSection[] {
  return parseNewsletterSections(raw)
}
