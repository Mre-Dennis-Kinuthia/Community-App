"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X, Plus, Upload } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { toast } from "@/lib/toast"
import { useSession } from "@/lib/use-session"

export default function ProfilePage() {
  const { user } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [website, setWebsite] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [memberSince, setMemberSince] = useState<string>("")

  // Get user initials for avatar fallback
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.trim().split(" ")
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  const userInitials = getInitials(user?.name, user?.email)
  const displayName = user?.name || "User"
  
  // Format member since date
  useEffect(() => {
    if (user?.id) {
      // In a real app, fetch user creation date from API
      // For now, we'll use a placeholder
      setMemberSince("Jan 2024")
    }
  }, [user])

  const handleSave = () => {
    setIsEditing(false)
    // In real app, this would save to backend
    toast.success("Profile updated!", "Your changes have been saved successfully")
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to current values (would be loaded from API in production)
    setNewSkill("")
    setAvatarPreview(null)
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", "Please select an image smaller than 5MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", "Please select an image file")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
        toast.success("Avatar updated", "Your profile picture has been updated")
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <Breadcrumbs items={[{ label: "Profile" }]} />
      <div className="mb-8 mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarPreview || user?.image || "/placeholder-user.jpg"} alt={displayName} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground shadow-md hover:bg-primary/90">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">{displayName}</h1>
            <p className="text-muted-foreground text-base">
              {user?.email} • Member since {memberSince}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
              <CardDescription>Tell the community about yourself and your work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    placeholder="Share your story..."
                    className="min-h-[100px]"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground min-h-[100px] p-3 rounded-md border bg-muted/50">
                    {bio || "No bio yet. Click 'Edit Profile' to add one."}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Skills & Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {skills.length === 0 && !isEditing && (
                    <p className="text-sm text-muted-foreground">No skills added yet. Click 'Edit Profile' to add some.</p>
                  )}
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="gap-1"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                  {isEditing && (
                    <div className="flex gap-1">
                      <Input
                        placeholder="Add skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddSkill()
                          }
                        }}
                        className="h-7 w-24 text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddSkill}
                        className="h-7"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  {isEditing ? (
                    <Input
                      id="linkedin"
                      placeholder="linkedin.com/in/..."
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground p-2 rounded-md border bg-muted/50">
                      {linkedin || "Not provided"}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  {isEditing ? (
                    <Input
                      id="website"
                      placeholder="https://..."
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground p-2 rounded-md border bg-muted/50">
                      {website || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Membership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan</span>
                <Badge>Fixed Desk</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <span className="text-sm text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Next Billing</span>
                <span className="text-sm">Feb 1, 2026</span>
              </div>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/billing">
                  Manage Billing
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-muted p-2">
                  <div className="text-xl font-bold">12</div>
                  <div className="text-xs text-muted-foreground">Events</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <div className="text-xl font-bold">45</div>
                  <div className="text-xs text-muted-foreground">Connections</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
