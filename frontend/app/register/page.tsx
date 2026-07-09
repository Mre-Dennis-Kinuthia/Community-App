"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/lib/toast"
import { startNavigation } from "@/lib/navigation"
import { Loader2 } from "lucide-react"
import { LegalLinks } from "@/components/legal-links"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter"
import {
  isOrganisationalRegisterIntent,
  MEMBERSHIP_REGISTER_INTENT,
} from "@/lib/membership-register-intent"
import { ORGANISATIONAL_PLAN_NAME } from "@/lib/membership-inquiry"
import { markOrganisationalSignupPending } from "@/lib/membership-pending-intent"
import {
  getPasswordValidationError,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PWNED_MESSAGE,
  PASSWORD_REQUIREMENTS_LINES,
} from "@/lib/password-policy"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const organisationalIntent = isOrganisationalRegisterIntent(searchParams.get("intent"))
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
  const [passwordPwned, setPasswordPwned] = useState<boolean | null>(null)

  useEffect(() => {
    if (organisationalIntent) markOrganisationalSignupPending()
    const emailParam = searchParams.get("email")
    if (emailParam && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailParam)) {
      setFormData((prev) => ({ ...prev, email: emailParam.toLowerCase().trim() }))
    }
  }, [organisationalIntent, searchParams])

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
      } else {
        const passwordError = getPasswordValidationError(value, {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
        })
        if (passwordError) {
          newErrors.password = passwordError
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

    if (passwordPwned) {
      setErrors((prev) => ({ ...prev, password: PASSWORD_PWNED_MESSAGE }))
      toast.error("Password not allowed", PASSWORD_PWNED_MESSAGE)
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
        ...(organisationalIntent
          ? { membershipIntent: MEMBERSHIP_REGISTER_INTENT.ORGANISATIONAL }
          : {}),
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
      const loginRedirect = organisationalIntent
        ? "/onboarding?intent=organisational"
        : "/onboarding"
      const successDetail = organisationalIntent
        ? data.emailsQueued === false
          ? "Sign in and complete your profile. Our partnerships team will follow up."
          : "Check your email, then sign in to complete your organisation profile."
        : "You can now sign in and complete your profile."
      toast.success("Account created!", successDetail)
      startNavigation()
      router.push(
        `/login?email=${encodeURIComponent(formData.email)}&registered=true&redirect=${encodeURIComponent(loginRedirect)}`
      )
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
    <AuthPageShell
      title={organisationalIntent ? `${ORGANISATIONAL_PLAN_NAME} membership` : "Become a member"}
      subtitle={
        organisationalIntent
          ? "Create your platform account after applying. Use the same email so we can link your partnership inquiry."
          : "Join Nairobi's impact community — free to start. Book workspace, join events, and connect with fellow innovators."
      }
      panelDescription={
        organisationalIntent
          ? "Partner with Impact Hub Nairobi to co-design programs, events, and ecosystem initiatives that drive inclusive innovation."
          : "Inclusive and sustainable innovation at scale — programs, workspace, events, and a local-to-global impact community."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby="password-requirements password-strength password-error"
          />
          <PasswordStrengthMeter
            password={formData.password}
            email={formData.email}
            name={`${formData.firstName} ${formData.lastName}`.trim()}
            onPwnedChange={setPasswordPwned}
            className="pt-1"
          />
          <ul id="password-requirements" className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
            {PASSWORD_REQUIREMENTS_LINES.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
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
        <Button
          type="submit"
          className="w-full bg-[#812926] hover:bg-[#6b2120]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : organisationalIntent ? (
            "Create account"
          ) : (
            "Become a member"
          )}
        </Button>
        <LegalLinks showAgreement className="px-1" />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={
              organisationalIntent
                ? `/login?redirect=${encodeURIComponent("/onboarding?intent=organisational")}`
                : "/login"
            }
            className="font-medium text-[#812926] hover:underline"
          >
            Sign in
          </Link>
        </p>
        {organisationalIntent ? (
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/membership/organisational" className="text-[#812926] hover:underline">
              Haven&apos;t applied yet? Start the partnership application
            </Link>
          </p>
        ) : null}
      </form>
    </AuthPageShell>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
