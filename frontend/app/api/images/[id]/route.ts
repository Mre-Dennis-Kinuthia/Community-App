import { NextRequest, NextResponse } from "next/server"
import { getStoredImageBytes } from "@/lib/stored-image"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS() {
  return handleOptions()
}

/**
 * GET /api/images/[id]
 * Serve image bytes from the database.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const image = await getStoredImageBytes(id)
    if (!image) {
      return new NextResponse("Not found", { status: 404, headers: corsHeaders })
    }

    const body = Buffer.from(image.data)
    return new NextResponse(body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": image.mimeType,
        "Content-Length": String(body.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("[IMAGES API] Serve error:", error)
    return new NextResponse("Failed to load image", { status: 500, headers: corsHeaders })
  }
}
