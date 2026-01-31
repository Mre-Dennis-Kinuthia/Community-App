"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
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
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowRight, ArrowLeft, Sparkles, User, Briefcase, Heart, Plus, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"

const EXPERIENCE_LEVELS = [
  "Early Career",
  "Mid-Level",
  "Senior",
  "Expert",
]

const AVAILABILITY_OPTIONS = [
  "Open to Collaboration",
  "Seeking Mentorship",
  "Offering Mentorship",
  "Open to Projects",
  "Available for Events",
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [industry, setIndustry] = useState("")
  const [role, setRole] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [location, setLocation] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState("")
  const [availability, setAvailability] = useState<string[]>([])

  const checkProfile = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      const res = await fetch("/api/profile", { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      setNeedsOnboarding(data.needsOnboarding === true)
      if (data.profile?.user?.name) setName(data.profile.user.name || "")
      if (data.profile?.bio) setBio(data.profile.bio)
      if (data.profile?.industry) setIndustry(data.profile.industry)
      if (data.profile?.role) setRole(data.profile.role)
      if (data.profile?.experienceLevel) setExperienceLevel(data.profile.experienceLevel)
      if (data.profile?.location) setLocation(data.profile.location)
      if (data.profile?.skills?.length) setSkills(data.profile.skills)
      if (data.profile?.interests?.length) setInterests(data.profile.interests)
      if (data.profile?.availability?.length) setAvailability(data.profile.availability)
    } catch (e) {
      console.error("Failed to fetch profile:", e)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/onboarding")
      return
    }
    if (session?.user?.id) {
      if (session.user.name) setName(session.user.name)
      checkProfile()
    }
  }, [status, session?.user?.id, session?.user?.name, router, checkProfile])

  useEffect(() => {
    if (!loading && !needsOnboarding && status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [loading, needsOnboarding, status, router])

  const addSkill = () => {
    const v = newSkill.trim()
    if (v && !skills.includes(v)) {
      setSkills([...skills, v])
      setNewSkill("")
    }
  }

  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s))

  const addInterest = () => {
    const v = newInterest.trim()
    if (v && !interests.includes(v)) {
      setInterests([...interests, v])
      setNewInterest("")
    }
  }

  const removeInterest = (i: string) => setInterests(interests.filter((x) => x !== i))

  const toggleAvailability = (opt: string) => {
    setAvailability((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
    )
  }

  const totalSteps = 4
  const canNext =
    (step === 1 && name.trim()) ||
    (step === 2 && (bio.trim() || industry || role)) ||
    step === 3 ||
    step === 4

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
    else handleComplete()
  }

  const handleComplete = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim() || undefined,
          bio: bio.trim() || undefined,
          industry: industry || undefined,
          role: role || undefined,
          experienceLevel: experienceLevel || undefined,
          location: location || undefined,
          skills,
          interests,
          availability,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save")
      }
      toast.success("Profile complete!", "Your profile has been set up.")
      router.replace("/dashboard")
    } catch (e: any) {
      toast.error("Could not save", e?.message || "Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!needsOnboarding) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex justify-center">
          <Logo href="/dashboard" variant="compact" />
        </div>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            Welcome to Impact Hub Nairobi
          </div>
          <h1 className="text-2xl font-bold">Complete your profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Step {step} of {totalSteps}
          </p>
          <div className="flex justify-center gap-1 mt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 w-8 rounded-full transition-colors",
                  i + 1 <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            {step === 1 && (
              <>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  What should we call you?
                </CardTitle>
                <CardDescription>
                  This name will appear on your profile and in the community.
                </CardDescription>
              </>
            )}
            {step === 2 && (
              <>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Tell us about yourself
                </CardTitle>
                <CardDescription>
                  Help others find and connect with you.
                </CardDescription>
              </>
            )}
            {step === 3 && (
              <>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Skills & interests
                </CardTitle>
                <CardDescription>
                  Add skills and topics you care about (used for discovery).
                </CardDescription>
              </>
            )}
            {step === 4 && (
              <>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  How can you engage?
                </CardTitle>
                <CardDescription>
                  Select ways you’re open to collaborating with the community.
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canNext && handleNext()}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Short bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="A few lines about you and what you do..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      placeholder="e.g. EdTech, Health"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      placeholder="e.g. Founder, Designer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience level</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger id="experience">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Nairobi, Kenya"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <Badge key={s} variant="secondary" className="gap-1">
                        {s}
                        <button type="button" onClick={() => removeSkill(s)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <div className="flex gap-1">
                      <Input
                        placeholder="Add skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        className="h-8 w-28 text-sm"
                      />
                      <Button type="button" size="sm" variant="outline" onClick={addSkill} className="h-8">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((i) => (
                      <Badge key={i} variant="outline" className="gap-1">
                        {i}
                        <button type="button" onClick={() => removeInterest(i)} className="hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <div className="flex gap-1">
                      <Input
                        placeholder="Add interest"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                        className="h-8 w-28 text-sm"
                      />
                      <Button type="button" size="sm" variant="outline" onClick={addInterest} className="h-8">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <Label>I am...</Label>
                <div className="flex flex-col gap-2">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
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
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1 || saving}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canNext || saving}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {step === totalSteps ? "Finish" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          You can update your profile anytime from{" "}
          <Link href="/profile" className="text-primary hover:underline">
            Profile
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
