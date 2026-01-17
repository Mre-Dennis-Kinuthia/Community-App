import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth-utils"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase().trim()),
  password: z.string().min(8),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[REGISTER API] Received registration request:", {
      email: body.email,
      hasPassword: !!body.password,
      passwordLength: body.password?.length,
      name: body.name,
    })
    
    const { email, password, name } = registerSchema.parse(body)
    const normalizedEmail = email.toLowerCase().trim()
    console.log("[REGISTER API] Validation passed, normalized email:", normalizedEmail)

    // Check if user already exists (case-insensitive)
    console.log("[REGISTER API] Checking if user exists:", normalizedEmail)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      console.log("[REGISTER API] User already exists:", normalizedEmail)
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password and create user
    console.log("[REGISTER API] Hashing password...")
    const hashedPassword = await hashPassword(password)
    console.log("[REGISTER API] Password hashed, creating user...")

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail, // Store email in lowercase
        name: name || null,
        password: hashedPassword,
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

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    )
  } catch (error) {
    console.error("[REGISTER API] Error occurred:", error)
    
    // Check for missing environment variables
    if (!process.env.DATABASE_URL) {
      console.error("[REGISTER API] DATABASE_URL is not set!")
      return NextResponse.json(
        { 
          error: "Server configuration error",
          details: "DATABASE_URL environment variable is not set. Please contact support."
        },
        { status: 500 }
      )
    }
    
    if (error instanceof z.ZodError) {
      console.log("[REGISTER API] Validation errors:", error.errors)
      // Format Zod errors into user-friendly messages
      const errorMessages = error.errors.map((err) => {
        if (err.path[0] === "email") {
          return "Please enter a valid email address"
        }
        if (err.path[0] === "password") {
          return "Password must be at least 8 characters"
        }
        return err.message
      })
      return NextResponse.json(
        { error: errorMessages[0] || "Invalid input" },
        { status: 400 }
      )
    }
    
    // Check if it's a Prisma connection error
    if (error && typeof error === "object") {
      const errorObj = error as any
      
      // Prisma connection errors
      if (errorObj.code === "P1001" || errorObj.message?.includes("Can't reach database")) {
        console.error("[REGISTER API] Database connection error:", errorObj.message)
        return NextResponse.json(
          { 
            error: "Database connection failed",
            details: "Unable to connect to the database. Please try again later."
          },
          { status: 500 }
        )
      }
      
      // Prisma unique constraint error (duplicate email)
      if (errorObj.code === "P2002") {
        console.log("[REGISTER API] Duplicate email detected (Prisma P2002)")
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 }
        )
      }
      
      // Log the error code and message for debugging
      console.error("[REGISTER API] Prisma error code:", errorObj.code, "Message:", errorObj.message)
    }

    console.error("[REGISTER API] Unexpected error:", error)
    return NextResponse.json(
      { 
        error: "Failed to create user. Please try again later.",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
