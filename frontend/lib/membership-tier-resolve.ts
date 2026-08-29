import { prisma } from "@/lib/prisma"
import {
  MEMBERSHIP_TIERS,
  type MembershipTier,
  pickHigherTier,
} from "@/lib/membership-tier"
import { MEMBERSHIP_REGISTER_INTENT } from "@/lib/membership-register-intent"
import { membershipTierFromPlan } from "@/lib/membership-tier-sync"
import { supportTicketsMatchingEmailWhere } from "@/lib/support-ticket-email"

const ORGANISATIONAL_TICKET_CATEGORIES = [
  "organisational-registration",
  "organisational-inquiry",
] as const

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

const EMAIL_IN_ANGLE_RE = /<([^>]+@[^>]+)>/
const EMAIL_TOKEN_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi

function extractEmailsFromTicketText(...parts: string[]): Set<string> {
  const found = new Set<string>()
  for (const part of parts) {
    if (!part) continue
    const angle = part.match(EMAIL_IN_ANGLE_RE)
    if (angle?.[1]) found.add(normalizeEmail(angle[1]))
    const tokens = part.match(EMAIL_TOKEN_RE) ?? []
    for (const token of tokens) found.add(normalizeEmail(token))
  }
  return found
}

function ticketMatchesEmail(member: string, description: string, email: string): boolean {
  const normalized = normalizeEmail(email)
  const emails = extractEmailsFromTicketText(member, description)
  return emails.has(normalized)
}

export type DetectMembershipTierOptions = {
  /**
   * Only count org tickets created at or after this time (this account).
   * Prevents a deleted member's leftover tickets from tagging a new signup.
   */
  notBefore?: Date
}

export async function detectMembershipTierFromEmail(
  email: string,
  options: DetectMembershipTierOptions = {}
): Promise<MembershipTier | null> {
  const normalized = normalizeEmail(email)

  const orgTickets = await prisma.supportTicket.findMany({
    where: {
      category: { in: [...ORGANISATIONAL_TICKET_CATEGORIES] },
      ...(options.notBefore ? { createdAt: { gte: options.notBefore } } : {}),
      ...supportTicketsMatchingEmailWhere(normalized),
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { member: true, description: true },
  })

  if (
    orgTickets.some((t) => ticketMatchesEmail(t.member, t.description, normalized))
  ) {
    return MEMBERSHIP_TIERS.ORGANISATIONAL
  }

  // Star Connect tier is set when membership payment completes (see membership-tier-sync).
  return null
}

async function hasActiveOrganisationalSubscription(userId: string): Promise<boolean> {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      deletedAt: null,
      status: { in: ["active", "trialing"] },
    },
    select: { plan: { select: { name: true } } },
  })

  return subscriptions.some(
    (sub) => membershipTierFromPlan(sub.plan) === MEMBERSHIP_TIERS.ORGANISATIONAL
  )
}

export type AssignMembershipTierOptions = {
  explicitIntent?: typeof MEMBERSHIP_REGISTER_INTENT.ORGANISATIONAL | null
  /** When true, set community if nothing else matches */
  defaultCommunity?: boolean
}

export type AssignMembershipTierResult = {
  tier: MembershipTier
  previousTier: MembershipTier | null
  changed: boolean
  source: "intent" | "ticket" | "existing" | "default"
}

export async function assignMembershipTierForUser(
  userId: string,
  email: string,
  options: AssignMembershipTierOptions = {}
): Promise<AssignMembershipTierResult> {
  const [profile, user] = await Promise.all([
    prisma.memberProfile.findUnique({
      where: { userId },
      select: { membershipTier: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    }),
  ])

  const previousTier =
    (profile?.membershipTier as MembershipTier | null) ?? null

  let detected: MembershipTier | null = null
  let source: AssignMembershipTierResult["source"] = "existing"

  if (options.explicitIntent === MEMBERSHIP_REGISTER_INTENT.ORGANISATIONAL) {
    detected = MEMBERSHIP_TIERS.ORGANISATIONAL
    source = "intent"
  } else {
    detected = await detectMembershipTierFromEmail(email, {
      notBefore: user?.createdAt,
    })
    if (detected) source = "ticket"
  }

  let finalTier = pickHigherTier(previousTier, detected)

  // Org from a previous deleted account (or leftover tickets) must not stick
  // on a new signup. pickHigherTier never downgrades, so drop ticket-only org
  // when this account has no qualifying ticket and no paid org plan.
  if (
    options.explicitIntent !== MEMBERSHIP_REGISTER_INTENT.ORGANISATIONAL &&
    previousTier === MEMBERSHIP_TIERS.ORGANISATIONAL &&
    detected !== MEMBERSHIP_TIERS.ORGANISATIONAL &&
    !(await hasActiveOrganisationalSubscription(userId))
  ) {
    finalTier = detected
    source = detected ? "ticket" : "default"
  }

  if (!finalTier && options.defaultCommunity) {
    finalTier = MEMBERSHIP_TIERS.COMMUNITY
    source = "default"
  }

  if (!finalTier) {
    return {
      tier: previousTier ?? MEMBERSHIP_TIERS.COMMUNITY,
      previousTier,
      changed: false,
      source: "existing",
    }
  }

  const changed = previousTier !== finalTier

  if (changed || !profile?.membershipTier) {
    const periodStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
    await prisma.memberProfile.upsert({
      where: { userId },
      create: {
        userId,
        skills: [],
        availability: [],
        interests: [],
        membershipTier: finalTier,
        meetingRoomFreeMinutesUsed: 0,
        meetingRoomAllowancePeriodStart: periodStart,
      },
      update: {
        membershipTier: finalTier,
        ...(changed && finalTier !== previousTier
          ? {
              meetingRoomFreeMinutesUsed: 0,
              meetingRoomAllowancePeriodStart: periodStart,
            }
          : {}),
      },
    })
  }

  return {
    tier: finalTier,
    previousTier,
    changed,
    source,
  }
}
