"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Leaf,
  Mail,
  Play,
  Sprout,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarketingPublicLayout } from "@/components/marketing/marketing-public-layout"
import {
  AAC_CONTACT_EMAIL,
  AAC_ENDLINE_STATS,
  AAC_HERO_STATS,
  AAC_IMAGES,
  AAC_IMPACT_PATHWAY,
  AAC_KEY_CHANGES,
  AAC_PILOTS,
  AAC_REPORTING_PERIOD,
  AAC_STORY_ANGLES,
  AAC_STORY_GALLERY,
  AAC_SYSTEM_CONSTRAINTS,
  AAC_TAGLINE,
  AAC_TIMELINE,
  AAC_VIDEOS,
} from "@/lib/aac-program"
import { cn } from "@/lib/utils"

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#edeff2] bg-white px-4 py-5 text-center">
      <p className="text-2xl font-semibold tabular-nums text-[#812926] md:text-3xl">{value}</p>
      <p className="mt-1 text-xs leading-snug text-[#1c395c]/75">{label}</p>
    </div>
  )
}

function SectionHeading({
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
    <div className={cn("max-w-3xl", className)}>
      {label ? (
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">
          {label}
        </p>
      ) : null}
      <h2 className={cn("font-semibold text-[#0a1f38]", label ? "mt-2 text-xl md:text-2xl" : "text-xl md:text-2xl")}>
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-[#1c395c]/80 md:text-base">{description}</p>
      ) : null}
    </div>
  )
}

