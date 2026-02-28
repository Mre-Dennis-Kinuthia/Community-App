import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/investments
 * List investment-ready projects for the Investments & Dealflow page.
 *
 * Visibility rules (enforced server-side):
 * - Only projects with status="approved", isInvestmentOpen=true, investmentApproved=true.
 * - Investors (MemberProfile.isInvestor=true) see full investment metrics.
 * - Non-investors see limited fields (no revenue/growth/runway).
 * - Optional public preview via env flag INVESTMENTS_PUBLIC_PREVIEW="true".
 *
 * Supported query params (all optional):
 * - sector        -> Project.category
 * - stage         -> Project.stage
 * - fundingStage  -> Project.fundingStage enum
 * - capitalMin    -> Project.capitalSought >= capitalMin
 * - capitalMax    -> Project.capitalSought <= capitalMax
 * - revenueMin    -> Project.revenueMonthly >= revenueMin   (investors only)
 * - revenueMax    -> Project.revenueMonthly <= revenueMax   (investors only)
 * - location      -> Project.location
 * - impact        -> Project.impact contains (case-insensitive)
 * - readinessMin  -> Project.readinessScore >= readinessMin
 * - visibility    -> Project.investmentVisibility (public|investors_only|request_access)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    const isPublicPreviewEnabled = process.env.INVESTMENTS_PUBLIC_PREVIEW === "true"
    const userId = session?.user?.id || null

    if (!userId && !isPublicPreviewEnabled) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: corsHeaders }
      )
    }

    // Determine if current user is an investor
    let isInvestor = false
    if (userId) {
      const profile = await prisma.memberProfile.findUnique({
        where: { userId },
        select: { isInvestor: true },
      })
      isInvestor = !!profile?.isInvestor
    }

    const { searchParams } = new URL(request.url)

    const sector = searchParams.get("sector") || ""
    const stage = searchParams.get("stage") || ""
    const fundingStage = searchParams.get("fundingStage") || ""
    const capitalMin = parseFloat(searchParams.get("capitalMin") || "")
    const capitalMax = parseFloat(searchParams.get("capitalMax") || "")
    const revenueMin = parseFloat(searchParams.get("revenueMin") || "")
    const revenueMax = parseFloat(searchParams.get("revenueMax") || "")
    const location = searchParams.get("location") || ""
    const impact = searchParams.get("impact") || ""
    const readinessMin = parseInt(searchParams.get("readinessMin") || "")
    const visibility = searchParams.get("visibility") || ""

    const where: any = {
      deletedAt: null,
      status: "approved",
      isInvestmentOpen: true,
      investmentApproved: true,
    }

    if (sector) {
      where.category = sector
    }

    if (stage) {
      where.stage = stage
    }

    if (fundingStage) {
      where.fundingStage = fundingStage
    }

    if (!Number.isNaN(capitalMin)) {
      where.capitalSought = { ...(where.capitalSought || {}), gte: capitalMin }
    }

    if (!Number.isNaN(capitalMax)) {
      where.capitalSought = { ...(where.capitalSought || {}), lte: capitalMax }
    }

    // Revenue filters only make sense for investors; ignore for others
    if (isInvestor) {
      if (!Number.isNaN(revenueMin)) {
        where.revenueMonthly = { ...(where.revenueMonthly || {}), gte: revenueMin }
      }
      if (!Number.isNaN(revenueMax)) {
        where.revenueMonthly = { ...(where.revenueMonthly || {}), lte: revenueMax }
      }
    }

    if (location) {
      where.location = location
    }

    if (impact) {
      where.impact = { contains: impact, mode: "insensitive" }
    }

    if (!Number.isNaN(readinessMin)) {
      where.readinessScore = { gte: readinessMin }
    }

    if (visibility && ["public", "investors_only", "request_access"].includes(visibility)) {
      where.investmentVisibility = visibility
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        founder: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Shape response based on role, never leaking investor-only fields to non-investors
    type ShapedProject = {
      id: string
      title: string
      category: string | null
      stage: string | null
      fundingStage: string | null
      impact: string | null
      imageUrl: string | null
      location: string | null
      investmentVisibility: string
      isInvestmentOpen: boolean
      capitalSought: number | null
      ticketMin: number | null
      ticketMax: number | null
      readinessScore: number | null
      // Investor-only fields (set to null for non-investors)
      revenueMonthly: number | null
      growthRateMonthly: number | null
      runwayMonths: number | null
      lastRoundAmount: number | null
      lastRoundDate: string | null
      founderName: string | null
      founderAvatar: string | null
      createdAt: string
    }

    const shaped: ShapedProject[] = projects.map((p) => {
      const investorFields =
        isInvestor && p.investmentApproved
          ? {
              revenueMonthly: p.revenueMonthly ?? null,
              growthRateMonthly: p.growthRateMonthly ?? null,
              runwayMonths: p.runwayMonths ?? null,
              lastRoundAmount: p.lastRoundAmount ?? null,
              lastRoundDate: p.lastRoundDate ? p.lastRoundDate.toISOString() : null,
            }
          : {
              revenueMonthly: null,
              growthRateMonthly: null,
              runwayMonths: null,
              lastRoundAmount: null,
              lastRoundDate: null,
            }

      return {
        id: p.id,
        title: p.title,
        category: p.category ?? null,
        stage: p.stage ?? null,
        fundingStage: (p as any).fundingStage ?? null,
        impact: p.impact ?? null,
        imageUrl: p.imageUrl ?? null,
        location: p.location ?? null,
        investmentVisibility: (p as any).investmentVisibility ?? "investors_only",
        isInvestmentOpen: !!p.isInvestmentOpen,
        capitalSought: p.capitalSought ?? null,
        ticketMin: p.ticketMin ?? null,
        ticketMax: p.ticketMax ?? null,
        readinessScore: p.readinessScore ?? null,
        founderName: p.founder?.name ?? null,
        founderAvatar: p.founder?.image ?? null,
        createdAt: p.createdAt.toISOString(),
        ...investorFields,
      }
    })

    // Derive metrics
    const activeCount = shaped.length

    const totalCapitalSought = isInvestor
      ? shaped.reduce((sum, p) => (typeof p.capitalSought === "number" ? sum + p.capitalSought : sum), 0)
      : null

    const readinessValues = shaped
      .map((p) => p.readinessScore)
      .filter((v): v is number => typeof v === "number")
    const avgReadinessScore =
      readinessValues.length > 0
        ? readinessValues.reduce((sum, v) => sum + v, 0) / readinessValues.length
        : null

    const sectorSet = new Set(shaped.map((p) => p.category).filter(Boolean) as string[])
    const sectorsCount = sectorSet.size

    return NextResponse.json(
      {
        isInvestor,
        projects: shaped,
        metrics: {
          activeCount,
          totalCapitalSought,
          avgReadinessScore,
          sectorsCount,
        },
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[INVESTMENTS API] Error:", error)
    const message = error?.message || "Failed to fetch investments"
    const isDbUnavailable =
      error?.code === "P1001" || /DATABASE_URL|Can't reach database|ECONNREFUSED/i.test(message)

    return NextResponse.json(
      {
        error: isDbUnavailable
          ? "Service temporarily unavailable. Please try again."
          : "Failed to fetch investments",
      },
      { status: isDbUnavailable ? 503 : 500, headers: corsHeaders }
    )
  }
}

