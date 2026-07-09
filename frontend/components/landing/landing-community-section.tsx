"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { cn } from "@/lib/utils"
import type { LandingCommunityPreview } from "@/lib/landing-community"

function MemberAvatar({
  name,
  image,
  className,
}: {
  name: string
  image?: string | null
  className?: string
}) {
  const src = getImageDisplayUrl(image || undefined)
  const initial = name.trim().charAt(0).toUpperCase() || "?"

  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={40}
        height={40}
        unoptimized
        className={cn("rounded-full border border-[#edeff2] object-cover", className)}
      />
    )
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full border border-[#edeff2] bg-[#f3f5f8] text-xs font-medium text-[#1c395c]",
        className
      )}
      aria-hidden
    >
      {initial}
    </span>
  )
}

export function LandingCommunitySection() {
  const [preview, setPreview] = useState<LandingCommunityPreview | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/landing/community-preview")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LandingCommunityPreview | null) => {
        if (!cancelled && data) setPreview(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const memberCount = preview?.memberCount ?? 0
  const eventsCount = preview?.upcomingEventsCount ?? 0

  return (
    <section id="community" className="landing-section border-t border-[#edeff2]">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight text-[#0a1f38] md:text-2xl">
            The community
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#1c395c]/85 md:text-base">
            Founders, partners, investors, and researchers working from Nairobi — connected through
            events, programs, and the platform.
          </p>
          {(memberCount > 0 || eventsCount > 0) && (
            <p className="mt-4 text-sm text-[#1c395c]/75">
              {memberCount > 0 ? (
                <>
                  <span className="font-medium text-[#0a1f38]">{memberCount}</span> members on the
                  platform
                </>
              ) : null}
              {memberCount > 0 && eventsCount > 0 ? " · " : null}
              {eventsCount > 0 ? (
                <>
                  <span className="font-medium text-[#0a1f38]">{eventsCount}</span> upcoming events
                </>
              ) : null}
            </p>
          )}
        </div>

        {preview?.featuredMembers.length ? (
          <ul className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
            {preview.featuredMembers.map((member) => (
              <li
                key={member.name}
                className="flex items-start gap-3 rounded-md border border-[#edeff2] bg-white p-4"
              >
                <MemberAvatar name={member.name} image={member.image} className="h-10 w-10 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-[#0a1f38]">{member.name}</p>
                  <p className="text-sm text-[#1c395c]/75">
                    {[member.role, member.organization].filter(Boolean).join(" · ") ||
                      member.industry ||
                      "Member"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mx-auto mt-10 flex max-w-md flex-col gap-2 sm:flex-row">
          <Link href="/register" className="flex-1">
            <Button className="w-full bg-[#812926] hover:bg-[#6b2120]">Join on the platform</Button>
          </Link>
          <Link href="/events/public" className="flex-1">
            <Button variant="outline" className="w-full border-[#edeff2] bg-white">
              See events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
