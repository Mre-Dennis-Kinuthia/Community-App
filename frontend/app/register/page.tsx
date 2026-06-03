"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { toast } from "@/lib/toast"
import { startNavigation } from "@/lib/navigation"
import { Loader2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { LegalLinks } from "@/components/legal-links"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/onboarding"
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [googleEnabled, setGoogleEnabled] = useState(false)

  useEffect(() => {
    fetch("/api/auth/google-enabled")
      .then((r) => r.json())
      .then((d: { enabled?: boolean }) => setGoogleEnabled(Boolean(d.enabled)))
      .catch(() => setGoogleEnabled(false))
  }, [])

  const validateField = (
    field: "firstName" | "lastName" | "email" | "password" | "confirmPassword",
    value: string
  ) => {
    const newErrors: typeof errors = { ...errors }

    if (field === "firstName") {
      if (!value.trim()) {
        newErrors.firstName = "First name is required"
      } else {
        delete newErrors.firstName
      }
    }

    if (field === "lastName") {
      if (!value.trim()) {
        newErrors.lastName = "Last name is required"
      } else {
        delete newErrors.lastName
      }
    }

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
      } else if (value.length < 8) {
        newErrors.password = "Password must be at least 8 characters"
      } else {
        delete newErrors.password
        // Re-validate confirm password if it exists
        if (formData.confirmPassword && formData.confirmPassword !== value) {
          newErrors.confirmPassword = "Passwords do not match"
        } else if (formData.confirmPassword) {
          delete newErrors.confirmPassword
        }
      }
    }

    if (field === "confirmPassword") {
      if (!value) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (value !== formData.password) {
        newErrors.confirmPassword = "Passwords do not match"
      } else {
        delete newErrors.confirmPassword
      }
    }

    setErrors(newErrors)
    return !newErrors[field]
  }

  const validate = () => {
    const firstNameValid = validateField("firstName", formData.firstName)
    const lastNameValid = validateField("lastName", formData.lastName)
    const emailValid = validateField("email", formData.email)
    const passwordValid = validateField("password", formData.password)
    const confirmPasswordValid = validateField("confirmPassword", formData.confirmPassword)
    return firstNameValid && lastNameValid && emailValid && passwordValid && confirmPasswordValid
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[REGISTER FORM] Form submitted with data:", {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      hasPassword: !!formData.password,
      passwordLength: formData.password.length,
    })

    if (!validate()) {
      console.log("[REGISTER FORM] Validation failed, errors:", errors)
      toast.error("Please fix the errors in the form")
      return
    }

    console.log("[REGISTER FORM] Validation passed, submitting...")
    setIsLoading(true)
    try {
      // Combine firstName and lastName into name for API
      const name = `${formData.firstName} ${formData.lastName}`.trim()
      // Normalize email to lowercase (server will also normalize, but good to do client-side too)
      const normalizedEmail = formData.email.toLowerCase().trim()
      const payload = {
        email: normalizedEmail,
        password: formData.password,
        name: name || undefined,
      }

      console.log("[REGISTER FORM] Sending request to /api/auth/register:", {
        email: payload.email,
        hasPassword: !!payload.password,
        passwordLength: payload.password.length,
        name: payload.name,
      })

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("[REGISTER FORM] Response status:", response.status)
      const data = await response.json()
      console.log("[REGISTER FORM] Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      console.log("[REGISTER FORM] Registration successful, redirecting to login")
      toast.success("Account created!", "You can now sign in and complete your profile.")
      startNavigation()
      router.push(`/login?email=${encodeURIComponent(formData.email)}&registered=true&redirect=${encodeURIComponent("/onboarding")}`)
    } catch (error) {
      console.error("[REGISTER FORM] Error:", error)
      toast.error(
        "Registration failed",
        error instanceof Error ? error.message : "Please check your information and try again. If the problem persists, contact support."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 p-4">
      <Logo href="/" className="mb-6" />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Join the Community</CardTitle>
          <CardDescription>Create your account to get started with Impact Hub Nairobi</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  name="first-name"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  onBlur={(e) => validateField("firstName", e.target.value)}
                  required
                  aria-invalid={errors.firstName ? "true" : "false"}
                  aria-describedby={errors.firstName ? "first-name-error" : undefined}
                />
                {errors.firstName && (
                  <p id="first-name-error" className="text-sm text-destructive" role="alert">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  name="last-name"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  onBlur={(e) => validateField("lastName", e.target.value)}
                  required
                  aria-invalid={errors.lastName ? "true" : "false"}
                  aria-describedby={errors.lastName ? "last-name-error" : undefined}
                />
                {errors.lastName && (
                  <p id="last-name-error" className="text-sm text-destructive" role="alert">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@email.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter a secure password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                onBlur={(e) => validateField("password", e.target.value)}
                required
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters
              </p>
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                onBlur={(e) => validateField("confirmPassword", e.target.value)}
                required
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
              />
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="text-sm text-destructive" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            {googleEnabled ? (
              <>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
                  </div>
                </div>
                <GoogleSignInButton
                  callbackUrl={redirect}
                  label="Sign up with Google"
                  disabled={isLoading}
                />
              </>
            ) : null}

            <LegalLinks showAgreement className="px-1" />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
