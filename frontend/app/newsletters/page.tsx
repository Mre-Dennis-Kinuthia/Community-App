"use client"

import useSWR from "swr"
import { DashboardLayout } from "@/app/dashboard/layout"
import {
  NewslettersArchiveList,
  type NewsletterEdition,
} from "@/components/news/newsletters-archive-list"

export default function NewslettersArchivePage() {
  const { data, error, isLoading } = useSWR<{
    campaigns?: NewsletterEdition[]
  }>("/api/newsletters?limit=50")
  const campaigns = Array.isArray(data?.campaigns) ? data.campaigns : []

  return (
    <DashboardLayout>
      <section className="mx-auto w-full max-w-5xl space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Newsletters
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Read the latest stories, opportunities, and updates from our community.
        </p>
        <div className="pt-4">
          <NewslettersArchiveList
            campaigns={campaigns}
            loading={isLoading}
            error={error ? "Unable to load newsletters. Please try again later." : null}
          />
        </div>
      </section>
    </DashboardLayout>
  )
}
