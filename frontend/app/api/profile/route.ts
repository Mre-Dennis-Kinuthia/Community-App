import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { z } from "zod"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

async function resolveUserIdFromSession(session: Awaited<ReturnType<typeof auth>>) {
  const sessionUser = session?.user
  if (!sessionUser) return null

  // Try by session user id first.
  if (typeof sessionUser.id === "string") {
    const existing = await prisma.user.findUnique({ where: { id: sessionUser.id } })
    if (existing) return existing.id
  }

  // Fallback to email. Create the user if it's missing to satisfy FK constraints.
  const email = typeof sessionUser.email === "string" ? sessionUser.email.toLowerCase().trim() : null
  if (!email) return null

  const upserted = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: typeof sessionUser.name === "string" ? sessionUser.name : null,
      image: typeof (sessionUser as any).image === "string" ? (sessionUser as any).image : null,
    },
    update: {
      name: typeof sessionUser.name === "string" ? sessionUser.name : undefined,
      image: typeof (sessionUser as any).image === "string" ? (sessionUser as any).image : undefined,
    },
  })

  return upserted.id
}

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  role: z.string().optional(),
  experienceLevel: z.string().optional(),
  availability: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
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

    const profile = await prisma.memberProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
    })

    if (!profile) {
      // Create empty profile if it doesn't exist
      const newProfile = await prisma.memberProfile.create({
        data: {
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true,
            },
          },
        },
      })
      const needsOnboarding = !newProfile.bio && !newProfile.industry && !newProfile.role
      return NextResponse.json({ profile: newProfile, needsOnboarding }, { headers: corsHeaders })
    }

    const needsOnboarding = !profile.bio && !profile.industry && !profile.role
    return NextResponse.json({ profile, needsOnboarding }, { headers: corsHeaders })
  } catch (error: any) {
    console.error("[PROFILE API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
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
    const { name: nameUpdate, ...profileData } = validatedData

    // Update user name if provided
    if (nameUpdate !== undefined && nameUpdate.trim()) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: nameUpdate.trim() },
      })
    }

    // Upsert profile (exclude name from profile model)
    const profile = await prisma.memberProfile.upsert({
      where: { userId },
      update: {
        ...profileData,
        updatedAt: new Date(),
      },
      create: {
        userId,
        ...profileData,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
    })

    return NextResponse.json(
      { message: "Profile updated successfully", profile },
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
      { error: "Failed to update profile" },
      { status: 500, headers: corsHeaders }
    )
  }
}
