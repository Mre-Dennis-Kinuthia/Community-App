import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth-utils"
import { authConfig } from "./auth.config"

// Validate required environment variables at runtime
function validateEnvVars() {
  const missing: string[] = []
  
  if (!process.env.AUTH_SECRET) {
    missing.push("AUTH_SECRET")
    console.error("[AUTH] ERROR: AUTH_SECRET is not set!")
  }
  
  if (!process.env.DATABASE_URL) {
    missing.push("DATABASE_URL")
    console.error("[AUTH] ERROR: DATABASE_URL is not set!")
  }
  
  if (missing.length > 0) {
    console.error("[AUTH] Missing environment variables:", missing.join(", "))
    console.error("[AUTH] Please set these in Vercel Dashboard → Settings → Environment Variables")
  }
  
  return missing.length === 0
}

// Validate on module load (but don't throw - let NextAuth handle it gracefully)
const envValid = validateEnvVars()

// Full auth config for API routes (Node.js runtime) - includes Prisma
// Note: If AUTH_SECRET is missing, NextAuth will throw a "Configuration" error
// which we handle in the login form
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: envValid ? PrismaAdapter(prisma) : undefined,
  trustHost: true,
  secret: process.env.AUTH_SECRET, // Will be undefined if not set, causing Configuration error
  providers: [
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

        // Look up user in database (only works in Node.js runtime)
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
})
