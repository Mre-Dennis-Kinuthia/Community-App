"use client"

import Link from "next/link"
import { useCallback, useId, useMemo, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { MembershipBenefits } from "@/lib/hooks/use-membership"
import { getMembershipCardCopy } from "@/lib/membership-card-copy"
import type { MembershipTier } from "@/lib/membership-tier"
import { BRAND_LOGO_SVG_PATH, BRAND_LOGO_PATH } from "@/lib/brand-meta"
import styles from "./membership-id-card.module.css"

type TierPalette = {
  /** Card face gradient stops */
  bgFrom: string
  bgVia: string
  bgTo: string
  /** Primary accent (pills, rings) */
  accent: string
  /** Secondary accent (thin lines, dots) */
  accentAlt: string
  /** Woven stripe colors */
  stripeA: string
  stripeB: string
  /** Tier label pill */
  pillBg: string
  pillText: string
}

const TIER_PALETTE: Record<MembershipTier, TierPalette> = {
  community: {
    bgFrom: "#0a1f38",
    bgVia: "#1c395c",
    bgTo: "#153049",
    accent: "#41bed0",
    accentAlt: "#7ebb55",
    stripeA: "rgba(65, 190, 208, 0.35)",
    stripeB: "rgba(126, 187, 85, 0.22)",
    pillBg: "rgba(65, 190, 208, 0.16)",
    pillText: "#8fe3ef",
  },
  star_connect: {
    bgFrom: "#3d1010",
    bgVia: "#822929",
    bgTo: "#5c1a1a",
    accent: "#ffd546",
    accentAlt: "#f78a3c",
    stripeA: "rgba(255, 213, 70, 0.30)",
    stripeB: "rgba(247, 138, 60, 0.22)",
    pillBg: "rgba(255, 213, 70, 0.16)",
    pillText: "#ffe58a",
  },
  organisational: {
    bgFrom: "#041526",
    bgVia: "#0f3a52",
    bgTo: "#0a2c40",
    accent: "#41bed0",
    accentAlt: "#ffd546",
    stripeA: "rgba(65, 190, 208, 0.32)",
    stripeB: "rgba(255, 213, 70, 0.16)",
    pillBg: "rgba(65, 190, 208, 0.16)",
    pillText: "#8fe3ef",
  },
}

const TIER_CODE: Record<MembershipTier, string> = {
  community: "CMT",
  star_connect: "STC",
  organisational: "ORG",
}

/** Deterministic pseudo-barcode from a seed string. */
function useBarcodeBars(seed: string, count = 36): number[] {
  return useMemo(() => {
    let h = 2166136261
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    const bars: number[] = []
    for (let i = 0; i < count; i++) {
      h = (Math.imul(h, 1103515245) + 12345) >>> 0
      bars.push(1 + ((h >> 16) % 3))
    }
    return bars
  }, [seed, count])
}

function Barcode({
  seed,
  className,
  tone = "light",
}: {
  seed: string
  className?: string
  tone?: "light" | "dark"
}) {
  const bars = useBarcodeBars(seed)
  const color = tone === "light" ? "rgba(255,255,255,0.85)" : "rgba(10,31,56,0.9)"
  return (
    <div className={cn("flex h-7 items-stretch gap-[2px]", className)} aria-hidden>
      {bars.map((w, i) => (
        <span
          key={i}
          style={{ width: `${w}px`, background: color }}
          className="rounded-[0.5px]"
        />
      ))}
    </div>
  )
}

/** Smart-card style chip. */
function CardChip() {
  return (
    <div
      aria-hidden
      className="relative h-8 w-11 overflow-hidden rounded-md shadow-inner"
      style={{
        background:
          "linear-gradient(135deg, #f6d77c 0%, #e3b04b 35%, #f9e6a8 60%, #d9a53f 100%)",
      }}
    >
      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/25" />
      <span className="absolute inset-y-0 left-1/3 w-px bg-black/25" />
      <span className="absolute inset-y-0 right-1/3 w-px bg-black/25" />
      <span className="absolute left-1/3 right-1/3 top-1.5 bottom-1.5 rounded-sm border border-black/25" />
    </div>
  )
}

function BrandLogo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BRAND_LOGO_SVG_PATH}
      alt="Impact Hub Nairobi"
      className={cn("block h-8 w-auto brightness-0 invert", className)}
      decoding="async"
      onError={(event) => {
        const img = event.currentTarget
        if (img.dataset.fallbackApplied === "true") return
        img.dataset.fallbackApplied = "true"
        img.src = BRAND_LOGO_PATH
      }}
    />
  )
}

