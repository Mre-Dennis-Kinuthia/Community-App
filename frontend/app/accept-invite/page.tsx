"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "@/lib/toast"
import { startNavigation } from "@/lib/navigation"
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { AUTH_LINK, AUTH_PRIMARY_BTN } from "@/components/auth/auth-form-styles"
import {
  getPasswordValidationError,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PWNED_MESSAGE,
  PASSWORD_REQUIREMENTS_LINES,
} from "@/lib/password-policy"
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/auth-routes"

function AcceptInviteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordPwned, setPasswordPwned] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = getPasswordValidationError(password, { email })
    if (validationError) {
      setPasswordError(validationError)
      toast.error("Password not strong enough", validationError)
      return
    }
    if (passwordPwned) {
      setPasswordError(PASSWORD_PWNED_MESSAGE)
      toast.error("Password not allowed", PASSWORD_PWNED_MESSAGE)
      return
    }
    if (password !== confirm) {
      toast.error("Passwords do not match", "Please re-enter your password.")
      return
    }
    if (!token || !email) {
      toast.error("Invalid link", "Ask your community manager for a new invite.")
      return
    }

    setIsLoading(true)
    try {
      const normalizedEmail = email.toLowerCase().trim()
      const res = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Activation failed")

      const signInResult = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        toast.success("Account ready", "Sign in with your new password.")
        router.push(`/login?email=${encodeURIComponent(normalizedEmail)}`)
        return
      }

      toast.success("Welcome!", "Your account is ready.")
      startNavigation()
      router.push(DEFAULT_POST_LOGIN_PATH)
    } catch (err) {
      toast.error(
        "Activation failed",
        err instanceof Error ? err.message : "Please request a new invite."
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <AuthPageShell
        title="Invalid invite link"
        subtitle="This link is missing required parameters. Ask your community manager to send a new invite."
      >
        <p className="text-center">
          <Link href="/login" className={AUTH_LINK}>
            Back to sign in
          </Link>
        </p>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell
      title="Join Impact Hub Nairobi"
      subtitle={`You were invited to ${email}. Create a password to activate your member account.`}
      panelTitle="Welcome to the community"
      panelDescription="Programs, workspace, events, and a local-to-global network of impact makers — all in one place."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (passwordError) setPasswordError(null)
            }}
            onBlur={(e) =>
              setPasswordError(getPasswordValidationError(e.target.value, { email }))
            }
            required
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            aria-invalid={passwordError ? "true" : "false"}
            aria-describedby="password-requirements password-strength password-error"
          />
          <PasswordStrengthMeter
            password={password}
            email={email}
            onPwnedChange={setPasswordPwned}
            className="pt-1"
          />
          <ul
            id="password-requirements"
            className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground"
          >
            {PASSWORD_REQUIREMENTS_LINES.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {passwordError && (
            <p id="password-error" className="text-sm text-destructive" role="alert">
              {passwordError}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
          />
        </div>
        <Button type="submit" className={AUTH_PRIMARY_BTN} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Activating…
            </>
          ) : (
            "Create password & continue"
          )}
        </Button>
        <p className="text-center">
          <Link href="/login" className={AUTH_LINK}>
            Already have a password? Sign in
          </Link>
        </p>
      </form>
    </AuthPageShell>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
          <p className="text-[#1c395c]/70">Loading…</p>
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  )
}
