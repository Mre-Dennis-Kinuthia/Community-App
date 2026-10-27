"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/lib/toast"

export function MembershipDetailsForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/membership/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Could not submit your request.")
      }

      setSubmitted(true)
      toast.success("Request received", "Our team will email you membership details.")
    } catch (error) {
      toast.error(
        "Could not submit",
        error instanceof Error ? error.message : "Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div
        className="mt-7 flex items-start gap-3 rounded-md border border-[#7ebb55]/30 bg-white p-5 text-sm leading-relaxed text-[#1c395c]"
        role="status"
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3d6b28]" aria-hidden />
        <p>
          Thanks, {name}. Your request has been sent. We’ll email membership details to{" "}
          <span className="font-medium">{email}</span>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-4 rounded-md border border-[#edeff2] bg-white p-5 shadow-sm md:p-6">
      <div className="space-y-2">
        <Label htmlFor="membership-details-name">Name</Label>
        <Input
          id="membership-details-name"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={120}
          required
          disabled={submitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="membership-details-email">Email</Label>
        <Input
          id="membership-details-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          maxLength={254}
          required
          disabled={submitting}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-[#812926] hover:bg-[#6b2120]"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Sending request…
          </>
        ) : (
          <>
            Send me membership details
            <ArrowRight className="h-4 w-4" aria-hidden />
          </>
        )}
      </Button>
      <p className="text-center text-xs text-[#1c395c]/60">
        We’ll use your details only to follow up about Impact Hub Nairobi membership.
      </p>
    </form>
  )
}
