import { createHash, randomBytes } from "node:crypto"
import { prisma } from "@/lib/prisma"

export function hashEmailActionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export async function issueEmailActionToken(params: {
  purpose: string
  subjectId: string
  expiresAt: Date
}): Promise<{ token: string; tokenHash: string }> {
  const token = randomBytes(32).toString("base64url")
  const tokenHash = hashEmailActionToken(token)

  await prisma.emailActionToken.upsert({
    where: {
      purpose_subjectId: {
        purpose: params.purpose,
        subjectId: params.subjectId,
      },
    },
    create: {
      purpose: params.purpose,
      subjectId: params.subjectId,
      tokenHash,
      expiresAt: params.expiresAt,
    },
    update: {
      tokenHash,
      expiresAt: params.expiresAt,
      createdAt: new Date(),
    },
  })

  return { token, tokenHash }
}
