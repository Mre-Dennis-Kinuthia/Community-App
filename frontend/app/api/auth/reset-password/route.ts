import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth-utils"
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit"
import { validatePasswordAsync } from "@/lib/password-policy"

const schema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  token: z.string().min(1),
  password: z.string(),
})

/**
 * POST /api/auth/reset-password
 */
export async function POST(request: NextRequest) {
  const ip = clientIpFromRequest(request)
  const limited = rateLimit(`reset-password:${ip}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  })
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    )
  }

  try {
    const body = await request.json()
    const { email, token, password } = schema.parse(body)

    const passwordResult = await validatePasswordAsync(password, { email })
    if (!passwordResult.ok) {
      return NextResponse.json({ error: passwordResult.message }, { status: 400 })
    }

    const record = await prisma.verificationToken.findFirst({
      where: { identifier: email, token },
    })

    if (!record || record.expires < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      )
    }

    const hashed = await hashPassword(password)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: { identifier: email, token },
        },
      }),
    ])

    return NextResponse.json({ message: "Password updated. You can sign in now." })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }
    console.error("[RESET PASSWORD]", error)
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    )
  }
}
