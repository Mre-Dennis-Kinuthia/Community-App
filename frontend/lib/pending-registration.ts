export type PendingRegistration = {
  id: string
  submittedAt: string
  email: string
  firstName: string | null
  lastName: string | null
  name: string | null
  membershipIntent: "organisational" | "community"
  acceptedTerms: true
  source: "register"
}

export type PendingRegistrationFile = {
  updatedAt: string
  signups: PendingRegistration[]
}

export function buildPendingRegistration(input: {
  email: string
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  organisational?: boolean
  submittedAt?: Date
}): PendingRegistration {
  const firstName = input.firstName?.trim() || null
  const lastName = input.lastName?.trim() || null
  const combined = [firstName, lastName].filter(Boolean).join(" ").trim()
  const name = input.name?.trim() || combined || null
  const submittedAt = (input.submittedAt ?? new Date()).toISOString()

  return {
    id: `signup_${submittedAt.replace(/[:.]/g, "-")}_${input.email.replace(/[^a-z0-9]+/gi, "_")}`,
    submittedAt,
    email: input.email.toLowerCase().trim(),
    firstName,
    lastName,
    name,
    membershipIntent: input.organisational ? "organisational" : "community",
    acceptedTerms: true,
    source: "register",
  }
}

export function mergePendingRegistrationFile(
  existing: PendingRegistrationFile | null,
  signup: PendingRegistration
): PendingRegistrationFile {
  const signups = existing?.signups ?? []
  const withoutEmail = signups.filter((row) => row.email !== signup.email)
  return {
    updatedAt: signup.submittedAt,
    signups: [...withoutEmail, signup],
  }
}
