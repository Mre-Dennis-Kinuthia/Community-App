"use client"

import { useState } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MobileBreadcrumbsHidden, MobilePageHeader } from "@/components/mobile/mobile-page-shell"
import { EmptyState } from "@/components/design/empty-state"
import { expertEventCreateSchema } from "@/lib/experts"
import { getEventPublicPath } from "@/lib/event-url"
import { toast } from "@/lib/toast"

type LinkedExpertResponse = {
  expert: { id: string; slug: string; name: string; isPublished: boolean } | null
}

export default function NewExpertEventPage() {
  const router = useRouter()
  const { data, isLoading } = useSWR<LinkedExpertResponse>("/api/experts/me", async (url) => {
    const res = await fetch(url)
    if (!res.ok) return { expert: null }
    return res.json()
  })

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [onlineUrl, setOnlineUrl] = useState("")
  const [visibility, setVisibility] = useState<"members" | "public">("members")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = expertEventCreateSchema.safeParse({
      title,
      description,
      startDate,
      endDate,
      onlineUrl,
      visibility,
    })
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Please complete the form")
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/experts/me/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof json.error === "string" ? json.error : "Could not create session")
      }
      toast.success("Virtual session published")
      const path = getEventPublicPath(json.event)
      router.push(path)
    } catch (err) {
      const text = err instanceof Error ? err.message : "Could not create session"
      setError(text)
      toast.error(text)
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!data?.expert?.isPublished) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <MobileBreadcrumbsHidden>
            <Breadcrumbs
              items={[
                { label: "Experts in Residence", href: "/experts" },
                { label: "Host a session" },
              ]}
            />
          </MobileBreadcrumbsHidden>
          <EmptyState
            title="Published experts only"
            description="Virtual sessions can be created by published Experts in Residence. Ask the Hub team to link your member account to your expert profile."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/experts">Back to experts</Link>
              </Button>
            }
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs
            items={[
              { label: "Experts in Residence", href: "/experts" },
              { label: "Host a session" },
            ]}
          />
        </MobileBreadcrumbsHidden>
        <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
          <Link href="/dashboard/eir">
            <ArrowLeft className="mr-2 h-4 w-4" />
            EIR dashboard
          </Link>
        </Button>
        <MobilePageHeader
          title="Host a virtual session"
          description="Publish an online event for members. It will appear on your expert profile and in Events."
        />
        <Card className="border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Session title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Climate office hours"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">About this session</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start">Starts</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">Ends (optional)</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="onlineUrl">Meeting link (optional)</Label>
                <Input
                  id="onlineUrl"
                  type="url"
                  value={onlineUrl}
                  onChange={(e) => setOnlineUrl(e.target.value)}
                  placeholder="https://meet.google.com/…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visibility">Who can see it</Label>
                <Select
                  value={visibility}
                  onValueChange={(value) => setVisibility(value as "members" | "public")}
                >
                  <SelectTrigger id="visibility" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="members">Members</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Publish session
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
