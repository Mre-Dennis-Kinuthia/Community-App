"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MEMBERSHIP_LINK,
  MEMBERSHIP_PRIMARY_BTN,
  MembershipPageShell,
} from "@/components/membership/membership-page-shell"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { IMPACT_SECTORS, PRIMARY_ROLES } from "@/lib/member-segmentation"
import {
  HOW_HEARD_OPTIONS,
  STAR_CONNECT_DISCOVERY_CALL_URL,
  STAR_CONNECT_PLAN_NAME,
  STAR_CONNECT_PRICE_LABEL,
  STAR_CONNECT_PRIMARY_NEEDS,
  STAR_CONNECT_RESPONSE_SLA,
  TARGET_START,
  VENTURE_STAGES,
  WORKSPACE_NEEDS,
} from "@/lib/membership-inquiry"
import { HUB_PUBLIC_EMAIL } from "@/lib/hub-contact"
import { ArrowRight, Calendar, CheckCircle2, Linkedin, Loader2 } from "lucide-react"

const STEPS = ["About you & your venture", "What you need"] as const
const VENTURE_MAX = 800
const SUPPORT_MAX = 500

function emptyForm() {
  return {
    fullName: "",
    email: "",
    phone: "",
    location: "Nairobi, Kenya",
    linkedinUrl: "",
    websiteUrl: "",
    organization: "",
    ventureDescription: "",
    role: "",
    sector: "",
    ventureStage: "",
    primaryNeeds: [] as string[],
    workspaceNeed: "",
    targetStart: "",
    supportNeeded: "",
    howHeard: "",
    referralName: "",
    message: "",
    consent: false,
  }
}

