"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { APP_HOME_PATH } from "@/lib/auth-routes"

export default function AdminAccessClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get("token")?.trim()
    if (!token) {
      setError("Missing access token. Open the member platform from the admin dashboard.")
      return
    }

    let cancelled = false

    ;(async () => {
      const result = await signIn("credentials", {
        adminAccessToken: token,
        redirect: false,
        callbackUrl: APP_HOME_PATH,
      })

      if (cancelled) return

      if (result?.error || !result?.ok) {
        setError("This sign-in link has expired. Open the member platform again from the admin app.")
        return
      }

      router.replace(result.url || APP_HOME_PATH)
    })()

    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <a href="/login" className="text-sm font-medium text-primary hover:underline">
          Go to sign in
        </a>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Signing you into the member platform…</p>
    </div>
  )
}
