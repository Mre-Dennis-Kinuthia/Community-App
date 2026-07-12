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
<<<<<<< HEAD
  id?: string
  key: string
  slot: string
=======
  key: string
>>>>>>> 35150d0b7b1ca08c599114d94918d96603e73111
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
<<<<<<< HEAD
  isActive: boolean
  isSystem: boolean
=======
>>>>>>> 35150d0b7b1ca08c599114d94918d96603e73111
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
<<<<<<< HEAD
    slot: def.key,
=======
>>>>>>> 35150d0b7b1ca08c599114d94918d96603e73111
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
<<<<<<< HEAD
    isActive: true,
    isSystem: true,
=======
>>>>>>> 35150d0b7b1ca08c599114d94918d96603e73111
    isCustomized: false,
    updatedAt: null,
  }
}

<<<<<<< HEAD
function rowToResolved(
  row: {
    id: string
    key: string
    slot: string
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
    isActive: boolean
    isSystem: boolean
    updatedAt: Date
  },
  def?: EmailTemplateDefinition
): ResolvedEmailTemplate {
  const slotDef = def ?? getEmailTemplateDefinition(row.slot)
  return {
    id: row.id,
    key: row.key,
    slot: row.slot || row.key,
    name: row.name || slotDef?.name || row.key,
    description: row.description ?? slotDef?.description ?? null,
    category: row.category || slotDef?.category || "community",
=======
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
>>>>>>> 35150d0b7b1ca08c599114d94918d96603e73111
    subject: row.subject,
    preheader: row.preheader,
    title: row.title,
    eyebrow: row.eyebrow,
    bodyHtml: row.bodyHtml,
    ctaLabel: row.ctaLabel,
    textBody: row.textBody,
    enabled: row.enabled,
<<<<<<< HEAD
    isActive: row.isActive,
    isSystem: row.isSystem,
    isCustomized: !row.isSystem || !!(slotDef && (
      row.subject !== slotDef.subject ||
      row.title !== slotDef.title ||
      row.bodyHtml !== slotDef.bodyHtml ||
      row.ctaLabel !== slotDef.ctaLabel ||
      row.textBody !== slotDef.textBody
    )),
=======
    isCustomized: true,
>>>>>>> 35150d0b7b1ca08c599114d94918d96603e73111
    updatedAt: row.updatedAt,
  }
}

<<<<<<< HEAD
export function slugifyTemplateKey(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48)
  return base || `template_${Date.now()}`
}

export async function ensureUniqueTemplateKey(base: string): Promise<string> {
  let key = base
  let n = 2
  while (await prisma.emailTemplate.findUnique({ where: { key }, select: { id: true } })) {
    key = `${base}_${n}`
    n += 1
  }
  return key
}

export async function ensureEmailTemplatesSeeded(): Promise<void> {
  const existing = await prisma.emailTemplate.findMany({
    select: { key: true, slot: true, isActive: true },
  })
  const existingKeys = new Set(existing.map((r) => r.key))
  const missing = EMAIL_TEMPLATE_CATALOG.filter((d) => !existingKeys.has(d.key))

  if (missing.length > 0) {
    await prisma.emailTemplate.createMany({
      data: missing.map((d) => ({
        key: d.key,
        slot: d.key,
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
        isActive: true,
        isSystem: true,
      })),
      skipDuplicates: true,
    })
  }

  // Ensure every catalog slot has exactly one active template when none is active
  const slots = await prisma.emailTemplate.groupBy({
    by: ["slot"],
    where: { isActive: true },
    _count: true,
  })
  const activeSlots = new Set(slots.map((s) => s.slot))
  for (const def of EMAIL_TEMPLATE_CATALOG) {
    if (activeSlots.has(def.key)) continue
    const system = await prisma.emailTemplate.findFirst({
      where: { OR: [{ key: def.key }, { slot: def.key, isSystem: true }] },
      orderBy: { updatedAt: "asc" },
    })
    if (system) {
      await prisma.emailTemplate.update({
        where: { id: system.id },
        data: { isActive: true, slot: def.key },
      })
    }
  }
}