export default function AacProgramClient() {
  return (
    <MarketingPublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1c395c] text-white">
        <div className="absolute inset-0">
          <Image
            src={AAC_IMAGES.hero}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f38]/95 via-[#1c395c]/85 to-[#1c395c]/70" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-20">
          <Link
            href="/programs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All programs
          </Link>

          <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.14em] text-[#7ebb55]">
            Impact Hub Nairobi · DOEN Foundation
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl">
            Advancing Agricultural Circularity
          </h1>
          <p className="mt-2 text-lg font-medium text-[#ffd546]">{AAC_TAGLINE}</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
            A multi-stakeholder programme shifting Kenya&apos;s agri-food system from linear models
            toward regenerative and circular systems — restoring soil, strengthening biodiversity,
            and connecting producers to viable markets.
          </p>
          <p className="mt-3 text-xs text-white/60">Year One · {AAC_REPORTING_PERIOD}</p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {AAC_HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-md border border-white/15 bg-white/10 px-3 py-4 text-center backdrop-blur-sm"
              >
                <p className="text-xl font-semibold tabular-nums md:text-2xl">{stat.value}</p>
                <p className="mt-1 text-[10px] leading-snug text-white/75">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive summary */}
      <section className="border-b border-[#edeff2] bg-[#faf9f6]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
          <SectionHeading
            label="Year One at a glance"
            title="From ecosystem diagnosis to implemented pilots"
            description="During Year One, AAC moved from structured stakeholder deliberation into two proof-of-concept interventions — generating early evidence of farmer learning, adoption readiness and consumer-market interest."
          />

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AAC_ENDLINE_STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <blockquote className="mt-10 border-l-4 border-[#7ebb55] pl-5">
            <p className="text-sm italic leading-relaxed text-[#1c395c]/85 md:text-base">
              &ldquo;The strongest Year One impact claim is that AAC created a coordinated process
              that converted ecosystem diagnosis into two implemented tests and generated early
              evidence of farmer learning, adoption readiness and consumer-market interest.&rdquo;
            </p>
            <footer className="mt-2 text-xs text-[#1c395c]/60">
              — AAC Year One Impact and Learning Report
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Impact pathway */}
      <section className="border-b border-[#edeff2] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
          <SectionHeading
            label="How change happens"
            title="The AAC impact pathway"
            description="Circular agriculture in Kenya is constrained not only by technical knowledge, but by weak evidence, under-equipped extension systems, fragmented markets, limited consumer trust, coordination gaps and unsuitable finance."
          />

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {AAC_IMPACT_PATHWAY.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-[#7ebb55]/30 bg-[#7ebb55]/10 px-3 py-1.5 text-xs font-medium text-[#3d6b28]">
                  {step}
                </span>
                {i < AAC_IMPACT_PATHWAY.length - 1 ? (
                  <ArrowRight className="hidden h-3.5 w-3.5 text-[#1c395c]/40 sm:block" aria-hidden />
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AAC_SYSTEM_CONSTRAINTS.map((constraint) => (
              <div
                key={constraint.title}
                className="rounded-md border border-[#edeff2] bg-[#faf9f6] p-4"
              >
                <h3 className="text-sm font-semibold text-[#0a1f38]">{constraint.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#1c395c]/75">
                  {constraint.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilots */}
      <section className="border-b border-[#edeff2] bg-[#f3f5f8]/50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
          <SectionHeading
            label="Two proof-of-concept pilots"
            title="Pilot A & Pilot B"
            description="Two interconnected pathways — capacity building through the extension system, and consumer demand testing through market activation."
          />

          <div className="mt-10 space-y-6">
            {AAC_PILOTS.map((pilot) => (
              <article
                key={pilot.id}
                className="overflow-hidden rounded-md border border-[#edeff2] bg-white md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
              >
                <div className="relative min-h-[12rem] bg-[#1c395c]/10 md:min-h-full">
                  <Image
                    src={pilot.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="object-cover"
                    unoptimized
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-[#812926] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {pilot.name}
                  </span>
                </div>
                <div className="p-6 md:p-8">
                  <h3 className="text-lg font-semibold text-[#0a1f38]">{pilot.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#1c395c]/80">
                    {pilot.description}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {pilot.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[#1c395c]/85">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7ebb55]" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-b border-[#edeff2] bg-[#faf9f6]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
          <SectionHeading
            label="Year One journey"
            title="From diagnosis to implementation"
          />

          <ol className="mt-10 space-y-0">
            {AAC_TIMELINE.map((item, i) => (
              <li key={item.date} className="relative flex gap-4 pb-8 last:pb-0">
                {i < AAC_TIMELINE.length - 1 ? (
                  <span
                    className="absolute left-[7px] top-4 h-full w-px bg-[#edeff2]"
                    aria-hidden
                  />
                ) : null}
                <span className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#812926] bg-white" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#812926]">
                    {item.date}
                  </p>
                  <h3 className="mt-0.5 text-sm font-semibold text-[#0a1f38]">{item.stage}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#1c395c]/75">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Key changes */}
      <section className="border-b border-[#edeff2] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
          <SectionHeading
            label="Most meaningful changes"
            title="What Year One achieved"
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {AAC_KEY_CHANGES.map((change) => (
              <article
                key={change.title}
                className="rounded-md border border-[#edeff2] bg-[#faf9f6] p-5 md:p-6"
              >
                <Leaf className="mb-3 h-5 w-5 text-[#7ebb55]" aria-hidden />
                <h3 className="text-base font-semibold text-[#0a1f38]">{change.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#1c395c]/80">{change.detail}</p>
                <p className="mt-3 text-xs font-medium text-[#812926]">{change.evidence}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Story gallery */}
      <section className="border-b border-[#edeff2] bg-[#f3f5f8]/50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
          <SectionHeading
            label="Stories from the field"
            title="Learn → Apply → Connect → Scale"
            description="Knowledge moved from the learning hub into extension practice; regenerative methods moved from concepts into demonstrations; and products moved into direct conversation with consumers."
          />

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {AAC_STORY_GALLERY.map((photo) => (
              <figure key={photo.src} className="group overflow-hidden rounded-md border border-[#edeff2] bg-white">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#1c395c]/10">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <figcaption className="p-3 text-[11px] leading-snug text-[#1c395c]/75">
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {AAC_STORY_ANGLES.map((angle) => (
              <span
                key={angle}
                className="rounded-full border border-[#edeff2] bg-white px-3 py-1 text-xs text-[#1c395c]/80"
              >
                {angle}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Videos */}
      <section className="border-b border-[#edeff2] bg-[#faf9f6]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
          <SectionHeading
            label="Watch & listen"
            title="AAC programme stories"
            description="Hear from farmers, extension officers, entrepreneurs and ecosystem partners building circular agriculture in Kenya."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {AAC_VIDEOS.map((video) => (
              <div key={video.id} className="overflow-hidden rounded-md border border-[#edeff2] bg-white">
                <div className="relative aspect-video bg-[#0a1f38]">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
                <div className="flex items-center gap-2 p-3">
                  <Play className="h-3.5 w-3.5 shrink-0 text-[#812926]" aria-hidden />
                  <p className="text-xs font-medium text-[#0a1f38]">{video.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1c395c] text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 md:py-16">
          <Users className="mx-auto h-8 w-8 text-[#7ebb55]" aria-hidden />
          <h2 className="mt-4 text-xl font-semibold md:text-2xl">
            Join the ecosystem
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            AAC is convening agribusinesses, farmers, financiers, policymakers and ecosystem
            enablers to co-design practical solutions for circular agriculture in Kenya.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="bg-[#7ebb55] text-white hover:bg-[#6aaa48]">
              <a href={`mailto:${AAC_CONTACT_EMAIL}`}>
                <Mail className="mr-2 h-4 w-4" aria-hidden />
                {AAC_CONTACT_EMAIL}
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/membership/organisational">
                Partner with Impact Hub Nairobi
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-white/50">
            Supported by the DOEN Foundation · {AAC_TAGLINE}
          </p>
        </div>
      </section>
    </MarketingPublicLayout>
  )
}
