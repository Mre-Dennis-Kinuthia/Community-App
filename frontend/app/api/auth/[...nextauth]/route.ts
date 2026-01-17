import { handlers } from "@/auth"

// Verify secret is available at handler runtime
if (!process.env.AUTH_SECRET) {
  console.error("[AUTH HANDLER] CRITICAL: AUTH_SECRET is not available in handler!")
}

export const { GET, POST } = handlers
