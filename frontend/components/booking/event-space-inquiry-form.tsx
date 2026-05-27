"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Loader2, MessageSquare } from "lucide-react"

interface EventSpaceInquiryFormProps {
  workspaceId: string
  workspaceName?: string
  onSuccess?: () => void
}

export function EventSpaceInquiryForm({ workspaceId, workspaceName, onSuccess }: EventSpaceInquiryFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    expectedAttendees: "",
    preferredDate: "",
    eventTitle: "",
    details: "",
    menuNotes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pax = Number(form.expectedAttendees)
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please fill in your name, email, and phone number.")
      return
    }
    if (!Number.isFinite(pax) || pax < 1 || pax > 70) {
      setError("Please enter expected guests between 1 and 70.")
      return
    }

    setSubmitting(true)
    setError(null)

    const messageParts = [
      form.eventTitle.trim() ? `Event / title: ${form.eventTitle.trim()}` : null,
      form.preferredDate.trim() ? `Preferred date: ${form.preferredDate.trim()}` : null,
      `Expected guests: ${pax} (max capacity for this space type: 70)`,
      form.details.trim() ? `\nEvent details:\n${form.details.trim()}` : null,
      form.menuNotes.trim() ? `\nMenu / catering preferences:\n${form.menuNotes.trim()}` : null,
    ].filter(Boolean)

    try {
      const res = await fetch("/api/workspace-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          inquiryType: "event-space",
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          expectedAttendees: pax,
          preferredDate: form.preferredDate.trim() || undefined,
          eventTitle: form.eventTitle.trim() || undefined,
          message: messageParts.join("\n"),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry")
      }

      setSubmitted(true)
      setForm({
        name: "",
        email: "",
        phone: "",
        expectedAttendees: "",
        preferredDate: "",
        eventTitle: "",
        details: "",
        menuNotes: "",
      })
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit inquiry")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center py-6">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Request received</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Thank you for your interest in the event space
              {workspaceName ? ` at ${workspaceName}` : ""}. Our team will contact you with availability and next
              steps.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Event space (up to 70 guests)</CardTitle>
            <CardDescription>
              Information request — share your plans and we will follow up with options and pricing.
            </CardDescription>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          This is not an instant booking. Use the form below for weddings, offsites, launches, and other events for up
          to <span className="font-medium text-foreground">70 PAX</span>.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ev-name">Name *</Label>
              <Input
                id="ev-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-email">Email *</Label>
              <Input
                id="ev-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-phone">Phone *</Label>
              <Input
                id="ev-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="07XX XXX XXX"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ev-pax">Expected number of guests (PAX) *</Label>
            <Input
              id="ev-pax"
              type="number"
              min={1}
              max={70}
              value={form.expectedAttendees}
              onChange={(e) => setForm((p) => ({ ...p, expectedAttendees: e.target.value }))}
              placeholder="e.g. 45"
              required
            />
            <p className="text-xs text-muted-foreground">Maximum 70 guests for this event space enquiry.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ev-date">Preferred date (optional)</Label>
              <Input
                id="ev-date"
                type="date"
                value={form.preferredDate}
                onChange={(e) => setForm((p) => ({ ...p, preferredDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-title">Event title (optional)</Label>
              <Input
                id="ev-title"
                value={form.eventTitle}
                onChange={(e) => setForm((p) => ({ ...p, eventTitle: e.target.value }))}
                placeholder="e.g. Team offsite / AGM"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ev-details">Event details *</Label>
            <Textarea
              id="ev-details"
              value={form.details}
              onChange={(e) => setForm((p) => ({ ...p, details: e.target.value }))}
              placeholder="Date range if flexible, format (theatre / banquet), AV needs, timing, access, etc."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ev-menu">Menu / catering customization (optional)</Label>
            <Textarea
              id="ev-menu"
              value={form.menuNotes}
              onChange={(e) => setForm((p) => ({ ...p, menuNotes: e.target.value }))}
              placeholder="Dietary requirements, preferred pastries or refreshments, branding — we can propose a tailored menu."
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Submit information request"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
