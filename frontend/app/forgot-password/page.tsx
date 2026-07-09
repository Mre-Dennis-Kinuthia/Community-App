"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "@/lib/toast"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { AUTH_LINK, AUTH_PRIMARY_BTN } from "@/components/auth/auth-form-styles"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalized = email.toLowerCase().trim()
    if (!normalized) {
      toast.error("Email required", "Please enter your email address.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      })
      const data = await res.json()
      setSubmitted(true)
      toast.success("Check your inbox", data.message || "If an account exists, we sent a reset link.")
    } catch {
      toast.error("Something went wrong", "Please try again in a moment.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthPageShell
      title="Reset password"
      subtitle={
        submitted
          ? "If an account exists for that email, you will receive a reset link shortly."
          : "Enter your email and we will send you a reset link."
      }
      panelTitle="Back on track"
      panelDescription="Reset your password and return to programs, events, and your Impact Hub Nairobi community."
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className={AUTH_PRIMARY_BTN} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
          <p className="text-center">
            <Link href="/login" className={AUTH_LINK}>
              Back to sign in
            </Link>
          </p>
        </form>
      ) : (
        <p className="text-center">
          <Link href="/login" className={AUTH_LINK}>
            Back to sign in
          </Link>
        </p>
      )}
    </AuthPageShell>
  )
}
