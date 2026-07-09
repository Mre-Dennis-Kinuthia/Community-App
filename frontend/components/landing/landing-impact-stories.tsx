import Link from "next/link"
import { ArrowRight } from "lucide-react"

const STORIES = [
  {
    title: "Impact stories",
    description: "Founders and programs from our Nairobi hub.",
    href: "https://nairobi.impacthub.net/impact-stories/",
    external: true,
  },
  {
    title: "News & updates",
    description: "Events, opportunities, and member news on the platform.",
    href: "/news",
    external: false,
  },
] as const

export function LandingImpactStories() {
  return (
    <section className="landing-section border-t border-[#edeff2] bg-[#faf9f6]">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight text-[#0a1f38] md:text-2xl">
            From the hub
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#1c395c]/85 md:text-base">
            Longer reads live on our main site; shorter updates are posted here.
          </p>
        </div>

        <ul className="mx-auto mt-8 max-w-2xl divide-y divide-[#edeff2] border-y border-[#edeff2]">
          {STORIES.map((story) => (
            <li key={story.title}>
              {story.external ? (
                <a
                  href={story.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 py-4 transition-colors hover:text-[#812926]"
                >
                  <span>
                    <span className="block font-medium text-[#0a1f38] group-hover:text-[#812926]">
                      {story.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-[#1c395c]/75">{story.description}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#1c395c]/50" aria-hidden />
                </a>
              ) : (
                <Link
                  href={story.href}
                  className="group flex items-center justify-between gap-4 py-4 transition-colors"
                >
                  <span>
                    <span className="block font-medium text-[#0a1f38] group-hover:text-[#812926]">
                      {story.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-[#1c395c]/75">{story.description}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#1c395c]/50" aria-hidden />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
