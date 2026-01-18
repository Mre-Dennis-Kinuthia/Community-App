import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword, verifyPassword } from "@/lib/auth-utils"
import { z } from "zod"
import { corsHeaders, handleOptions } from "@/middleware-cors"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * Admin login endpoint
 * Authenticates admin users and creates a session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    })

    if (!adminUser) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { 
          status: 401,
          headers: corsHeaders(request),
        }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, adminUser.password)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { 
          status: 401,
          headers: corsHeaders(request),
        }
      )
    }

    // For now, return admin user info
    // In production, you'd create a session using Auth.js
    return NextResponse.json(
      {
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
        },
        message: "Login successful",
      },
      {
        headers: corsHeaders(request),
      }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { 
          status: 400,
          headers: corsHeaders(request),
        }
      )
    }

    console.error("[ADMIN AUTH] Login error:", error)
    return NextResponse.json(
      { error: "Login failed" },
      { 
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}
