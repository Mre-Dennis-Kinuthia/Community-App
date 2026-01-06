"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { handleRegister } from "@/app/actions/auth-actions"
import { toast } from "@/lib/toast"
import { Loader2 } from "lucide-react"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    email?: string
  }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateField = (field: "firstName" | "lastName" | "email", value: string) => {
    const newErrors: {
      firstName?: string
      lastName?: string
      email?: string
    } = { ...errors }

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

    setErrors(newErrors)
    return !newErrors[field]
  }

  const validate = () => {
    const firstNameValid = validateField("firstName", formData.firstName)
    const lastNameValid = validateField("lastName", formData.lastName)
    const emailValid = validateField("email", formData.email)
    return firstNameValid && lastNameValid && emailValid
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsLoading(true)
    try {
      const submitFormData = new FormData()
      submitFormData.append("first-name", formData.firstName)
      submitFormData.append("last-name", formData.lastName)
      submitFormData.append("email", formData.email)
      await handleRegister(submitFormData)
      toast.success("Account created!", "Welcome to Impact Hub Nairobi")
      router.push(redirect)
    } catch (error) {
      toast.error(
        "Oops! Registration didn't work", 
        error instanceof Error ? error.message : "Please check your information and try again. If the problem persists, contact support."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
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
                  placeholder="John"
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
                  placeholder="Doe"
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
                placeholder="john@example.com"
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
