import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"
import {
  findLinkedExpert,
  replaceExpertAvailabilityWindows,
  serializeLinkedExpert,
} from "@/lib/experts-server"
import { normalizeTagList } from "@/lib/experts"
import { expertAvailabilityUpdateSchema } from "@/lib/expert-availability"
import { normalizeWebsiteUrl } from "@/lib/member-social-links"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

async function requireLinkedExpert(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return {
      error: NextResponse.json(
        { error: "Sign in required" },
        { status: 401, headers: corsHeaders(request) }
      ),
    }
  }
  const userId = await resolveUserIdFromSession(session)
  if (!userId) {
    return {
      error: NextResponse.json(
        { error: "Could not resolve your member account" },
        { status: 401, headers: corsHeaders(request) }
      ),
    }
  }
  const expert = await findLinkedExpert(userId, session.user.email)
  if (!expert) {
    return {
      error: NextResponse.json({ expert: null }, { headers: corsHeaders(request) }),
    }
  }
  return { expert }
}

export async function GET(request: NextRequest) {
  try {
    const result = await requireLinkedExpert(request)
    if ("error" in result && result.error) {
      return result.error
    }
    if (!("expert" in result) || !result.expert) {
      return NextResponse.json({ expert: null }, { headers: corsHeaders(request) })
    }

    return NextResponse.json(
      { expert: serializeLinkedExpert(result.expert) },
      { headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    console.error("[EXPERT ME]", error)
    return NextResponse.json(
      { error: "Failed to load expert profile" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Sign in required" },
        { status: 401, headers: corsHeaders(request) }
      )
    }
    const userId = await resolveUserIdFromSession(session)
    if (!userId) {
      return NextResponse.json(
        { error: "Could not resolve your member account" },
        { status: 401, headers: corsHeaders(request) }
      )
    }

    const expert = await findLinkedExpert(userId, session.user.email)
    if (!expert) {
      return NextResponse.json(
        { error: "This action is for Experts in Residence" },
        { status: 403, headers: corsHeaders(request) }
      )
    }

    const body = expertAvailabilityUpdateSchema.parse(await request.json())
    const industries = body.industries ? normalizeTagList(body.industries) : undefined
    const websiteUrl =
      body.websiteUrl === undefined
        ? undefined
        : body.websiteUrl
          ? normalizeWebsiteUrl(body.websiteUrl)
          : null
    if (body.websiteUrl && websiteUrl === null) {
      return NextResponse.json(
        { error: "Enter a valid website URL" },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    if (body.availabilityWindows) {
      await replaceExpertAvailabilityWindows(expert.id, body.availabilityWindows)
    }

    await prisma.expertInResidence.update({
      where: { id: expert.id },
      data: {
        ...(industries
          ? { industries, industry: industries[0] ?? null }
          : {}),
        ...(websiteUrl !== undefined ? { websiteUrl } : {}),
        ...(body.sessionDurationMinutes !== undefined
          ? { sessionDurationMinutes: body.sessionDurationMinutes }
          : {}),
        ...(body.availabilityEnabled !== undefined
          ? { availabilityEnabled: body.availabilityEnabled }
          : {}),
      },
    })

    const updated = await findLinkedExpert(userId, session.user.email)
    return NextResponse.json(
      { expert: updated ? serializeLinkedExpert(updated) : null },
      { headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid settings" },
        { status: 400, headers: corsHeaders(request) }
      )
    }
    console.error("[EXPERT ME PUT]", error)
    return NextResponse.json(
      { error: "Failed to save expert settings" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
