import { prisma } from "@/lib/prisma"
import {
  buildExpertProfileSyncData,
  mapPublicExpert,
  type ExpertProfileSyncPatch,
} from "@/lib/experts"
import { MEMBERSHIP_TIERS } from "@/lib/membership-tier"

export const expertUserOverlaySelect = {
  name: true,
  image: true,
  profile: {
    select: {
      bio: true,
      organization: true,
      industry: true,
      role: true,
      location: true,
      skills: true,
      socialLinks: true,
    },
  },
} as const

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

const expertInclude = {
  user: { select: expertUserOverlaySelect },
  availabilityWindows: { orderBy: [{ weekday: "asc" as const }, { startTime: "asc" as const }] },
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
    include: expertInclude,
  })
  if (!expert) return null

  if (!expert.userId) {
    const linked = await prisma.expertInResidence.update({
      where: { id: expert.id },
      data: { userId },
      include: expertInclude,
    })
    await ensureEirMembership(userId)
    return linked
  }

  return expert
}

export async function syncLinkedExpertFromProfileUpdate(
  userId: string,
  email: string | null | undefined,
  patch: ExpertProfileSyncPatch
) {
  const expert = await findLinkedExpert(userId, email)
  if (!expert) return null

  const data = buildExpertProfileSyncData(expert, patch)
  if (Object.keys(data).length === 0) return expert

  return prisma.expertInResidence.update({
    where: { id: expert.id },
    data,
    include: expertInclude,
  })
}

export function bookedRangesFromMeetings(
  meetings: Array<{ scheduledAt: Date | null; scheduledEndAt: Date | null; status: string }>
) {
  return meetings
    .filter(
      (row) =>
        row.scheduledAt &&
        row.scheduledEndAt &&
        row.status !== "declined" &&
        row.status !== "cancelled"
    )
    .map((row) => ({
      start: row.scheduledAt as Date,
      end: row.scheduledEndAt as Date,
    }))
}

export function serializeAvailabilityWindows(
  windows: Array<{ id: string; weekday: number; startTime: string; endTime: string }>
) {
  return windows.map((window) => ({
    id: window.id,
    weekday: window.weekday,
    startTime: window.startTime,
    endTime: window.endTime,
  }))
}

export function serializeLinkedExpert(expert: NonNullable<Awaited<ReturnType<typeof findLinkedExpert>>>) {
  return {
    ...mapPublicExpert(expert),
    email: expert.email,
    isPublished: expert.isPublished,
    canHostEvents: true,
    availabilityWindows: serializeAvailabilityWindows(expert.availabilityWindows),
  }
}

export async function replaceExpertAvailabilityWindows(
  expertId: string,
  windows: Array<{ weekday: number; startTime: string; endTime: string }>
) {
  await prisma.$transaction([
    prisma.expertAvailabilityWindow.deleteMany({ where: { expertId } }),
    ...(windows.length
      ? [
          prisma.expertAvailabilityWindow.createMany({
            data: windows.map((window) => ({
              expertId,
              weekday: window.weekday,
              startTime: window.startTime,
              endTime: window.endTime,
            })),
          }),
        ]
      : []),
  ])
}
