import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { touchMemberLastActiveInBackground } from "@/lib/member-activity"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"

/**
 * POST /api/me/activity — record a throttled platform visit for the signed-in member.
 */
export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = await resolveUserIdFromSession(session)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  touchMemberLastActiveInBackground(userId)
  return NextResponse.json({ ok: true })
}
