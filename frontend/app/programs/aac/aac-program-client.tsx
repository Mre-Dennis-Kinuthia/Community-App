"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Leaf,
  Mail,
  MapPin,
  Play,
  Quote,
  Sprout,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AacGallery } from "@/components/programs/aac-gallery"
import { MarketingPublicLayout } from "@/components/marketing/marketing-public-layout"
import {
  AAC_BASELINE_CHALLENGES,
  AAC_CONTACT_EMAIL,
  AAC_ENDLINE_STATS,
  AAC_HERO_STATS,
  AAC_IMAGES,
  AAC_IMPACT_PATHWAY,
  AAC_KEY_CHANGES,
  AAC_PILOTS,
  AAC_PRACTICE_ADOPTION,
  AAC_REPORTING_PERIOD,
  AAC_SECTIONS,
  AAC_STAKEHOLDER_QUOTES,
  AAC_STORY_ANGLES,
  AAC_STORY_ARC,
  AAC_STORY_GALLERY,
  AAC_SUPPORT_NEEDS,
  AAC_SYSTEM_CONSTRAINTS,
  AAC_TAGLINE,
  AAC_TIMELINE,
  AAC_UNDERSTANDING_BY_TOPIC,
  AAC_VIDEOS,
} from "@/lib/aac-program"
import { cn } from "@/lib/utils"

function MetricBar({
  label,
  value,
  accent = "#7ebb55",
  suffix = "%",
}: {
  label: string
  value: number
  accent?: string
  suffix?: string
}) {
  return (
    <div className="group">
      {label ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-xs leading-snug text-[#1c395c]/85 md:text-sm">{label}</span>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-[#812926]">
            {value}
            {suffix}
          </span>
        </div>
      ) : null}
      <div className={cn("h-2 overflow-hidden rounded-full bg-[#edeff2]", !label && "mt-0")}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: accent }}
        />
      </div>
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
      <h2 className="mt-2 text-xl font-semibold text-[#0a1f38] md:text-2xl lg:text-3xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-[#1c395c]/80 md:text-base">{description}</p>
      ) : null}
    </div>
  )
}

function AacSectionNav() {
  const [active, setActive] = useState<string>(AAC_SECTIONS[0].id)

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    AAC_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <nav
      aria-label="Page sections"
      className="sticky top-14 z-40 border-b border-[#edeff2] bg-[#faf9f6]/95 backdrop-blur supports-[backdrop-filter]:bg-[#faf9f6]/85"
    >
      <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {AAC_SECTIONS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              active === id
                ? "bg-[#812926] text-white"
                : "text-[#1c395c]/70 hover:bg-[#edeff2] hover:text-[#0a1f38]"
            )}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  )
}