export default function StarConnectApplicationPage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const update = (field: keyof ReturnType<typeof emptyForm>, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleNeed = (need: string) => {
    setForm((prev) => ({
      ...prev,
      primaryNeeds: prev.primaryNeeds.includes(need)
        ? prev.primaryNeeds.filter((n) => n !== need)
        : [...prev.primaryNeeds, need],
    }))
  }

  const showReferral = form.howHeard === "Referral from a member"

  const validateStep1 = (): boolean => {
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Missing details", "Fill in your name, email, and phone.")
      return false
    }
    if (!form.organization.trim() || form.ventureDescription.trim().length < 25) {
      toast.error("Tell us about your venture", "Add your venture name and a short description.")
      return false
    }
    if (!form.role || !form.sector || !form.ventureStage) {
      toast.error("Almost there", "Select your role, sector, and stage.")
      return false
    }
    return true
  }

  const handleContinue = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.primaryNeeds.length === 0) {
      toast.error("Pick what you need", "Select at least one membership benefit.")
      return
    }
    if (!form.workspaceNeed || !form.targetStart) {
      toast.error("Almost there", "Select workspace needs and start timing.")
      return
    }
    if (form.supportNeeded.trim().length < 15) {
      toast.error("One more thing", "Briefly describe the support you need.")
      return
    }
    if (!form.consent) {
      toast.error("Consent required", "Please agree so we can contact you.")
      return
    }
    if (showReferral && !form.referralName.trim()) {
      toast.error("Who referred you?", "Enter your referrer's name.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/membership/star-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          location: form.location,
          linkedinUrl: form.linkedinUrl.trim() || undefined,
          websiteUrl: form.websiteUrl.trim() || undefined,
          organization: form.organization,
          ventureDescription: form.ventureDescription,
          role: form.role,
          sector: form.sector,
          ventureStage: form.ventureStage,
          primaryNeeds: form.primaryNeeds,
          workspaceNeed: form.workspaceNeed,
          targetStart: form.targetStart,
          supportNeeded: form.supportNeeded,
          howHeard: form.howHeard || undefined,
          referralName: showReferral ? form.referralName.trim() : undefined,
          message: form.message.trim() || undefined,
          consent: true,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Submission failed")
      setSubmitted(true)
      if (data.emailsQueued === false) {
        toast.success(
          "Application saved",
          "Email is temporarily unavailable — book a discovery call below or contact us."
        )
      } else {
        toast.success("Submitted", "Check your email for next steps.")
      }
    } catch (err) {
      toast.error("Could not submit", err instanceof Error ? err.message : "Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <MembershipPageShell>
          <Card className="auth-page-card border-[#edeff2] bg-white shadow-sm">
            <CardHeader className="pb-2 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#812926]/10">
                <CheckCircle2 className="h-6 w-6 text-[#812926]" aria-hidden />
              </div>
              <CardTitle className="text-xl text-[#0a1f38]">You&apos;re on the list</CardTitle>
              <CardDescription className="text-base leading-relaxed text-[#1c395c]/80">
                We emailed <strong className="text-[#0a1f38]">{form.email}</strong> with next
                steps. Our team will reply {STAR_CONNECT_RESPONSE_SLA}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild size="lg" className={MEMBERSHIP_PRIMARY_BTN}>
                <a
                  href={STAR_CONNECT_DISCOVERY_CALL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book discovery call
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full border-[#edeff2] bg-white">
                <Link href="/register">Create your platform account</Link>
              </Button>
              <p className="text-center text-xs text-[#1c395c]/70">
                Use the same email ({form.email}) so we can link your Star Connect membership.
              </p>
              <Button variant="ghost" asChild className="w-full text-[#1c395c]">
                <Link href="/">Back to home</Link>
              </Button>
            </CardContent>
          </Card>
      </MembershipPageShell>
    )
  }

  return (
    <MembershipPageShell backLabel="Back">
        <div>
          <p className="section-label text-left">{STAR_CONNECT_PLAN_NAME}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0a1f38]">
            Apply for membership
          </h1>
          <p className="mt-2 text-sm text-[#1c395c]/80">
            {STAR_CONNECT_PRICE_LABEL} · Two quick steps · Response {STAR_CONNECT_RESPONSE_SLA}
          </p>
          <div className="mt-4 flex gap-2" aria-label={`Step ${step} of 2`}>
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className={cn(
                    "h-1 rounded-full transition-colors",
                    i + 1 <= step ? "bg-[#812926]" : "bg-[#edeff2]"
                  )}
                />
                <p
                  className={cn(
                    "mt-1.5 text-[10px] font-medium uppercase tracking-wider",
                    i + 1 === step ? "text-[#0a1f38]" : "text-[#1c395c]/60"
                  )}
                >
                  {i + 1}. {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Card className="auth-page-card border-[#edeff2] bg-white shadow-sm">
          <CardContent className="pt-6">
            {step === 1 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  How we reach you and a snapshot of your venture.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      required
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone / WhatsApp</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+254…"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="location">City</Label>
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(e) => update("location", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Venture name</Label>
                  <Input
                    id="organization"
                    required
                    value={form.organization}
                    onChange={(e) => update("organization", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ventureDescription">What does your venture do?</Label>
                  <Textarea
                    id="ventureDescription"
                    required
                    rows={3}
                    maxLength={VENTURE_MAX}
                    placeholder="Product, customers, and what you're building toward…"
                    value={form.ventureDescription}
                    onChange={(e) =>
                      update("ventureDescription", e.target.value.slice(0, VENTURE_MAX))
                    }
                    className="resize-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="role">Your role</Label>
                    <Select value={form.role} onValueChange={(v) => update("role", v)}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIMARY_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <Select value={form.sector} onValueChange={(v) => update("sector", v)}>
                      <SelectTrigger id="sector">
                        <SelectValue placeholder="Sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {IMPACT_SECTORS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="ventureStage">Stage</Label>
                    <Select
                      value={form.ventureStage}
                      onValueChange={(v) => update("ventureStage", v)}
                    >
                      <SelectTrigger id="ventureStage">
                        <SelectValue placeholder="Stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {VENTURE_STAGES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-1.5 text-muted-foreground">
                      <Linkedin className="h-3.5 w-3.5 text-[#0A66C2]" aria-hidden />
                      LinkedIn <span className="font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="linkedin"
                      placeholder="linkedin.com/in/…"
                      value={form.linkedinUrl}
                      onChange={(e) => update("linkedinUrl", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-muted-foreground">
                      Website <span className="font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="website"
                      placeholder="yourventure.com"
                      value={form.websiteUrl}
                      onChange={(e) => update("websiteUrl", e.target.value)}
                    />
                  </div>
                </div>

                <Button type="button" className={`${MEMBERSHIP_PRIMARY_BTN}`} size="lg" onClick={handleContinue}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Help us understand how Star Connect can support you.
                </p>

                <div className="space-y-2">
                  <Label>I&apos;m interested in…</Label>
                  <div className="flex flex-wrap gap-2">
                    {STAR_CONNECT_PRIMARY_NEEDS.map((need) => (
                      <button
                        key={need}
                        type="button"
                        onClick={() => toggleNeed(need)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-left text-xs transition-colors sm:text-sm",
                          form.primaryNeeds.includes(need)
                            ? "border-primary bg-primary/10 font-medium text-foreground"
                            : "border-border text-muted-foreground hover:border-foreground/30"
                        )}
                      >
                        {need}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="workspaceNeed">Workspace</Label>
                    <Select
                      value={form.workspaceNeed}
                      onValueChange={(v) => update("workspaceNeed", v)}
                    >
                      <SelectTrigger id="workspaceNeed">
                        <SelectValue placeholder="How often?" />
                      </SelectTrigger>
                      <SelectContent>
                        {WORKSPACE_NEEDS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetStart">Start</Label>
                    <Select
                      value={form.targetStart}
                      onValueChange={(v) => update("targetStart", v)}
                    >
                      <SelectTrigger id="targetStart">
                        <SelectValue placeholder="When?" />
                      </SelectTrigger>
                      <SelectContent>
                        {TARGET_START.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportNeeded">What support do you need most right now?</Label>
                  <Textarea
                    id="supportNeeded"
                    required
                    rows={3}
                    maxLength={SUPPORT_MAX}
                    placeholder="e.g. introductions, program fit, workspace setup…"
                    value={form.supportNeeded}
                    onChange={(e) =>
                      update("supportNeeded", e.target.value.slice(0, SUPPORT_MAX))
                    }
                    className="resize-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="howHeard" className="text-muted-foreground">
                      How did you find us?
                    </Label>
                    <Select
                      value={form.howHeard || "__none__"}
                      onValueChange={(v) => update("howHeard", v === "__none__" ? "" : v)}
                    >
                      <SelectTrigger id="howHeard">
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">—</SelectItem>
                        {HOW_HEARD_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {showReferral ? (
                    <div className="space-y-2">
                      <Label htmlFor="referralName">Referred by</Label>
                      <Input
                        id="referralName"
                        value={form.referralName}
                        onChange={(e) => update("referralName", e.target.value)}
                      />
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-muted-foreground">
                    Anything else? <span className="font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="message"
                    maxLength={500}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border/80 bg-muted/20 p-3">
                  <Checkbox
                    checked={form.consent}
                    onCheckedChange={(c) => update("consent", c === true)}
                    className="mt-0.5"
                  />
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    Impact Hub Nairobi may contact me about this application. *
                  </span>
                </label>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => setStep(1)}
                    disabled={submitting}
                  >
                    Back
                  </Button>
                  <Button type="submit" className={`flex-1 ${MEMBERSHIP_PRIMARY_BTN}`} size="lg" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Submit application
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#1c395c]/70">
          <a href={`mailto:${HUB_PUBLIC_EMAIL}`} className={MEMBERSHIP_LINK}>
            Questions? Email us
          </a>
        </p>
    </MembershipPageShell>
  )
}
