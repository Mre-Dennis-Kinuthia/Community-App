"use client"

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { AUTH_LINK, AUTH_PRIMARY_BTN } from "@/components/auth/auth-form-styles"
import { Input } from "@/components/ui/input"
import { safeRedirectPath } from "@/lib/auth-routes"
import { safeLumaRedirectUrl } from "@/lib/luma"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""
  const registrationNotice = searchParams.has("sent")
  const emailSent = searchParams.get("sent") !== "false"
  const redirectParam = searchParams.get("redirect")
  const redirect =
    safeRedirectPath(redirectParam) ?? safeLumaRedirectUrl(redirectParam)

  const [status, setStatus] = useState<
    "waiting" | "loading" | "success" | "already" | "error"
  >(
    token ? (email ? "loading" : "error") : "waiting"
  )
  const [message, setMessage] = useState(() => {
    if (token && email) return "Verifying your email address…"
    if (token) return "This verification link is incomplete. Request a new one from the login page."
    if (registrationNotice && !emailSent) {
      return "Your account was created, but we couldn't send the verification email. You can request another link below."
    }
    if (registrationNotice) {
      return "Your account was created. Check your inbox for the verification link. Clicking it will verify your email automatically."
    }
    if (email) return "Check your inbox for a verification link. Clicking it will verify your email automatically."
    return "Open the verification link from your email to verify your account."
  })
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [alternateEmail, setAlternateEmail] = useState("")
  const [password, setPassword] = useState("")
  const [currentEmail, setCurrentEmail] = useState(email)
  const verificationRequestKey = useRef("")

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = window.setTimeout(
      () => setResendCooldown((remaining) => remaining - 1),
      1000
    )
    return () => window.clearTimeout(timer)
  }, [resendCooldown])

  useEffect(() => {
    if (!token || !email) return

    const requestKey = `${email}\u0000${token}`
    if (verificationRequestKey.current === requestKey) return
    verificationRequestKey.current = requestKey

    setStatus("loading")
    setMessage("Verifying your email address…")

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token }),
        })
        const data = await res.json()
        if (verificationRequestKey.current !== requestKey) return
        if (!res.ok) {
          setStatus("error")
          setMessage(data.error || "Could not verify this link.")
          return
        }
        setStatus(data.alreadyVerified ? "already" : "success")
        setMessage(data.message || "Email verified successfully.")
      } catch {
        if (verificationRequestKey.current !== requestKey) return
        setStatus("error")
        setMessage("Could not verify this link. Please try again.")
      }
    }

    void verify()
  }, [email, token])

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
      if (res.ok) {
        setResendCooldown(60)
        setStatus("waiting")
      }
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
      if (res.ok) {
        const updatedEmail = alternateEmail.toLowerCase().trim()
        setCurrentEmail(updatedEmail)
        setAlternateEmail("")
        setResendCooldown(60)
        setStatus("waiting")
        const params = new URLSearchParams({
          email: updatedEmail,
          sent: String(data.emailed),
        })
        if (redirect) params.set("redirect", redirect)
        router.replace(`/verify-email?${params.toString()}`)
      }
      setMessage(data.message || data.error || "Could not update your email.")
    } catch {
      setMessage("Could not update your email. Please try again.")
    } finally {
      setResending(false)
    }
  }

  const loginParams = new URLSearchParams()
  if (currentEmail) loginParams.set("email", currentEmail)
  if (redirect) loginParams.set("redirect", redirect)
  const loginHref = `/login${loginParams.size ? `?${loginParams.toString()}` : ""}`
  const title =
    status === "loading"
      ? "Verifying your email"
      : status === "success" || status === "already"
        ? "Email verified"
        : status === "waiting" && registrationNotice
          ? "Check your email"
          : "Email verification"

  return (
    <AuthPageShell
      title={title}
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
            <Link href={loginHref}>Continue to sign in</Link>
          </Button>
        )}

        {(status === "error" || status === "waiting") && (
          <div className="space-y-3">
            {currentEmail ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleResend(currentEmail)}
                disabled={resending || resendCooldown > 0}
              >
                {resending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {resendCooldown > 0
                  ? `Resend verification email in ${resendCooldown}s`
                  : "Resend verification email"}
              </Button>
            ) : null}
            {currentEmail ? (
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
              <Link href={loginHref} className={AUTH_LINK}>
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
