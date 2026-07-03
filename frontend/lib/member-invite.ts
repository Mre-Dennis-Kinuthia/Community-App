import { prisma } from "@/lib/prisma"

const INVITE_PREFIX = "member-invite:"

export function memberInviteIdentifier(email: string): string {
  return `${INVITE_PREFIX}${email.toLowerCase().trim()}`
}

export async function validateMemberInviteToken(
  email: string,
  token: string
): Promise<{ valid: true } | { valid: false; error: string }> {
  const normalizedEmail = email.toLowerCase().trim()
  const record = await prisma.verificationToken.findFirst({
    where: { identifier: memberInviteIdentifier(normalizedEmail), token },
  })

  if (!record) {
    return { valid: false, error: "Invalid or expired invite link." }
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({
      where: { identifier: memberInviteIdentifier(normalizedEmail), token },
    })
    return {
      valid: false,
      error: "This invite link has expired. Ask your community manager to send a new invite.",
    }
  }

  return { valid: true }
}

export async function consumeMemberInviteToken(email: string, token: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim()
  await prisma.verificationToken.deleteMany({
    where: { identifier: memberInviteIdentifier(normalizedEmail), token },
  })
}
