"use client"

import { Suspense, useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { AUTH_LINK, AUTH_PRIMARY_BTN } from "@/components/auth/auth-form-styles"
import { Input } from "@/components/ui/input"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""

  const [status, setStatus] = useState<"ready" | "loading" | "success" | "already" | "error">(
    token && email ? "ready" : "error"
  )
  const [message, setMessage] = useState(
    token && email
      ? "Confirm that you want to verify this email address."
      : "This verification link is incomplete. Request a new one from the login page."
  )
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [alternateEmail, setAlternateEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = window.setTimeout(
      () => setResendCooldown((remaining) => remaining - 1),
      1000
    )
    return () => window.clearTimeout(timer)
  }, [resendCooldown])

  const verify = async () => {
    setStatus("loading")
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus("error")
        setMessage(data.error || "Could not verify this link.")
        return
      }
      setStatus(data.alreadyVerified ? "already" : "success")
      setMessage(data.message || "Email verified successfully.")
    } catch {
      setStatus("error")
      setMessage("Could not verify this link. Please try again.")
    }
  }

  const handleResend = async (targetEmail = email) => {
    if (!targetEmail) return
    try {
      setResending(true)
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) setResendCooldown(60)
      setMessage(data.message || data.error || "If that account exists, a new link was sent.")
    } catch {
      setMessage("Could not resend verification email.")
    } finally {
      setResending(false)
    }
  }

  const handleChangeEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResending(true)
    try {
      const res = await fetch("/api/auth/change-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail: email,
          newEmail: alternateEmail,
          password,
        }),
      })
      const data = await res.json()
      setMessage(data.message || data.error || "Could not update your email.")
    } catch {
      setMessage("Could not update your email. Please try again.")
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
        {status === "ready" ? (
          <Button className={AUTH_PRIMARY_BTN} onClick={() => void verify()}>
            Verify email address
          </Button>
        ) : null}
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

        {(status === "error" || status === "ready") && (
          <div className="space-y-3">
            {email ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleResend()}
                disabled={resending || resendCooldown > 0}
              >
                {resending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {resendCooldown > 0
                  ? `Resend verification email in ${resendCooldown}s`
                  : "Resend verification email"}
              </Button>
            ) : null}
            {email ? (
              <form className="space-y-2 border-t pt-4" onSubmit={handleChangeEmail}>
                <p className="text-sm font-medium">Can&apos;t access this email?</p>
                <Input
                  type="email"
                  autoComplete="email"
                  value={alternateEmail}
                  onChange={(event) => setAlternateEmail(event.target.value)}
                  placeholder="New email address"
                  required
                />
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Account password"
                  required
                />
                <Button type="submit" variant="outline" disabled={resending}>
                  {resending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Update email and resend link
                </Button>
              </form>
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
        <AuthPageShell title="Email verification" subtitle="Loading verification details…">
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
