import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BadgePercent, CheckCircle2, Mail } from "lucide-react"
import { MarketingPublicLayout } from "@/components/marketing/marketing-public-layout"
import { Button } from "@/components/ui/button"
import { HUB_PUBLIC_EMAIL } from "@/lib/hub-contact"
import {
  formatKes,
  WORKSPACE_PRICING_CATEGORIES,
} from "@/lib/workspace-pricing"

const STAR_CONNECT_OPTIONS = WORKSPACE_PRICING_CATEGORIES.filter(
  (category) => category.membershipId === "star_connect"
)

export const metadata: Metadata = {
  title: "Star Connect offer | Impact Hub Nairobi",
  description:
    "Get 30% off your first Star Connect billing period or purchase with offer code Community30. Offer ends December 31, 2026.",
}

function discountedAmount(amount: number) {
  return Math.round(amount * 0.7)
}

export default function OffersPage() {
  const redemptionEmail = `mailto:${HUB_PUBLIC_EMAIL}?subject=${encodeURIComponent(
    "Star Connect offer: Community30"
  )}`

  return (
    <MarketingPublicLayout>
      <div className="bg-[#faf9f6]">
        <section className="border-b border-[#edeff2] bg-[#f3f5f8]/60">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#812926]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#812926]">
                <BadgePercent className="h-4 w-4" aria-hidden />
                Star Connect offer
              </span>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#0a1f38] md:text-6xl">
                Get 30% off Star Connect
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#1c395c]/80 md:text-base">
                Save on any Star Connect workspace option for your first billing period or
                purchase. Use the offer code below and the Hub team will apply the discount.
              </p>
              <div className="mx-auto mt-7 inline-flex flex-col items-center rounded-md border border-[#edeff2] bg-white px-7 py-4 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#1c395c]/65">
                  Your offer code
                </span>
                <span className="mt-1 text-2xl font-bold tracking-wider text-[#812926]">
                  Community30
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-[#1c395c]">
                Offer ends December 31, 2026
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button asChild className="bg-[#812926] hover:bg-[#6b2120]">
                  <a href={redemptionEmail}>
                    Redeem this offer
                    <Mail className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-[#1c395c]/20 bg-white">
                  <Link href="/pricing">
                    View Star Connect rates
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </div>
              <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-[#1c395c]/65">
                Email the Hub team with code Community30 before completing your application or
                payment. The team will confirm and apply your discount.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">
              Eligible options
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#0a1f38] md:text-3xl">
              Choose your Star Connect option
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#1c395c]/75">
              The discount applies to the first billing period or purchase of any Star Connect
              option. Promotional prices shown are estimates before VAT; the Hub team will confirm
              your final price when you redeem the code.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STAR_CONNECT_OPTIONS.map((option) => (
              <article
                key={option.id}
                className="flex flex-col rounded-md border border-[#edeff2] bg-white p-5 shadow-sm"
              >
                <h3 className="text-base font-semibold text-[#0a1f38]">{option.name}</h3>
                <p className="mt-1 text-xs text-[#1c395c]/65">{option.bestFor}</p>
                <div className="mt-5">
                  <p className="text-xs text-[#1c395c]/65">
                    <span className="sr-only">Regular price: </span>
                    <span className="line-through">
                      {option.priceFrom ? "From " : ""}
                      {formatKes(option.priceAmount)}
                    </span>
                    {" "}
                    {option.pricePeriod}
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#812926]">
                    {option.priceFrom ? "From " : ""}
                    {formatKes(discountedAmount(option.priceAmount))}
                    <span className="ml-1 text-xs font-normal text-[#1c395c]/65">
                      {option.pricePeriod}
                    </span>
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#3d6b28]">30% off with Community30</p>
                </div>
                {option.validity ? (
                  <p className="mt-3 text-xs text-[#1c395c]/65">{option.validity}</p>
                ) : null}
                {option.note ? (
                  <p className="mt-2 text-xs leading-relaxed text-[#1c395c]/65">{option.note}</p>
                ) : null}
                <div className="mt-auto pt-5">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-between border-[#812926]/25 text-[#812926] hover:bg-[#812926]/5"
                  >
                    <Link href={option.href}>
                      {option.cta}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-md border border-[#edeff2] bg-white p-4 text-sm leading-relaxed text-[#1c395c]/75">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7ebb55]" aria-hidden />
            <p>
              This offer is exclusively for Star Connect options, applies once to the first billing
              period or purchase, and expires December 31, 2026. Prices exclude 16% VAT and are
              subject to availability and the applicable membership agreement.
            </p>
          </div>
        </section>
      </div>
    </MarketingPublicLayout>
  )
}
