"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { handleLogin } from "@/app/actions/auth-actions"
import { toast } from "@/lib/toast"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

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
      } else if (value.length < 6) {
        newErrors.password = "Password must be at least 6 characters"
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

    if (!validate()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      await handleLogin(formData)
      toast.success("Welcome back!", "You've been successfully logged in")
      router.push("/dashboard")
    } catch (error) {
      toast.error(
        "Oops! That didn't work", 
        error instanceof Error ? error.message : "Please check your email and password, then try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your Impact Hub account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="demo@impacthub.co.ke"
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
                <Link href="#" className="text-sm text-primary hover:underline">
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
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 6 characters
              </p>
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">Demo: demo@impacthub.co.ke / password123</p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/register" className="text-primary hover:underline">
                Join the community
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
