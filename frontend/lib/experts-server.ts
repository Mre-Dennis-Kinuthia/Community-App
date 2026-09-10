import { prisma } from "@/lib/prisma"
import { mapPublicExpert } from "@/lib/experts"

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
  if (expert && !expert.userId) {
    return prisma.expertInResidence.update({
      where: { id: expert.id },
      data: { userId },
    })
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
