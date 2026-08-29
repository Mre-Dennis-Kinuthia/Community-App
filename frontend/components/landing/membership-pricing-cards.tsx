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

const LANDING_INCLUDE_COUNT = 5

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

function MembershipCategoryToggle({
  tier,
  category,
  onSelect,
}: {
  tier: MembershipPricingTier
  category: WorkspacePricingCategory
  onSelect: (categoryId: string) => void
}) {
  const options = categoriesForMembership(tier.id)
  const groupOptions = options.filter((option) => option.optionGroup === category.optionGroup)

  return (
    <div className="space-y-3">
      <div
        className="grid grid-cols-3 rounded-md border border-[#edeff2] bg-[#f3f5f8] p-1"
        role="tablist"
        aria-label="Workspace type"
      >
        {WORKSPACE_OPTION_GROUPS.map((group) => {
          const active = category.optionGroup === group.id
          const firstInGroup = options.find((option) => option.optionGroup === group.id)
          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (firstInGroup && !active) onSelect(firstInGroup.id)
              }}
              className={cn(
                "rounded-sm px-2 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {group.toggleLabel}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Workspace option">
        {groupOptions.map((option) => {
          const active = option.id === category.id
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(option.id)}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-[#812926] bg-[#812926] text-white"
                  : "border-[#edeff2] bg-white text-foreground hover:border-[#812926]/30 hover:bg-[#faf9f6]"
              )}
            >
              {option.chipLabel}
            </button>
          )
        })}
      </div>
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
    : (tier.includes ?? [])
  const price = category
    ? formatWorkspacePrice(category)
    : (tier.staticPrice ?? "Free")
  const period = category?.pricePeriod ?? ""
  const href = category?.href ?? tier.href
  const cta = category?.cta ?? tier.cta

  return (
    <article
      id={tier.id}
      className={cn(
        "landing-panel flex h-full flex-col overflow-hidden",
        tier.popular && "border-[#812926]/30"
      )}
    >
      <header className="border-b border-[#edeff2] px-5 py-5 text-center md:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">
          {tier.audience}
        </p>
        <h3 className="mt-2 text-base font-semibold text-foreground">{tier.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tier.intro}</p>
      </header>

      <div className="flex flex-1 flex-col px-5 py-5 md:px-6 md:py-6">
        {category ? (
          <MembershipCategoryToggle
            tier={tier}
            category={category}
            onSelect={onSelect}
          />
        ) : null}

        <div className="mt-5 rounded-md bg-[#f3f5f8] px-4 py-4">
          <p className="text-xs font-medium text-muted-foreground">
            {category?.shortName ?? "Membership"}
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">{price}</span>
            {period ? (
              <span className="text-xs text-muted-foreground">{period}</span>
            ) : null}
          </div>
          {category ? (
            <p className="mt-2 text-sm text-foreground">
              {category.coworkingDays}
              {category.validity ? (
                <span className="text-muted-foreground"> · {category.validity}</span>
              ) : null}
            </p>
          ) : null}
        </div>

        {category ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {category.bestFor}
          </p>
        ) : null}

        <ul className="mt-4 space-y-2.5 text-sm leading-relaxed">
          {includes.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <CheckCircle2
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#812926]"
                aria-hidden
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {detail && category?.note ? (
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{category.note}</p>
        ) : null}

        <div className="mt-auto pt-6">
          <p className="mb-3 text-center text-xs leading-relaxed text-muted-foreground">
            {tier.helper}
          </p>
          <Link href={href} className="block">
            <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
              {cta}
              {tier.popular ? <ArrowRight className="ml-2 h-4 w-4" aria-hidden /> : null}
            </Button>
          </Link>
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
      <div className="mx-auto grid max-w-6xl items-stretch gap-5 lg:grid-cols-3">
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
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
          {VAT_DISCLAIMER}{" "}
          <Link href="/pricing" className="font-medium text-foreground underline-offset-2 hover:underline">
            Full details
          </Link>
        </p>
      ) : null}
    </div>
  )
}
