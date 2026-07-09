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
import { IMPACT_SECTORS } from "@/lib/member-segmentation"
import {
  HOW_HEARD_OPTIONS,
  ORGANISATIONAL_AUDIENCE_REACH,
  ORGANISATIONAL_BUDGET_BANDS,
  ORGANISATIONAL_CONTACT_ROLES,
  ORGANISATIONAL_DISCOVERY_CALL_URL,
  ORGANISATIONAL_ENGAGEMENT_MODELS,
  ORGANISATIONAL_ENGAGEMENT_TIMELINE,
  ORGANISATIONAL_GEOGRAPHIC_SCOPE,
  ORGANISATIONAL_PLAN_NAME,
  ORGANISATIONAL_REGISTER_PATH,
  ORGANISATIONAL_RESPONSE_SLA,
  ORGANISATION_TEAM_SIZES,
  ORGANISATION_TYPES,
} from "@/lib/membership-inquiry"
import { HUB_PUBLIC_EMAIL } from "@/lib/hub-contact"
import { ArrowRight, Building2, Calendar, CheckCircle2, Handshake, Loader2, Users } from "lucide-react"

const STEPS = ["Institution profile", "Partnership design", "Primary contact"] as const
const MANDATE_MAX = 800
const OBJECTIVES_MAX = 500

function emptyForm() {
  return {
    organizationName: "",
    organizationType: "",
    organizationMandate: "",
    geographicScope: "",
    focusSectors: [] as string[],
    staffScale: "",
    websiteUrl: "",
    engagementModels: [] as string[],
    audienceReach: [] as string[],
    engagementTimeline: "",
    partnershipObjectives: "",
    budgetBand: "",
    fullName: "",
    contactRole: "",
    email: "",
    phone: "",
    location: "Nairobi, Kenya",
    howHeard: "",
    referralName: "",
    message: "",
    consent: false,
  }
}

function ChipToggle({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-left text-xs transition-colors sm:text-sm",
        selected
          ? "border-primary bg-primary/10 font-medium text-foreground"
          : "border-border text-muted-foreground hover:border-foreground/30"
      )}
    >
      {label}
    </button>
  )
}

