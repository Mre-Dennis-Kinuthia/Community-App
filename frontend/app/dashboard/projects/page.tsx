"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MobilePageHeader, MobileBreadcrumbsHidden } from "@/components/mobile/mobile-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2, Clock, CheckCircle2, XCircle, Send, Lightbulb } from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/lib/toast"

const CATEGORIES = [
  "Climate & Environment",
  "Agriculture",
  "Circular Economy",
  "Healthcare",
  "FinTech",
  "Water & Sanitation",
]
const STAGES = ["Early Stage", "Growth", "Scaling"]
const NEEDS_OPTIONS = [
  "Seeking Funding",
  "Seeking Collaborators",
  "Looking for Volunteers",
  "Open to Partnerships",
]

interface MyProject {
  id: string
  title: string
  status: string
  submittedAt?: string
  createdAt: string
}

const emptyForm = {
  title: "",
  description: "",
  category: "",
  stage: "",
  impact: "",
  location: "",
  needs: [] as string[],
  tags: "",
  website: "",
  imageUrl: "",
}

export default function MyProjectsPage() {
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<MyProject[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState(emptyForm)

  const fetchMy = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/projects?mine=true&limit=50", { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      setProjects(data.projects || [])
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMy()
  }, [fetchMy])

  useEffect(() => {
    if (searchParams.get("new") === "1") setShowForm(true)
  }, [searchParams])

  const statusConfig: Record<string, { label: string; variant: "secondary" | "default" | "destructive" | "outline"; icon: React.ComponentType<{ className?: string }> }> = {
    pending: { label: "Pending review", variant: "secondary", icon: Clock },
    approved: { label: "Published", variant: "default", icon: CheckCircle2 },
    rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
  }

  const toggleNeed = (need: string) => {
    setFormData((prev) => ({
      ...prev,
      needs: prev.needs.includes(need) ? prev.needs.filter((n) => n !== need) : [...prev.needs, need],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error("Title is required", "Please enter a project title.")
      return
    }
    setSubmitting(true)
    try {
      const tagsArray = formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          category: formData.category || undefined,
          stage: formData.stage || undefined,
          impact: formData.impact.trim() || undefined,
          location: formData.location.trim() || undefined,
          needs: formData.needs.length > 0 ? formData.needs : undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
          website: formData.website.trim() || undefined,
          imageUrl: formData.imageUrl.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to submit")
      }
      toast.success("Project submitted", "It will be reviewed by the admin and published once approved.")
      setFormData(emptyForm)
      setShowForm(false)
      fetchMy()
    } catch (err: any) {
      toast.error("Could not submit", err?.message || "Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs items={[{ label: "Dashboard" }, { label: "My projects" }]} />
        </MobileBreadcrumbsHidden>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <MobilePageHeader
            title="My projects"
            description={
              showForm
                ? "Submit for admin approval to publish on Projects & Initiatives."
                : "View and submit projects."
            }
          />
          {!showForm && (
            <Button onClick={() => setShowForm(true)} size="sm" className="shrink-0 rounded-lg">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5">Submit</span>
            </Button>
          )}
        </div>

        {showForm ? (
          <Card className="border-border ">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  New project
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Sustainable Energy Initiative"
                    required
                    className="border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project and goals..."
                    rows={4}
                    className="border-border resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Project image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/your-project-image.jpg"
                    className="border-border"
                  />
                  <p className="text-xs text-muted-foreground">Optional. Link to a cover image for your project.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category || undefined} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Stage</Label>
                    <Select value={formData.stage || undefined} onValueChange={(v) => setFormData({ ...formData, stage: v })}>
                      <SelectTrigger className="border-border"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {STAGES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impact">Impact</Label>
                  <Textarea
                    id="impact"
                    value={formData.impact}
                    onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                    placeholder="Social or environmental impact..."
                    rows={2}
                    className="border-border resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Nairobi, Kenya"
                    className="border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Looking for</Label>
                  <div className="flex flex-wrap gap-3">
                    {NEEDS_OPTIONS.map((need) => (
                      <label key={need} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formData.needs.includes(need)}
                          onCheckedChange={() => toggleNeed(need)}
                        />
                        <span className="text-sm">{need}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. sustainability, cleantech"
                    className="border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                    className="border-border"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit for approval
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border ">
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium text-foreground">No projects yet</p>
                  <p className="text-sm mt-1">Use the button above to submit your first project.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {projects.map((p) => {
                    const config = statusConfig[p.status] || statusConfig.pending
                    const Icon = config.icon
                    return (
                      <li key={p.id}>
                        <div className="flex items-center gap-3 rounded-xl border border-border/80 p-3.5">
                          <div className="flex w-10 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                            <Lightbulb className="h-4 w-4 text-primary/70" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{p.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.submittedAt
                                ? format(new Date(p.submittedAt), "MMM d, yyyy")
                                : format(new Date(p.createdAt), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge variant={config.variant} className="shrink-0 gap-1 text-[10px]">
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
    </div>
  )
}