/** Activate this template for its slot; deactivate siblings. */
export async function activateEmailTemplateForSlot(templateId: string): Promise<void> {
  const row = await prisma.emailTemplate.findUnique({ where: { id: templateId } })
  if (!row) throw new Error("Template not found")

  await prisma.$transaction([
    prisma.emailTemplate.updateMany({
      where: { slot: row.slot, NOT: { id: row.id } },
      data: { isActive: false },
    }),
    prisma.emailTemplate.update({
      where: { id: row.id },
      data: { isActive: true, enabled: true },
    }),
  ])
}

export async function listResolvedEmailTemplates(): Promise<ResolvedEmailTemplate[]> {
  await ensureEmailTemplatesSeeded()
  const rows = await prisma.emailTemplate.findMany({
    orderBy: [{ category: "asc" }, { slot: "asc" }, { name: "asc" }],
  })
  return rows.map((row) => rowToResolved(row))
}

export async function listEmailSlots() {
  return EMAIL_TEMPLATE_CATALOG.map((d) => ({
    key: d.key,
    name: d.name,
    description: d.description,
    category: d.category,
    variables: d.variables,
  }))
}

/**
 * Resolve content for a send trigger (`slot`).
 * Prefers the active linked template; falls back to catalog default.
 */
export async function resolveEmailTemplate(
  slot: string
): Promise<ResolvedEmailTemplate | null> {
  const def = getEmailTemplateDefinition(slot)

  const active = await prisma.emailTemplate.findFirst({
    where: { slot, isActive: true },
    orderBy: { updatedAt: "desc" },
  })
  if (active) return rowToResolved(active, def ?? undefined)

  const byKey = await prisma.emailTemplate.findUnique({ where: { key: slot } })
  if (byKey) return rowToResolved(byKey, def ?? undefined)

  if (def) return definitionToResolved(def)
  return null
}

export async function resolveEmailTemplateByKey(
  key: string
): Promise<ResolvedEmailTemplate | null> {
  const row = await prisma.emailTemplate.findUnique({ where: { key } })
  if (row) return rowToResolved(row)
  const def = getEmailTemplateDefinition(key)
  return def ? definitionToResolved(def) : null
}

function wrapBodyParagraphs(html: string): string {
  const trimmed = html.trim()
  if (!trimmed) return ""
=======
function wrapBodyParagraphs(html: string): string {
  const trimmed = html.trim()
  if (!trimmed) return ""
  // If admin already included block tags, use as-is; otherwise wrap as a paragraph.
>>>>>>> 35150d0b7b1ca08c599114d94918d96603e73111
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
<<<<<<< HEAD
  // `key` is the send slot (welcome, booking_confirmation, …)
=======
>>>>>>> 35150d0b7b1ca08c599114d94918d96603e73111
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
<<<<<<< HEAD
    slot?: string
  }>
  vars?: Record<string, string>
}): Promise<{ subject: string; html: string; text: string } | null> {
  const base =
    (await resolveEmailTemplateByKey(params.key)) ??
    (await resolveEmailTemplate(params.key))
  if (!base) return null

  const slot = params.overrides?.slot || base.slot
  const def = getEmailTemplateDefinition(slot)
  const template: ResolvedEmailTemplate = {
    ...base,
    ...params.overrides,
    slot,
=======
  }>
  vars?: Record<string, string>
}): Promise<{ subject: string; html: string; text: string } | null> {
  const base = await resolveEmailTemplate(params.key)
  if (!base) return null
  const def = getEmailTemplateDefinition(params.key)
  const template: ResolvedEmailTemplate = {
    ...base,
    ...params.overrides,
>>>>>>> 35150d0b7b1ca08c599114d94918d96603e73111
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
<<<<<<< HEAD
    ctaUrl:
      vars.onboardingUrl ||
      vars.bookingUrl ||
      vars.eventUrl ||
      vars.payUrl ||
      vars.actionUrl ||
      vars.billingUrl ||
      vars.inviteUrl ||
      vars.resetUrl ||
      "https://example.com",
=======
    ctaUrl: vars.onboardingUrl || vars.bookingUrl || vars.eventUrl || vars.payUrl || vars.actionUrl || vars.billingUrl || vars.inviteUrl || vars.resetUrl || "https://example.com",
>>>>>>> 35150d0b7b1ca08c599114d94918d96603e73111
  })
  return { subject: built.subject, html: built.html, text: built.text }
}

export function escapeVar(value: string): string {
  return escapeHtml(value)
}
