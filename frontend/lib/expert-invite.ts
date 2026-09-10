import { prisma } from "@/lib/prisma"
import { EIR_INVITE_PREFIX } from "@/lib/experts"

export function eirInviteIdentifier(email: string): string {
  return `${EIR_INVITE_PREFIX}${email.toLowerCase().trim()}`
}

export async function validateEirInviteToken(
  email: string,
  token: string
): Promise<{ valid: true } | { valid: false; error: string }> {
  const normalizedEmail = email.toLowerCase().trim()
  const record = await prisma.verificationToken.findFirst({
    where: { identifier: eirInviteIdentifier(normalizedEmail), token },
  })

  if (!record) {
    return { valid: false, error: "Invalid or expired Expert in Residence invite." }
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: eirInviteIdentifier(normalizedEmail), token },
    })
    return {
      valid: false,
      error: "This invite link has expired. Ask the Hub team to send a new invite.",
    }
  }

  return { valid: true }
}

export async function consumeEirInviteToken(email: string, token: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim()
  await prisma.verificationToken.deleteMany({
    where: { identifier: eirInviteIdentifier(normalizedEmail), token },
  })
}