/** Woven diagonal stripe pattern, inspired by prism ID-card ribbons. */
function WeaveDecor({ palette }: { palette: TierPalette }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -inset-x-10 top-[-12%] h-[55%] rotate-[-14deg]"
        style={{
          background: `repeating-linear-gradient(90deg, ${palette.stripeA} 0 22px, transparent 22px 54px)`,
          maskImage: "linear-gradient(180deg, black 0%, transparent 92%)",
          WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 92%)",
        }}
      />
      <div
        className="absolute -inset-x-10 bottom-[-14%] h-[48%] rotate-[12deg]"
        style={{
          background: `repeating-linear-gradient(90deg, ${palette.stripeB} 0 30px, transparent 30px 74px)`,
          maskImage: "linear-gradient(0deg, black 0%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(0deg, black 0%, transparent 90%)",
        }}
      />
      {/* soft radial glow behind the photo */}
      <div
        className="absolute left-1/2 top-[40%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45 blur-2xl"
        style={{
          background: `radial-gradient(circle, ${palette.accent} 0%, transparent 65%)`,
        }}
      />
    </div>
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
  const cardRef = useRef<HTMLDivElement>(null)
  const palette = TIER_PALETTE[copy.tier]
  const subtitle = [role, organization].filter(Boolean).join(" · ") || null
  const seed = email || name || "impact-hub"
  const memberCode = `IHN-${TIER_CODE[copy.tier]}-${(seed.length * 7919)
    .toString(36)
    .toUpperCase()
    .padStart(4, "0")
    .slice(-4)}`

  const setFlipped = (next: boolean) => {
    onFlippedChange?.(next)
    if (controlledFlipped === undefined) setUncontrolledFlipped(next)
  }

  const toggle = () => setFlipped(!flipped)

  /* Pointer-follow tilt (composed with the flip via CSS vars). */
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el || e.pointerType === "touch") return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty("--tilt-y", `${px * 10}deg`)
    el.style.setProperty("--tilt-x", `${-py * 10}deg`)
    el.style.setProperty("--glare-x", `${(px + 0.5) * 100}%`)
    el.style.setProperty("--glare-y", `${(py + 0.5) * 100}%`)
  }, [])

  const handlePointerLeave = useCallback(() => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty("--tilt-y", "0deg")
    el.style.setProperty("--tilt-x", "0deg")
  }, [])

  const faceStyle = {
    background: `linear-gradient(160deg, ${palette.bgFrom} 0%, ${palette.bgVia} 52%, ${palette.bgTo} 100%)`,
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn(styles.scene, styles.enter)}>
        <div
          ref={cardRef}
          className={cn(styles.card, flipped && styles.cardFlipped)}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              toggle()
            }
          }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-labelledby={titleId}
          aria-describedby={`${titleId}-hint`}
        >
          {/* ---------- FRONT ---------- */}
          <div className={cn(styles.face, styles.front)} style={faceStyle}>
            <WeaveDecor palette={palette} />
            <span className={styles.holo} aria-hidden />
            <span className={styles.glare} aria-hidden />
            <span className={styles.noise} aria-hidden />

            <div className="relative z-10 flex h-full flex-col p-6">
              {/* Header: logo + chip */}
              <div className="flex items-start justify-between gap-3">
                <BrandLogo />
                <CardChip />
              </div>

              {/* Identity */}
              <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
                <div
                  className="rounded-full p-[3px]"
                  style={{
                    background: `conic-gradient(from 210deg, ${palette.accent}, ${palette.accentAlt}, ${palette.accent})`,
                  }}
                >
                  <Avatar className="h-24 w-24 border-2 border-black/30">
                    <AvatarImage src={avatarUrl || undefined} alt={name} />
                    <AvatarFallback
                      className="text-xl font-semibold text-white"
                      style={{ background: palette.bgVia }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <h2
                  id={titleId}
                  className="mt-4 max-w-[15rem] text-xl font-bold leading-snug tracking-tight text-white"
                >
                  {name}
                </h2>
                {subtitle ? (
                  <p className="mt-1 max-w-[15rem] text-xs text-white/70">{subtitle}</p>
                ) : null}

                <span
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{
                    background: palette.pillBg,
                    borderColor: `${palette.accent}55`,
                    color: palette.pillText,
                  }}
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: palette.accent }}
                  />
                  {copy.label}
                </span>
              </div>

              {/* Footer: code + barcode */}
              <div className="mt-auto space-y-2.5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/45">
                      Member
                    </p>
                    <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-white/90">
                      {memberCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/45">
                      Since
                    </p>
                    <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-white/90">
                      {memberSince || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-white/12 pt-2.5">
                  <Barcode seed={seed} />
                  <span
                    id={`${titleId}-hint`}
                    className="shrink-0 text-[10px] font-medium text-white/50"
                  >
                    Tap to flip
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- BACK ---------- */}
          <div className={cn(styles.face, styles.back)} style={faceStyle}>
            <WeaveDecor palette={palette} />
            <span className={styles.holo} aria-hidden />
            <span className={styles.noise} aria-hidden />

            <div className="relative z-10 flex h-full flex-col">
              {/* Mag stripe */}
              <div className="mt-6 h-10 w-full bg-black/70" aria-hidden />

              <div className="flex flex-1 flex-col p-6 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: palette.pillText }}
                  >
                    Member benefits
                  </p>
                  <BrandLogo className="h-5 opacity-80" />
                </div>
                <h3 className="mt-1.5 text-base font-bold text-white">{copy.label}</h3>

                <ul className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
                  {copy.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex gap-2.5 text-xs leading-relaxed text-white/85"
                    >
                      <svg
                        viewBox="0 0 12 12"
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        aria-hidden
                      >
                        <circle cx="6" cy="6" r="6" fill={palette.accent} opacity="0.25" />
                        <path
                          d="M3.4 6.2 5.2 8l3.4-3.8"
                          stroke={palette.pillText}
                          strokeWidth="1.4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 text-[9.5px] leading-relaxed text-white/45">
                  {copy.terms}
                </p>

                <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/12 pt-3">
                  <Barcode seed={seed} />
                  <p className="font-mono text-[10px] tracking-[0.14em] text-white/60">
                    {memberCode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {copy.showBookingCta && flipped ? (
        <Link
          href="/booking"
          className="inline-flex w-full max-w-[20.5rem] items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-[#0a1f38] shadow-lg transition-transform hover:scale-[1.02]"
          style={{
            background: `linear-gradient(120deg, ${palette.accent}, ${palette.accentAlt})`,
          }}
        >
          Book a space
        </Link>
      ) : null}
    </div>
  )
}
