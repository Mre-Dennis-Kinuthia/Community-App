"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { cn } from "@/lib/utils"
import {
  COMMUNITY_MOMENTS,
  COMMUNITY_VOICES,
  MEMBER_ARCHETYPES,
  type LandingCommunityPreview,
} from "@/lib/landing-community"

function SectionHeader({
  label,
  title,
  description,
  className,
}: {
  label?: string
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      {label ? <p className="section-label mb-3">{label}</p> : null}
      <h2 className="section-title text-balance">{title}</h2>
      {description ? (
        <p className="section-lead mx-auto mt-4 max-w-2xl text-pretty">{description}</p>
      ) : null}
    </div>
  )
}

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
        className={cn("rounded-full border-2 border-white object-cover", className)}
      />
    )
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full border-2 border-white bg-[#1c395c] text-xs font-semibold text-white",
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
  const showLiveStats = memberCount > 0 || eventsCount > 0

  return (
    <section id="community" className="landing-section">
      <div className="container px-4">
        <SectionHeader
          label="Our community"
          title="Where impact makers connect"
          description="Founders, partners, investors, and creatives — building together in Nairobi and plugged into a global network of 300k+ impact makers."
          className="mb-10 md:mb-12"
        />

        {showLiveStats ? (
          <div className="landing-community-pulse mx-auto mb-12 max-w-4xl">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {preview?.featuredMembers.length ? (
                <div className="flex -space-x-2" aria-hidden>
                  {preview.featuredMembers.slice(0, 5).map((member) => (
                    <MemberAvatar
                      key={member.name}
                      name={member.name}
                      image={member.image}
                      className="h-10 w-10"
                    />
                  ))}
                </div>
              ) : null}
              <p className="text-center text-sm text-[#1c395c]/85 sm:text-left">
                {memberCount > 0 ? (
                  <>
                    <span className="font-semibold text-[#812926]">{memberCount}+</span> members on
                    the platform
                  </>
                ) : null}
                {memberCount > 0 && eventsCount > 0 ? " · " : null}
                {eventsCount > 0 ? (
                  <>
                    <span className="font-semibold text-[#812926]">{eventsCount}</span> upcoming
                    events
                  </>
                ) : null}
              </p>
            </div>
          </div>
        ) : null}

        {preview?.featuredMembers.length ? (
          <div className="mx-auto mb-14 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {preview.featuredMembers.map((member) => (
              <article key={member.name} className="landing-community-member-card">
                <div className="flex items-center gap-3">
                  <MemberAvatar name={member.name} image={member.image} className="h-11 w-11" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#0a1f38]">{member.name}</p>
                    <p className="truncate text-xs text-[#1c395c]/70">
                      {member.role || member.industry || "Impact Hub member"}
                    </p>
                  </div>
                </div>
                {member.organization || member.industry ? (
                  <p className="mt-3 text-xs leading-relaxed text-[#1c395c]/65">
                    {[member.organization, member.industry].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}

        <div className="mx-auto mb-14 max-w-5xl">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.12em] text-[#1c395c]/60">
            Who you&apos;ll meet
          </p>
          <ul className="flex flex-wrap justify-center gap-2">
            {MEMBER_ARCHETYPES.map((archetype) => (
              <li
                key={archetype.label}
                className="landing-community-chip rounded-full px-3 py-1.5 text-xs text-[#1c395c]"
              >
                <span aria-hidden>{archetype.emoji} </span>
                {archetype.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mb-14 grid max-w-5xl gap-4 md:grid-cols-3">
          {COMMUNITY_VOICES.map((voice) => (
            <blockquote
              key={voice.quote}
              className="landing-community-voice"
              style={{ borderTopColor: voice.accent }}
            >
              <p className="text-sm leading-relaxed text-[#1c395c]">&ldquo;{voice.quote}&rdquo;</p>
              <footer className="mt-4">
                <p className="text-xs font-semibold text-[#0a1f38]">{voice.attribution}</p>
                <p className="text-xs text-[#1c395c]/65">{voice.context}</p>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mx-auto mb-12 grid max-w-5xl gap-2 sm:grid-cols-4 sm:grid-rows-2">
          {COMMUNITY_MOMENTS.map((moment, index) => (
            <figure
              key={moment.caption}
              className={cn(
                "landing-community-moment relative overflow-hidden rounded-md",
                index === 0 && "sm:col-span-2 sm:row-span-2",
                index > 0 && "aspect-[4/3] sm:aspect-auto sm:min-h-[8rem]"
              )}
            >
              <Image
                src={moment.image}
                alt=""
                fill
                sizes={index === 0 ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
                className="object-cover transition-transform duration-500 hover:scale-105"
                unoptimized
              />
              <figcaption className="landing-community-moment__caption">{moment.caption}</figcaption>
            </figure>
          ))}
        </div>

        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center">
          <p className="text-sm text-[#1c395c]/80">
            Join mixers, programs, and workspace sessions — then stay connected on the platform.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/register">
              <Button className="w-full bg-[#812926] hover:bg-[#6b2120] sm:w-auto">
                <Users className="mr-2 h-4 w-4" aria-hidden />
                Join the community
              </Button>
            </Link>
            <Link href="/events/public">
              <Button variant="outline" className="w-full border-[#1c395c]/20 bg-white sm:w-auto">
                Browse events
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
