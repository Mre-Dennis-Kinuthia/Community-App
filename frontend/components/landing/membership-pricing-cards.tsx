"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  MEMBERSHIP_PRICING_TIERS,
  VAT_DISCLAIMER,
  categoriesForMembership,
  formatWorkspacePrice,
  workspaceCategoryById,
  type MembershipPricingId,
  type MembershipPricingTier,
  type WorkspacePricingCategory,
} from "@/lib/workspace-pricing"

function defaultSelection(): Record<MembershipPricingId, string> {
  return Object.fromEntries(
    MEMBERSHIP_PRICING_TIERS.map((tier) => [tier.id, tier.defaultCategoryId])
  ) as Record<MembershipPricingId, string>
}

function categoryForTier(
  tier: MembershipPricingTier,
  selectedId: string
): WorkspacePricingCategory {
  const categories = categoriesForMembership(tier.id)
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

  return (
    <fieldset>
      <legend className="text-xs font-medium text-muted-foreground">Workspace category</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = option.id === category.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              aria-pressed={active}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                active
                  ? "border-[#812926] bg-[#812926] text-white"
                  : "border-[#edeff2] bg-white text-foreground hover:bg-[#f3f5f8]"
              )}
            >
              {option.shortName}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function MembershipPricingCard({
  tier,
  category,
  onSelect,
  detail,
}: {
  tier: MembershipPricingTier
  category: WorkspacePricingCategory
  onSelect: (categoryId: string) => void
  detail: boolean
}) {
  const includes = detail ? category.includes : category.includes.slice(0, 4)
  const price = formatWorkspacePrice(category)

  return (
    <article
      id={tier.id}
      className={cn(
        "landing-panel flex flex-col",
        tier.popular && "border-primary/30"
      )}
    >
      <div className="border-b border-border px-5 py-6 text-center">
        {tier.popular ? (
          <p className="section-label mb-3 text-primary">Recommended</p>
        ) : null}
        <h3 className={cn("text-sm font-semibold text-foreground", !tier.popular && "mt-6")}>
          {tier.name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tier.intro}</p>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-5 py-6">
        <MembershipCategoryPicker
          tier={tier}
          category={category}
          onSelect={onSelect}
        />

        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {category.name}
          </p>
          <div className="mt-2 flex items-baseline justify-center gap-1">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {price}
            </span>
            <span className="text-xs text-muted-foreground">{category.pricePeriod}</span>
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            {category.coworkingDays}
          </p>
          {category.validity ? (
            <p className="mt-1 text-xs text-muted-foreground">{category.validity}</p>
          ) : null}
        </div>

        {detail ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Best for: </span>
            {category.bestFor}
          </p>
        ) : null}

        <ul className="space-y-2.5 text-sm leading-relaxed">
          {includes.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <CheckCircle2
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {category.note ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{category.note}</p>
        ) : null}

        <div className="mt-auto space-y-2">
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            {tier.helper}
          </p>
          <Link href={category.href} className="block">
            <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
              {category.cta}
              {tier.popular ? <ArrowRight className="ml-2 h-4 w-4" aria-hidden /> : null}
            </Button>
          </Link>
          {tier.id === "community" ? (
            <p className="text-center text-xs text-muted-foreground">
              Platform membership is free.{" "}
              <Link href="/register" className="font-medium text-foreground underline-offset-2 hover:underline">
                Create an account
              </Link>
            </p>
          ) : null}
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
      <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-3">
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
        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
          {VAT_DISCLAIMER}
        </p>
      ) : null}
    </div>
  )
}
