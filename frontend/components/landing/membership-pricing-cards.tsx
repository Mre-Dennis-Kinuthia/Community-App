"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  MEMBERSHIP_PRICING_TIERS,
  VAT_DISCLAIMER,
  WORKSPACE_OPTION_GROUPS,
  categoriesForMembership,
  formatWorkspacePrice,
  workspaceCategoryById,
  type MembershipPricingId,
  type MembershipPricingTier,
  type WorkspacePricingCategory,
} from "@/lib/workspace-pricing"

const LANDING_INCLUDE_COUNT = 3

function defaultSelection(): Partial<Record<MembershipPricingId, string>> {
  return Object.fromEntries(
    MEMBERSHIP_PRICING_TIERS.filter((tier) => tier.defaultCategoryId).map((tier) => [
      tier.id,
      tier.defaultCategoryId as string,
    ])
  )
}

function categoryForTier(
  tier: MembershipPricingTier,
  selectedId: string | undefined
): WorkspacePricingCategory | null {
  const categories = categoriesForMembership(tier.id)
  if (categories.length === 0) return null
  return (
    categories.find((c) => c.id === selectedId) ??
    categories.find((c) => c.id === tier.defaultCategoryId) ??
    categories[0]
  )
}

function MembershipCategoryPicker({
  tier,
  category,
  onSelect,
}: {
  tier: MembershipPricingTier
  category: WorkspacePricingCategory
  onSelect: (categoryId: string) => void
}) {
  const options = categoriesForMembership(tier.id)
  const selectId = `${tier.id}-workspace-option`

  return (
    <div className="space-y-2">
      <label htmlFor={selectId} className="sr-only">
        Workspace option
      </label>
      <select
        id={selectId}
        value={category.id}
        onChange={(e) => onSelect(e.target.value)}
        className="h-11 w-full rounded-md border border-[#edeff2] bg-[#faf9f6] px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-[#812926]/40 focus-visible:ring-2 focus-visible:ring-[#812926]/15"
      >
        {WORKSPACE_OPTION_GROUPS.map((group) => {
          const grouped = options.filter((option) => option.optionGroup === group.id)
          if (grouped.length === 0) return null
          return (
            <optgroup key={group.id} label={group.label}>
              {grouped.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.shortName}
                </option>
              ))}
            </optgroup>
          )
        })}
      </select>
    </div>
  )
}

function MembershipPricingCard({
  tier,
  category,
  onSelect,
  detail,
}: {
  tier: MembershipPricingTier
  category: WorkspacePricingCategory | null
  onSelect: (categoryId: string) => void
  detail: boolean
}) {
  const includes = category
    ? detail
      ? category.includes
      : category.includes.slice(0, LANDING_INCLUDE_COUNT)
    : (tier.includes ?? []).slice(0, LANDING_INCLUDE_COUNT)
  const price = category
    ? formatWorkspacePrice(category)
    : (tier.staticPrice ?? "Free")
  const period = category?.pricePeriod ?? ""
  const coworkingLine = category
    ? [category.coworkingDays, category.validity].filter(Boolean).join(" · ")
    : ""
  const href = category?.href ?? tier.href
  const cta = category?.cta ?? tier.cta

  return (
    <article
      id={tier.id}
      className={cn(
        "landing-panel flex h-full flex-col px-6 py-8 md:px-7 md:py-9",
        tier.popular && "border-[#812926]/25 shadow-sm"
      )}
    >
      <header className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#812926]/80">
          {tier.audience}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{tier.name}</h3>
          {tier.popular ? (
            <span className="rounded-full bg-[#812926]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#812926]">
              Popular
            </span>
          ) : null}
        </div>
      </header>

      <div className="mt-8 flex flex-1 flex-col">
        {category ? (
          <MembershipCategoryPicker
            tier={tier}
            category={category}
            onSelect={onSelect}
          />
        ) : (
          <p className="flex min-h-11 items-center justify-center text-center text-sm leading-relaxed text-muted-foreground">
            {tier.intro}
          </p>
        )}

        <div className="mt-8 text-center">
          <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
            {price}
          </p>
          {period ? (
            <p className="mt-1.5 text-sm text-muted-foreground">{period}</p>
          ) : null}
          {coworkingLine ? (
            <p className="mt-2 text-sm text-muted-foreground">{coworkingLine}</p>
          ) : null}
        </div>

        {detail && category ? (
          <p className="mt-6 text-center text-sm leading-relaxed text-muted-foreground">
            {category.bestFor}
          </p>
        ) : null}

        <ul className="mt-8 space-y-3 text-sm leading-relaxed text-muted-foreground">
          {includes.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-[#812926]/70"
                aria-hidden
              />
              <span className="text-foreground/80">{feature}</span>
            </li>
          ))}
        </ul>

        {detail && category?.note ? (
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">{category.note}</p>
        ) : null}

        <div className="mt-auto pt-8">
          <Link href={href} className="block">
            <Button
              className="h-11 w-full"
              variant={tier.popular ? "default" : "outline"}
            >
              {cta}
              {tier.popular ? <ArrowRight className="ml-2 h-4 w-4" aria-hidden /> : null}
            </Button>
          </Link>
          <p className="mt-3 text-center text-xs text-muted-foreground">{tier.helper}</p>
        </div>
      </div>
    </article>
  )
}

export function MembershipPricingCards({
  detail = false,
  showVatNote = true,
  syncHash = false,
}: {
  detail?: boolean
  showVatNote?: boolean
  syncHash?: boolean
}) {
  const [selected, setSelected] = useState(defaultSelection)

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace(/^#/, "")
      if (!hash) return
      const fromHash = workspaceCategoryById(hash)
      if (!fromHash) return
      setSelected((prev) => ({ ...prev, [fromHash.membershipId]: fromHash.id }))
    }

    applyHash()
    window.addEventListener("hashchange", applyHash)
    return () => window.removeEventListener("hashchange", applyHash)
  }, [])

  const cards = useMemo(
    () =>
      MEMBERSHIP_PRICING_TIERS.map((tier) => ({
        tier,
        category: categoryForTier(tier, selected[tier.id]),
      })),
    [selected]
  )

  return (
    <div>
      <div className="mx-auto grid max-w-6xl items-stretch gap-6 lg:grid-cols-3 lg:gap-8">
        {cards.map(({ tier, category }) => (
          <MembershipPricingCard
            key={tier.id}
            tier={tier}
            category={category}
            detail={detail}
            onSelect={(categoryId) => {
              setSelected((prev) => ({ ...prev, [tier.id]: categoryId }))
              if (syncHash) {
                window.history.replaceState(null, "", `#${categoryId}`)
              }
            }}
          />
        ))}
      </div>
      {showVatNote ? (
        <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-muted-foreground">
          {VAT_DISCLAIMER}{" "}
          <Link href="/pricing" className="text-foreground underline-offset-2 hover:underline">
            Full details
          </Link>
        </p>
      ) : null}
    </div>
  )
}
