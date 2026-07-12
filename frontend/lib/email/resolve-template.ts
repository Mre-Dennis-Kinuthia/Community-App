import { prisma } from "@/lib/prisma"
import {
  EMAIL_TEMPLATE_CATALOG,
  getEmailTemplateDefinition,
  type EmailTemplateDefinition,
} from "./template-catalog"
import {
  layoutEmail,
  emailGreeting,
  emailParagraph,
  escapeHtml,
} from "./templates"
import { sendEmail, type EmailAttachment, type SendEmailResult } from "./send"

export type ResolvedEmailTemplate = {
  key: string
  name: string
  description: string | null
  category: string
  subject: string
  preheader: string | null
  title: string
  eyebrow: string | null
  bodyHtml: string
  ctaLabel: string | null
  textBody: string
  enabled: boolean
  isCustomized: boolean
  updatedAt: Date | null
}

/** Replace {{var}} placeholders. Unknown vars become empty string. */
export function interpolateTemplate(
  template: string,
  vars: Record<string, string | null | undefined>
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const value = vars[key]
    return value == null ? "" : String(value)
  })
}

function definitionToResolved(def: EmailTemplateDefinition): ResolvedEmailTemplate {
  return {
    key: def.key,
    name: def.name,
    description: def.description,
    category: def.category,
    subject: def.subject,
    preheader: def.preheader,
    title: def.title,
    eyebrow: def.eyebrow,
    bodyHtml: def.bodyHtml,
    ctaLabel: def.ctaLabel,
    textBody: def.textBody,
    enabled: true,
    isCustomized: false,
    updatedAt: null,
  }
}

export async function ensureEmailTemplatesSeeded(): Promise<void> {
  const existing = await prisma.emailTemplate.findMany({ select: { key: true } })
  const existingKeys = new Set(existing.map((r) => r.key))
  const missing = EMAIL_TEMPLATE_CATALOG.filter((d) => !existingKeys.has(d.key))
  if (missing.length === 0) return

  await prisma.emailTemplate.createMany({
    data: missing.map((d) => ({
      key: d.key,
      name: d.name,
      description: d.description,
      category: d.category,
      subject: d.subject,
      preheader: d.preheader,
      title: d.title,
      eyebrow: d.eyebrow,
      bodyHtml: d.bodyHtml,
      ctaLabel: d.ctaLabel,
      textBody: d.textBody,
      enabled: true,
    })),
    skipDuplicates: true,
  })
}

export async function listResolvedEmailTemplates(): Promise<ResolvedEmailTemplate[]> {
  await ensureEmailTemplatesSeeded()
  const rows = await prisma.emailTemplate.findMany()
  const byKey = new Map(rows.map((r) => [r.key, r]))

  return EMAIL_TEMPLATE_CATALOG.map((def) => {
    const row = byKey.get(def.key)
    if (!row) return definitionToResolved(def)
    return {
      key: def.key,
      name: row.name || def.name,
      description: row.description ?? def.description,
      category: row.category || def.category,
      subject: row.subject,
      preheader: row.preheader,
      title: row.title,
      eyebrow: row.eyebrow,
      bodyHtml: row.bodyHtml,
      ctaLabel: row.ctaLabel,
      textBody: row.textBody,
      enabled: row.enabled,
      isCustomized:
        row.subject !== def.subject ||
        row.title !== def.title ||
        row.bodyHtml !== def.bodyHtml ||
        row.ctaLabel !== def.ctaLabel ||
        row.textBody !== def.textBody ||
        (row.preheader ?? "") !== def.preheader ||
        (row.eyebrow ?? "") !== def.eyebrow ||
        !row.enabled,
      updatedAt: row.updatedAt,
    }
  })
}

export async function resolveEmailTemplate(
  key: string
): Promise<ResolvedEmailTemplate | null> {
  const def = getEmailTemplateDefinition(key)
  if (!def) return null

  const row = await prisma.emailTemplate.findUnique({ where: { key } })
  if (!row) return definitionToResolved(def)

  return {
    key: def.key,
    name: row.name || def.name,
    description: row.description ?? def.description,
    category: row.category || def.category,
    subject: row.subject,
    preheader: row.preheader,
    title: row.title,
    eyebrow: row.eyebrow,
    bodyHtml: row.bodyHtml,
    ctaLabel: row.ctaLabel,
    textBody: row.textBody,
    enabled: row.enabled,
    isCustomized: true,
    updatedAt: row.updatedAt,
  }
}

