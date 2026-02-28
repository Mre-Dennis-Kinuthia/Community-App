import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { corsHeaders, handleOptions } from "@/middleware-cors"

async function getParams(params: Promise<{ id: string }> | { id: string }) {
  return typeof (params as Promise<{ id: string }>).then === "function"
    ? await (params as Promise<{ id: string }>)
    : (params as { id: string })
}

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/projects/[id]/investment
 *
 * Returns investment-specific data for a project, including capital structure,
 * diligence documents, and the current user's interest status.
 *
 * Access rules:
 * - Project must be approved and not deleted.
 * - Everyone can hit this endpoint if they can see the project; visibility of fields is gated:
 *   - Investors (MemberProfile.isInvestor=true):
 *       - See investor-only fields when investmentApproved=true.
 *       - See all docs with accessLevel=public or investors_only.
 *       - For request_access docs, URL is only returned when their interest is approved.
 *   - Non-investors:
 *       - See only high-level investment fields (no revenue/growth/runway/lastRound).
 *       - See only docs with accessLevel=public.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id || null

    const { id } = await getParams(params)

    // Determine if current user is an investor
    let isInvestor = false
    if (userId) {
      const profile = await prisma.memberProfile.findUnique({
        where: { userId },
        select: { isInvestor: true },
      })
      isInvestor = !!profile?.isInvestor
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
        status: "approved",
      },
      include: {
        founder: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mediaAssets: {
          where: {
            deletedAt: null,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    const isInvestmentOpen = !!project.isInvestmentOpen
    const investmentApproved = !!project.investmentApproved
    const investmentVisibility = (project as any).investmentVisibility as
      | "public"
      | "investors_only"
      | "request_access"
      | undefined

    // Current user's interest record, if any
    let interest:
      | {
          status: "requested" | "approved" | "declined"
          message: string | null
          createdAt: string
          updatedAt: string
        }
      | null = null

    if (userId) {
      const existing = await prisma.projectInvestmentInterest.findUnique({
        where: {
          projectId_investorId: {
            projectId: project.id,
            investorId: userId,
          },
        },
      })

      if (existing) {
        interest = {
          status: existing.status as any,
          message: existing.message ?? null,
          createdAt: existing.createdAt.toISOString(),
          updatedAt: existing.updatedAt.toISOString(),
        }
      }
    }

    const hasApprovedAccess = interest?.status === "approved"

    // Shape investment fields; investor-only numbers are nulled for non-investors
    const baseInvestment = {
      capitalSought: project.capitalSought ?? null,
      ticketMin: project.ticketMin ?? null,
      ticketMax: project.ticketMax ?? null,
      fundingStage: (project as any).fundingStage ?? null,
      readinessScore: project.readinessScore ?? null,
    }

    const investorOnly =
      isInvestor && investmentApproved
        ? {
            revenueMonthly: project.revenueMonthly ?? null,
            growthRateMonthly: project.growthRateMonthly ?? null,
            runwayMonths: project.runwayMonths ?? null,
            lastRoundAmount: project.lastRoundAmount ?? null,
            lastRoundDate: project.lastRoundDate ? project.lastRoundDate.toISOString() : null,
          }
        : {
            revenueMonthly: null,
            growthRateMonthly: null,
            runwayMonths: null,
            lastRoundAmount: null,
            lastRoundDate: null,
          }

    // Shape docs based on access rules
    const docs = project.mediaAssets.map((asset) => {
      const accessLevel = (asset as any).accessLevel as
        | "public"
        | "investors_only"
        | "request_access"
        | undefined

      const fileType = (asset as any).fileType as string | undefined

      let canViewUrl = false
      let showMetadata = false

      if (!accessLevel || accessLevel === "public") {
        // Public docs: everyone can see
        canViewUrl = true
        showMetadata = true
      } else if (accessLevel === "investors_only") {
        // Only investors can see
        canViewUrl = isInvestor
        showMetadata = isInvestor
      } else if (accessLevel === "request_access") {
        // Metadata visible to investors; URL only if interest approved
        showMetadata = isInvestor
        canViewUrl = isInvestor && hasApprovedAccess
      }

      if (!showMetadata) {
        // Completely hide docs that the user should not even see metadata for
        return null
      }

      return {
        id: asset.id,
        name: asset.name,
        size: asset.size,
        mimeType: asset.mimeType,
        tags: asset.tags ?? [],
        accessLevel: accessLevel ?? "public",
        fileType: fileType ?? "other",
        url: canViewUrl ? asset.url : null,
        createdAt: asset.createdAt.toISOString(),
      }
    })
      .filter(Boolean) as Array<{
      id: string
      name: string
      size: number | null
      mimeType: string | null
      tags: string[]
      accessLevel: string
      fileType: string
      url: string | null
      createdAt: string
    }>

    const isOwner = !!(userId && project.founderId && project.founderId === userId)

    return NextResponse.json(
      {
        projectId: project.id,
        isInvestmentOpen,
        investmentApproved,
        investmentVisibility: investmentVisibility ?? "investors_only",
        role: {
          isInvestor,
          isOwner,
        },
        permissions: {
          canViewInvestorFields: isInvestor && investmentApproved,
          canExpressInterest: isInvestor && isInvestmentOpen && investmentApproved,
        },
        investment: {
          ...baseInvestment,
          ...investorOnly,
        },
        docs,
        interest,
        founder: project.founder
          ? {
              id: project.founder.id,
              name: project.founder.name,
              email: project.founder.email,
            }
          : null,
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[PROJECT INVESTMENT API] Error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to fetch project investment data" },
      { status: 500, headers: corsHeaders }
    )
  }
}

