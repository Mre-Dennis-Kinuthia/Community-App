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
  ORGANISATIONAL_DISCOVERY_CALL_URL,
  ORGANISATIONAL_PLAN_NAME,
  ORGANISATIONAL_REGISTER_PATH,
  ORGANISATIONAL_RESPONSE_SLA,
  ORGANISATION_TEAM_SIZES,
  ORGANISATION_TYPES,
  ORGANISATIONAL_PARTNERSHIP_INTERESTS,
  TARGET_START,
} from "@/lib/membership-inquiry"
import { HUB_PUBLIC_EMAIL } from "@/lib/hub-contact"
import { ArrowRight, Building2, Calendar, CheckCircle2, Linkedin, Loader2 } from "lucide-react"

const STEPS = ["Your organisation", "Partnership goals"] as const
const DESCRIPTION_MAX = 800
const GOALS_MAX = 500

function emptyForm() {
  return {
    fullName: "",
    email: "",
    phone: "",
    location: "Nairobi, Kenya",
    organizationName: "",
    organizationType: "",
    organizationDescription: "",
    role: "",
    sector: "",
    teamSize: "",
    partnershipInterests: [] as string[],
    targetStart: "",
    partnershipGoals: "",
    linkedinUrl: "",
    websiteUrl: "",
    howHeard: "",
    referralName: "",
    message: "",
    consent: false,
  }
}

