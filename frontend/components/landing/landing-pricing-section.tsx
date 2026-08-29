import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  VAT_DISCLAIMER,
  WORKSPACE_PRICING_CATEGORIES,
  WORKSPACE_PRICING_GROUPS,
} from "@/lib/workspace-pricing"

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

export function LandingPricingSection() {
  return (
    <section id="pricing" className="landing-section">
      <div className="container px-4">
        <SectionHeader
          label="Workspace pricing"
          title="Coworking and space rates"
          description="Connect, Star Connect and Organisation / Company stay the three memberships. These are the published workspace categories. Day Passes can be booked on the platform; packs, desks and rooms are confirmed with the team."
          className="mb-12 md:mb-14"
        />

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          {WORKSPACE_PRICING_GROUPS.map((group) => {
            const items = WORKSPACE_PRICING_CATEGORIES.filter((c) => c.group === group.id)
            return (
              <div key={group.id} className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {group.description}
                  </p>
                </div>
                <ul className="landing-panel divide-y divide-border">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/pricing#${item.id}`}
                        className="flex items-start justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-foreground">
                            {item.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {item.priceLabel}
                          </span>
                        </span>
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
          {VAT_DISCLAIMER}{" "}
          <Link href="/pricing" className="font-medium text-foreground underline-offset-2 hover:underline">
            Full category details
          </Link>
        </p>
      </div>
    </section>
  )
}
