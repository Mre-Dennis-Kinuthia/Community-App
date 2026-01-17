"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface HealthCheck {
  status: "healthy" | "unhealthy"
  checks: {
    AUTH_SECRET: boolean
    DATABASE_URL: boolean
    NODE_ENV: string
    VERCEL: boolean
  }
  message: string
}

export default function SetupCheckPage() {
  const [health, setHealth] = useState<HealthCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch("/api/auth/health")
        const data = await response.json()
        setHealth(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to check health")
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Checking configuration...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error Checking Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isHealthy = health?.status === "healthy"
  const checks = health?.checks

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isHealthy ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Configuration Check
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-destructive" />
                Configuration Issues Detected
              </>
            )}
          </CardTitle>
          <CardDescription>
            {health?.message || "Checking environment variables..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checks && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="font-medium">AUTH_SECRET</span>
                </div>
                {checks.AUTH_SECRET ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="font-medium">DATABASE_URL</span>
                </div>
                {checks.DATABASE_URL ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Environment</span>
                </div>
                <span className="text-sm text-muted-foreground">{checks.NODE_ENV}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Vercel</span>
                </div>
                {checks.VERCEL ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <span className="text-sm text-muted-foreground">Not on Vercel</span>
                )}
              </div>
            </div>
          )}

          {!isHealthy && (
            <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <h3 className="font-semibold text-destructive mb-2">Setup Required</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  Go to{" "}
                  <a
                    href="https://vercel.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Vercel Dashboard
                  </a>
                </li>
                <li>Select your project</li>
                <li>Go to Settings → Environment Variables</li>
                <li>
                  Add <code className="bg-muted px-1 py-0.5 rounded">AUTH_SECRET</code> (generate with:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">openssl rand -base64 32</code>)
                </li>
                <li>
                  Add <code className="bg-muted px-1 py-0.5 rounded">DATABASE_URL</code> (your Neon connection string)
                </li>
                <li>Select <strong>all environments</strong> (Production, Preview, Development)</li>
                <li>Save and <strong>redeploy</strong> your application</li>
              </ol>
            </div>
          )}

          {isHealthy && (
            <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✅ All environment variables are configured correctly!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