export default function OrganisationalMembershipPage() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const update = (field: keyof ReturnType<typeof emptyForm>, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleInterest = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      partnershipInterests: prev.partnershipInterests.includes(interest)
        ? prev.partnershipInterests.filter((i) => i !== interest)
        : [...prev.partnershipInterests, interest],
    }))
  }

  const showReferral = form.howHeard === "Referral from a member"
  const registerHref = `${ORGANISATIONAL_REGISTER_PATH}&email=${encodeURIComponent(form.email)}`

  const validateStep1 = (): boolean => {
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Missing details", "Fill in your name, email, and phone.")
      return false
    }
    if (!form.organizationName.trim() || !form.organizationType) {
      toast.error("Organisation details", "Add your organisation name and type.")
      return false
    }
    if (form.organizationDescription.trim().length < 25) {
      toast.error("Tell us about your organisation", "Add a short description (at least 25 characters).")
      return false
    }
    if (!form.role || !form.sector || !form.teamSize) {
      toast.error("Almost there", "Select your role, sector, and team size.")
      return false
    }
    return true
  }

  const handleContinue = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.partnershipInterests.length === 0) {
      toast.error("Pick partnership interests", "Select at least one area of collaboration.")
      return
    }
    if (!form.targetStart) {
      toast.error("Almost there", "Select when you'd like to start.")
      return
    }
    if (form.partnershipGoals.trim().length < 15) {
      toast.error("Partnership goals", "Briefly describe what you hope to achieve together.")
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
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          location: form.location,
          organizationName: form.organizationName,
          organizationType: form.organizationType,
          organizationDescription: form.organizationDescription,
          role: form.role,
          sector: form.sector,
          teamSize: form.teamSize,
          partnershipInterests: form.partnershipInterests,
          targetStart: form.targetStart,
          partnershipGoals: form.partnershipGoals,
          linkedinUrl: form.linkedinUrl.trim() || undefined,
          websiteUrl: form.websiteUrl.trim() || undefined,
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
          "Email is temporarily unavailable — book a call below or contact us."
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
            <CardTitle className="text-xl text-[#0a1f38]">Application received</CardTitle>
            <CardDescription className="text-base leading-relaxed text-[#1c395c]/80">
              We emailed <strong className="text-[#0a1f38]">{form.email}</strong>. Our partnerships
              team will reply {ORGANISATIONAL_RESPONSE_SLA}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-[#1c395c]/80">
              Next, create your platform account so we can link your partnership profile and
              co-design programs with you.
            </p>
            <Button asChild size="lg" className={MEMBERSHIP_PRIMARY_BTN}>
              <Link href={registerHref}>Create your platform account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full border-[#edeff2] bg-white">
              <a
                href={ORGANISATIONAL_DISCOVERY_CALL_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book a partnership call
              </a>
            </Button>
            <p className="text-center text-xs text-[#1c395c]/70">
              Use the same email ({form.email}) when you register.
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
        <p className="section-label text-left">{ORGANISATIONAL_PLAN_NAME} membership</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0a1f38]">
          Apply as an organisation
        </h1>
        <p className="mt-2 text-sm text-[#1c395c]/80">
          Custom partnership · Two quick steps · Response {ORGANISATIONAL_RESPONSE_SLA}
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
        <CardHeader className="space-y-3 pb-2 sm:hidden">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#812926]/10">
            <Building2 className="h-5 w-5 text-[#812926]" aria-hidden />
          </div>
          <CardDescription className="text-base leading-relaxed text-[#1c395c]/80">
            Tell us about your institution and how you&apos;d like to partner with Impact Hub Nairobi.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 sm:pt-6">
          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Primary contact and a snapshot of your organisation.
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
                <Label htmlFor="organizationName">Organisation name</Label>
                <Input
                  id="organizationName"
                  required
                  value={form.organizationName}
                  onChange={(e) => update("organizationName", e.target.value)}
                />
              </div>

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
                <Label htmlFor="organizationDescription">What does your organisation do?</Label>
                <Textarea
                  id="organizationDescription"
                  required
                  rows={3}
                  maxLength={DESCRIPTION_MAX}
                  placeholder="Mission, programs, and who you serve…"
                  value={form.organizationDescription}
                  onChange={(e) =>
                    update("organizationDescription", e.target.value.slice(0, DESCRIPTION_MAX))
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
                  <Label htmlFor="sector">Sector / focus</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team size</Label>
                  <Select value={form.teamSize} onValueChange={(v) => update("teamSize", v)}>
                    <SelectTrigger id="teamSize">
                      <SelectValue placeholder="Size" />
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
                    placeholder="yourorganisation.org"
                    value={form.websiteUrl}
                    onChange={(e) => update("websiteUrl", e.target.value)}
                  />
                </div>
              </div>

              <Button type="button" className={MEMBERSHIP_PRIMARY_BTN} size="lg" onClick={handleContinue}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Help us understand how you&apos;d like to partner with Impact Hub Nairobi.
              </p>

              <div className="space-y-2">
                <Label>We&apos;re interested in…</Label>
                <div className="flex flex-wrap gap-2">
                  {ORGANISATIONAL_PARTNERSHIP_INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-left text-xs transition-colors sm:text-sm",
                        form.partnershipInterests.includes(interest)
                          ? "border-primary bg-primary/10 font-medium text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetStart">When would you like to start?</Label>
                <Select value={form.targetStart} onValueChange={(v) => update("targetStart", v)}>
                  <SelectTrigger id="targetStart">
                    <SelectValue placeholder="Select timing" />
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

              <div className="space-y-2">
                <Label htmlFor="partnershipGoals">What do you hope to achieve through this partnership?</Label>
                <Textarea
                  id="partnershipGoals"
                  required
                  rows={3}
                  maxLength={GOALS_MAX}
                  placeholder="e.g. co-design a youth program, host ecosystem events, connect portfolio ventures…"
                  value={form.partnershipGoals}
                  onChange={(e) =>
                    update("partnershipGoals", e.target.value.slice(0, GOALS_MAX))
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
                  Impact Hub Nairobi may contact me about this partnership inquiry. *
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
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit application
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-[#1c395c]/70">
        Already applied?{" "}
        <Link href={ORGANISATIONAL_REGISTER_PATH} className={MEMBERSHIP_LINK}>
          Create your account
        </Link>
        {" · "}
        <a href={`mailto:${HUB_PUBLIC_EMAIL}`} className={MEMBERSHIP_LINK}>
          Email partnerships
        </a>
      </p>
    </MembershipPageShell>
  )
}
