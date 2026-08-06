"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { NewsletterWebRenderer } from "@/lib/newsletter/render-web"
import type { NewsletterSection } from "@/lib/newsletter"

type Campaign = {
  title: string
  slug: string
  subject: string
  preheader: string | null
  brandPrimary: string | null
  brandAccent: string | null
  sentAt: string | null
  sections: NewsletterSection[]
}

export default function NewsletterDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/newsletters/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Not found")
        setCampaign(data.campaign)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/newsletters"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          All newsletters
        </Link>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error || !campaign ? (
          <p className="text-sm text-destructive">{error || "Not found"}</p>
        ) : (
          <>
            {campaign.sentAt ? (
              <p className="mb-4 text-center text-xs text-muted-foreground">
                Sent {format(new Date(campaign.sentAt), "MMMM d, yyyy")}
              </p>
            ) : null}
            <NewsletterWebRenderer
              sections={campaign.sections}
              brandPrimary={campaign.brandPrimary}
              brandAccent={campaign.brandAccent}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