export default function AacProgramClient() {
  const [activePilot, setActivePilot] = useState(0)
  const pilot = AAC_PILOTS[activePilot]

  return (
    <MarketingPublicLayout>
      <div className="aac-page scroll-smooth">
        {/* Hero */}
        <section className="relative min-h-[min(88vh,52rem)] overflow-hidden bg-[#0a1f38] text-white">
          <div className="absolute inset-0">
            <Image
              src={AAC_IMAGES.hero}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f38]/92 via-[#1c395c]/80 to-[#0a1f38]/70" />
          </div>

          <div className="relative mx-auto flex min-h-[min(88vh,52rem)] max-w-5xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 md:pb-20">
            <Link
              href="/programs"
              className="absolute left-4 top-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/75 transition-colors hover:text-white sm:left-6"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              All programs
            </Link>

            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#7ebb55]/40 bg-[#7ebb55]/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7ebb55]">
                  DOEN Foundation
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">
                  Year One complete
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">
                Advancing Agricultural Circularity
              </h1>
              <p className="mt-3 text-xl font-medium text-[#ffd546] md:text-2xl">{AAC_TAGLINE}</p>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
                A multi-stakeholder programme shifting Kenya&apos;s agri-food system toward
                regenerative and circular models — convening ecosystem actors, strengthening
                extension pathways, and testing market demand with real farmers and consumers.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/60">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  Kiambu County, Kenya
                </span>
                <span>{AAC_REPORTING_PERIOD}</span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="bg-[#7ebb55] text-white hover:bg-[#6aaa48]">
                  <a href="#impact">
                    See Year One impact
                    <ArrowDown className="ml-2 h-4 w-4" aria-hidden />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  <a href={`mailto:${AAC_CONTACT_EMAIL}`}>
                    <Mail className="mr-2 h-4 w-4" aria-hidden />
                    Get in touch
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-3 border-t border-white/15 pt-8 sm:grid-cols-4">
              {AAC_HERO_STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-semibold tabular-nums md:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-[11px] leading-snug text-white/65">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <AacSectionNav />

        {/* Story arc */}
        <section className="border-b border-[#edeff2] bg-white py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <SectionHeading
              label="The programme arc"
              title="Learn → Apply → Connect → Scale"
              description="Knowledge tested at the farm, carried by trusted intermediaries, adapted by farmers, reinforced through ecosystem exchange, and made visible in the market."
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {AAC_STORY_ARC.map((item, i) => (
                <article
                  key={item.step}
                  className="group overflow-hidden rounded-lg border border-[#edeff2] bg-[#faf9f6]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f38]/70 to-transparent" />
                    <span
                      className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0a1f38]"
                      style={{ backgroundColor: item.accent }}
                    >
                      {item.step}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-[#0a1f38]">{item.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#1c395c]/75">
                      {item.description}
                    </p>
                    {i < AAC_STORY_ARC.length - 1 ? (
                      <ChevronRight
                        className="mt-3 hidden h-4 w-4 text-[#1c395c]/30 lg:block"
                        aria-hidden
                      />
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Impact stats */}
        <section id="impact" className="scroll-mt-28 border-b border-[#edeff2] bg-[#faf9f6] py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <SectionHeading
              label="Year One at a glance"
              title="Farmer training outcomes"
              description="144 endline records from Kiambu County — high participation, strong learning, and widespread intention to apply."
            />

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {AAC_ENDLINE_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-[#edeff2] bg-white p-5 shadow-sm"
                >
                  <p className="text-3xl font-semibold tabular-nums text-[#812926]">{stat.value}</p>
                  <p className="mt-1.5 text-xs leading-snug text-[#1c395c]/75">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-[#edeff2] bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#812926]">
                  Learning scores
                </p>
                <div className="mt-4 space-y-4">
                  {[
                    { label: "Understanding", value: 83.1, display: "3.32 / 4" },
                    { label: "Confidence", value: 70.8, display: "3.54 / 5", accent: "#41bed0" },
                    { label: "Attitude", value: 84.1, display: "4.20 / 5", accent: "#822929" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-[#0a1f38]">{s.label}</span>
                        <span className="font-semibold tabular-nums text-[#812926]">{s.display}</span>
                      </div>
                      <MetricBar label="" value={s.value} accent={s.accent ?? "#7ebb55"} />
                    </div>
                  ))}
                </div>
              </div>

              <blockquote className="flex flex-col justify-center rounded-lg border border-[#7ebb55]/20 bg-[#7ebb55]/5 p-6">
                <Quote className="h-8 w-8 text-[#7ebb55]/50" aria-hidden />
                <p className="mt-3 text-sm italic leading-relaxed text-[#1c395c]/90 md:text-base">
                  AAC created a coordinated process that converted ecosystem diagnosis into two
                  implemented tests and generated early evidence of farmer learning, adoption
                  readiness and consumer-market interest.
                </p>
                <footer className="mt-4 text-xs font-medium text-[#812926]">
                  — AAC Year One Impact and Learning Report
                </footer>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Pathway */}
        <section id="pathway" className="scroll-mt-28 border-b border-[#edeff2] bg-white py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <SectionHeading
              label="How change happens"
              title="The AAC impact pathway"
              description="Circular agriculture in Kenya is constrained not only by technical knowledge — but by evidence, extension capacity, trust, coordination, markets and finance."
            />

            <div className="mt-10 hidden items-stretch gap-0 md:flex">
              {AAC_IMPACT_PATHWAY.map((step, i) => (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-1 flex-col items-center rounded-lg border border-[#edeff2] bg-[#faf9f6] px-3 py-4 text-center">
                    <span className="mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#812926] text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium leading-snug text-[#0a1f38]">{step}</span>
                  </div>
                  {i < AAC_IMPACT_PATHWAY.length - 1 ? (
                    <ChevronRight className="mx-1 h-4 w-4 shrink-0 text-[#1c395c]/30" aria-hidden />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2 md:hidden">
              {AAC_IMPACT_PATHWAY.map((step) => (
                <span
                  key={step}
                  className="rounded-full border border-[#7ebb55]/30 bg-[#7ebb55]/10 px-3 py-1.5 text-xs font-medium text-[#3d6b28]"
                >
                  {step}
                </span>
              ))}
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {AAC_SYSTEM_CONSTRAINTS.map((c) => (
                <div key={c.title} className="rounded-lg border border-[#edeff2] p-4">
                  <h3 className="text-sm font-semibold text-[#0a1f38]">{c.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#1c395c]/75">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pilots — tabbed */}
        <section id="pilots" className="scroll-mt-28 border-b border-[#edeff2] bg-[#f3f5f8]/60 py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <SectionHeading
              label="Two proof-of-concept pilots"
              title="Pilot A & Pilot B"
              description="Capacity building through the extension system — connected to consumer demand testing through market activation."
            />

            <div className="mt-8 flex gap-2">
              {AAC_PILOTS.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePilot(i)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    activePilot === i
                      ? "bg-[#812926] text-white"
                      : "border border-[#edeff2] bg-white text-[#1c395c]/80 hover:border-[#812926]/30"
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <article className="mt-6 overflow-hidden rounded-lg border border-[#edeff2] bg-white shadow-sm lg:grid lg:grid-cols-2">
              <div className="relative min-h-[16rem] lg:min-h-[22rem]">
                <Image
                  key={pilot.image}
                  src={pilot.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
                <span className="absolute left-4 top-4 rounded-full bg-[#812926] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {pilot.name}
                </span>
              </div>
              <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
                <h3 className="text-xl font-semibold text-[#0a1f38] md:text-2xl">{pilot.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[#1c395c]/80">{pilot.description}</p>
                <ul className="mt-6 space-y-3">
                  {pilot.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[#1c395c]/85">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7ebb55]" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </section>

        {/* Data charts */}
        <section id="data" className="scroll-mt-28 border-b border-[#edeff2] bg-white py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <SectionHeading
              label="Evidence from the field"
              title="What farmers learned — and plan to apply"
              description="Strong understanding in production topics; market access and post-harvest remain areas for Year Two follow-up."
            />

            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              <div className="rounded-lg border border-[#edeff2] bg-[#faf9f6] p-6">
                <div className="flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-[#7ebb55]" aria-hidden />
                  <h3 className="text-sm font-semibold text-[#0a1f38]">
                    Practices farmers plan to apply
                  </h3>
                </div>
                <div className="mt-5 space-y-3.5">
                  {AAC_PRACTICE_ADOPTION.map((item) => (
                    <MetricBar key={item.label} {...item} />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[#edeff2] bg-[#faf9f6] p-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#41bed0]" aria-hidden />
                  <h3 className="text-sm font-semibold text-[#0a1f38]">
                    Post-training understanding by topic
                  </h3>
                </div>
                <div className="mt-5 space-y-3.5">
                  {AAC_UNDERSTANDING_BY_TOPIC.map((item) => (
                    <MetricBar
                      key={item.label}
                      {...item}
                      accent={item.value >= 90 ? "#7ebb55" : item.value >= 80 ? "#41bed0" : "#f78a3c"}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-[#edeff2] p-6">
                <h3 className="text-sm font-semibold text-[#0a1f38]">
                  Top baseline challenges (n=145)
                </h3>
                <div className="mt-4 space-y-3">
                  {AAC_BASELINE_CHALLENGES.map((item) => (
                    <MetricBar key={item.label} {...item} accent="#822929" />
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-[#edeff2] p-6">
                <h3 className="text-sm font-semibold text-[#0a1f38]">Remaining support needs</h3>
                <div className="mt-4 space-y-3">
                  {AAC_SUPPORT_NEEDS.map((item) => (
                    <MetricBar key={item.label} {...item} accent="#1c395c" />
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-[#1c395c]/65">
                  Finance, extension follow-up, and market linkages remain binding constraints —
                  shaping the Year Two follow-up package.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline + key changes */}
        <section id="journey" className="scroll-mt-28 border-b border-[#edeff2] bg-[#faf9f6] py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <SectionHeading label="Year One journey" title="From diagnosis to implementation" />
                <ol className="mt-8 space-y-0">
                  {AAC_TIMELINE.map((item, i) => (
                    <li key={item.date} className="relative flex gap-4 pb-7 last:pb-0">
                      {i < AAC_TIMELINE.length - 1 ? (
                        <span className="absolute left-[9px] top-5 h-full w-px bg-[#812926]/20" aria-hidden />
                      ) : null}
                      <span className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#812926] text-[9px] font-bold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#812926]">
                          {item.date}
                        </p>
                        <h3 className="mt-0.5 text-sm font-semibold text-[#0a1f38]">{item.stage}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-[#1c395c]/75">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <SectionHeading label="Most meaningful changes" title="What Year One achieved" />
                <div className="mt-8 space-y-4">
                  {AAC_KEY_CHANGES.map((change) => (
                    <article
                      key={change.title}
                      className="rounded-lg border border-[#edeff2] bg-white p-5"
                    >
                      <Leaf className="h-4 w-4 text-[#7ebb55]" aria-hidden />
                      <h3 className="mt-2 text-sm font-semibold text-[#0a1f38]">{change.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#1c395c]/80">{change.detail}</p>
                      <p className="mt-2 text-[10px] font-medium text-[#812926]">{change.evidence}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quotes */}
        <section className="border-b border-[#edeff2] bg-[#1c395c] py-12 text-white md:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <SectionHeading
              label="Voices from the ecosystem"
              title="People making circularity tangible"
              className="[&_h2]:text-white [&_p]:text-white/75 [&_p:first-of-type]:text-[#7ebb55]"
            />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {AAC_STAKEHOLDER_QUOTES.map((q) => (
                <blockquote
                  key={q.name}
                  className="flex flex-col rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <Quote className="h-5 w-5 text-[#ffd546]/60" aria-hidden />
                  <p className="mt-3 flex-1 text-sm italic leading-relaxed text-white/90">
                    &ldquo;{q.quote}&rdquo;
                  </p>
                  <footer className="mt-4 border-t border-white/10 pt-4">
                    <p className="text-sm font-semibold">{q.name}</p>
                    <p className="text-xs text-white/60">{q.role}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#7ebb55]">
                      {q.theme}
                    </p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section id="stories" className="scroll-mt-28 border-b border-[#edeff2] bg-white py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <SectionHeading
              label="Stories from the field"
              title="Circularity in action"
              description="Click any photo to explore — from the Live-in Lab and field training to the HereAfrica Discovery Booth."
            />
            <div className="mt-10">
              <AacGallery photos={AAC_STORY_GALLERY} />
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {AAC_STORY_ANGLES.map((angle) => (
                <span
                  key={angle}
                  className="rounded-full border border-[#edeff2] bg-[#faf9f6] px-3 py-1 text-xs text-[#1c395c]/80"
                >
                  {angle}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Videos */}
        <section id="videos" className="scroll-mt-28 border-b border-[#edeff2] bg-[#faf9f6] py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <SectionHeading
              label="Watch & listen"
              title="AAC programme stories"
              description="Hear from farmers, extension officers, entrepreneurs and ecosystem partners."
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-5">
              <div className="overflow-hidden rounded-lg border border-[#edeff2] bg-white lg:col-span-3">
                <div className="relative aspect-video bg-[#0a1f38]">
                  <iframe
                    src={`https://www.youtube.com/embed/${AAC_VIDEOS[0].youtubeId}`}
                    title={AAC_VIDEOS[0].title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
                <div className="flex items-center gap-2 p-4">
                  <Play className="h-4 w-4 shrink-0 text-[#812926]" aria-hidden />
                  <p className="text-sm font-medium text-[#0a1f38]">{AAC_VIDEOS[0].title}</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 lg:col-span-2">
                {AAC_VIDEOS.slice(1).map((video) => (
                  <div
                    key={video.id}
                    className="overflow-hidden rounded-lg border border-[#edeff2] bg-white"
                  >
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
          </div>
        </section>

        {/* CTA */}
        <section id="join" className="scroll-mt-28 relative overflow-hidden bg-[#0a1f38] text-white">
          <div className="absolute inset-0 opacity-20">
            <Image src={AAC_IMAGES.greenhouseInterior} alt="" fill className="object-cover" unoptimized />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f38]/95 to-[#1c395c]/90" />
          <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 md:py-20">
            <Users className="mx-auto h-10 w-10 text-[#7ebb55]" aria-hidden />
            <h2 className="mt-5 text-2xl font-semibold md:text-3xl">Join the ecosystem</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
              AAC is convening agribusinesses, farmers, financiers, policymakers and ecosystem
              enablers to co-design practical solutions for circular agriculture in Kenya.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-[#7ebb55] text-white hover:bg-[#6aaa48]">
                <a href={`mailto:${AAC_CONTACT_EMAIL}`}>
                  <Mail className="mr-2 h-4 w-4" aria-hidden />
                  {AAC_CONTACT_EMAIL}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/membership/organisational">
                  Partner with Impact Hub Nairobi
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
            <p className="mt-8 text-xs text-white/45">
              Supported by the DOEN Foundation · {AAC_TAGLINE}
            </p>
          </div>
        </section>
      </div>
    </MarketingPublicLayout>
  )
}
