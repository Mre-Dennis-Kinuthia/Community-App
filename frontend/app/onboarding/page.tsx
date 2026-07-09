"use client"

import { Suspense, useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageUpload } from "@/components/ui/image-upload"
import { PresetAvatarPicker } from "@/components/profile/preset-avatar-picker"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { getInitials } from "@/lib/utils"
import { validateLinkedInInput } from "@/lib/member-social-links"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Loader2, ArrowRight, ArrowLeft, Building2, Target, Linkedin } from "lucide-react"
import { Logo } from "@/components/logo"
import { toast } from "@/lib/toast"
import { resetWelcomeForNewMember } from "@/lib/getting-started"
import { cn } from "@/lib/utils"
import {
  ENGAGEMENT_GOALS,
  ENGAGEMENT_PREFERENCES,
  IMPACT_SECTORS,
  MEMBER_TYPES,
  PRIMARY_ROLES,
  memberTypeRequiresOrganization,
  validateOnboardingStep1,
} from "@/lib/member-segmentation"
import { isOrganisationalRegisterIntent } from "@/lib/membership-register-intent"
import { ORGANISATIONAL_PLAN_NAME, ORGANISATIONAL_RESPONSE_SLA } from "@/lib/membership-inquiry"
import { markOrganisationalSignupPending } from "@/lib/membership-pending-intent"

