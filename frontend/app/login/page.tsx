"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { toast } from "@/lib/toast"
import { startNavigation } from "@/lib/navigation"
import { Loader2 } from "lucide-react"
import { LegalLinks } from "@/components/legal-links"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/auth-routes"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect =
    searchParams.get("redirect") ??
    searchParams.get("callbackUrl") ??
    DEFAULT_POST_LOGIN_PATH
  const registeredEmail = searchParams.get("email")
  const isRegistered = searchParams.get("registered") === "true"
  const accountDeleted = searchParams.get("deleted") === "true"
  const [email, setEmail] = useState(registeredEmail || "")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (accountDeleted) {
      toast.success(
        "Account deleted",
        "Your account was permanently removed. Check your email for confirmation."
      )
      router.replace("/login")
    }
  }, [accountDeleted, router])

  useEffect(() => {
    if (isRegistered && registeredEmail) {
      toast.success("Registration successful!", "You can now sign in with your credentials")
      // Clean up URL
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`)
    }
  }, [isRegistered, registeredEmail, redirect, router])

  const validateField = (field: "email" | "password", value: string) => {
    const newErrors: { email?: string; password?: string } = { ...errors }

    if (field === "email") {
      if (!value) {
        newErrors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = "Please enter a valid email address"
      } else {
        delete newErrors.email
      }
    }

    if (field === "password") {
      if (!value) {
        newErrors.password = "Password is required"
      } else {
        delete newErrors.password
      }
    }

    setErrors(newErrors)
    return !newErrors[field]
  }

  const validate = () => {
    const emailValid = validateField("email", email)
    const passwordValid = validateField("password", password)
    return emailValid && passwordValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[LOGIN FORM] Form submitted:", {
      email,
      hasPassword: !!password,
      passwordLength: password.length,
      redirect,
    })

    if (!validate()) {
      console.log("[LOGIN FORM] Validation failed, errors:", errors)
      toast.error("Please fix the errors in the form")
      return
    }

    // Normalize email to lowercase (server will also normalize, but good to do client-side too)
    const normalizedEmail = email.toLowerCase().trim()
    console.log("[LOGIN FORM] Validation passed, attempting sign in with normalized email...")
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: normalizedEmail,
        password,
        callbackUrl: redirect,
      })

      console.log("[LOGIN FORM] Sign in result:", {
        error: result?.error,
        ok: result?.ok,
        status: result?.status,
        url: result?.url,
      })

      if (result?.error) {
        console.log("[LOGIN FORM] Sign in failed:", result.error)
        
        // Handle configuration errors
        if (result.error === "Configuration") {
          console.error("[LOGIN FORM] Auth.js configuration error - likely missing AUTH_SECRET or DATABASE_URL")
          throw new Error(
            "Server configuration error. Missing AUTH_SECRET or DATABASE_URL. " +
            "Check /setup-check for details or visit Vercel Dashboard → Settings → Environment Variables."
          )
        }
        
        // Handle other errors
        throw new Error("Invalid email or password. Please check your credentials and try again.")
      }

      console.log("[LOGIN FORM] Sign in successful, redirecting to:", result?.url || redirect)
      toast.success("Welcome back!", "You've been successfully logged in")
      startNavigation()
      router.push(result?.url || redirect)
    } catch (error) {
      console.error("[LOGIN FORM] Error:", error)
      toast.error(
        "Oops! That didn't work", 
        error instanceof Error ? error.message : "Please check your email and password, then try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthPageShell
      title="Welcome back"
      subtitle="Sign in to access your member platform — workspace, events, programs, and community."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors({ ...errors, email: undefined })
            }}
            onBlur={(e) => validateField("email", e.target.value)}
            required
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive" role="alert">
              {errors.email}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-[#812926] hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="password123"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors({ ...errors, password: undefined })
            }}
            onBlur={(e) => validateField("password", e.target.value)}
            required
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive" role="alert">
              {errors.password}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full bg-[#812926] hover:bg-[#6b2120]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
        <LegalLinks showAgreement className="px-1" />

        <p className="text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/register" className="font-medium text-[#812926] hover:underline">
            Become a member
          </Link>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Impact Hub staff can sign in with the same email and password used for the admin app.
        </p>
      </form>
    </AuthPageShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
