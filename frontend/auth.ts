import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth-utils"
import { authConfig } from "./auth.config"
import { randomBytes } from "crypto"

// Validate required environment variables at runtime
function validateEnvVars() {
  const missing: string[] = []
  const issues: string[] = []
  
  const authSecret = process.env.AUTH_SECRET
  const databaseUrl = process.env.DATABASE_URL
  
  if (!authSecret) {
    missing.push("AUTH_SECRET")
    console.error("[AUTH] ERROR: AUTH_SECRET is not set!")
  } else {
    console.log("[AUTH] AUTH_SECRET is set, length:", authSecret.length)
    if (authSecret.length < 32) {
      issues.push(`AUTH_SECRET is too short (${authSecret.length} chars, need at least 32)`)
      console.error("[AUTH] ERROR: AUTH_SECRET is too short! Must be at least 32 characters.")
    }
  }
  
  if (!databaseUrl) {
    missing.push("DATABASE_URL")
    console.error("[AUTH] ERROR: DATABASE_URL is not set!")
  } else {
    console.log("[AUTH] DATABASE_URL is set, starts with:", databaseUrl.substring(0, 20) + "...")
  }
  
  if (missing.length > 0) {
    console.error("[AUTH] Missing environment variables:", missing.join(", "))
    console.error("[AUTH] Please set these in Vercel Dashboard → Settings → Environment Variables")
  }
  
  if (issues.length > 0) {
    console.error("[AUTH] Configuration issues:", issues.join(", "))
  }
  
  return missing.length === 0 && issues.length === 0
}

// Validate on module load
const envValid = validateEnvVars()
const authSecret = process.env.AUTH_SECRET

// Log configuration status
console.log("[AUTH] Initializing NextAuth with:", {
  hasSecret: !!authSecret,
  secretLength: authSecret?.length || 0,
  secretValid: authSecret ? authSecret.length >= 32 : false,
  hasDatabase: !!process.env.DATABASE_URL,
  envValid,
})

// Ensure we always have some secret to pass to NextAuth
// In production we STRONGLY recommend setting a proper AUTH_SECRET (32+ chars).
// However, we avoid throwing at import time so API routes don't 500 due to misconfig.
let resolvedSecret = authSecret

if (!authSecret || typeof authSecret !== "string" || authSecret.length < 32) {
  const errorMsg = !authSecret
    ? "AUTH_SECRET is not set"
    : typeof authSecret !== "string"
    ? "AUTH_SECRET is not a string"
    : `AUTH_SECRET is too short (${authSecret.length} chars, need 32+)`

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `[AUTH] ${errorMsg}. Set AUTH_SECRET in Vercel (openssl rand -base64 32).`
    )
  }

  console.error("[AUTH] WARNING:", errorMsg)
  resolvedSecret = randomBytes(32).toString("hex")
  console.error(
    "[AUTH] Using a generated fallback secret for local development only."
  )
}

// Create NextAuth config with explicit secret validation
const nextAuthConfig = {
  ...authConfig,
  adapter: envValid ? PrismaAdapter(prisma) : undefined,
  trustHost: true,
  secret: resolvedSecret,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true, // Allow linking Google account with existing email
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] Authorize called with credentials:", {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
        })

        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing email or password")
          return null
        }

        // Normalize email to lowercase for case-insensitive lookup
        const normalizedEmail = (credentials.email as string).toLowerCase().trim()
        console.log("[AUTH] Normalized email for lookup:", normalizedEmail)

        // Look up user in database
        console.log("[AUTH] Looking up user in database:", normalizedEmail)
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        })

        if (!user) {
          console.log("[AUTH] User not found:", normalizedEmail)
          return null
        }

        if (!user.password) {
          console.log("[AUTH] User has no password set:", normalizedEmail)
          return null
        }

        // Verify password
        console.log("[AUTH] Verifying password...")
        const isValid = await verifyPassword(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          console.log("[AUTH] Password verification failed for:", normalizedEmail)
          return null
        }

        console.log("[AUTH] Authentication successful for:", {
          id: user.id,
          email: user.email,
          name: user.name,
        })

        // Return user object (Auth.js will use this to create session)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
}

// Log final config (without exposing secret)
console.log("[AUTH] NextAuth config:", {
  hasSecret: !!nextAuthConfig.secret,
  secretLength: nextAuthConfig.secret?.length || 0,
  secretType: typeof nextAuthConfig.secret,
  hasAdapter: !!nextAuthConfig.adapter,
  trustHost: nextAuthConfig.trustHost,
})

// Initialize NextAuth with validated config
export const { handlers, auth, signIn, signOut } = NextAuth(nextAuthConfig)
