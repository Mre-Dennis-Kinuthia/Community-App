import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sprout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFeaturedLandingPrograms } from "@/lib/landing-programs"
import { cn } from "@/lib/utils"

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

function statusTone(status: string) {
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

export function LandingProgramsSection() {
  const programs = getFeaturedLandingPrograms(2)

  return (
    <section id="programs" className="landing-section-alt landing-section">
      <div className="container px-4">
        <SectionHeader
          label="Programs & initiatives"
          title="Building ventures and ecosystems that last"
          description="AAC trains farmers across Kiambu. Climate accelerators and member programmes sit alongside it. Here's a look at what's running now."
          className="mb-10 md:mb-12"
        />

        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={program.detailHref ?? "/programs"}
              className="group flex flex-col overflow-hidden rounded-md border border-[#edeff2] bg-white shadow-sm transition-colors hover:border-[#812926]/30"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-[#1c395c]/10">
                <Image
                  src={program.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <span
                  className={cn(
                    "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                    statusTone(program.status)
                  )}
                >
                  {program.statusLabel}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5 md:p-6">
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
                  {program.shortName ?? program.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1c395c]/80">
                  {program.tagline}
                </p>
                {program.duration ? (
                  <p className="mt-3 text-xs text-[#1c395c]/65">{program.duration}</p>
                ) : null}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#812926] group-hover:underline">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/programs/aac">
            <Button className="bg-[#812926] hover:bg-[#6b2120]">
              Explore AAC Year One
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </Link>
          <Link href="/programs">
            <Button variant="outline" className="border-[#1c395c]/20 bg-white hover:bg-[#faf9f6]">
              <Sprout className="mr-2 h-4 w-4" aria-hidden />
              All programs & initiatives
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
