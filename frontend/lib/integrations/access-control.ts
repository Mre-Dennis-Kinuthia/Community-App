import { prisma } from "@/lib/prisma"
import { isFeatureEnabled } from "@/lib/feature-flags"
import {
  bookingAccessAction,
  planGrantExistingCard,
  planIssueCard,
  planRevokeCards,
  type CredentialSnapshot,
} from "@/lib/integrations/access-policy"

export type AccessGrantContext = {
  userId?: string
  visitorId?: string
  locationId?: string | null
  spaceAssetId?: string | null
  bookingId?: string | null
  checkInId?: string | null
  validFrom?: Date
  validUntil?: Date
  name?: string
  cardNo?: string
}

export interface AccessControlProvider {
  readonly name: string
  grantAccess(ctx: AccessGrantContext): Promise<void>
  revokeAccess(ctx: AccessGrantContext): Promise<void>
}

class NullAccessProvider implements AccessControlProvider {
  readonly name = "null"

  async grantAccess(_ctx: AccessGrantContext): Promise<void> {}

  async revokeAccess(_ctx: AccessGrantContext): Promise<void> {}
}

function toSnapshot(row: {
  id: string
  userId: string | null
  visitorId: string | null
  cardNo: string
  employeeNo: string
  status: CredentialSnapshot["status"]
}): CredentialSnapshot {
  return row
}

async function hikvisionIntegrationActive() {
  if (!isFeatureEnabled("accessControl")) return false
  try {
    const integration = await prisma.accessControlIntegration.findFirst({
      where: { isActive: true, provider: "hikvision" },
      orderBy: { updatedAt: "desc" },
    })
    return Boolean(integration)
  } catch {
    return false
  }
}

async function loadSubjectCredentials(ctx: AccessGrantContext) {
  if (!ctx.userId && !ctx.visitorId) return []
  return prisma.accessCredential.findMany({
    where: ctx.userId ? { userId: ctx.userId } : { visitorId: ctx.visitorId },
    orderBy: { updatedAt: "desc" },
  })
}

async function enqueueJobs(
  credentialId: string,
  jobs: { action: "upsert_user" | "grant_card" | "revoke_card"; payload: Record<string, unknown> }[]
) {
  const now = new Date()
  await prisma.accessSyncJob.createMany({
    data: jobs.map((job) => ({
      credentialId,
      action: job.action,
      payload: { ...job.payload, credentialId },
      status: "pending",
      createdAt: now,
      updatedAt: now,
    })),
  })
}

class HikvisionOutboxProvider implements AccessControlProvider {
  readonly name = "hikvision-outbox"

  async grantAccess(ctx: AccessGrantContext): Promise<void> {
    if (!(await hikvisionIntegrationActive())) return

    const rows = await loadSubjectCredentials(ctx)
    const plan = planGrantExistingCard({
      credentials: rows.map(toSnapshot),
      validFrom: ctx.validFrom,
      validUntil: ctx.validUntil,
      name: ctx.name,
      locationId: ctx.locationId,
      bookingId: ctx.bookingId,
      checkInId: ctx.checkInId,
    })
    if (plan.kind === "skip") return

    await prisma.accessCredential.update({
      where: { id: plan.credential.id },
      data: {
        validFrom: ctx.validFrom ?? undefined,
        validUntil: ctx.validUntil ?? undefined,
        lastSyncError: null,
      },
    })
    await enqueueJobs(plan.credential.id, plan.jobs)
  }

  async revokeAccess(ctx: AccessGrantContext): Promise<void> {
    if (!(await hikvisionIntegrationActive())) return

    const rows = await loadSubjectCredentials(ctx)
    const plan = planRevokeCards(rows.map(toSnapshot))
    if (plan.revokeIds.length === 0) return

    await prisma.accessCredential.updateMany({
      where: { id: { in: plan.revokeIds } },
      data: { status: "revoked", lastSyncError: null },
    })

    for (const job of plan.jobs) {
      const credentialId = String(job.payload.credentialId ?? "")
      if (!credentialId) continue
      await enqueueJobs(credentialId, [job])
    }
  }
}

