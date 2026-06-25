"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { format, isToday, isTomorrow } from "date-fns"
import { ArrowLeft, Loader2, Plus, UserRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PillTabs } from "@/components/mobile/pill-tabs"
import { MobilePageHeader } from "@/components/mobile/mobile-page-shell"
import { LocationSelect } from "@/components/location-select"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"

type Visitor = {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  expectedAt: string
  purpose: string | null
  status: "expected" | "checked_in" | "checked_out" | "cancelled"
  location: { id: string; name: string } | null
}

const statusLabel: Record<Visitor["status"], string> = {
  expected: "Expected",
  checked_in: "Checked in",
  checked_out: "Checked out",
  cancelled: "Cancelled",
}

function statusVariant(status: Visitor["status"]) {
  switch (status) {
    case "checked_in":
      return "default"
    case "expected":
      return "secondary"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}

function formatExpectedAt(value: string) {
  const date = new Date(value)
  const time = format(date, "h:mm a")
  if (isToday(date)) return `Today, ${time}`
  if (isTomorrow(date)) return `Tomorrow, ${time}`
  return format(date, "EEE, MMM d · h:mm a")
}

export default function DashboardVisitorsPage() {
  const enabled = isFeatureEnabled("visitorManagement")
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [hubCount, setHubCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    expectedAt: "",
    purpose: "",
    locationId: "",
  })

  const loadVisitors = useCallback(async () => {
    const res = await fetch("/api/visitors", { credentials: "include" })
    if (res.status === 404) return []
    if (!res.ok) throw new Error("Failed to load visitors")
    const data = await res.json()
    return (data.visitors || []) as Visitor[]
  }, [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const visitorRows = await loadVisitors()
        if (cancelled) return
        setVisitors(visitorRows)
      } catch {
        if (!cancelled) toast.error("Could not load visitors", "Please try again.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enabled, loadVisitors])

  useEffect(() => {
    if (!showForm || form.expectedAt) return
    const next = new Date()
    next.setMinutes(next.getMinutes() + 30 - (next.getMinutes() % 15))
    setForm((prev) => ({
      ...prev,
      expectedAt: format(next, "yyyy-MM-dd'T'HH:mm"),
    }))
  }, [showForm, form.expectedAt])

  if (!enabled) {
    return (
      <div className="space-y-4">
        <MobilePageHeader title="Visitors" description="Pre-register guests for reception" />
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Visitor management is not enabled on this environment.
          </CardContent>
        </Card>
      </div>
    )
  }

  const now = new Date()
  const upcoming = visitors.filter(
    (v) =>
      v.status === "expected" ||
      v.status === "checked_in" ||
      (v.status !== "cancelled" && new Date(v.expectedAt) >= now)
  )
  const past = visitors.filter((v) => !upcoming.includes(v))
  const displayed = activeTab === "upcoming" ? upcoming : past

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.expectedAt) {
      toast.error("Missing details", "Name and visit time are required.")
      return
    }
    if (hubCount > 1 && !form.locationId) {
      toast.error("Select a hub", "Choose which workspace your guest is visiting.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/visitors", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          company: form.company.trim() || null,
          purpose: form.purpose.trim() || null,
          expectedAt: new Date(form.expectedAt).toISOString(),
          locationId: form.locationId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error("Registration failed", data.error || "Please try again.")
        return
      }
      toast.success("Visitor registered", "Reception has been notified.")
      setShowForm(false)
      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        expectedAt: "",
        purpose: "",
        locationId: hubCount === 1 ? form.locationId : "",
      })
      setVisitors(await loadVisitors())
    } catch {
      toast.error("Registration failed", "Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <MobilePageHeader
            title="My visitors"
            description="Pre-register guests so reception can check them in quickly"
          />
        </div>
        <Button size="sm" className="shrink-0 rounded-lg" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">{showForm ? "Cancel" : "Register guest"}</span>
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Register a visitor</CardTitle>
            <CardDescription>Reception will see this on their front-desk list.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="visitor-name">Full name *</Label>
                <Input
                  id="visitor-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitor-email">Email</Label>
                <Input
                  id="visitor-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="jane@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitor-phone">Phone</Label>
                <Input
                  id="visitor-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+254…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitor-company">Company</Label>
                <Input
                  id="visitor-company"
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  placeholder="Acme Ltd"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitor-expected">Expected arrival *</Label>
                <Input
                  id="visitor-expected"
                  type="datetime-local"
                  value={form.expectedAt}
                  onChange={(e) => setForm((f) => ({ ...f, expectedAt: e.target.value }))}
                  required
                />
              </div>
              <LocationSelect
                label="Hub"
                value={form.locationId}
                onChange={(locationId) => setForm((f) => ({ ...f, locationId }))}
                onLoaded={(hubs) => setHubCount(hubs.length)}
                required={hubCount > 1}
                className="sm:col-span-2"
              />
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="visitor-purpose">Purpose of visit</Label>
                <Textarea
                  id="visitor-purpose"
                  value={form.purpose}
                  onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                  placeholder="Meeting, interview, workshop…"
                  rows={2}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register visitor"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <PillTabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "upcoming" | "past")}
        items={[
          { value: "upcoming", label: `Upcoming (${upcoming.length})` },
          { value: "past", label: `Past (${past.length})` },
        ]}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : displayed.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <UserRound className="h-10 w-10 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              {activeTab === "upcoming"
                ? "No upcoming visitors. Register a guest before they arrive."
                : "No past visitors yet."}
            </p>
            {activeTab === "upcoming" ? (
              <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                Register guest
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayed.map((visitor) => (
            <Card key={visitor.id} className={cn(visitor.status === "checked_in" && "border-primary/40")}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{visitor.name}</p>
                    <Badge variant={statusVariant(visitor.status)}>{statusLabel[visitor.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatExpectedAt(visitor.expectedAt)}</p>
                  <p className="text-xs text-muted-foreground">
                    {[visitor.company, visitor.location?.name, visitor.purpose]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
