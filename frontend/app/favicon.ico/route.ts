import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    // Serve the icon.svg file for favicon.ico requests
    const iconPath = join(process.cwd(), "public", "icon.svg")
    const iconBuffer = await readFile(iconPath)
    
    return new NextResponse(iconBuffer, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    // If file doesn't exist, return 204 No Content
    return new NextResponse(null, { status: 204 })
  }
}

