import type { Metadata } from "next"
import { ArrowRight, BookOpen, Globe2, Handshake, Users } from "lucide-react"
import { MembershipDetailsForm } from "@/components/marketing/membership-details-form"
import { MarketingPublicLayout } from "@/components/marketing/marketing-public-layout"

export const metadata: Metadata = {
  title: "Community membership offer | Impact Hub Nairobi",
  description:
    "Join the Impact Hub Nairobi community and get 30% off your first membership period. Discover the connections, learning, and venture support available to members.",
}

const MEMBER_BENEFITS = [
  {
    icon: Users,
    title: "A connected impact community",
    description:
      "Meet entrepreneurs, creatives, investors, and partners through the member community, directory, and curated introductions.",
  },
  {
    icon: BookOpen,
    title: "Learning and founder support",
    description:
      "Take part in selected learning sessions, office hours, networking, thematic acceleration, and growth advisory.",
  },
  {
    icon: Handshake,
    title: "Connections to opportunities",
    description:
      "Build relationships with ecosystem partners and access introductions to grants, investors, and strategic partnerships.",
  },
  {
    icon: Globe2,
    title: "A global network",
    description:
      "Connect with the wider Impact Hub network through Global Passport, spanning hubs around the world.",
  },
]

export default function OffersPage() {
  return (
    <MarketingPublicLayout>
      <div className="bg-[#faf9f6]">
        <section className="border-b border-[#edeff2] bg-[#f3f5f8]/60">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">
                Impact Hub Nairobi community
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0a1f38] md:text-6xl">
                Join a community building what’s next
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#1c395c]/80 md:text-base">
                Connect with people growing ventures and ideas for a more inclusive and sustainable
                future. New members get{" "}
                <span className="font-semibold text-[#812926]">30% off their first membership period</span>.
              </p>
              <p className="mt-3 text-xs font-medium text-[#1c395c]/65">
                Offer ends December 31, 2026
              </p>
              <a
                href="#membership-details"
                className="mt-7 inline-flex items-center gap-2 rounded-md bg-[#812926] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6b2120]"
              >
                Get membership details
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">
              More than a membership
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#0a1f38] md:text-3xl">
              Find your people, knowledge, and next opportunity
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#1c395c]/75">
              Membership brings you into a community of people working across sectors to create
              meaningful change.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {MEMBER_BENEFITS.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="flex gap-4 rounded-md border border-[#edeff2] bg-white p-5 shadow-sm md:p-6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#812926]/10 text-[#812926]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-semibold text-[#0a1f38]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#1c395c]/75">{description}</p>
                </div>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-[#1c395c]/60">
            Members also have access to workspace options and member rates. We’ll share the
            membership details that are right for you.
          </p>
        </section>

        <section
          id="membership-details"
          className="border-y border-[#edeff2] bg-[#f3f5f8]"
        >
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mx-auto max-w-xl">
              <p className="text-center text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">
                Take the next step
              </p>
              <h2 className="mt-2 text-center text-2xl font-semibold text-[#0a1f38] md:text-3xl">
                Get details on membership
              </h2>
              <p className="mt-3 text-center text-sm leading-relaxed text-[#1c395c]/75">
                Leave your details and our team will email you more information about joining the
                Impact Hub Nairobi community.
              </p>
              <MembershipDetailsForm />
            </div>
          </div>
        </section>
      </div>
    </MarketingPublicLayout>
  )
}
