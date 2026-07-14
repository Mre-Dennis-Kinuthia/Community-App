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
import { Edit, Save, X, Plus, Loader2, CreditCard, Users, CalendarDays, Briefcase, AlertTriangle, Heart } from "lucide-react"
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
} from "@/lib/member-segmentation"
import { validateLinkedInInput } from "@/lib/member-social-links"
import { Linkedin } from "lucide-react"
import { MembershipTierBadge } from "@/components/membership-tier-badge"
import { MembershipCardDialog } from "@/components/membership/membership-card-dialog"
import type { MembershipBenefits } from "@/lib/hooks/use-membership"

const EXPERIENCE_LEVELS = ["Early Career", "Mid-Level", "Senior", "Expert"] as const

const AVAILABILITY_OPTIONS = [
  "Open to Collaboration",
  "Seeking Mentorship",
  "Offering Mentorship",
  "Open to Partnerships",
  "Looking for Volunteers",
] as const

type FollowingMember = {
  id: string
  name: string
  avatar: string | null
  role: string | null
}

type ProfileStats = {
  connections: number
  following: number
  followers: number
  events: number
  projects: number
}

type ProfilePayload = {
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

  const [form, setForm] = useState(emptyForm())
  const [newSkill, setNewSkill] = useState("")
  const [newInterest, setNewInterest] = useState("")

  const applyProfile = useCallback((profile: ProfilePayload) => {
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
    label: "Community member",
    canBookHotDesk: true,
    meetingRoom: {
      allowanceMinutes: 0,
      usedMinutes: 0,
      remainingMinutes: 0,
      periodStart: new Date().toISOString(),
    },
  }

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
    setSaving(true)
    try {
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
          availability: form.availability,
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
        const savedImage = data.profile.user?.image
        if (savedImage) {
          await updateSession({ user: { image: savedImage } })
          window.dispatchEvent(
            new CustomEvent("profile-image-updated", { detail: { url: savedImage } })
          )
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
                  <Link href={user?.id ? `/community/${user.id}` : "/community"}>
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
            { label: "Connections", value: stats?.connections ?? 0, icon: Users },
            { label: "Following", value: stats?.following ?? 0, icon: Heart },
            { label: "Event sign-ups", value: stats?.events ?? 0, icon: CalendarDays },
            { label: "Projects", value: stats?.projects ?? 0, icon: Briefcase },
          ]}
          loading={loading}
        />

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
                      onChange={async (path) => {
                        setForm((p) => ({ ...p, image: path }))
                        await updateSession({ user: { image: path } })
                      }}
                    />
                    <ImageUpload
                      label="Or upload a photo"
                      description="JPEG, PNG, WebP, or GIF. Max 2MB. Stored securely on the platform."
                      value={form.image}
                      onChange={async (url) => {
                        setForm((p) => ({ ...p, image: url }))
                        await updateSession({ user: { image: url } })
                      }}
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
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      placeholder="What you work on, what you are looking for, how others can help."
                      className="min-h-[120px] resize-y"
                      value={form.bio}
                      onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
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
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {getMemberTypeLabel(form.memberType) || "—"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    {isEditing ? (
                      <Input
                        id="organization"
                        placeholder="Company, NGO, or institution"
                        value={form.organization}
                        onChange={(e) => setForm((p) => ({ ...p, organization: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{form.organization.trim() || "—"}</p>
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
                    ) : (
                      <p className="text-sm text-muted-foreground">{form.role.trim() || "—"}</p>
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
                    ) : (
                      <p className="text-sm text-muted-foreground">{form.industry.trim() || "—"}</p>
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-[#0A66C2]" aria-hidden />
                      LinkedIn
                    </Label>
                    {isEditing ? (
                      <>
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
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {form.linkedin.trim() ? (
                          <a
                            href={form.linkedin.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {form.linkedin.trim()}
                          </a>
                        ) : (
                          "—"
                        )}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        placeholder="City, country"
                        value={form.location}
                        onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{form.location.trim() || "—"}</p>
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
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {form.experienceLevel.trim() || "—"}
                      </p>
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
                <CardDescription>Themes and topics you care about.</CardDescription>
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
                    {AVAILABILITY_OPTIONS.map((option) => {
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
                      href={`/community/${member.id}`}
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
                      href={`/community/${member.id}`}
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

        <Card className="border-destructive/40">
          <CardHeader className="p-4 pb-3 md:p-6">
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete account
            </CardTitle>
            <CardDescription>
              Permanently remove your account, profile, bookings, and sign-in access. You will receive
              a confirmation email at {user.email}. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
