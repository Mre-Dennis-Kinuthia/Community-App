import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

const STORIES = [
  {
    title: "Ventures scaling impact across Kenya",
    description:
      "Meet founders building in climate, agri-tech, and circularity — supported through programs and community at Impact Hub Nairobi.",
    href: "https://nairobi.impacthub.net/impact-stories/",
    external: true,
  },
  {
    title: "Programs & ecosystem partnerships",
    description:
      "How institutions, funders, and innovators collaborate to drive inclusive innovation at scale in Nairobi.",
    href: "https://nairobi.impacthub.net/",
    external: true,
  },
  {
    title: "News from our community",
    description:
      "Updates on events, opportunities, and member milestones — published on the Impact Hub Nairobi platform.",
    href: "/news",
    external: false,
  },
] as const

export function LandingImpactStories() {
  return (
    <section className="landing-section">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label mb-3">Impact stories</p>
          <h2 className="section-title text-balance">Stories from Nairobi</h2>
          <p className="section-lead mx-auto mt-4 max-w-2xl text-pretty">
            Real ventures, programs, and partnerships shaping inclusive innovation — from our
            workspace to the wider ecosystem.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
          {STORIES.map((story) => (
            <article
              key={story.title}
              className="landing-panel flex flex-col rounded-md border border-[#edeff2] bg-white p-6"
            >
              <BookOpen className="mb-4 h-5 w-5 text-[#812926]" aria-hidden />
              <h3 className="text-base font-semibold text-[#0a1f38]">{story.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1c395c]/80">
                {story.description}
              </p>
              {story.external ? (
                <a
                  href={story.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#812926] hover:underline"
                >
                  Read on IHN
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : (
                <Link
                  href={story.href}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#812926] hover:underline"
                >
                  Browse news
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              )}
            </article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://nairobi.impacthub.net/impact-stories/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="border-[#1c395c]/20 bg-white hover:bg-[#faf9f6]">
              More stories from Impact Hub Nairobi
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
