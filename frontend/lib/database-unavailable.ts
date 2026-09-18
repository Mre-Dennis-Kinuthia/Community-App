import { MAINTENANCE_UNTIL_LABEL } from "@/lib/maintenance"

export const DATABASE_UNAVAILABLE_CODE = "database_unavailable"

export const MEMBER_LOGIN_OUTAGE_MESSAGE =
  `The platform is under maintenance. Things will be back to normal by ${MAINTENANCE_UNTIL_LABEL}.`

export const MEMBER_REGISTER_OUTAGE_MESSAGE =
  `You can submit your details now. Come back ${MAINTENANCE_UNTIL_LABEL} to access your account.`

export const MEMBER_REGISTER_QUEUED_MESSAGE =
  `We received your details. Come back ${MAINTENANCE_UNTIL_LABEL} to access your account.`

export const ADMIN_LOGIN_OUTAGE_MESSAGE =
  `The admin platform is under maintenance. Things will be back to normal by ${MAINTENANCE_UNTIL_LABEL}.`

export function isDatabaseUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return typeof error === "string" && matchesUnavailableText(error)
  }

  const record = error as {
    code?: unknown
    message?: unknown
    cause?: unknown
    meta?: { message?: unknown }
  }

  const code = typeof record.code === "string" ? record.code : ""
  if (
    code === "P1001" ||
    code === "P1002" ||
    code === "P1017" ||
    code === "53000" ||
    code === "57P01"
  ) {
    return true
  }

  const chunks = [
    typeof record.message === "string" ? record.message : "",
    typeof record.meta?.message === "string" ? record.meta.message : "",
    stringifyUnknown(error),
  ]

  if (chunks.some(matchesUnavailableText)) return true
  if (record.cause && record.cause !== error) {
    return isDatabaseUnavailableError(record.cause)
  }
  return false
}

function matchesUnavailableText(value: string): boolean {
  return (
    /can't reach database/i.test(value) ||
    /exceeded the quota/i.test(value) ||
    /upgrade your plan to increase limits/i.test(value) ||
    /HTTP status 402/i.test(value) ||
    /code:\s*"?53000"?/i.test(value) ||
    /connection timed out/i.test(value) ||
    /ECONNREFUSED/i.test(value) ||
    /ConnectorError/i.test(value) && /quota|timeout|refused/i.test(value)
  )
}

function stringifyUnknown(error: unknown): string {
  try {
    return String(error)
  } catch {
    return ""
  }
}
