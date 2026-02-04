"use client"

import React, { useState, useEffect } from "react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, Clock, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface MyProject {
  id: string
  title: string
  status: string
  submittedAt?: string
  createdAt: string
}

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<MyProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMy() {
      try {
        const res = await fetch("/api/projects?mine=true&limit=50", { credentials: "include" })
        if (!res.ok) return
        const data = await res.json()
        setProjects(data.projects || [])
      } catch {
        setProjects([])
      } finally {
        setLoading(false)
      }
    }
    fetchMy()
  }, [])

  const statusConfig: Record<string, { label: string; variant: "secondary" | "default" | "destructive" | "outline"; icon: React.ComponentType<{ className?: string }> }> = {
    pending: { label: "Pending review", variant: "secondary", icon: Clock },
    approved: { label: "Published", variant: "default", icon: CheckCircle2 },
    rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Dashboard" }, { label: "My projects" }]} />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">My projects</h1>
            <p className="text-muted-foreground text-sm">
              Projects you’ve submitted. They need admin approval before they appear on the community.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="h-4 w-4" />
              Submit a project
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>Status: Pending = under review, Published = live on Projects & Initiatives, Rejected = not published.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">You haven’t submitted any projects yet.</p>
                <Button asChild>
                  <Link href="/dashboard/projects/new">Submit your first project</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y">
                {projects.map((p) => {
                  const config = statusConfig[p.status] || statusConfig.pending
                  const Icon = config.icon
                  return (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted {p.submittedAt ? format(new Date(p.submittedAt), "PP") : format(new Date(p.createdAt), "PP")}
                        </p>
                      </div>
                      <Badge variant={config.variant} className="gap-1 shrink-0">
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
