import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// This config is used by middleware (Edge runtime) - no Prisma here
// Note: AUTH_SECRET validation happens in auth.ts (Node.js runtime)
export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
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
