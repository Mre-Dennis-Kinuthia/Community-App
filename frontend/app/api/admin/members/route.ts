import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "../middleware"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { z } from "zod"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/admin/members - List all members
 * POST /api/admin/members - Create a new member (admin action)
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const { error, admin } = await requireAdmin(request)
    if (error) return error
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ]
    }

    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          profile: true,
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json(
      {
        members: members.map((member) => ({
          id: member.id,
          email: member.email,
          name: member.name,
          image: member.image,
          createdAt: member.createdAt,
          profile: member.profile,
          bookingCount: member._count.bookings,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: corsHeaders(request),
      }
    )
  } catch (error) {
    console.error("[ADMIN MEMBERS] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { 
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const { error, admin } = await requireAdmin(request)
    if (error) return error
    const body = await request.json()
    
    // Create user (admin can create members)
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase().trim(),
        name: body.name,
        // Password will be set via separate endpoint or invite flow
      },
    })

    return NextResponse.json(
      { message: "Member created", user },
      { 
        status: 201,
        headers: corsHeaders(request),
      }
    )
  } catch (error) {
    console.error("[ADMIN MEMBERS] Error creating member:", error)
    return NextResponse.json(
      { error: "Failed to create member" },
      { 
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}
