"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Edit, Save, X, Plus, Loader2, CreditCard, Users, CalendarDays, Briefcase, AlertTriangle, Heart, ChevronDown, UserCheck } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MobilePageHeader, MobileStatsStrip, MobileBreadcrumbsHidden } from "@/components/mobile/mobile-page-shell"
import { DashboardLayout } from "@/app/dashboard/layout"
import { toast } from "@/lib/toast"
import { getInitials, cn } from "@/lib/utils"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { ImageUpload } from "@/components/ui/image-upload"
import { PresetAvatarPicker } from "@/components/profile/preset-avatar-picker"
import { useSession as useNextAuthSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/use-session"
import { badgeClassForLabel } from "@/lib/badge-styles"
import {
  getMemberTypeLabel,
  IMPACT_SECTORS,
  MEMBER_TYPES,
  PRIMARY_ROLES,
  ENGAGEMENT_GOALS,
  BIO_MAX_LENGTH,
  BIO_MIN_LENGTH,
  availabilityOptionsForEdit,
  normalizeAvailabilityList,
  memberTypeRequiresOrganization,
  isOnboardingComplete,
  validateOnboardingStep2,
} from "@/lib/member-segmentation"
import { getProfileCompleteness, validateProfileOrganization } from "@/lib/profile-completeness"
import { getCommunityMemberProfilePath } from "@/lib/member-slug"
import { HUB_CONTACT_EMAIL } from "@/lib/hub-contact"
import { validateLinkedInInput } from "@/lib/member-social-links"
import { Linkedin } from "lucide-react"
import { MembershipTierBadge } from "@/components/membership-tier-badge"
import { MembershipCardDialog } from "@/components/membership/membership-card-dialog"
import type { MembershipBenefits } from "@/lib/hooks/use-membership"

const EXPERIENCE_LEVELS = ["Early Career", "Mid-Level", "Senior", "Expert"] as const

function emptyFieldHint(hint: string) {
  return <p className="text-sm text-muted-foreground italic">{hint}</p>
}

type FollowingMember = {
  id: string
  name: string
  avatar: string | null
  role: string | null
  slug?: string | null
}

type ProfileStats = {
  connections: number
  following: number
  followers: number
  events: number
  projects: number
}

type ProfilePayload = {
  slug?: string | null
  bio: string | null
  skills: string[]
  location: string | null
  industry: string | null
  role: string | null
  memberType: string | null
  organization: string | null
  experienceLevel: string | null
  availability: string[]
  interests: string[]
  socialLinks?: { linkedin?: string } | null
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    createdAt: string
  }
  membership?: MembershipBenefits | null
}