function wrapBodyParagraphs(html: string): string {
  const trimmed = html.trim()
  if (!trimmed) return ""
  // If admin already included block tags, use as-is; otherwise wrap as a paragraph.
  if (/<(p|div|table|ul|ol|h[1-6])\b/i.test(trimmed)) {
    return trimmed
  }
  return emailParagraph(trimmed)
}

export function buildTemplatedEmailHtml(params: {
  template: ResolvedEmailTemplate
  vars: Record<string, string | null | undefined>
  name?: string | null
  detailsHtml?: string
  afterDetailsHtml?: string
  ctaUrl?: string | null
}): { subject: string; html: string; text: string; preheader: string; title: string } {
  const { template, vars, name, detailsHtml, afterDetailsHtml, ctaUrl } = params
  const merged = { ...vars, name: vars.name ?? name ?? "" }

  const subject = interpolateTemplate(template.subject, merged)
  const preheader = interpolateTemplate(template.preheader ?? "", merged)
  const title = interpolateTemplate(template.title, merged)
  const eyebrow = interpolateTemplate(template.eyebrow ?? "", merged)
  const bodyInner = wrapBodyParagraphs(interpolateTemplate(template.bodyHtml, merged))
  const text = interpolateTemplate(template.textBody, merged)
  const ctaLabel = template.ctaLabel
    ? interpolateTemplate(template.ctaLabel, merged)
    : undefined

  const bodyHtml = `
    ${emailGreeting(name ?? merged.name)}
    ${bodyInner}
    ${detailsHtml ?? ""}
    ${afterDetailsHtml ?? ""}
  `

  return {
    subject,
    preheader,
    title,
    text,
    html: layoutEmail({
      preheader: preheader || undefined,
      title,
      eyebrow: eyebrow || undefined,
      bodyHtml,
      ctaLabel: ctaUrl && ctaLabel ? ctaLabel : undefined,
      ctaUrl: ctaUrl && ctaLabel ? ctaUrl : undefined,
    }),
  }
}

export type SendFromTemplateResult =
  | (SendEmailResult & { skipped?: false })
  | { ok: true; skipped: true; reason: "disabled" | "missing_template" }

export async function sendFromTemplate(params: {
  key: string
  to: string
  vars?: Record<string, string | null | undefined>
  name?: string | null
  detailsHtml?: string
  afterDetailsHtml?: string
  ctaUrl?: string | null
  attachments?: EmailAttachment[]
  replyTo?: string
}): Promise<SendFromTemplateResult> {
  const template = await resolveEmailTemplate(params.key)
  if (!template) {
    return { ok: true, skipped: true, reason: "missing_template" }
  }
  if (!template.enabled) {
    return { ok: true, skipped: true, reason: "disabled" }
  }

  const built = buildTemplatedEmailHtml({
    template,
    vars: params.vars ?? {},
    name: params.name,
    detailsHtml: params.detailsHtml,
    afterDetailsHtml: params.afterDetailsHtml,
    ctaUrl: params.ctaUrl,
  })

  const result = await sendEmail({
    to: params.to,
    subject: built.subject,
    html: built.html,
    text: built.text,
    attachments: params.attachments,
    replyTo: params.replyTo,
  })

  return { ...result, skipped: false }
}

export async function previewEmailTemplate(params: {
  key: string
  overrides?: Partial<{
    subject: string
    preheader: string | null
    title: string
    eyebrow: string | null
    bodyHtml: string
    ctaLabel: string | null
    textBody: string
  }>
  vars?: Record<string, string>
}): Promise<{ subject: string; html: string; text: string } | null> {
  const base = await resolveEmailTemplate(params.key)
  if (!base) return null
  const def = getEmailTemplateDefinition(params.key)
  const template: ResolvedEmailTemplate = {
    ...base,
    ...params.overrides,
  }
  const sampleVars = Object.fromEntries(
    (def?.variables ?? []).map((v) => [v.key, v.sample])
  )
  const vars = { ...sampleVars, ...params.vars }
  const detailsHtml = emailParagraph(
    `<em style="color:#71717A;">[Dynamic details for this email — event info, booking card, etc. — are inserted here when sent.]</em>`
  )
  const built = buildTemplatedEmailHtml({
    template,
    vars,
    name: vars.name || "Jane Doe",
    detailsHtml,
    ctaUrl: vars.onboardingUrl || vars.bookingUrl || vars.eventUrl || vars.payUrl || vars.actionUrl || vars.billingUrl || vars.inviteUrl || vars.resetUrl || "https://example.com",
  })
  return { subject: built.subject, html: built.html, text: built.text }
}

export function escapeVar(value: string): string {
  return escapeHtml(value)
}
