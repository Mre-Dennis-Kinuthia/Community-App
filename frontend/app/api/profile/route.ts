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

const profileUpdateSchema = z.object({
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
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      )
    }

    const profile = await prisma.memberProfile.findUnique({
      where: { userId: session.user.id },
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
          userId: session.user.id,
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
      return NextResponse.json({ profile: newProfile }, { headers: corsHeaders })
    }

    return NextResponse.json({ profile }, { headers: corsHeaders })
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
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const validatedData = profileUpdateSchema.parse(body)

    // Upsert profile
    const profile = await prisma.memberProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...validatedData,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        ...validatedData,
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
