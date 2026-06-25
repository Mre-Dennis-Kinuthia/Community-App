"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Loader2, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MobilePageHeader } from "@/components/mobile/mobile-page-shell"
import { LocationSelect } from "@/components/location-select"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { toast } from "@/lib/toast"
import { useRouter } from "next/navigation"

type Ticket = {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: string
  location: { id: string; name: string } | null
}

const categories = ["internet", "cleaning", "printer", "hvac", "other"] as const

export default function MaintenancePage() {
  const router = useRouter()
  const enabled = isFeatureEnabled("operationsModule")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other" as (typeof categories)[number],
    locationId: "",
  })

  useEffect(() => {
    if (!enabled) {
      router.replace("/dashboard")
    }
  }, [enabled, router])

  const loadTickets = useCallback(async () => {
    const res = await fetch("/api/maintenance-requests", { credentials: "include" })
    if (!res.ok) throw new Error("Failed to load requests")
    const data = await res.json()
    return (data.tickets || []) as Ticket[]
  }, [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const rows = await loadTickets()
        if (!cancelled) setTickets(rows)
      } catch {
        if (!cancelled) toast.error("Could not load maintenance requests", "Please try again.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enabled, loadTickets])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required")
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch("/api/maintenance-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          locationId: form.locationId || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error("Request failed", json.error || "Please try again")
        return
      }
      toast.success("Request submitted", "Facilities will follow up soon.")
      setForm({ title: "", description: "", category: "other", locationId: form.locationId })
      setTickets(await loadTickets())
    } catch {
      toast.error("Request failed", "Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!enabled) return null

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex min-w-0 items-start gap-2">
        <Button variant="ghost" size="icon" className="shrink-0 mt-0.5" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <MobilePageHeader
          title="Maintenance"
          description="Report facilities issues at your hub"
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">New request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as (typeof categories)[number] }))}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <LocationSelect
              value={form.locationId}
              onChange={(locationId) => setForm((f) => ({ ...f, locationId }))}
            />
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading...
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No maintenance requests yet.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {tickets.map((t) => (
            <li key={t.id}>
              <Card>
                <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <p className="font-medium">{t.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.location?.name ? `${t.location.name} · ` : ""}
                      {format(new Date(t.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Badge variant="outline" className="capitalize">{t.status}</Badge>
                    <Badge variant="secondary" className="capitalize">{t.category}</Badge>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
