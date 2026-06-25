import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { z } from "zod"

const bodySchema = z.object({
  answers: z.record(z.string()),
})

async function resolveUserId(session: Awaited<ReturnType<typeof auth>>) {
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  return user?.id ?? null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isFeatureEnabled("operationsModule")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = await resolveUserId(session)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const survey = await prisma.survey.findUnique({ where: { id } })
    if (!survey || survey.status !== "active") {
      return NextResponse.json({ error: "Survey not available" }, { status: 404 })
    }

    const body = bodySchema.parse(await request.json())
    const response = await prisma.surveyResponse.upsert({
      where: { surveyId_userId: { surveyId: id, userId } },
      create: { surveyId: id, userId, answers: body.answers },
      update: { answers: body.answers },
    })

    return NextResponse.json({ response }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 })
    }
    console.error("[SURVEY RESPOND]", error)
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 })
  }
}