const BIO_MAX_LENGTH = 280
const STEP_LABELS = ["Your profile", "Goals & community"] as const
const TOTAL_STEPS = STEP_LABELS.length

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const organisationalIntent = isOrganisationalRegisterIntent(searchParams.get("intent"))
  const organisationalNotifySent = useRef(false)
  const { data: session, status, update: updateSession } = useSession()
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)

  const [memberType, setMemberType] = useState("")
  const [organization, setOrganization] = useState("")
  const [role, setRole] = useState("")
  const [sector, setSector] = useState("")
  const [location, setLocation] = useState("Nairobi, Kenya")
  const [goals, setGoals] = useState<string[]>([])
  const [availability, setAvailability] = useState<string[]>([])
  const [bio, setBio] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [showOnboardingNudge, setShowOnboardingNudge] = useState(false)

  const checkProfile = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      const res = await fetch("/api/profile", { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      setNeedsOnboarding(data.needsOnboarding === true)
      setShowOnboardingNudge(data.showOnboardingNudge === true)
      const p = data.profile
      if (p?.memberType) setMemberType(p.memberType)
      else if (organisationalIntent) setMemberType("partner")
      if (p?.organization) setOrganization(p.organization)
      if (p?.role) setRole(p.role)
      if (p?.industry) setSector(p.industry)
      if (p?.location) setLocation(p.location)
      if (p?.bio) setBio(p.bio)
      if (p?.interests?.length) setGoals(p.interests)
      else if (organisationalIntent) setGoals(["Strategic partnerships"])
      if (p?.availability?.length) setAvailability(p.availability)
      if (p?.user?.image) setProfileImage(p.user.image)
      if (p?.socialLinks?.linkedin) setLinkedinUrl(p.socialLinks.linkedin)
    } catch (e) {
      console.error("Failed to fetch profile:", e)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, organisationalIntent])

  useEffect(() => {
    if (organisationalIntent) markOrganisationalSignupPending()
  }, [organisationalIntent])

  useEffect(() => {
    if (status !== "authenticated" || !organisationalIntent || organisationalNotifySent.current) {
      return
    }
    organisationalNotifySent.current = true
    fetch("/api/membership/organisational/registration-notify", {
      method: "POST",
      credentials: "include",
    }).catch(() => {})
  }, [status, organisationalIntent])

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      const onboardingPath = organisationalIntent
        ? "/onboarding?intent=organisational"
        : "/onboarding"
      router.replace(`/login?redirect=${encodeURIComponent(onboardingPath)}`)
      return
    }
    if (session?.user?.id) {
      if (session.user.image) setProfileImage(session.user.image)
      checkProfile()
    }
  }, [status, session?.user?.id, session?.user?.image, router, checkProfile, organisationalIntent])

  useEffect(() => {
    if (!loading && !needsOnboarding && status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [loading, needsOnboarding, status, router])

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  const toggleAvailability = (opt: string) => {
    setAvailability((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
    )
  }

  const firstName = session?.user?.name?.split(/\s+/)[0] || ""
  const displayName = session?.user?.name || "Member"
  const avatarSrc = getImageDisplayUrl(profileImage || session?.user?.image || undefined)
  const userInitials = getInitials(displayName, session?.user?.email)
  const showOrganization = memberTypeRequiresOrganization(memberType)

  const handleNext = () => {
    setStepError(null)
    if (step === 1) {
      const err = validateOnboardingStep1({
        memberType,
        sector,
        role,
        organization,
      })
      if (err) {
        setStepError(err)
        return
      }
      setStep(2)
      return
    }
    handleComplete()
  }

  const handleComplete = async () => {
    setSaving(true)
    setStepError(null)
    const linkedinError = validateLinkedInInput(linkedinUrl)
    if (linkedinError) {
      setStepError(linkedinError)
      setSaving(false)
      return
    }
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...(profileImage.trim() ? { image: profileImage.trim() } : {}),
          memberType: memberType || undefined,
          organization: organization.trim() || undefined,
          role: role || undefined,
          industry: sector || undefined,
          location: location.trim() || undefined,
          interests: goals,
          availability,
          bio: bio.trim() || undefined,
          socialLinks: linkedinUrl.trim()
            ? { linkedin: linkedinUrl.trim() }
            : null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        const details = err.details
          ? typeof err.details === "string"
            ? err.details
            : JSON.stringify(err.details)
          : null
        throw new Error(
          err.error ? (details ? `${err.error}: ${details}` : err.error) : details || "Failed to save"
        )
      }
      toast.success("You're all set", "Your profile helps us tailor programs and connections.")
      if (profileImage.trim()) {
        await updateSession({ user: { image: profileImage.trim() } })
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem("onboardingJustCompleted", "true")
        resetWelcomeForNewMember()
      }
      router.replace("/dashboard")
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Please try again."
      toast.error("Could not save", message)
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
        <Loader2 className="h-8 w-8 animate-spin text-[#812926]" aria-label="Loading" />
      </div>
    )
  }

  if (!needsOnboarding) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] px-4 py-8 md:py-12">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex justify-center">
          <Logo href="/dashboard" variant="compact" />
        </div>

        {showOnboardingNudge ? (
          <div
            className="rounded-md border border-[#812926]/20 bg-[#812926]/5 px-4 py-3 text-sm text-[#1c395c]"
            role="status"
          >
            <p className="font-medium text-[#812926]">Finish your profile to join the community</p>
            <p className="mt-1 text-[#1c395c]/85">
              You&apos;re almost there — complete onboarding to appear in the directory, register for
              events, and book workspace.
            </p>
          </div>
        ) : null}

        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#812926]">
            Become a member
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#0a1f38]">
            {firstName ? `Welcome, ${firstName}` : "Welcome to Impact Hub Nairobi"}
          </h1>
          <p className="mt-2 text-sm text-[#1c395c]/80">
            {organisationalIntent
              ? `Complete your organisation profile for ${ORGANISATIONAL_PLAN_NAME} membership. Our partnerships team will follow up ${ORGANISATIONAL_RESPONSE_SLA}.`
              : "Tell us about your venture and goals — we'll connect you with programs, workspace, events, and people across Nairobi's impact ecosystem."}
          </p>
          <div
            className="mt-5 flex justify-center gap-2"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-label={`Step ${step} of ${TOTAL_STEPS}`}
          >
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "h-1.5 w-16 rounded-full transition-colors sm:w-20",
                    i + 1 <= step ? "bg-[#812926]" : "bg-[#edeff2]"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wider",
                    i + 1 === step ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Card className="auth-page-card border-[#edeff2] bg-white shadow-sm">
          <CardHeader className="pb-4">
            {step === 1 ? (
              <>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" aria-hidden />
                  Your profile
                </CardTitle>
                <CardDescription>
                  Tell us who you are and where you work — used for community discovery and program matching.
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" aria-hidden />
                  Goals & community
                </CardTitle>
                <CardDescription>
                  What you want from the hub — optional details you can change anytime in Profile.
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-5">
            {step === 1 ? (
              <div className="space-y-5 animate-in fade-in-0 duration-200">
                <div className="flex flex-col items-center gap-4 rounded-md border border-border/80 bg-muted/20 px-4 py-5 sm:flex-row sm:items-start">
                  <Avatar className="h-20 w-20 shrink-0 border-2 border-background shadow-sm">
                    <AvatarImage src={avatarSrc} alt={displayName} />
                    <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="w-full min-w-0 flex-1 space-y-4">
                    <PresetAvatarPicker
                      value={profileImage}
                      onChange={async (path) => {
                        setProfileImage(path)
                        await updateSession({ user: { image: path } })
                      }}
                    />
                    <ImageUpload
                      label="Or upload a photo"
                      description="Optional. Shown on your community profile and in the directory."
                      value={profileImage}
                      onChange={async (url) => {
                        setProfileImage(url)
                        if (url) await updateSession({ user: { image: url } })
                      }}
                      category="profile"
                      previewClassName="hidden"
                      allowClear
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    I am a… <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {MEMBER_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setMemberType(type.value)
                          setStepError(null)
                        }}
                        className={cn(
                          "rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                          memberType === type.value
                            ? "border-primary bg-primary/5 font-medium text-foreground"
                            : "border-border hover:border-foreground/25 hover:bg-muted/40"
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {showOrganization ? (
                  <div className="space-y-2">
                    <Label htmlFor="organization">
                      Organization / institution <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="organization"
                      placeholder="e.g. Acme Ventures, Ministry of X, University of Y"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="role">
                    Primary role <span className="text-destructive">*</span>
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
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
                  <Label htmlFor="sector">
                    Primary sector / focus <span className="text-destructive">*</span>
                  </Label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger id="sector">
                      <SelectValue placeholder="Select sector" />
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

                {!showOrganization ? (
                  <div className="space-y-2">
                    <Label htmlFor="organization-optional">Organization (optional)</Label>
                    <Input
                      id="organization-optional"
                      placeholder="Venture, employer, or affiliate org"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in-0 duration-200">
                <div className="space-y-2">
                  <Label>What are you here for?</Label>
                  <p className="text-xs text-muted-foreground">Select all that apply.</p>
                  <div className="flex flex-wrap gap-2">
                    {ENGAGEMENT_GOALS.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm transition-colors",
                          goals.includes(goal)
                            ? "border-primary bg-primary/10 font-medium text-foreground"
                            : "border-border text-muted-foreground hover:border-foreground/20"
                        )}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Open to</Label>
                  <div className="flex flex-col gap-2">
                    {ENGAGEMENT_PREFERENCES.map((opt) => (
                      <label
                        key={opt}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors",
                          availability.includes(opt)
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <Checkbox
                          checked={availability.includes(opt)}
                          onCheckedChange={() => toggleAvailability(opt)}
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-[#0A66C2]" aria-hidden />
                    LinkedIn profile
                  </Label>
                  <Input
                    id="linkedin"
                    type="url"
                    inputMode="url"
                    placeholder="linkedin.com/in/yourname"
                    value={linkedinUrl}
                    onChange={(e) => {
                      setLinkedinUrl(e.target.value)
                      setStepError(null)
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional. Helps members and partners find you in the community directory.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio">Short intro (optional)</Label>
                    <span className="text-xs text-muted-foreground">
                      {bio.length}/{BIO_MAX_LENGTH}
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    placeholder="One or two sentences about your work and what you're building…"
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX_LENGTH))}
                    rows={3}
                    className="resize-none"
                    maxLength={BIO_MAX_LENGTH}
                  />
                </div>
              </div>
            )}

            {stepError ? (
              <p className="text-sm text-destructive" role="alert">
                {stepError}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-3 border-t pt-5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStepError(null)
                  setStep((s) => Math.max(1, s - 1))
                }}
                disabled={step === 1 || saving}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                {step === 2 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleComplete}
                    disabled={saving}
                  >
                    Skip extras
                  </Button>
                ) : null}
                <Button type="button" onClick={handleNext} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  {step === TOTAL_STEPS ? "Finish" : "Continue"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Update anytime from{" "}
          <Link href="/profile" className="font-medium text-primary hover:underline">
            Profile
          </Link>
          . We use this information to segment programs and community features — not for public marketing lists.
        </p>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  )
}
