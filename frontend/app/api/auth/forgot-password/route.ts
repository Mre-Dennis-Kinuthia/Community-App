import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit"

const schema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
})

const GENERIC_MESSAGE = "If an account exists, we sent a reset link."

/**
 * POST /api/auth/forgot-password
 */
export async function POST(request: NextRequest) {
  const ip = clientIpFromRequest(request)
  const limited = rateLimit(`forgot-password:${ip}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  })
  if (!limited.ok) {
    return NextResponse.json(
      { message: GENERIC_MESSAGE },
      {
        status: 200,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    )
  }

  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    })

    if (user?.password) {
      const token = randomBytes(32).toString("hex")
      const expires = new Date(Date.now() + 60 * 60 * 1000)

      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      })

      await prisma.verificationToken.create({
        data: { identifier: email, token, expires },
      })

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.AUTH_URL ||
        request.nextUrl.origin
      const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`

      await sendPasswordResetEmail({ to: email, resetUrl })
    }

    return NextResponse.json({ message: GENERIC_MESSAGE })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: GENERIC_MESSAGE })
    }
    console.error("[FORGOT PASSWORD]", error)
    return NextResponse.json({ message: GENERIC_MESSAGE })
  }
}
