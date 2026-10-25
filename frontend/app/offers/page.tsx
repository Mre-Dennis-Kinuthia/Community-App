import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { MarketingPublicLayout } from "@/components/marketing/marketing-public-layout"
import { Button } from "@/components/ui/button"
import { LANDING_PROGRAMS, type LandingProgram } from "@/lib/landing-programs"
import { MEMBERSHIP_PRICING_TIERS } from "@/lib/workspace-pricing"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Offers | Impact Hub Nairobi",
  description:
    "Explore Impact Hub Nairobi membership, workspace, partnerships, and programmes for people building a more inclusive and sustainable future.",
}

function statusTone(status: LandingProgram["status"]) {
  switch (status) {
    case "active":
      return "bg-[#7ebb55]/15 text-[#3d6b28]"
    case "upcoming":
      return "bg-[#41bed0]/15 text-[#1c395c]"
    case "ongoing":
      return "bg-[#822929]/10 text-[#822929]"
    default:
      return "bg-[#edeff2] text-[#1c395c]"
  }
}

function ProgramOfferCard({ program }: { program: LandingProgram }) {
  const href = program.detailHref ?? program.cta?.href ?? "/programs"
  const label = program.detailHref ? "Explore programme" : program.cta?.label ?? "Learn more"

  return (
    <article className="overflow-hidden rounded-md border border-[#edeff2] bg-white shadow-sm">
      <div className="relative aspect-[16/9] overflow-hidden bg-[#1c395c]/10">
        <Image
          src={program.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          unoptimized
        />
        <span
          className={cn(
            "absolute left-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
            statusTone(program.status)
          )}
        >
          {program.statusLabel}
        </span>
      </div>

      <div className="flex h-full flex-col p-5 md:p-6">
        <div className="flex flex-wrap gap-2">
          {program.themes.slice(0, 3).map((theme) => (
            <span
              key={theme}
              className="rounded-full bg-[#f3f5f8] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#1c395c]/75"
            >
              {theme}
            </span>
          ))}
        </div>
        <h3 className="mt-3 text-lg font-semibold leading-snug text-[#0a1f38]">
          {program.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#1c395c]/80">{program.tagline}</p>
        {program.duration ? (
          <p className="mt-3 text-xs font-medium text-[#812926]">{program.duration}</p>
        ) : null}
        <ul className="mt-4 space-y-2">
          {program.highlights.slice(0, 2).map((highlight) => (
            <li key={highlight} className="flex items-start gap-2 text-sm text-[#1c395c]/80">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7ebb55]" aria-hidden />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-5">
          <Button
            asChild
            className="bg-[#812926] hover:bg-[#6b2120]"
          >
            {program.cta?.external && !program.detailHref ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            ) : (
              <Link href={href}>
                {label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function OffersPage() {
  return (
    <MarketingPublicLayout>
      <div className="bg-[#faf9f6]">
        <section className="border-b border-[#edeff2] bg-[#f3f5f8]/60">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-20">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">
              Impact Hub Nairobi
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-[#0a1f38] md:text-5xl">
              Find the support that moves your work forward
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#1c395c]/80 md:text-base">
              Explore community membership, workspace, partnerships, and programmes for people
              building ventures and ideas with positive impact.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="bg-[#812926] hover:bg-[#6b2120]">
                <Link href="/register">
                  Join the community
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#1c395c]/20 bg-white">
                <Link href="/programs">Explore programmes</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">
              Ways to connect
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#0a1f38] md:text-3xl">
              Start where you are
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#1c395c]/75">
              Whether you are building a venture, looking for a place to work, or seeking a
              programme partner, there is a way to get involved.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {MEMBERSHIP_PRICING_TIERS.map((tier) => (
              <article
                key={tier.id}
                className="flex flex-col rounded-md border border-[#edeff2] bg-white p-5 shadow-sm"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">
                  {tier.audience}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[#0a1f38]">{tier.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1c395c]/80">
                  {tier.intro}
                </p>
                <p className="mt-4 text-sm font-semibold text-[#812926]">
                  {tier.staticPrice ?? (tier.id === "star_connect" ? "Workspace rates available" : "")}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-4 justify-between border-[#812926]/25 text-[#812926] hover:bg-[#812926]/5"
                >
                  <Link href={tier.id === "star_connect" ? "/pricing" : tier.href}>
                    {tier.id === "star_connect" ? "View workspace rates" : tier.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#edeff2] bg-[#f3f5f8]">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">
                  Programmes & initiatives
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#0a1f38] md:text-3xl">
                  Explore what is happening now
                </h2>
              </div>
              <Link
                href="/programs"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#812926] hover:underline"
              >
                View all programmes
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {LANDING_PROGRAMS.map((program) => (
                <ProgramOfferCard key={program.id} program={program} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 md:py-16">
          <h2 className="text-2xl font-semibold text-[#0a1f38]">Ready to take the next step?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#1c395c]/75">
            Create a free Connect account to join the community, or explore the right programme
            and workspace option for you.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-[#812926] hover:bg-[#6b2120]">
              <Link href="/register">Create a free account</Link>
            </Button>
            <Button asChild variant="outline" className="border-[#1c395c]/20 bg-white">
              <Link href="/pricing">Compare memberships and workspace</Link>
            </Button>
          </div>
        </section>
      </div>
    </MarketingPublicLayout>
  )
}
