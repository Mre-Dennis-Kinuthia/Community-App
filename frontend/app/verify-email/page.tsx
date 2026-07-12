"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { AUTH_LINK, AUTH_PRIMARY_BTN } from "@/components/auth/auth-form-styles"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""

  const [status, setStatus] = useState<"loading" | "success" | "already" | "error">("loading")
  const [message, setMessage] = useState("Verifying your email…")
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token || !email) {
      setStatus("error")
      setMessage("This verification link is incomplete. Request a new one from the login page.")
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token }),
        })
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (res.ok && data.alreadyVerified) {
          setStatus("already")
          setMessage(data.message || "Your email is already verified.")
          return
        }
        if (res.ok) {
          setStatus("success")
          setMessage(data.message || "Email verified successfully.")
          return
        }
        setStatus("error")
        setMessage(data.error || "Could not verify this link.")
      } catch {
        if (!cancelled) {
          setStatus("error")
          setMessage("Could not verify this link. Please try again.")
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token, email])

  const handleResend = async () => {
    if (!email) return
    try {
      setResending(true)
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      setMessage(data.message || data.error || "If that account exists, a new link was sent.")
    } catch {
      setMessage("Could not resend verification email.")
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthPageShell
      title="Email verification"
      subtitle={message}
    >
      <div className="space-y-4">
        {status === "loading" ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : null}

        {(status === "success" || status === "already") && (
          <Button asChild className={AUTH_PRIMARY_BTN}>
            <Link href="/login">Continue to sign in</Link>
          </Button>
        )}

        {status === "error" && (
          <div className="space-y-3">
            {email ? (
              <Button
                type="button"
                className={AUTH_PRIMARY_BTN}
                onClick={() => void handleResend()}
                disabled={resending}
              >
                {resending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Resend verification email
              </Button>
            ) : null}
            <p className="text-center text-sm">
              <Link href="/login" className={AUTH_LINK}>
                Back to sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </AuthPageShell>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthPageShell title="Email verification" subtitle="Verifying your email…">
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </AuthPageShell>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
