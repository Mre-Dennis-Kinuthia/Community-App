import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { z } from "zod"
import { imageRefSchema } from "@/lib/image-url-schema"
import { isOnboardingComplete } from "@/lib/member-segmentation"
import { shouldShowOnboardingNudge } from "@/lib/onboarding-reminders"
import { buildMembershipSummary } from "@/lib/membership-profile"
import { assignMembershipTierForUser } from "@/lib/membership-tier-resolve"
import { maybeNotifyMembershipTierUpgrade } from "@/lib/membership-tier-notify"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"
import { touchMemberLastActiveInBackground } from "@/lib/member-activity"
import {
  memberSocialLinksSchema,
  parseMemberSocialLinks,
  socialLinksFromInput,
  validateLinkedInInput,
} from "@/lib/member-social-links"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const profileSelect = {
  bio: true,
  skills: true,
  location: true,
  industry: true,
  role: true,
  memberType: true,
  membershipTier: true,
  meetingRoomFreeMinutesUsed: true,
  meetingRoomAllowancePeriodStart: true,
  organization: true,
  experienceLevel: true,
  availability: true,
  interests: true,
  socialLinks: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  },
} as const

function formatProfileResponse<
  T extends {
    socialLinks?: unknown
    membershipTier?: string | null
    meetingRoomFreeMinutesUsed?: number
    meetingRoomAllowancePeriodStart?: Date | null
  },
>(profile: T) {
  const { membershipTier, meetingRoomFreeMinutesUsed, meetingRoomAllowancePeriodStart, ...rest } =
    profile
  return {
    ...rest,
    socialLinks: parseMemberSocialLinks(profile.socialLinks),
    membership: buildMembershipSummary({
      membershipTier: membershipTier ?? null,
      meetingRoomFreeMinutesUsed: meetingRoomFreeMinutesUsed ?? 0,
      meetingRoomAllowancePeriodStart:
        meetingRoomAllowancePeriodStart ?? null,
    }),
  }
}

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  image: imageRefSchema,
  bio: z.union([z.string(), z.null()]).optional(),
  skills: z.array(z.string()).optional(),
  location: z.union([z.string(), z.null()]).optional(),
  industry: z.union([z.string(), z.null()]).optional(),
  role: z.union([z.string(), z.null()]).optional(),
  memberType: z.union([z.string(), z.null()]).optional(),
  organization: z.union([z.string(), z.null()]).optional(),
  experienceLevel: z.union([z.string(), z.null()]).optional(),
  availability: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  socialLinks: memberSocialLinksSchema,
})

/**
 * GET /api/profile
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      )
    }

    const userId = await resolveUserIdFromSession(session)
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      )
    }

    touchMemberLastActiveInBackground(userId)

    const accountMeta = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    })

    const userEmail =
      typeof session.user.email === "string"
        ? session.user.email.toLowerCase().trim()
        : null

    if (userEmail) {
      const tierResult = await assignMembershipTierForUser(userId, userEmail, {
        defaultCommunity: true,
      })
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      })
      maybeNotifyMembershipTierUpgrade({
        email: userEmail,
        name: dbUser?.name,
        result: tierResult,
      })
    }

    const profile = await prisma.memberProfile.findUnique({
      where: { userId },
      select: profileSelect,
    })

    if (!profile) {
      // Create empty profile if it doesn't exist
      const newProfile = await prisma.memberProfile.create({
        data: {
          userId,
          // These fields are required in the DB schema (non-null arrays).
          // Provide safe defaults so new users don't 500 on first load.
          skills: [],
          availability: [],
          interests: [],
        },
        select: profileSelect,
      })
      const [connections, events, projects, following, followers] = await Promise.all([
        prisma.connection.count({
          where: {
            status: "accepted",
            OR: [{ fromUserId: userId }, { toUserId: userId }],
          },
        }),
        prisma.eventRegistration.count({
          where: { userId, status: { not: "cancelled" } },
        }),
        prisma.project.count({
          where: { founderId: userId, deletedAt: null },
        }),
        prisma.follow.count({
          where: { followerId: userId },
        }),
        prisma.follow.count({
          where: { followingId: userId },
        }),
      ])
      const needsOnboarding = !isOnboardingComplete(newProfile)
      return NextResponse.json(
        {
          profile: formatProfileResponse(newProfile),
          needsOnboarding,
          showOnboardingNudge:
            needsOnboarding && accountMeta
              ? shouldShowOnboardingNudge(accountMeta.createdAt)
              : false,
          stats: { connections, events, projects, following, followers },
        },
        { headers: corsHeaders }
      )
    }

    const [connections, events, projects, following, followers] = await Promise.all([
      prisma.connection.count({
        where: {
          status: "accepted",
          OR: [{ fromUserId: userId }, { toUserId: userId }],
        },
      }),
      prisma.eventRegistration.count({
        where: { userId, status: { not: "cancelled" } },
      }),
      prisma.project.count({
        where: { founderId: userId, deletedAt: null },
      }),
      prisma.follow.count({
        where: { followerId: userId },
      }),
      prisma.follow.count({
        where: { followingId: userId },
      }),
    ])

    const needsOnboarding = !isOnboardingComplete(profile)
    return NextResponse.json(
      {
        profile: formatProfileResponse(profile),
        needsOnboarding,
        showOnboardingNudge:
          needsOnboarding && accountMeta
            ? shouldShowOnboardingNudge(accountMeta.createdAt)
            : false,
        stats: { connections, events, projects, following, followers },
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[PROFILE API] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch profile",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

/**
 * PUT /api/profile
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      )
    }

    const userId = await resolveUserIdFromSession(session)
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const validatedData = profileUpdateSchema.parse(body)
    const { name: nameUpdate, image: imageUpdate, socialLinks: socialLinksInput, ...profileData } =
      validatedData

    if (socialLinksInput?.linkedin) {
      const linkedinError = validateLinkedInInput(socialLinksInput.linkedin)
      if (linkedinError) {
        return NextResponse.json(
          { error: linkedinError },
          { status: 400, headers: corsHeaders }
        )
      }
    }

    const socialLinksPayload =
      socialLinksInput !== undefined
        ? socialLinksFromInput(socialLinksInput ?? undefined)
        : undefined

    const userUpdates: { name?: string; image?: string | null } = {}
    if (nameUpdate !== undefined && nameUpdate.trim()) {
      userUpdates.name = nameUpdate.trim()
    }
    if (imageUpdate !== undefined) {
      userUpdates.image = imageUpdate
    }
    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdates,
      })
    }

    // Upsert profile (exclude name from profile model)
    const profile = await prisma.memberProfile.upsert({
      where: { userId },
      update: {
        ...profileData,
        skills: profileData.skills ?? [],
        availability: profileData.availability ?? [],
        interests: profileData.interests ?? [],
        ...(socialLinksPayload !== undefined ? { socialLinks: socialLinksPayload } : {}),
        updatedAt: new Date(),
      },
      create: {
        userId,
        ...profileData,
        skills: profileData.skills ?? [],
        availability: profileData.availability ?? [],
        interests: profileData.interests ?? [],
        ...(socialLinksPayload !== undefined ? { socialLinks: socialLinksPayload } : {}),
      },
      select: profileSelect,
    })

    return NextResponse.json(
      { message: "Profile updated successfully", profile: formatProfileResponse(profile) },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[PROFILE API] Error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid profile data",
          details: error.errors,
        },
        { status: 400, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