export async function issueAccessCard(ctx: AccessGrantContext & { cardNo: string }) {
  if (!(await hikvisionIntegrationActive())) {
    throw new Error("Hikvision access control is not connected")
  }
  const cardNo = ctx.cardNo.trim()
  if (!cardNo) throw new Error("Card number is required")
  if (!ctx.userId && !ctx.visitorId) throw new Error("Member or visitor is required")

  const duplicate = await prisma.accessCredential.findUnique({ where: { cardNo } })
  if (duplicate && duplicate.status !== "revoked") {
    throw new Error("That card is already assigned")
  }

  const rows = await loadSubjectCredentials(ctx)
  const plan = planIssueCard({
    userId: ctx.userId,
    visitorId: ctx.visitorId,
    cardNo,
    name: ctx.name,
    existing: rows.map(toSnapshot),
    validFrom: ctx.validFrom,
    validUntil: ctx.validUntil,
  })

  if (plan.revokeIds.length > 0) {
    await prisma.accessCredential.updateMany({
      where: { id: { in: plan.revokeIds } },
      data: { status: "revoked" },
    })
    const revokePlan = planRevokeCards(rows.map(toSnapshot))
    for (const job of revokePlan.jobs) {
      const credentialId = String(job.payload.credentialId ?? "")
      if (credentialId) await enqueueJobs(credentialId, [job])
    }
  }

  const created = await prisma.accessCredential.create({
    data: {
      userId: ctx.userId,
      visitorId: ctx.visitorId,
      cardNo,
      employeeNo: plan.employeeNo,
      status: "pending",
      validFrom: ctx.validFrom,
      validUntil: ctx.validUntil,
    },
  })

  await enqueueJobs(
    created.id,
    plan.jobsForNew.map((job) => ({
      ...job,
      payload: { ...job.payload, credentialId: created.id },
    }))
  )

  return created
}

let provider: AccessControlProvider = new NullAccessProvider()

export function setAccessControlProvider(next: AccessControlProvider) {
  provider = next
}

export function getAccessControlProvider(): AccessControlProvider {
  return provider
}

async function loadActiveProvider(): Promise<AccessControlProvider> {
  if (!isFeatureEnabled("accessControl")) return new NullAccessProvider()
  if (await hikvisionIntegrationActive()) return new HikvisionOutboxProvider()
  return new NullAccessProvider()
}

export async function grantMemberAccess(ctx: AccessGrantContext): Promise<void> {
  const active = await loadActiveProvider()
  await active.grantAccess(ctx)
}

export async function revokeMemberAccess(ctx: AccessGrantContext): Promise<void> {
  const active = await loadActiveProvider()
  await active.revokeAccess(ctx)
}

export async function syncAccessForCheckIn(checkIn: {
  id: string
  userId: string
  locationId: string
}): Promise<void> {
  await grantMemberAccess({
    userId: checkIn.userId,
    locationId: checkIn.locationId,
    checkInId: checkIn.id,
    validFrom: new Date(),
  })
}

export async function syncAccessForBooking(booking: {
  id: string
  userId: string
  spaceAssetId?: string | null
  date: Date
  endTime?: string | null
  status: string
  paymentStatus?: string | null
  totalPrice?: number | string | null
}): Promise<void> {
  const action = bookingAccessAction(booking)
  if (action === "revoke") {
    await revokeMemberAccess({
      userId: booking.userId,
      spaceAssetId: booking.spaceAssetId,
      bookingId: booking.id,
    })
    return
  }

  if (action !== "grant") return

  const validUntil = new Date(booking.date)
  if (booking.endTime) {
    const [h, m] = booking.endTime.split(":").map(Number)
    validUntil.setHours(h, m ?? 0, 0, 0)
  } else {
    validUntil.setHours(23, 59, 59, 999)
  }

  await grantMemberAccess({
    userId: booking.userId,
    spaceAssetId: booking.spaceAssetId,
    bookingId: booking.id,
    validFrom: booking.date,
    validUntil,
  })
}

export async function syncAccessForSubscription(
  userId: string,
  opts: { active: boolean; name?: string }
): Promise<void> {
  if (opts.active) {
    await grantMemberAccess({ userId, name: opts.name })
    return
  }
  await revokeMemberAccess({ userId })
}

