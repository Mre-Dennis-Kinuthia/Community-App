import { prisma } from "@/lib/prisma"
import { mapPublicExpert } from "@/lib/experts"
import { MEMBERSHIP_TIERS } from "@/lib/membership-tier"

export async function ensureEirMembership(userId: string) {
  await prisma.memberProfile.upsert({
    where: { userId },
    create: {
      userId,
      skills: [],
      availability: [],
      interests: [],
      memberType: "expert_in_residence",
      membershipTier: MEMBERSHIP_TIERS.EXPERT_IN_RESIDENCE,
      meetingRoomFreeMinutesUsed: 0,
    },
    update: {
      memberType: "expert_in_residence",
      membershipTier: MEMBERSHIP_TIERS.EXPERT_IN_RESIDENCE,
    },
  })
}

export async function findLinkedExpert(userId: string, email: string | null | undefined) {
  const normalized = email?.toLowerCase().trim() || null
  const expert = await prisma.expertInResidence.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { userId },
        ...(normalized ? [{ email: { equals: normalized, mode: "insensitive" as const } }] : []),
      ],
    },
  })
  if (!expert) return null

  if (!expert.userId) {
    const linked = await prisma.expertInResidence.update({
      where: { id: expert.id },
      data: { userId },
    })
    await ensureEirMembership(userId)
    return linked
  }

  return expert
}

export function serializeLinkedExpert(expert: NonNullable<Awaited<ReturnType<typeof findLinkedExpert>>>) {
  return {
    ...mapPublicExpert(expert),
    email: expert.email,
    isPublished: expert.isPublished,
    canHostEvents: true,
  }
}
