"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Mail,
  Sprout,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarketingPublicLayout } from "@/components/marketing/marketing-public-layout"
import {
  LANDING_PROGRAMS,
  LANDING_THEMATIC_AREAS,
  getLandingProgramBySlug,
  type LandingProgram,
} from "@/lib/landing-programs"
import { cn } from "@/lib/utils"

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

function ProgramCard({ program, featured = false }: { program: LandingProgram; featured?: boolean }) {
  return (
    <article
      id={program.slug}
      className={cn(
        "overflow-hidden rounded-md border border-[#edeff2] bg-white",
        featured && "md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[#1c395c]/10",
          featured ? "min-h-[14rem] md:min-h-full" : "aspect-[16/9]"
        )}
      >
        <Image
          src={program.image}
          alt=""
          fill
          sizes={featured ? "(max-width: 768px) 100vw, 45vw" : "(max-width: 768px) 100vw, 33vw"}
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

      <div className={cn("flex flex-col", featured ? "p-6 md:p-8" : "p-5")}>
        <div className="flex flex-wrap gap-2">
          {program.themes.map((theme) => (
            <span
              key={theme}
              className="rounded-full bg-[#f3f5f8] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#1c395c]/75"
            >
              {theme}
            </span>
          ))}
        </div>

        <h2
          className={cn(
            "mt-3 font-semibold text-[#0a1f38]",
            featured ? "text-xl md:text-2xl" : "text-lg"
          )}
        >
          {program.name}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#1c395c]/80">{program.tagline}</p>
        <p className="mt-3 text-sm leading-relaxed text-[#1c395c]/75">{program.description}</p>

        {program.duration ? (
          <p className="mt-4 text-xs font-medium text-[#812926]">{program.duration}</p>
        ) : null}

        <ul className="mt-5 space-y-2">
          {program.highlights.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[#1c395c]/85">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7ebb55]" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {program.detailHref ? (
            <Link
              href={program.detailHref}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#812926] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6b2120]"
            >
              View programme
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : null}
          {program.cta ? (
            program.cta.external ? (
              <a
                href={program.cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                  program.detailHref
                    ? "border border-[#812926]/30 text-[#812926] hover:bg-[#812926]/5"
                    : "bg-[#812926] text-white hover:bg-[#6b2120]"
                )}
              >
                {program.cta.label}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            ) : (
              <Link
                href={program.cta.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                  program.detailHref
                    ? "border border-[#812926]/30 text-[#812926] hover:bg-[#812926]/5"
                    : "bg-[#812926] text-white hover:bg-[#6b2120]"
                )}
              >
                {program.cta.label}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            )
          ) : null}

          {program.contactEmail ? (
            <a
              href={`mailto:${program.contactEmail}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#812926] hover:underline"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {program.contactEmail}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default function ProgramsPageClient() {
  const aac = getLandingProgramBySlug("aac")
  const featured = LANDING_PROGRAMS.filter((p) => p.featured && p.slug !== "aac")
  const other = LANDING_PROGRAMS.filter((p) => !p.featured)

  return (
    <MarketingPublicLayout>
      <div className="bg-[#faf9f6]">
        <section className="border-b border-[#edeff2] bg-[#f3f5f8]/60">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">
              Impact Hub Nairobi
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-[#0a1f38] md:text-4xl">
              Programs & initiatives
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#1c395c]/80 md:text-base">
              Structured programmes, accelerators, and ecosystem initiatives that help ventures
              scale — and help partners co-create inclusive, sustainable innovation across Kenya
              and East Africa.
            </p>
          </div>
        </section>

        {aac ? (
          <section className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 md:pt-14">
            <Link
              href="/programs/aac"
              className="group relative block overflow-hidden rounded-lg border border-[#edeff2] bg-[#0a1f38] shadow-md"
            >
              <div className="absolute inset-0">
                <Image
                  src={aac.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 80vw"
                  className="object-cover opacity-40 transition-transform duration-700 group-hover:scale-[1.02]"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f38]/95 via-[#1c395c]/85 to-[#1c395c]/60" />
              </div>
              <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-10">
                <div className="max-w-xl text-white">
                  <span className="rounded-full border border-[#7ebb55]/40 bg-[#7ebb55]/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7ebb55]">
                    Featured · Year One complete
                  </span>
                  <h2 className="mt-4 text-2xl font-semibold md:text-3xl">{aac.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">{aac.tagline}</p>
                  <p className="mt-3 text-xs text-white/60">
                    150 farmers trained · 38 Working Group members · 2 pilots implemented
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[#7ebb55] px-5 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-[#6aaa48]">
                  Explore Year One report
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Link>
          </section>
        ) : null}

        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
          <div className="mb-8 flex items-center gap-2">
            <Sprout className="h-5 w-5 text-[#812926]" aria-hidden />
            <h2 className="text-lg font-semibold text-[#0a1f38]">Featured programmes</h2>
          </div>

          <div className="space-y-6">
            {featured.map((program) => (
              <ProgramCard key={program.id} program={program} featured />
            ))}
          </div>
        </section>

        <section className="border-y border-[#edeff2] bg-[#f3f5f8]/50">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
            <h2 className="text-lg font-semibold text-[#0a1f38]">Thematic focus areas</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#1c395c]/80">
              Our programmes run across six thematic areas — each designed to connect founders,
              partners, and funders around shared impact goals.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {LANDING_THEMATIC_AREAS.map((area) => (
                <span
                  key={area.label}
                  className="inline-flex items-center gap-2 rounded-full border border-[#edeff2] bg-white px-3 py-1.5 text-sm font-medium text-[#0a1f38]"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: area.accent }}
                    aria-hidden
                  />
                  {area.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {other.length > 0 ? (
          <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
            <h2 className="text-lg font-semibold text-[#0a1f38]">More ways to engage</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#1c395c]/80">
              Member acceleration, workshops, and recurring ecosystem programming throughout the
              year.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {other.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-t border-[#edeff2] bg-[#1c395c] text-white">
          <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 md:py-14">
            <h2 className="text-xl font-semibold md:text-2xl">Partner with us on your next programme</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80">
              Institutions, funders, and ecosystem partners can co-design programmes, events, and
              bespoke engagement with Impact Hub Nairobi.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild className="bg-white text-[#1c395c] hover:bg-white/90">
                <Link href="/membership/organisational">
                  Start partnership inquiry
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/events/public">View public events</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </MarketingPublicLayout>
  )
}
