import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"

export async function requireMemberUserId() {
  const session = await auth()
  if (!session?.user) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const userId = await resolveUserIdFromSession(session)
  if (!userId) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  return { userId, session }
}

export function emptyListIfMissingTable(error: unknown, payload: Record<string, unknown>) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
    console.error("[DB] Missing table — run db:apply-phase2 and db:apply-phase3-6:", error.meta)
    return NextResponse.json({ ...payload, schemaPending: true })
  }
  return null
}
