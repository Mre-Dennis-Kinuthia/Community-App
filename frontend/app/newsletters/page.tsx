"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Calendar, Mail } from "lucide-react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { EmptyState } from "@/components/design/empty-state"
import {
  ListPageBody,
  ListPageShell,
} from "@/components/design/list-page-shell"
import { ImpactHubMark } from "@/components/brand/impact-hub-mark"
import { cn } from "@/lib/utils"

type Campaign = {
  id: string
  title: string
  slug: string
  subject: string
  preheader: string | null
  sentAt: string | null
  coverImageUrl?: string | null
  brandPrimary?: string | null
}

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #822929 0%, #1c395c 100%)",
  "linear-gradient(135deg, #1c395c 0%, #41bed0 110%)",
  "linear-gradient(135deg, #0a1f38 0%, #822929 110%)",
] as const

function fallbackGradient(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return FALLBACK_GRADIENTS[h % FALLBACK_GRADIENTS.length]
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
      <ListPageShell
        breadcrumb="Newsletters"
        title="Newsletters"
        description="Community editions from Impact Hub Nairobi — the same stories we send by email."
        resultCount={loading ? undefined : campaigns.length}
        resultLabel="editions"
      >
        <ListPageBody
          loading={loading}
          loadingMessage="Loading newsletters…"
          error={error}
          isEmpty={!loading && !error && campaigns.length === 0}
          empty={
            <EmptyState
              icon={Mail}
              title="No newsletters yet"
              description="When campaigns are sent and published to the web, they’ll show up here."
            />
          }
        >
          <ul className="grid gap-4 sm:grid-cols-2">
            {campaigns.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/newsletters/${c.slug}`}
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card",
                    "transition hover:border-[#822929]/35 hover:shadow-sm"
                  )}
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    {c.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.coverImageUrl}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div
                        className="relative flex h-full w-full items-center justify-center"
                        style={{ background: fallbackGradient(c.id) }}
                      >
                        <ImpactHubMark size={48} className="opacity-80 brightness-0 invert" />
                      </div>
                    )}
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-1.5"
                      style={{
                        background: `linear-gradient(90deg, ${c.brandPrimary || "#822929"}, #1c395c)`,
                      }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#822929]">
                      Newsletter
                    </p>
                    <h2 className="mt-1.5 text-base font-semibold leading-snug tracking-tight group-hover:text-[#822929] sm:text-lg">
                      {c.title}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {c.preheader || c.subject}
                    </p>
                    {c.sentAt ? (
                      <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {format(new Date(c.sentAt), "MMMM d, yyyy")}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </ListPageBody>
      </ListPageShell>
    </DashboardLayout>
  )
}
