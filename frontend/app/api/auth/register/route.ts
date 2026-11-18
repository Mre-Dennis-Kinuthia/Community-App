import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth-utils"
import { clientIpFromRequest, rateLimit } from "@/lib/rate-limit"
import { MEMBERSHIP_REGISTER_INTENT } from "@/lib/membership-register-intent"
import { validatePasswordAsync } from "@/lib/password-policy"
import { issueEmailVerificationForEmail } from "@/lib/email-verification"
import { persistentRateLimit } from "@/lib/persistent-rate-limit"
import { validateEmailAddress } from "@/lib/email-validation"
import {
  isDatabaseUnavailableError,
  MEMBER_REGISTER_QUEUED_MESSAGE,
} from "@/lib/database-unavailable"
import { queueRegistrationDuringOutage } from "@/lib/queue-registration-during-outage"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase().trim()),
  password: z.string().optional(),
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  membershipIntent: z.literal(MEMBERSHIP_REGISTER_INTENT.ORGANISATIONAL).optional(),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({
      message: "You must accept the Terms of Service and Privacy Policy",
    }),
  }),
})

async function queueOutageSignup(input: {
  email: string
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  organisational?: boolean
}) {
  const queued = await queueRegistrationDuringOutage(input)
  if (queued.ok) {
    return NextResponse.json(
      {
        queued: true,
        message: MEMBER_REGISTER_QUEUED_MESSAGE,
      },
      { status: 202 }
    )
  }
  return NextResponse.json(
    {
      error: "We couldn't save your request. Please try again.",
      code: "database_unavailable",
    },
    { status: 503 }
  )
}

export async function POST(request: NextRequest) {
  const ip = clientIpFromRequest(request)
  const localLimit = rateLimit(`register:${ip}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  })
  if (!localLimit.ok) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(localLimit.retryAfterSec) } }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    const errorMessages = parsed.error.errors.map((err) => {
      if (err.path[0] === "email") return "Please enter a valid email address"
      if (err.path[0] === "password") return err.message
      if (err.path[0] === "acceptedTerms") {
        return "You must accept the Terms of Service and Privacy Policy"
      }
      return err.message
    })
    return NextResponse.json(
      { error: errorMessages[0] || "Invalid input" },
      { status: 400 }
    )
  }

  const { email, password, name, firstName, lastName, membershipIntent } = parsed.data
  const normalizedEmail = email
  const emailValidation = validateEmailAddress(normalizedEmail)
  if (!emailValidation.valid) {
    return NextResponse.json(
      {
        error:
          emailValidation.reason === "disposable"
            ? "Please use a non-disposable email address."
            : emailValidation.reason === "reserved"
              ? "Please use a real email address."
              : "Please enter a valid email address.",
      },
      { status: 400 }
    )
  }

  const isOrganisational =
    membershipIntent === MEMBERSHIP_REGISTER_INTENT.ORGANISATIONAL

  console.log("[REGISTER API] Received registration request:", {
    email: normalizedEmail,
    hasPassword: !!password,
    passwordLength: password?.length,
    name,
  })

  try {
    const limits = await Promise.all([
      persistentRateLimit(`register:ip:${ip}`, {
        limit: 10,
        windowMs: 60 * 60 * 1000,
      }),
      persistentRateLimit(`register:email:${normalizedEmail}`, {
        limit: 5,
        windowMs: 60 * 60 * 1000,
      }),
    ])
    const limited = limits.find((limit) => !limit.ok)
    if (limited && !limited.ok) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
      )
    }

    if (password) {
      const passwordResult = await validatePasswordAsync(password, {
        email: normalizedEmail,
        name: name || undefined,
      })
      if (!passwordResult.ok) {
        return NextResponse.json({ error: passwordResult.message }, { status: 400 })
      }
    }

    console.log("[REGISTER API] Checking if user exists:", normalizedEmail)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      console.log("[REGISTER API] User already exists:", normalizedEmail)
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    console.log("[REGISTER API] Hashing password...")
    const hashedPassword = await hashPassword(password)
    console.log("[REGISTER API] Password hashed, creating user...")

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name || null,
        password: hashedPassword,
        termsAcceptedAt: new Date(),
        registrationIntent: isOrganisational
          ? MEMBERSHIP_REGISTER_INTENT.ORGANISATIONAL
          : "community",
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    console.log("[REGISTER API] User created successfully:", {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    })

    const verifyResult = await issueEmailVerificationForEmail(user.email, {
      name: user.name,
    })
    const verificationEmailed = verifyResult.ok && verifyResult.emailed

    return NextResponse.json(
      {
        message: verificationEmailed
          ? "Account created. Check your email to verify your address."
          : "Account created, but we couldn't send the verification email. Please request a new link later.",
        user,
        membershipIntent: membershipIntent ?? null,
        verificationEmailed,
        needsEmailVerification: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[REGISTER API] Error occurred:", error)

    if (!process.env.DATABASE_URL) {
      console.error("[REGISTER API] DATABASE_URL is not set!")
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "DATABASE_URL environment variable is not set. Please contact support.",
        },
        { status: 500 }
      )
    }

    if (isDatabaseUnavailableError(error)) {
      console.error("[REGISTER API] Database unavailable, queueing membership request")
      return queueOutageSignup({
        email: normalizedEmail,
        firstName,
        lastName,
        name,
        organisational: isOrganisational,
      })
    }

    if (error && typeof error === "object") {
      const errorObj = error as { code?: string; message?: string }

      if (errorObj.code === "P2002") {
        console.log("[REGISTER API] Duplicate email detected (Prisma P2002)")
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 }
        )
      }

      console.error(
        "[REGISTER API] Prisma error code:",
        errorObj.code,
        "Message:",
        errorObj.message
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create user. Please try again later.",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    )
  }
}
