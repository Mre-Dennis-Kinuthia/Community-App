"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Logo } from "@/components/logo"
import { toast } from "@/lib/toast"

type PayLink = {
  id: string
  recipientEmail: string
  recipientName: string | null
  amount: number
  currency: string
  status: string
  expiresAt: string
  adminNote: string | null
  plan: { name: string; interval: string; description: string | null }
}

export default function MembershipPayPage() {
  const params = useParams()
  const token = params.token as string
  const { data: session, status: sessionStatus } = useSession()

  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [link, setLink] = useState<PayLink | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/membership/pay/${token}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Invalid link")
        setLink(data.link)
        setEmail(data.link.recipientEmail)
        if (data.sessionEmail) setEmail(data.sessionEmail)
        if (data.link.recipientName) setName(data.link.recipientName)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load payment link")
      } finally {
        setLoading(false)
      }
    }
    if (token) load()
  }, [token])

  const handlePay = async () => {
    if (!link || link.status !== "pending") return
    if (!phone.trim()) {
      toast.error("Enter your M-Pesa phone number")
      return
    }
    if (!session?.user && !email.trim()) {
      toast.error("Enter your email address")
      return
    }

    setPaying(true)
    try {
      const res = await fetch(`/api/membership/pay/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user ? undefined : email.trim(),
          name: name.trim() || undefined,
          phoneNumber: phone.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Payment failed")
      setDone(true)
      toast.success("Membership activated", data.message)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment failed")
    } finally {
      setPaying(false)
    }
  }

  const intervalLabel = link?.plan.interval === "yearly" ? "year" : "month"

  return (
    <div className="min-h-[100svh] bg-background">
      <header className="border-b border-border">
        <div className="container flex h-14 items-center px-4">
          <Logo href="/" />
        </div>
      </header>

      <main className="container max-w-lg px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-muted-foreground">{error}</p>
              <Button asChild variant="outline">
                <Link href="/">Back to home</Link>
              </Button>
            </CardContent>
          </Card>
        ) : done ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
              <h1 className="text-xl font-semibold">Membership active</h1>
              <p className="text-sm text-muted-foreground">
                Thank you. Your {link?.plan.name} membership is now active.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button asChild>
                  <Link href={session?.user ? "/billing" : "/login"}>
                    {session?.user ? "View billing" : "Sign in to your account"}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Go to dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : link ? (
          <Card>
            <CardHeader>
              <CardTitle>Membership payment</CardTitle>
              <CardDescription>
                {link.plan.name} · {link.currency} {link.amount.toLocaleString()} / {intervalLabel}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {link.status !== "pending" ? (
                <p className="text-sm text-muted-foreground capitalize">This link is {link.status}.</p>
              ) : (
                <>
                  {link.adminNote ? (
                    <p className="rounded-md border border-border bg-muted/40 p-3 text-sm">{link.adminNote}</p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    Expires {new Date(link.expiresAt).toLocaleDateString("en-KE", { dateStyle: "long" })}
                  </p>

                  {sessionStatus === "authenticated" && session?.user ? (
                    <p className="text-sm">
                      Paying as <strong>{session.user.email}</strong>
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="pay-email">Email (must match invite)</Label>
                        <Input
                          id="pay-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          readOnly={!!link.recipientEmail}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pay-name">Full name</Label>
                        <Input id="pay-name" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Already have an account?{" "}
                        <Link href={`/login?redirect=/pay/${token}`} className="text-primary underline">
                          Sign in
                        </Link>
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="pay-phone">M-Pesa phone number</Label>
                    <Input
                      id="pay-phone"
                      placeholder="07XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <Button className="w-full" disabled={paying} onClick={() => void handlePay()}>
                    {paying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      `Pay ${link.currency} ${link.amount.toLocaleString()}`
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  )
}
