import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

// This config is used by middleware (Edge runtime) - no Prisma here
// Note: AUTH_SECRET is set in auth.ts (Node.js runtime), not here
// Middleware doesn't need the secret for JWT validation
export const authConfig = {
  // Don't set secret here - it's set in auth.ts for API routes
  trustHost: true,
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
      // In middleware, we can't use Prisma, so this won't be called
      // The actual auth happens in API routes
      async authorize() {
        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("[AUTH] JWT callback - adding user to token:", {
          id: user.id,
          email: user.email,
          name: user.name,
        })
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        console.log("[AUTH] Session callback - building session for:", token.email)
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
      }
      return session
    },
  },
} satisfies NextAuthConfig
