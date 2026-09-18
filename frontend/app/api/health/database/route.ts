import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isDatabaseUnavailableError } from "@/lib/database-unavailable"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, database: "up" })
  } catch (error) {
    const unavailable = isDatabaseUnavailableError(error)
    console.error("[HEALTH DATABASE]", error)
    return NextResponse.json(
      {
        ok: false,
        database: "down",
        code: unavailable ? "database_unavailable" : "database_error",
      },
      { status: 503 }
    )
  }
}
