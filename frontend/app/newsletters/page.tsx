"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Loader2, Mail } from "lucide-react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { EmptyState } from "@/components/design/empty-state"

type Campaign = {
  id: string
  title: string
  slug: string
  subject: string
  preheader: string | null
  sentAt: string | null
}

export default function NewslettersArchivePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/newsletters")
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed")
        setCampaigns(data.campaigns || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#822929]">
            Impact Hub Nairobi
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Newsletters</h1>
          <p className="mt-2 text-muted-foreground">
            Archive of community newsletters — the same branded layout you receive by email.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No newsletters yet"
            description="When campaigns are sent and published to the web, they’ll appear here."
          />
        ) : (
          <ul className="space-y-3">
            {campaigns.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/newsletters/${c.slug}`}
                  className="block rounded-xl border bg-card p-4 transition hover:border-[#822929]/40"
                >
                  <h2 className="font-semibold">{c.title}</h2>
                  {c.preheader ? (
                    <p className="mt-1 text-sm text-muted-foreground">{c.preheader}</p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">{c.subject}</p>
                  )}
                  {c.sentAt ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {format(new Date(c.sentAt), "MMMM d, yyyy")}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  )
}
