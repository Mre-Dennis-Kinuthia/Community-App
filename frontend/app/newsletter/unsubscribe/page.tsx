"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { AUTH_LINK } from "@/components/auth/auth-form-styles"

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      return
    }

    let cancelled = false
    fetch("/api/newsletter/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (!cancelled) setStatus(res.ok ? "done" : "error")
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })

    return () => {
      cancelled = true
    }
  }, [token])

  if (!token || status === "error") {
    return (
      <AuthPageShell
        title="Unsubscribe link invalid"
        subtitle="This link may have expired or already been used."
      >
        <p className="text-center">
          <Link href="/" className={AUTH_LINK}>
            Return to home
          </Link>
        </p>
      </AuthPageShell>
    )
  }

  if (status === "loading") {
    return (
      <AuthPageShell title="Unsubscribing…" subtitle="Please wait a moment.">
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-[#812926]" aria-hidden />
        </div>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell
      title="You are unsubscribed"
      subtitle="You will no longer receive Impact Hub Nairobi newsletter emails."
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="h-10 w-10 text-[#7ebb55]" aria-hidden />
        <p className="text-sm text-[#1c395c]/80">
          Changed your mind? You can subscribe again from our homepage.
        </p>
        <Link href="/" className={AUTH_LINK}>
          Back to home
        </Link>
      </div>
    </AuthPageShell>
  )
}

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
          <Loader2 className="h-6 w-6 animate-spin text-[#812926]" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  )
}
