import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth-utils"
import { deleteMemberAccount } from "@/lib/delete-member-account"
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit"

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
  confirmation: z.literal("DELETE", {
    errorMap: () => ({ message: 'Type "DELETE" to confirm account deletion' }),
  }),
})

/**
 * POST /api/account/delete — permanently delete the signed-in member account.
 */
export async function POST(request: NextRequest) {
  const ip = clientIpFromRequest(request)
  const limited = rateLimit(`account-delete:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  })
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many deletion attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    )
  }

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { password } = deleteAccountSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "This account cannot be deleted here. Contact support for assistance." },
        { status: 400 }
      )
    }

    const passwordValid = await verifyPassword(password, user.password)
    if (!passwordValid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 400 })
    }

    const result = await deleteMemberAccount(user.id, {
      deletedBy: "self",
      notify: true,
    })

    return NextResponse.json({
      message: `Your account has been permanently deleted. A confirmation email was sent to ${result.email}.`,
      email: result.email,
      emailSent: result.emailSent,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    console.error("[ACCOUNT DELETE]", error)
    const message =
      error instanceof Error ? error.message : "Failed to delete account. Please try again."
    const status = message === "Member not found" ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
