"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { toast } from "@/lib/toast"
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter"
import {
  getPasswordValidationError,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PWNED_MESSAGE,
  PASSWORD_REQUIREMENTS_LINES,
} from "@/lib/password-policy"

function ResetPasswordForm() {
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
      toast.error("Invalid link", "Request a new reset link from the forgot password page.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          token,
          password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Reset failed")
      }
      toast.success("Password updated", "You can sign in with your new password.")
      router.push("/login")
    } catch (err) {
      toast.error(
        "Reset failed",
        err instanceof Error ? err.message : "Please request a new link."
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Invalid reset link</CardTitle>
            <CardDescription>
              This link is missing required parameters. Request a new reset link.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/forgot-password" className="text-primary hover:underline">
              Request new link
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <Logo />
          </div>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>Choose a strong, unique password.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
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
              <ul id="password-requirements" className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </Button>
            <Link href="/login" className="text-sm text-primary hover:underline">
              Back to sign in
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