function emptyForm() {
  return {
    name: "",
    image: "",
    bio: "",
    role: "",
    industry: "",
    memberType: "",
    organization: "",
    location: "",
    experienceLevel: "" as string,
    skills: [] as string[],
    interests: [] as string[],
    availability: [] as string[],
    linkedin: "",
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useSession()
  const { update: updateSession } = useNextAuthSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [followingMembers, setFollowingMembers] = useState<FollowingMember[]>([])
  const [followingLoading, setFollowingLoading] = useState(true)
  const [joinedAt, setJoinedAt] = useState<string | null>(null)
  const [membership, setMembership] = useState<MembershipBenefits | null>(null)
  const [membershipCardOpen, setMembershipCardOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [canDeleteWithPassword, setCanDeleteWithPassword] = useState(true)
  const [dangerZoneOpen, setDangerZoneOpen] = useState(false)

  const [form, setForm] = useState(emptyForm())
  const [profileSlug, setProfileSlug] = useState<string | null>(null)
  const [newSkill, setNewSkill] = useState("")
  const [newInterest, setNewInterest] = useState("")

  const applyProfile = useCallback((profile: ProfilePayload) => {
    setProfileSlug(profile.slug ?? null)
    setForm({
      name: profile.user.name?.trim() || "",
      image: profile.user.image?.trim() || "",
      bio: profile.bio?.trim() || "",
      role: profile.role?.trim() || "",
      industry: profile.industry?.trim() || "",
      memberType: profile.memberType?.trim() || "",
      organization: profile.organization?.trim() || "",
      location: profile.location?.trim() || "",
      experienceLevel: profile.experienceLevel?.trim() || "",
      skills: [...(profile.skills || [])],
      interests: [...(profile.interests || [])],
      availability: [...(profile.availability || [])],
      linkedin: profile.socialLinks?.linkedin?.trim() || "",
    })
  }, [])

  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      setFollowingLoading(false)
      return
    }
    setLoading(true)
    setFollowingLoading(true)
    try {
      const [profileRes, followingRes] = await Promise.all([
        fetch("/api/profile", { credentials: "include" }),
        fetch("/api/follow?list=following&limit=20", { credentials: "include" }),
      ])
      if (!profileRes.ok) {
        const err = await profileRes.json().catch(() => ({}))
        throw new Error(err.error || "Failed to load profile")
      }
      const data = await profileRes.json()
      if (data.profile) {
        applyProfile(data.profile)
        setMembership(data.profile.membership ?? null)
        setJoinedAt(data.profile.user?.createdAt ?? null)
      }
      if (data.stats) {
        setStats(data.stats)
      }
      setNeedsOnboarding(data.needsOnboarding === true)
      setCanDeleteWithPassword(data.canDeleteWithPassword !== false)

      if (followingRes.ok) {
        const followingData = await followingRes.json()
        setFollowingMembers(followingData.following || [])
      } else {
        setFollowingMembers([])
      }
    } catch (e) {
      console.error(e)
      toast.error("Could not load profile", e instanceof Error ? e.message : "Try again later.")
    } finally {
      setLoading(false)
      setFollowingLoading(false)
    }
  }, [user?.id, applyProfile])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const displayName = form.name.trim() || user?.name || "Member"
  const avatarSrc = getImageDisplayUrl(form.image || user?.image || undefined)
  const userInitials = getInitials(displayName, user?.email)
  const memberSince = joinedAt ? format(new Date(joinedAt), "MMM yyyy") : null
  const membershipDisplay: MembershipBenefits = membership ?? {
    tier: "community",
    label: "Connect member",
    canBookHotDesk: true,
    meetingRoom: {
      allowanceMinutes: 0,
      usedMinutes: 0,
      remainingMinutes: 0,
      periodStart: new Date().toISOString(),
    },
  }

  const profileCompleteness = getProfileCompleteness({
    memberType: form.memberType,
    role: form.role,
    industry: form.industry,
    organization: form.organization,
    bio: form.bio,
    skills: form.skills,
    interests: form.interests,
    availability: form.availability,
    image: form.image || user?.image,
    linkedin: form.linkedin,
  })

  const availabilityEditOptions = availabilityOptionsForEdit(form.availability)
  const suggestedInterests = ENGAGEMENT_GOALS.filter((goal) => !form.interests.includes(goal))

  const toggleAvailability = (option: string) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter((a) => a !== option)
        : [...prev.availability, option],
    }))
  }

  const handleSave = async () => {
    const linkedinError = validateLinkedInInput(form.linkedin)
    if (linkedinError) {
      toast.error("Invalid LinkedIn URL", linkedinError)
      return
    }
    const orgError = validateProfileOrganization({
      memberType: form.memberType,
      organization: form.organization,
    })
    if (orgError) {
      toast.error("Organization required", orgError)
      return
    }
    if (form.bio.trim().length > BIO_MAX_LENGTH) {
      toast.error("Bio too long", `Keep your bio under ${BIO_MAX_LENGTH} characters.`)
      return
    }
    const introError = validateOnboardingStep2({
      goals: form.interests,
      bio: form.bio,
    })
    if (introError) {
      toast.error("Directory profile incomplete", introError)
      return
    }
    setSaving(true)
    try {
      const normalizedAvailability = normalizeAvailabilityList(form.availability)
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...(form.name.trim() ? { name: form.name.trim() } : {}),
          image: form.image.trim() ? form.image.trim() : null,
          bio: form.bio.trim() ? form.bio.trim() : null,
          skills: form.skills,
          location: form.location.trim() ? form.location.trim() : null,
          industry: form.industry.trim() ? form.industry.trim() : null,
          memberType: form.memberType.trim() ? form.memberType.trim() : null,
          organization: form.organization.trim() ? form.organization.trim() : null,
          role: form.role.trim() ? form.role.trim() : null,
          experienceLevel: form.experienceLevel.trim() ? form.experienceLevel.trim() : null,
          availability: normalizedAvailability,
          interests: form.interests,
          socialLinks: form.linkedin.trim()
            ? { linkedin: form.linkedin.trim() }
            : null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile")
      }
      if (data.profile) {
        applyProfile(data.profile)
        setMembership(data.profile.membership ?? null)
        setJoinedAt(data.profile.user?.createdAt ?? null)
        setNeedsOnboarding(!isOnboardingComplete(data.profile))
        const savedImage = data.profile.user?.image
        if (savedImage) {
          await updateSession({ user: { image: savedImage, name: data.profile.user?.name ?? undefined } })
          window.dispatchEvent(
            new CustomEvent("profile-image-updated", { detail: { url: savedImage } })
          )
        } else if (form.name.trim()) {
          await updateSession({ user: { name: form.name.trim() } })
        }
      }
      setIsEditing(false)
      setNewSkill("")
      setNewInterest("")
      toast.success("Profile saved", "Your directory profile is updated.")
    } catch (e) {
      toast.error("Save failed", e instanceof Error ? e.message : "Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    setIsEditing(false)
    setNewSkill("")
    setNewInterest("")
    await loadProfile()
  }

  const handleAddSkill = () => {
    const s = newSkill.trim()
    if (s && !form.skills.includes(s)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, s] }))
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((x) => x !== skill) }))
  }

  const handleAddInterest = () => {
    const s = newInterest.trim()
    if (s && !form.interests.includes(s)) {
      setForm((prev) => ({ ...prev, interests: [...prev.interests, s] }))
      setNewInterest("")
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setForm((prev) => ({ ...prev, interests: prev.interests.filter((x) => x !== interest) }))
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Confirmation required", 'Type "DELETE" to confirm account deletion.')
      return
    }
    if (!deletePassword) {
      toast.error("Password required", "Enter your password to delete your account.")
      return
    }

    setDeletingAccount(true)
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirmation,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete account")
      }

      toast.success(
        "Account deleted",
        data.message || "Your account has been permanently removed."
      )
      await signOut({ redirect: false })
      router.push("/login?deleted=true")
    } catch (e) {
      toast.error("Deletion failed", e instanceof Error ? e.message : "Please try again.")
    } finally {
      setDeletingAccount(false)
    }
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading" />
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto w-full max-w-5xl space-y-6 overflow-x-hidden">
          <MobileBreadcrumbsHidden>
            <Breadcrumbs items={[{ label: "Profile" }]} />
          </MobileBreadcrumbsHidden>
          <div className="flex min-h-[40vh] items-center justify-center rounded-lg border border-border bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Loading profile" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-5xl space-y-4 overflow-x-hidden md:space-y-8">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs items={[{ label: "Profile" }]} />
        </MobileBreadcrumbsHidden>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <MobilePageHeader
            title="Your profile"
            description="This information appears in the community directory. Keep it accurate so members can find and collaborate with you."
          />
          <div className="flex shrink-0 flex-wrap gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={
                      user?.id
                        ? getCommunityMemberProfilePath({
                            id: user.id,
                            slug: profileSlug,
                          })
                        : "/community"
                    }
                  >
                    View public profile
                  </Link>
                </Button>
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>

        <MobileStatsStrip
          items={[
            { label: "Connections", value: stats?.connections ?? 0, icon: Users, href: "/community" },
            { label: "Following", value: stats?.following ?? 0, icon: Heart, href: "/community" },
            { label: "Followers", value: stats?.followers ?? 0, icon: UserCheck, href: "/community" },
            { label: "Events", value: stats?.events ?? 0, icon: CalendarDays, href: "/events" },
            { label: "Projects", value: stats?.projects ?? 0, icon: Briefcase },
          ]}
          loading={loading}
        />

        {(needsOnboarding || profileCompleteness.percent < 100) && !isEditing ? (
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-foreground">
                  {needsOnboarding ? "Complete your directory profile" : "Strengthen your public profile"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {needsOnboarding
                    ? "Add your role, sector, a short intro, and what you're here for so your directory profile isn't empty."
                    : `${profileCompleteness.completed} of ${profileCompleteness.total} recommended sections complete.`}
                </p>
              </div>
              <Button size="sm" className="shrink-0" onClick={() => setIsEditing(true)}>
                {needsOnboarding ? "Complete profile" : "Continue editing"}
              </Button>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${profileCompleteness.percent}%` }}
                role="progressbar"
                aria-valuenow={profileCompleteness.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Profile completeness"
              />
            </div>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {profileCompleteness.items
                .filter((item) => !item.optional && !item.complete)
                .slice(0, 4)
                .map((item) => (
                  <li key={item.id} className="text-xs text-muted-foreground">
                    · {item.action ?? item.label}
                  </li>
                ))}
            </ul>
          </div>
        ) : null}

        <div className="flex gap-2 lg:hidden">
          <Button variant="outline" size="sm" className="flex-1 rounded-lg" asChild>
            <Link href="/billing">Billing</Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 rounded-lg" asChild>
            <Link href="/booking">Book space</Link>
          </Button>
        </div>

        {/* Identity */}
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
          <div className="border-b border-border bg-muted/30 px-4 py-5 md:px-8 md:py-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <Avatar className="h-20 w-20 shrink-0 border-2 border-background shadow-sm md:h-24 md:w-24">
                <AvatarImage src={avatarSrc} alt={displayName} />
                <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1">
                {isEditing ? (
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display name</Label>
                      <Input
                        id="display-name"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Your name"
                      />
                    </div>
                    <PresetAvatarPicker
                      value={form.image}
                      onChange={(path) => setForm((p) => ({ ...p, image: path }))}
                    />
                    <ImageUpload
                      label="Or upload a photo"
                      description="JPEG, PNG, WebP, or GIF. Max 2MB. Saved when you click Save."
                      value={form.image}
                      onChange={(url) => setForm((p) => ({ ...p, image: url }))}
                      category="profile"
                      previewClassName="size-24 md:size-32"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{displayName}</h1>
                    <MembershipTierBadge
                      membership={membershipDisplay}
                      interactive
                      onClick={() => setMembershipCardOpen(true)}
                    />
                    <MembershipCardDialog
                      open={membershipCardOpen}
                      onOpenChange={setMembershipCardOpen}
                      name={displayName}
                      email={user.email}
                      avatarUrl={avatarSrc}
                      initials={userInitials}
                      role={form.role.trim() || null}
                      organization={form.organization.trim() || null}
                      memberSince={memberSince}
                      membership={membershipDisplay}
                    />
                  </div>
                )}
                <p className="break-all text-sm text-muted-foreground">
                  {user.email}
                  {memberSince ? (
                    <span className="block sm:inline">
                      <span className="hidden sm:inline"> · </span>
                      Member since {memberSince}
                    </span>
                  ) : null}
                </p>
                {!isEditing && form.linkedin.trim() ? (
                  <a
                    href={form.linkedin.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-primary hover:underline"
                  >
                    <Linkedin className="h-4 w-4 text-[#0A66C2]" aria-hidden />
                    LinkedIn profile
                  </a>
                ) : !isEditing ? (
                  <p className="text-xs text-muted-foreground pt-1">
                    Edit your profile to pick an avatar, add a photo, or link LinkedIn.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
          <div className="space-y-4 md:space-y-6 lg:col-span-2">
            <Card className="border-border">
              <CardHeader className="p-4 pb-3 md:p-6">
                <CardTitle className="text-lg">About you</CardTitle>
                <CardDescription>Short introduction visible on your public member card.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-4 pt-0 md:p-6 md:pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio">
                      Bio <span className="text-destructive">*</span>
                    </Label>
                    {isEditing ? (
                      <span className="text-xs text-muted-foreground">
                        {form.bio.length}/{BIO_MAX_LENGTH}
                      </span>
                    ) : null}
                  </div>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      placeholder={`What you work on, what you are looking for, how others can help (${BIO_MIN_LENGTH}+ characters).`}
                      className="min-h-[120px] resize-y"
                      value={form.bio}
                      maxLength={BIO_MAX_LENGTH}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, bio: e.target.value.slice(0, BIO_MAX_LENGTH) }))
                      }
                    />
                  ) : (
                    <p className="rounded-md border border-border bg-muted/30 px-3 py-3 text-sm leading-relaxed text-foreground/90 min-h-[120px]">
                      {form.bio.trim() || "No bio yet. Edit your profile to add one."}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Member type</Label>
                    {isEditing ? (
                      <Select
                        value={form.memberType || "__none__"}
                        onValueChange={(v) =>
                          setForm((p) => ({ ...p, memberType: v === "__none__" ? "" : v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {MEMBER_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : form.memberType ? (
                      <p className="text-sm text-muted-foreground">
                        {getMemberTypeLabel(form.memberType)}
                      </p>
                    ) : (
                      emptyFieldHint("Select your member type to appear in directory filters.")
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">
                      Organization
                      {isEditing && memberTypeRequiresOrganization(form.memberType) ? (
                        <span className="text-destructive"> *</span>
                      ) : null}
                    </Label>
                    {isEditing ? (
                      <Input
                        id="organization"
                        placeholder="Company, NGO, or institution"
                        value={form.organization}
                        onChange={(e) => setForm((p) => ({ ...p, organization: e.target.value }))}
                      />
                    ) : form.organization.trim() ? (
                      <p className="text-sm text-muted-foreground">{form.organization.trim()}</p>
                    ) : (
                      emptyFieldHint(
                        memberTypeRequiresOrganization(form.memberType)
                          ? "Required for your member type."
                          : "Add your company, NGO, or institution."
                      )
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Primary role</Label>
                    {isEditing ? (
                      <Select
                        value={form.role || "__none__"}
                        onValueChange={(v) =>
                          setForm((p) => ({ ...p, role: v === "__none__" ? "" : v }))
                        }
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {PRIMARY_ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : form.role.trim() ? (
                      <p className="text-sm text-muted-foreground">{form.role.trim()}</p>
                    ) : (
                      emptyFieldHint("Select your primary role for better matching.")
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Sector / focus</Label>
                    {isEditing ? (
                      <Select
                        value={form.industry || "__none__"}
                        onValueChange={(v) =>
                          setForm((p) => ({ ...p, industry: v === "__none__" ? "" : v }))
                        }
                      >
                        <SelectTrigger id="industry">
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {IMPACT_SECTORS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : form.industry.trim() ? (
                      <p className="text-sm text-muted-foreground">{form.industry.trim()}</p>
                    ) : (
                      emptyFieldHint("Choose a sector so members can find you in filters.")
                    )}
                  </div>
                  {isEditing ? (
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="linkedin" className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-[#0A66C2]" aria-hidden />
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        type="url"
                        inputMode="url"
                        placeholder="linkedin.com/in/yourname"
                        value={form.linkedin}
                        onChange={(e) => setForm((p) => ({ ...p, linkedin: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Shown on your public community profile when you add a link.
                      </p>
                    </div>
                  ) : null}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        placeholder="City, country"
                        value={form.location}
                        onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                      />
                    ) : form.location.trim() ? (
                      <p className="text-sm text-muted-foreground">{form.location.trim()}</p>
                    ) : (
                      emptyFieldHint("Add your city or country.")
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Experience level</Label>
                    {isEditing ? (
                      <Select
                        value={form.experienceLevel || "__none__"}
                        onValueChange={(v) =>
                          setForm((p) => ({ ...p, experienceLevel: v === "__none__" ? "" : v }))
                        }
                      >
                        <SelectTrigger className="max-w-md">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Not specified</SelectItem>
                          {EXPERIENCE_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : form.experienceLevel.trim() ? (
                      <p className="text-sm text-muted-foreground">{form.experienceLevel.trim()}</p>
                    ) : (
                      emptyFieldHint("Optional — helps others understand your experience.")
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="p-4 pb-3 md:p-6">
                <CardTitle className="text-lg">Skills</CardTitle>
                <CardDescription>Helps others discover you in search and filters.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <div className="flex flex-wrap gap-2">
                  {form.skills.length === 0 && !isEditing && (
                    <p className="text-sm text-muted-foreground">No skills yet.</p>
                  )}
                  {form.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                      {skill}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="rounded p-0.5 hover:bg-muted hover:text-destructive"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                  {isEditing && (
                    <div className="flex w-full max-w-sm gap-2 sm:w-auto">
                      <Input
                        placeholder="Add a skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddSkill()
                          }
                        }}
                      />
                      <Button type="button" size="sm" variant="outline" onClick={handleAddSkill}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="p-4 pb-3 md:p-6">
                <CardTitle className="text-lg">Interests</CardTitle>
                <CardDescription>
                  Why you&apos;re in the hub — pick at least one so members can find you.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <div className="flex flex-wrap gap-2">
                  {form.interests.length === 0 && !isEditing && (
                    <p className="text-sm text-muted-foreground">No interests listed yet.</p>
                  )}
                  {form.interests.map((interest) => (
                    <Badge key={interest} variant="outline" className="gap-1 pr-1">
                      {interest}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(interest)}
                          className="rounded p-0.5 hover:bg-muted hover:text-destructive"
                          aria-label={`Remove ${interest}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                  {isEditing && suggestedInterests.length > 0 ? (
                    <div className="flex w-full flex-wrap gap-2 pt-1">
                      {suggestedInterests.slice(0, 6).map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              interests: [...prev.interests, interest],
                            }))
                          }
                          className="rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                        >
                          + {interest}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {isEditing && (
                    <div className="flex w-full max-w-sm gap-2 sm:w-auto">
                      <Input
                        placeholder="Add an interest"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddInterest()
                          }
                        }}
                      />
                      <Button type="button" size="sm" variant="outline" onClick={handleAddInterest}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="p-4 pb-3 md:p-6">
                <CardTitle className="text-lg">Availability</CardTitle>
                <CardDescription>What you are open to — shown on your member profile.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {availabilityEditOptions.map((option) => {
                      const on = form.availability.includes(option)
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleAvailability(option)}
                          className={cn(
                            "rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors sm:px-3 sm:py-2 sm:text-sm",
                            on
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-background hover:bg-muted/50"
                          )}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {form.availability.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nothing selected yet.</p>
                    ) : (
                      form.availability.map((a) => (
                        <Badge key={a} variant="outline" className={badgeClassForLabel(a)}>
                          {a}
                        </Badge>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 lg:hidden">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="h-4 w-4" />
                  Following
                </CardTitle>
                <CardDescription>Members you follow in the community directory.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {followingLoading ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </div>
                ) : followingMembers.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">
                    You are not following anyone yet.{" "}
                    <Link href="/community" className="font-medium text-primary hover:underline">
                      Browse the directory
                    </Link>
                    .
                  </p>
                ) : (
                  followingMembers.map((member) => (
                    <Link
                      key={member.id}
                      href={getCommunityMemberProfilePath(member)}
                      className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={getImageDisplayUrl(member.avatar) || undefined}
                          alt={member.name}
                        />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{member.name}</p>
                        {member.role ? (
                          <p className="truncate text-xs text-muted-foreground">{member.role}</p>
                        ) : null}
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="hidden space-y-6 lg:block">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Your activity</CardTitle>
                <CardDescription>Counts from your account in this platform.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-md border border-border px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    <Users className="h-3.5 w-3.5" />
                    Connections
                  </div>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{stats?.connections ?? 0}</p>
                </div>
                <div className="rounded-md border border-border px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    <Heart className="h-3.5 w-3.5" />
                    Following
                  </div>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{stats?.following ?? 0}</p>
                </div>
                <div className="rounded-md border border-border px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    <UserCheck className="h-3.5 w-3.5" />
                    Followers
                  </div>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{stats?.followers ?? 0}</p>
                </div>
                <div className="rounded-md border border-border px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Event sign-ups
                  </div>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{stats?.events ?? 0}</p>
                </div>
                <div className="rounded-md border border-border px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    <Briefcase className="h-3.5 w-3.5" />
                    Projects (founder)
                  </div>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{stats?.projects ?? 0}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="h-4 w-4" />
                  Following
                </CardTitle>
                <CardDescription>
                  Members you follow in the community directory.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {followingLoading ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </div>
                ) : followingMembers.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">
                    You are not following anyone yet. Browse the{" "}
                    <Link href="/community" className="font-medium text-primary hover:underline">
                      community directory
                    </Link>{" "}
                    to follow members.
                  </p>
                ) : (
                  followingMembers.map((member) => (
                    <Link
                      key={member.id}
                      href={getCommunityMemberProfilePath(member)}
                      className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={getImageDisplayUrl(member.avatar) || undefined}
                          alt={member.name}
                        />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{member.name}</p>
                        {member.role ? (
                          <p className="truncate text-xs text-muted-foreground">{member.role}</p>
                        ) : null}
                      </div>
                    </Link>
                  ))
                )}
                {(stats?.following ?? 0) > followingMembers.length ? (
                  <Button variant="ghost" size="sm" className="mt-2 w-full" asChild>
                    <Link href="/community">Browse community</Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing & workspace
                </CardTitle>
                <CardDescription>Payments, invoices, and workspace bookings.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/billing">Open billing & payments</Link>
                </Button>
                <Button variant="ghost" className="mt-2 w-full" asChild>
                  <Link href="/booking">Book workspace</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>

        <Card className="border-destructive/30">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 p-4 text-left md:p-6"
            onClick={() => setDangerZoneOpen((open) => !open)}
            aria-expanded={dangerZoneOpen}
          >
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Account & danger zone
              </CardTitle>
              <CardDescription className="mt-1 text-left">
                Permanently delete your account and all associated data.
              </CardDescription>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                dangerZoneOpen && "rotate-180"
              )}
              aria-hidden
            />
          </button>
          {dangerZoneOpen ? (
            <CardContent className="space-y-4 border-t border-destructive/20 p-4 pt-4 md:p-6 md:pt-4">
              {!canDeleteWithPassword ? (
                <p className="text-sm text-muted-foreground">
                  You signed in with Google, so account deletion must be handled by our team. Email{" "}
                  <a href={`mailto:${HUB_CONTACT_EMAIL}`} className="font-medium text-primary hover:underline">
                    {HUB_CONTACT_EMAIL}
                  </a>{" "}
                  from {user.email} to request removal.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Permanently remove your account, profile, bookings, and sign-in access. You will
                    receive a confirmation email at {user.email}. This cannot be undone.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="delete-password">Current password</Label>
                      <Input
                        id="delete-password"
                        type="password"
                        autoComplete="current-password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        disabled={deletingAccount}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delete-confirmation">Type DELETE to confirm</Label>
                      <Input
                        id="delete-confirmation"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="DELETE"
                        disabled={deletingAccount}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                  >
                    {deletingAccount ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting account…
                      </>
                    ) : (
                      "Permanently delete my account"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          ) : null}
        </Card>
      </div>
    </DashboardLayout>
  )
}
