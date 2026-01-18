import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/app/api/admin/middleware"
import { corsHeaders, handleOptions } from "@/middleware-cors"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * Upload image for news posts
 * Accepts multipart/form-data with image file
 * Returns the image URL (base64 data URL for now, can be extended to use cloud storage)
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const { error, admin } = await requireAdmin(request)
    if (error) return error

    const formData = await request.formData()
    const file = formData.get("image") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        {
          status: 400,
          headers: corsHeaders(request),
        }
      )
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        {
          status: 400,
          headers: corsHeaders(request),
        }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Image size must be less than 10MB" },
        {
          status: 400,
          headers: corsHeaders(request),
        }
      )
    }

    // Convert file to base64 data URL
    // In production, you should upload to cloud storage (Vercel Blob, AWS S3, etc.)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    // TODO: In production, upload to cloud storage and return the public URL
    // Example with Vercel Blob:
    // const blob = await put(file.name, buffer, { access: 'public' })
    // return NextResponse.json({ url: blob.url }, { headers: corsHeaders(request) })

    return NextResponse.json(
      {
        url: dataUrl,
        message: "Image uploaded successfully",
        // Include file info for debugging
        fileInfo: {
          name: file.name,
          type: file.type,
          size: file.size,
        },
      },
      {
        headers: corsHeaders(request),
      }
    )
  } catch (error: any) {
    console.error("[ADMIN NEWS API] Error uploading image:", error)

    return NextResponse.json(
      {
        error: "Failed to upload image",
        details: error?.message || "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}
