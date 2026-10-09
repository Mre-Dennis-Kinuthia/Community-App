/** Booking / membership rules for when a badge should be granted or revoked. */

export function hikvisionEmployeeNo(
  kind: "user" | "visitor",
  id: string
): string {
  const prefix = kind === "visitor" ? "V" : "U"
  const compact = id.replace(/[^a-zA-Z0-9]/g, "")
  return `${prefix}${compact.slice(0, 31 - prefix.length)}`
}

export function bookingAccessAction(booking: {
  status: string
  paymentStatus?: string | null
  totalPrice?: number | string | null
}): "grant" | "revoke" | "none" {
  if (booking.status === "cancelled") return "revoke"
  if (booking.status !== "confirmed") return "none"
  const price = Number(booking.totalPrice ?? 0)
  if (price > 0 && booking.paymentStatus !== "paid") return "none"
  return "grant"
}

export type AccessCredentialStatus = "pending" | "active" | "revoked"

export type AccessSyncAction = "upsert_user" | "grant_card" | "revoke_card"

export type CredentialSnapshot = {
  id: string
  userId: string | null
  visitorId: string | null
  cardNo: string
  employeeNo: string
  status: AccessCredentialStatus
}

export type AccessJobPlan = {
  action: AccessSyncAction
  payload: Record<string, unknown>
}

export function liveCredentials(credentials: CredentialSnapshot[]) {
  return credentials.filter((c) => c.status === "pending" || c.status === "active")
}

export function planGrantExistingCard(args: {
  credentials: CredentialSnapshot[]
  validFrom?: Date
  validUntil?: Date
  name?: string
  locationId?: string | null
  bookingId?: string | null
  checkInId?: string | null
}): { kind: "skip" } | { kind: "update"; credential: CredentialSnapshot; jobs: AccessJobPlan[] } {
  const live = liveCredentials(args.credentials)
  const credential = live[0]
  if (!credential) return { kind: "skip" }

  const payload = {
    credentialId: credential.id,
    employeeNo: credential.employeeNo,
    cardNo: credential.cardNo,
    name: args.name ?? credential.employeeNo,
    validFrom: args.validFrom?.toISOString() ?? null,
    validUntil: args.validUntil?.toISOString() ?? null,
    locationId: args.locationId ?? null,
    bookingId: args.bookingId ?? null,
    checkInId: args.checkInId ?? null,
  }

  return {
    kind: "update",
    credential,
    jobs: [
      { action: "upsert_user", payload },
      { action: "grant_card", payload },
    ],
  }
}

export function planIssueCard(args: {
  userId?: string
  visitorId?: string
  cardNo: string
  name?: string
  existing: CredentialSnapshot[]
  validFrom?: Date
  validUntil?: Date
}): {
  revokeIds: string[]
  employeeNo: string
  jobsForNew: AccessJobPlan[]
} {
  const cardNo = args.cardNo.trim()
  const kind = args.visitorId ? "visitor" : "user"
  const subjectId = args.visitorId ?? args.userId ?? ""
  const employeeNo = hikvisionEmployeeNo(kind, subjectId)
  const revokeIds = liveCredentials(args.existing).map((c) => c.id)
  const payload = {
    employeeNo,
    cardNo,
    name: args.name ?? employeeNo,
    validFrom: args.validFrom?.toISOString() ?? null,
    validUntil: args.validUntil?.toISOString() ?? null,
    userId: args.userId ?? null,
    visitorId: args.visitorId ?? null,
  }

  return {
    revokeIds,
    employeeNo,
    jobsForNew: [
      { action: "upsert_user", payload },
      { action: "grant_card", payload },
    ],
  }
}

export function planRevokeCards(credentials: CredentialSnapshot[]): {
  revokeIds: string[]
  jobs: AccessJobPlan[]
} {
  const live = liveCredentials(credentials)
  return {
    revokeIds: live.map((c) => c.id),
    jobs: live.map((c) => ({
      action: "revoke_card" as const,
      payload: {
        credentialId: c.id,
        employeeNo: c.employeeNo,
        cardNo: c.cardNo,
      },
    })),
  }
}

export function parseHikvisionConfig(config: unknown): {
  baseUrl: string
  doorRight: string
  planTemplateNo: string
} {
  const raw = config && typeof config === "object" ? (config as Record<string, unknown>) : {}
  const baseUrl =
    typeof raw.baseUrl === "string" && raw.baseUrl.trim()
      ? raw.baseUrl.trim()
      : "http://10.136.7.253"
  const doorRight = typeof raw.doorRight === "string" && raw.doorRight.trim() ? raw.doorRight.trim() : "1"
  const planTemplateNo =
    typeof raw.planTemplateNo === "string" && raw.planTemplateNo.trim()
      ? raw.planTemplateNo.trim()
      : "1"
  return { baseUrl, doorRight, planTemplateNo }
}
