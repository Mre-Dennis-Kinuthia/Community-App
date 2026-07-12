import { prisma } from "@/lib/prisma"

/** Seeded default when the CC table is empty. */
export const DEFAULT_EMAIL_CC = "dennis.ndungu@impacthub.net"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmailAddress(value: string): string | null {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return null

  const angle = trimmed.match(/<([^>]+)>/)
  const email = (angle?.[1] ?? trimmed).trim().toLowerCase()
  if (!EMAIL_RE.test(email)) return null
  return email
}

function parseEnvCcList(): string[] {
  const raw = process.env.EMAIL_CC?.trim()
  if (!raw) return []
  return raw
    .split(/[,;\n]+/)
    .map((part) => normalizeEmailAddress(part))
    .filter((email): email is string => Boolean(email))
}

/** Seed Dennis only when the table has never had rows (e.g. local DB without migration seed). */
export async function ensureEmailCcSeeded(): Promise<void> {
  const count = await prisma.emailCcRecipient.count()
  if (count > 0) return

  await prisma.emailCcRecipient.create({
    data: {
      email: DEFAULT_EMAIL_CC,
      name: "Dennis Ndungu",
    },
  })
}

/** Addresses that should be CC'd on outbound platform emails. */
export async function getConfiguredEmailCc(): Promise<string[]> {
  const rows = await prisma.emailCcRecipient.findMany({
    orderBy: { createdAt: "asc" },
    select: { email: true },
  })

  const fromDb = rows
    .map((row) => normalizeEmailAddress(row.email))
    .filter((email): email is string => Boolean(email))

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
}): Promise<string[] | undefined> {
  const toList = (Array.isArray(params.to) ? params.to : [params.to])
    .map((value) => normalizeEmailAddress(value))
    .filter((email): email is string => Boolean(email))

  const explicit = (Array.isArray(params.cc) ? params.cc : params.cc ? [params.cc] : [])
    .map((value) => normalizeEmailAddress(value))
    .filter((email): email is string => Boolean(email))

  const configured = params.skipConfiguredCc ? [] : await getConfiguredEmailCc()
  const fromEmail = params.fromEmail ? normalizeEmailAddress(params.fromEmail) : null

  const exclude = new Set(
    [...toList, ...(fromEmail ? [fromEmail] : [])].map((e) => e.toLowerCase())
  )

  const cc = [...new Set([...explicit, ...configured])].filter(
    (email) => !exclude.has(email)
  )

  return cc.length > 0 ? cc : undefined
}
