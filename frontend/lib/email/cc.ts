import { prisma } from "@/lib/prisma"
import {
  EMAIL_TEMPLATE_CATEGORY_LABELS,
  getEmailTemplateDefinition,
  type EmailTemplateCategory,
} from "./template-catalog"

/** Seeded default when the CC table is empty. */
export const DEFAULT_EMAIL_CC = "dennis.ndungu@impacthub.net"

/** Valid email kinds admins can assign to a CC recipient. */
export const EMAIL_CC_CATEGORIES = Object.keys(
  EMAIL_TEMPLATE_CATEGORY_LABELS
) as EmailTemplateCategory[]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmailAddress(value: string): string | null {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return null

  const angle = trimmed.match(/<([^>]+)>/)
  const email = (angle?.[1] ?? trimmed).trim().toLowerCase()
  if (!EMAIL_RE.test(email)) return null
  return email
}

export function normalizeEmailCategories(input: unknown): EmailTemplateCategory[] {
  if (!Array.isArray(input)) return []
  const allowed = new Set<string>(EMAIL_CC_CATEGORIES)
  const unique = new Set<EmailTemplateCategory>()
  for (const value of input) {
    if (typeof value !== "string") continue
    const key = value.trim().toLowerCase()
    if (allowed.has(key)) unique.add(key as EmailTemplateCategory)
  }
  return [...unique]
}

/** Resolve category from a template slot key when known. */
export function categoryForEmailSlot(slot: string | null | undefined): EmailTemplateCategory | null {
  if (!slot?.trim()) return null
  return getEmailTemplateDefinition(slot.trim())?.category ?? null
}

function parseEnvCcList(): string[] {
  const raw = process.env.EMAIL_CC?.trim()
  if (!raw) return []
  return raw
    .split(/[,;\n]+/)
    .map((part) => normalizeEmailAddress(part))
    .filter((email): email is string => Boolean(email))
}

function recipientMatchesCategory(
  categories: string[],
  category: string | null | undefined
): boolean {
  // Empty categories = CC on every email kind
  if (!categories.length) return true
  if (!category) return false
  return categories.includes(category)
}

/** Seed Dennis only when the table has never had rows (e.g. local DB without migration seed). */
export async function ensureEmailCcSeeded(): Promise<void> {
  const count = await prisma.emailCcRecipient.count()
  if (count > 0) return

  await prisma.emailCcRecipient.create({
    data: {
      email: DEFAULT_EMAIL_CC,
      name: "Dennis Ndungu",
      categories: [],
    },
  })
}

/**
 * Addresses that should be CC'd for a given email kind.
 * @param category — template category (membership, events, …). Null = only
 *   recipients tagged for all kinds (empty categories list).
 */
export async function getConfiguredEmailCc(
  category?: string | null
): Promise<string[]> {
  const rows = await prisma.emailCcRecipient.findMany({
    orderBy: { createdAt: "asc" },
    select: { email: true, categories: true },
  })

  const fromDb = rows
    .filter((row) => recipientMatchesCategory(row.categories, category))
    .map((row) => normalizeEmailAddress(row.email))
    .filter((email): email is string => Boolean(email))

  // Env list always applies (ops override), regardless of category tags
  const merged = [...fromDb, ...parseEnvCcList()]
  return [...new Set(merged)]
}

/**
 * Merge explicit CC with configured CC, excluding anyone already in `to`
 * (and the From mailbox if known).
 */
export async function resolveEmailCc(params: {
  to: string | string[]
  cc?: string | string[] | null
  skipConfiguredCc?: boolean
  fromEmail?: string | null
  /** Template category or slot key — used to filter tagged CC recipients. */
  emailCategory?: string | null
  emailSlot?: string | null
}): Promise<string[] | undefined> {
  const toList = (Array.isArray(params.to) ? params.to : [params.to])
    .map((value) => normalizeEmailAddress(value))
    .filter((email): email is string => Boolean(email))

  const explicit = (Array.isArray(params.cc) ? params.cc : params.cc ? [params.cc] : [])
    .map((value) => normalizeEmailAddress(value))
    .filter((email): email is string => Boolean(email))

  const category =
    params.emailCategory?.trim() ||
    categoryForEmailSlot(params.emailSlot) ||
    null

  const configured = params.skipConfiguredCc ? [] : await getConfiguredEmailCc(category)
  const fromEmail = params.fromEmail ? normalizeEmailAddress(params.fromEmail) : null

  const exclude = new Set(
    [...toList, ...(fromEmail ? [fromEmail] : [])].map((e) => e.toLowerCase())
  )

  const cc = [...new Set([...explicit, ...configured])].filter(
    (email) => !exclude.has(email)
  )

  return cc.length > 0 ? cc : undefined
}
