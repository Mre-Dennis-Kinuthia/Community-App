"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ArrowLeft, Loader2, Send } from "lucide-react"
import Link from "next/link"
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

export default function SubmitProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    stage: "",
    impact: "",
    location: "",
    needs: [] as string[],
    tags: "",
    website: "",
  })

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
    setLoading(true)
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
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to submit")
      }
      toast.success("Project submitted", "It will be reviewed by the admin and published once approved.")
      router.push("/dashboard/projects")
    } catch (err: any) {
      toast.error("Could not submit", err?.message || "Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <Breadcrumbs
          items={[
            { label: "Dashboard" },
            { label: "My projects", href: "/dashboard/projects" },
            { label: "Submit project" },
          ]}
        />
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Submit a project</h1>
            <p className="text-muted-foreground text-sm">
              Your project will be reviewed by the admin team before it appears on the community.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project details</CardTitle>
            <CardDescription>
              Fill in the information. Your project will need admin approval to be published.
            </CardDescription>
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
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category || undefined} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Nairobi, Kenya"
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
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/projects">Cancel</Link>
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit for approval
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