export default function OrganisationalMembershipPage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const update = (field: keyof ReturnType<typeof emptyForm>, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleInList = (field: "focusSectors" | "engagementModels" | "audienceReach", value: string) => {
    setForm((prev) => {
      const list = prev[field]
      const max = field === "focusSectors" ? 3 : undefined
      if (list.includes(value)) {
        return { ...prev, [field]: list.filter((v) => v !== value) }
      }
      if (max && list.length >= max) {
        toast.error("Limit reached", `Select up to ${max} sectors.`)
        return prev
      }
      return { ...prev, [field]: [...list, value] }
    })
  }

  const showReferral = form.howHeard === "Referral from a member"
  const registerHref = `${ORGANISATIONAL_REGISTER_PATH}&email=${encodeURIComponent(form.email)}`

  const validateStep1 = (): boolean => {
    if (!form.organizationName.trim() || !form.organizationType) {
      toast.error("Institution details", "Add your organisation name and type.")
      return false
    }
    if (form.organizationMandate.trim().length < 25) {
      toast.error("Mandate required", "Describe your mission, programmes, and who you serve.")
      return false
    }
    if (!form.geographicScope || !form.staffScale) {
      toast.error("Almost there", "Select geographic scope and team/programme scale.")
      return false
    }
    if (form.focusSectors.length === 0) {
      toast.error("Focus sectors", "Select at least one sector your institution works in.")
      return false
    }
    return true
  }

  const validateStep2 = (): boolean => {
    if (form.engagementModels.length === 0) {
      toast.error("Engagement model", "How would you like to partner with Impact Hub?")
      return false
    }
    if (form.audienceReach.length === 0) {
      toast.error("Audiences", "Who do you want to reach through this partnership?")
      return false
    }
    if (!form.engagementTimeline) {
      toast.error("Timeline", "Select your preferred partnership timeline.")
      return false
    }
    if (form.partnershipObjectives.trim().length < 15) {
      toast.error("Objectives", "Describe what a successful partnership looks like.")
      return false
    }
    return true
  }

  const handleContinue = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.contactRole) {
      toast.error("Contact details", "Fill in the primary contact name, role, email, and phone.")
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
      const res = await fetch("/api/membership/organisational", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName: form.organizationName,
          organizationType: form.organizationType,
          organizationMandate: form.organizationMandate,
          geographicScope: form.geographicScope,
          focusSectors: form.focusSectors,
          staffScale: form.staffScale,
          websiteUrl: form.websiteUrl.trim() || undefined,
          engagementModels: form.engagementModels,
          audienceReach: form.audienceReach,
          engagementTimeline: form.engagementTimeline,
          partnershipObjectives: form.partnershipObjectives,
          budgetBand: form.budgetBand || undefined,
          fullName: form.fullName,
          contactRole: form.contactRole,
          email: form.email,
          phone: form.phone,
          location: form.location,
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
        toast.success("Inquiry saved", "Email unavailable — book a partnership call or contact us.")
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
            <CardTitle className="text-xl text-[#0a1f38]">Partnership inquiry received</CardTitle>
            <CardDescription className="text-base leading-relaxed text-[#1c395c]/80">
              We emailed <strong className="text-[#0a1f38]">{form.email}</strong>. Our partnerships
              team will review <strong>{form.organizationName}</strong> and reply{" "}
              {ORGANISATIONAL_RESPONSE_SLA}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-[#1c395c]/80">
              Create your platform account next so we can link your inquiry and co-design engagement
              with your team.
            </p>
            <Button asChild size="lg" className={MEMBERSHIP_PRIMARY_BTN}>
              <Link href={registerHref}>Create platform account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full border-[#edeff2] bg-white">
              <a href={ORGANISATIONAL_DISCOVERY_CALL_URL} target="_blank" rel="noopener noreferrer">
                <Calendar className="mr-2 h-4 w-4" />
                Book partnership call
              </a>
            </Button>
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
        <p className="section-label text-left">{ORGANISATIONAL_PLAN_NAME} membership</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0a1f38]">
          Partnership inquiry
        </h1>
        <p className="mt-2 text-sm text-[#1c395c]/80">
          Bespoke institutional engagement · 3 steps · Response {ORGANISATIONAL_RESPONSE_SLA}
        </p>
        <div className="mt-4 flex gap-2" aria-label={`Step ${step} of 3`}>
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
                  "mt-1.5 text-[10px] font-medium uppercase tracking-wider leading-tight",
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
        <CardHeader className="space-y-3 pb-2 sm:hidden">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#812926]/10">
            {step === 2 ? (
              <Handshake className="h-5 w-5 text-[#812926]" aria-hidden />
            ) : step === 3 ? (
              <Users className="h-5 w-5 text-[#812926]" aria-hidden />
            ) : (
              <Building2 className="h-5 w-5 text-[#812926]" aria-hidden />
            )}
          </div>
          <CardDescription className="text-base leading-relaxed text-[#1c395c]/80">
            {step === 1
              ? "Start with your institution — we scope partnerships around your mandate and reach."
              : step === 2
                ? "Design the collaboration — engagement model, audiences, and timeline."
                : "Who should our partnerships team speak with?"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tell us about the institution — not an individual venture profile.
              </p>

              <div className="space-y-2">
                <Label htmlFor="organizationName">Organisation name</Label>
                <Input
                  id="organizationName"
                  required
                  value={form.organizationName}
                  onChange={(e) => update("organizationName", e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="organizationType">Organisation type</Label>
                  <Select
                    value={form.organizationType}
                    onValueChange={(v) => update("organizationType", v)}
                  >
                    <SelectTrigger id="organizationType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANISATION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-muted-foreground">
                    Website <span className="font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="website"
                    placeholder="organisation.org"
                    value={form.websiteUrl}
                    onChange={(e) => update("websiteUrl", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationMandate">Mission, mandate &amp; programmes</Label>
                <Textarea
                  id="organizationMandate"
                  required
                  rows={4}
                  maxLength={MANDATE_MAX}
                  placeholder="What does your institution stand for? Who do you serve? Which programmes or initiatives are relevant to a Nairobi impact partnership?"
                  value={form.organizationMandate}
                  onChange={(e) =>
                    update("organizationMandate", e.target.value.slice(0, MANDATE_MAX))
                  }
                  className="resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="geographicScope">Geographic scope</Label>
                  <Select
                    value={form.geographicScope}
                    onValueChange={(v) => update("geographicScope", v)}
                  >
                    <SelectTrigger id="geographicScope">
                      <SelectValue placeholder="Where you operate" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANISATIONAL_GEOGRAPHIC_SCOPE.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staffScale">Team / programme scale</Label>
                  <Select value={form.staffScale} onValueChange={(v) => update("staffScale", v)}>
                    <SelectTrigger id="staffScale">
                      <SelectValue placeholder="Approximate size" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANISATION_TEAM_SIZES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primary focus sectors <span className="font-normal text-muted-foreground">(up to 3)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {IMPACT_SECTORS.map((sector) => (
                    <ChipToggle
                      key={sector}
                      label={sector}
                      selected={form.focusSectors.includes(sector)}
                      onClick={() => toggleInList("focusSectors", sector)}
                    />
                  ))}
                </div>
              </div>

              <Button type="button" className={MEMBERSHIP_PRIMARY_BTN} size="lg" onClick={handleContinue}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : step === 2 ? (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                How should we work together? This is partnership scoping — not a workspace membership
                application.
              </p>

              <div className="space-y-2">
                <Label>Preferred engagement model</Label>
                <div className="flex flex-wrap gap-2">
                  {ORGANISATIONAL_ENGAGEMENT_MODELS.map((model) => (
                    <ChipToggle
                      key={model}
                      label={model}
                      selected={form.engagementModels.includes(model)}
                      onClick={() => toggleInList("engagementModels", model)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Who should this partnership reach?</Label>
                <div className="flex flex-wrap gap-2">
                  {ORGANISATIONAL_AUDIENCE_REACH.map((audience) => (
                    <ChipToggle
                      key={audience}
                      label={audience}
                      selected={form.audienceReach.includes(audience)}
                      onClick={() => toggleInList("audienceReach", audience)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="engagementTimeline">Partnership timeline</Label>
                  <Select
                    value={form.engagementTimeline}
                    onValueChange={(v) => update("engagementTimeline", v)}
                  >
                    <SelectTrigger id="engagementTimeline">
                      <SelectValue placeholder="When to engage" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANISATIONAL_ENGAGEMENT_TIMELINE.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetBand" className="text-muted-foreground">
                    Budget indication <span className="font-normal">(optional)</span>
                  </Label>
                  <Select
                    value={form.budgetBand || "__none__"}
                    onValueChange={(v) => update("budgetBand", v === "__none__" ? "" : v)}
                  >
                    <SelectTrigger id="budgetBand">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Prefer not to say</SelectItem>
                      {ORGANISATIONAL_BUDGET_BANDS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partnershipObjectives">What does success look like?</Label>
                <Textarea
                  id="partnershipObjectives"
                  required
                  rows={3}
                  maxLength={OBJECTIVES_MAX}
                  placeholder="e.g. co-deliver a youth innovation program, convene 200 ecosystem actors annually, connect portfolio ventures to grant funding…"
                  value={form.partnershipObjectives}
                  onChange={(e) =>
                    update("partnershipObjectives", e.target.value.slice(0, OBJECTIVES_MAX))
                  }
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" className={`flex-1 ${MEMBERSHIP_PRIMARY_BTN}`} size="lg" onClick={handleContinue}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Primary contact for partnership conversations and platform access.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="fullName">Contact name</Label>
                  <Input
                    id="fullName"
                    required
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactRole">Your role</Label>
                  <Select value={form.contactRole} onValueChange={(v) => update("contactRole", v)}>
                    <SelectTrigger id="contactRole">
                      <SelectValue placeholder="Institutional role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANISATIONAL_CONTACT_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="location">City</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                  />
                </div>
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
                  Anything else for the partnerships team? <span className="font-normal">(optional)</span>
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
                  Impact Hub Nairobi may contact me about this partnership inquiry. *
                </span>
              </label>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep(2)} disabled={submitting}>
                  Back
                </Button>
                <Button type="submit" className={`flex-1 ${MEMBERSHIP_PRIMARY_BTN}`} size="lg" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit partnership inquiry
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-[#1c395c]/70">
        Looking for venture membership?{" "}
        <Link href="/membership/star-connect" className={MEMBERSHIP_LINK}>
          Apply for Star Connect
        </Link>
        {" · "}
        <a href={`mailto:${HUB_PUBLIC_EMAIL}`} className={MEMBERSHIP_LINK}>
          Email partnerships
        </a>
      </p>
    </MembershipPageShell>
  )
}
