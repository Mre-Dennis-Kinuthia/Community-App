import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import {
  categoryAllowedForMember,
  isStoredImageCategory,
} from "@/lib/stored-image"
import { createStoredImage } from "@/lib/stored-image-server"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

async function resolveUserId(session: Awaited<ReturnType<typeof auth>>) {
  const sessionUser = session?.user
  if (!sessionUser) return null
  if (typeof sessionUser.id === "string") {
    const existing = await prisma.user.findUnique({ where: { id: sessionUser.id } })
    if (existing) return existing.id
  }
  const email = typeof sessionUser.email === "string" ? sessionUser.email.toLowerCase().trim() : null
  if (!email) return null
  const user = await prisma.user.findUnique({ where: { email } })
  return user?.id ?? null
}

/**
 * POST /api/images
 * Upload an image (multipart: file, category)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
    }

    const userId = await resolveUserId(session)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const categoryRaw = String(formData.get("category") || "profile")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400, headers: corsHeaders })
    }

    if (!isStoredImageCategory(categoryRaw)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400, headers: corsHeaders })
    }

    if (!categoryAllowedForMember(categoryRaw)) {
      return NextResponse.json(
        { error: "You cannot upload this image type" },
        { status: 403, headers: corsHeaders }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await createStoredImage({
      buffer,
      mimeType: file.type,
      fileName: file.name,
      category: categoryRaw,
      userId,
    })

    if (categoryRaw === "profile") {
      await prisma.user.update({
        where: { id: userId },
        data: { image: result.url },
      })
    }

    return NextResponse.json(
      { id: result.id, url: result.url },
      { status: 201, headers: corsHeaders }
    )
  } catch (error: unknown) {
    console.error("[IMAGES API] Upload error:", error)
    const message = error instanceof Error ? error.message : "Failed to upload image"
    const missingTable = message.includes("stored_images") && message.includes("does not exist")
    return NextResponse.json(
      {
        error: missingTable
          ? "Image storage is not set up on the database yet. Run: npx prisma migrate deploy"
          : message,
      },
      { status: missingTable ? 503 : 400, headers: corsHeaders }
    )
  }
}
