"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, Loader2, MessageSquare } from "lucide-react"

interface PrivateOfficeInquiryFormProps {
  workspaceId: string
  workspaceName?: string
  onSuccess?: () => void
}

export function PrivateOfficeInquiryForm({
  workspaceId,
  workspaceName,
  onSuccess,
}: PrivateOfficeInquiryFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please fill in your name, email, and phone number.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/workspace-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry")
      }

      setSubmitted(true)
      setForm({ name: "", email: "", phone: "", message: "" })
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
            <h3 className="font-semibold text-lg mb-1">Inquiry submitted</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Thank you for your interest in a private office. Our staff will contact you shortly to discuss your requirements and custom pricing.
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
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Private Office Inquiry</CardTitle>
            <CardDescription>
              Custom pricing – a staff member will contact you to discuss your requirements
            </CardDescription>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Private office pricing is tailored to your needs. Submit your details and our team will reach out with options.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inquiry-name">Name *</Label>
            <Input
              id="inquiry-name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inquiry-email">Email *</Label>
            <Input
              id="inquiry-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inquiry-phone">Phone *</Label>
            <Input
              id="inquiry-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="07XX XXX XXX"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inquiry-message">Requirements / Message (optional)</Label>
            <Textarea
              id="inquiry-message"
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Tell us about your team size, duration, and any specific needs..."
              rows={4}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Inquiry"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
