"use client"

import Link from "next/link"
import { useId, useState } from "react"
import { ImpactHubMark } from "@/components/brand/impact-hub-mark"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { MembershipBenefits } from "@/lib/hooks/use-membership"
import { getMembershipCardCopy } from "@/lib/membership-card-copy"
import type { MembershipTier } from "@/lib/membership-tier"
import styles from "./membership-id-card.module.css"

type TierPalette = {
  accent: string
  ribbonA: string
  ribbonB: string
  ribbonC: string
  chipBg: string
  chipText: string
}

const TIER_PALETTE: Record<MembershipTier, TierPalette> = {
  community: {
    accent: "#1c395c",
    ribbonA: "#1c395c",
    ribbonB: "#41bed0",
    ribbonC: "#7ebb55",
    chipBg: "#1c395c",
    chipText: "#faf9f6",
  },
  star_connect: {
    accent: "#822929",
    ribbonA: "#822929",
    ribbonB: "#f78a3c",
    ribbonC: "#ffd546",
    chipBg: "#822929",
    chipText: "#faf9f6",
  },
  organisational: {
    accent: "#0a1f38",
    ribbonA: "#41bed0",
    ribbonB: "#1c395c",
    ribbonC: "#822929",
    chipBg: "#0a1f38",
    chipText: "#faf9f6",
  },
}

function RibbonDecor({ palette }: { palette: TierPalette }) {
  return (
    <>
      <span
        aria-hidden
        className="absolute -right-8 -top-10 h-36 w-36 rotate-12 rounded-[2rem]"
        style={{ background: palette.ribbonA }}
      />
      <span
        aria-hidden
        className="absolute -right-2 top-16 h-24 w-40 -rotate-6 rounded-[1.5rem] opacity-90"
        style={{ background: palette.ribbonB }}
      />
      <span
        aria-hidden
        className="absolute -bottom-10 -left-10 h-40 w-40 rotate-[-18deg] rounded-[2rem] opacity-95"
        style={{ background: palette.ribbonC }}
      />
      <span
        aria-hidden
        className="absolute bottom-8 -right-6 h-20 w-28 rotate-12 rounded-2xl opacity-80"
        style={{ background: palette.ribbonA }}
      />
    </>
  )
}

export type MembershipIdCardProps = {
  name: string
  email?: string | null
  avatarUrl?: string | null
  initials: string
  role?: string | null
  organization?: string | null
  memberSince?: string | null
  membership?: MembershipBenefits | null
  flipped?: boolean
  onFlippedChange?: (flipped: boolean) => void
  className?: string
}

export function MembershipIdCard({
  name,
  email,
  avatarUrl,
  initials,
  role,
  organization,
  memberSince,
  membership,
  flipped: controlledFlipped,
  onFlippedChange,
  className,
}: MembershipIdCardProps) {
  const copy = getMembershipCardCopy(membership)
  const [uncontrolledFlipped, setUncontrolledFlipped] = useState(false)
  const flipped = controlledFlipped ?? uncontrolledFlipped
  const titleId = useId()

  if (!copy) return null

  const palette = TIER_PALETTE[copy.tier]
  const subtitle = [role, organization].filter(Boolean).join(" · ") || null

  const setFlipped = (next: boolean) => {
    onFlippedChange?.(next)
    if (controlledFlipped === undefined) setUncontrolledFlipped(next)
  }

  const toggle = () => setFlipped(!flipped)

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn(styles.scene, styles.enter)}>
        <div
          className={cn(styles.card, flipped && styles.cardFlipped)}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              toggle()
            }
          }}
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-labelledby={titleId}
          aria-describedby={`${titleId}-hint`}
        >
          {/* Front */}
          <div className={cn(styles.face, styles.front)} style={{ background: "#faf9f6" }}>
            <RibbonDecor palette={palette} />
            <span className={styles.shine} aria-hidden />

            <div className="relative z-10 flex h-full flex-col p-5">
              <div
                className="inline-flex w-fit items-center gap-2 rounded-md px-2.5 py-1.5"
                style={{ background: palette.accent }}
              >
                <ImpactHubMark size={22} className="brightness-0 invert" />
                <div className="leading-tight text-white">
                  <p className="text-[10px] font-semibold tracking-wide">Impact Hub</p>
                  <p className="text-[9px] opacity-80">Nairobi</p>
                </div>
              </div>

              <div className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
                <Avatar
                  className="h-24 w-24 border-[3px] shadow-md"
                  style={{ borderColor: palette.ribbonB }}
                >
                  <AvatarImage src={avatarUrl || undefined} alt={name} />
                  <AvatarFallback
                    className="text-xl font-semibold text-white"
                    style={{ background: palette.accent }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <h2
                  id={titleId}
                  className="mt-4 max-w-[14rem] text-lg font-bold leading-snug tracking-tight text-[#0a1f38]"
                >
                  {name}
                </h2>
                {subtitle ? (
                  <p className="mt-1 max-w-[14rem] text-xs text-[#1c395c]">{subtitle}</p>
                ) : null}
                <p className="mt-2 text-sm font-semibold" style={{ color: palette.accent }}>
                  {copy.label}
                </p>
                <span
                  aria-hidden
                  className="mt-2 h-0.5 w-16 rounded-full"
                  style={{ background: palette.ribbonB }}
                />
              </div>

              <div className="mt-auto flex items-end justify-between gap-3">
                <span
                  className="rounded-md px-2.5 py-1 text-[10px] font-semibold tracking-wide"
                  style={{ background: palette.chipBg, color: palette.chipText }}
                >
                  {memberSince ? `Since ${memberSince}` : email || "Member"}
                </span>
                <span
                  id={`${titleId}-hint`}
                  className="text-[10px] font-medium text-[#1c395c]/opacity-70"
                >
                  {flipped ? "Tap to flip back" : "Tap to flip"}
                </span>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className={cn(styles.face, styles.back)} style={{ background: "#faf9f6" }}>
            <RibbonDecor palette={palette} />
            <span className={styles.shine} aria-hidden />

            <div className="relative z-10 flex h-full flex-col p-5">
              <p
                className="text-xs font-bold uppercase tracking-[0.14em]"
                style={{ color: palette.accent }}
              >
                Your benefits
              </p>
              <h3 className="mt-1 text-base font-bold text-[#0a1f38]">{copy.label}</h3>

              <ul className="mt-4 flex-1 space-y-2.5 overflow-y-auto pr-1">
                {copy.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex gap-2 text-xs leading-relaxed text-[#1c395c]"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: palette.ribbonB }}
                      aria-hidden
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-[10px] leading-relaxed text-[#1c395c]/opacity-70">
                {copy.terms}
              </p>

              <p className="mt-auto pt-4 text-center text-[10px] font-medium text-[#1c395c]/opacity-70">
                Tap to flip back
              </p>
            </div>
          </div>
        </div>
      </div>

      {copy.showBookingCta && flipped ? (
        <Link
          href="/booking"
          className="inline-flex w-full max-w-[20.5rem] items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: palette.accent }}
        >
          Book a space
        </Link>
      ) : null}
    </div>
  )
}
