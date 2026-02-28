import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { z } from "zod"
import { createNotification } from "@/lib/notifications"

async function getParams(params: Promise<{ id: string }> | { id: string }) {
  return typeof (params as Promise<{ id: string }>).then === "function"
    ? await (params as Promise<{ id: string }>)
    : (params as { id: string })
}

const InterestSchema = z.object({
  message: z.string().max(2000).optional(),
})

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * POST /api/projects/[id]/investment-interest
 *
 * Express or update investment interest in a project.
 *
 * - Only investors (MemberProfile.isInvestor=true) may express interest.
 * - Project must be approved, investmentApproved=true, and isInvestmentOpen=true.
 * - Idempotent: one interest per (projectId, investorId); subsequent calls update message
 *   and reset status to "requested".
 * - Triggers a notification to the project founder when a new/requested interest is recorded.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id || null

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: corsHeaders }
      )
    }

    const { id } = await getParams(params)
    const body = await request.json()

    const parsed = InterestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400, headers: corsHeaders }
      )
    }

    // Verify investor profile
    const profile = await prisma.memberProfile.findUnique({
      where: { userId },
      select: {
        isInvestor: true,
      },
    })

    if (!profile?.isInvestor) {
      return NextResponse.json(
        { error: "Only verified investors can express investment interest" },
        { status: 403, headers: corsHeaders }
      )
    }

    // Ensure project is eligible for investment interest
    const project = await prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
        status: "approved",
        isInvestmentOpen: true,
        investmentApproved: true,
      },
      select: {
        id: true,
        title: true,
        founderId: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project is not open for investment" },
        { status: 400, headers: corsHeaders }
      )
    }

    const message = parsed.data.message?.trim() || null

    const interest = await prisma.projectInvestmentInterest.upsert({
      where: {
        projectId_investorId: {
          projectId: project.id,
          investorId: userId,
        },
      },
      update: {
        status: "requested",
        message,
      },
      create: {
        projectId: project.id,
        investorId: userId,
        status: "requested",
        message,
      },
    })

    // Notify founder that a new/updated interest was requested
    if (project.founderId) {
      const investorName = session.user?.name || "An investor"
      const title = "New investment interest"
      const notifMessage = `${investorName} has expressed investment interest in your project "${project.title}".`

      await createNotification({
        userId: project.founderId,
        title,
        message: notifMessage,
        type: "info",
        category: "investment",
        actionUrl: `/projects/${project.id}?mode=investment`,
        relatedId: project.id,
        relatedType: "project",
      })
    }

    return NextResponse.json(
      {
        interest: {
          projectId: interest.projectId,
          status: interest.status,
          message: interest.message,
          createdAt: interest.createdAt.toISOString(),
          updatedAt: interest.updatedAt.toISOString(),
        },
      },
      { status: 201, headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[PROJECT INVESTMENT INTEREST API] Error:", error)

    if (error?.code === "P2002") {
      // Unique constraint violation (should be prevented by upsert, but guard just in case)
      return NextResponse.json(
        { error: "You have already expressed interest in this project" },
        { status: 409, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { error: error?.message || "Failed to express investment interest" },
      { status: 500, headers: corsHeaders }
    )
  }
}

