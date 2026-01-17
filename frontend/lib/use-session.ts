"use client"

import { useSession as useNextAuthSession } from "next-auth/react"

/**
 * Custom hook to get the current user session
 * Returns the session with proper typing
 * 
 * Note: This hook must be used within a component that is a child of <SessionProvider>
 */
export function useSession() {
  const { data: session, status } = useNextAuthSession()

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
    status,
  }
}
