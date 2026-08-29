"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MetricCardGrid } from "@/components/design/metric-card"
import { toast } from "@/lib/toast"
import {
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  MapPin,
  Twitter,
  Linkedin,
  Instagram,
  Shield,
  Award,
  Globe,
  Mail,
  Phone,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { LandingPartnerLogo } from "@/components/landing-partner-logo"
import { LANDING_IMPLEMENTATION_PARTNERS, LANDING_STRATEGIC_PARTNERS } from "@/lib/landing-partners"
import { cn } from "@/lib/utils"
import { LANDING_IMAGES } from "@/lib/landing-assets"
import { HERO_AVATAR_COLORS, HERO_AVATAR_INITIALS } from "@/lib/landing-community"
import { LandingCommunitySection } from "@/components/landing/landing-community-section"
import { LandingEventsSection } from "@/components/landing/landing-events-section"
import { LandingImpactStories } from "@/components/landing/landing-impact-stories"
import { LandingProgramsSection } from "@/components/landing/landing-programs-section"
import { LandingHeader } from "@/components/landing/landing-header"
import { getLandingFooterPlatformLinks } from "@/lib/public-nav-links"
import { HUB_PUBLIC_EMAIL, HUB_PUBLIC_PHONE, HUB_PUBLIC_PHONE_HREF } from "@/lib/hub-contact"
import { MembershipPricingCards } from "@/components/landing/membership-pricing-cards"
import { STAR_CONNECT_FAQ_ANSWER } from "@/lib/membership-inquiry"

const IMPACT_STATS = [
  { label: "Impact Hubs", value: "117" },
  { label: "Countries", value: "68" },
  { label: "Continents", value: "5" },
  { label: "Impact Makers", value: "300k+" },
]

const PILLARS = [
  {
    title: "Support for Socially-Driven Ventures and Innovations",
    description:
      "Incubators, accelerators, consulting, and workshops for founders who want to grow their ventures and deepen their social impact.",
    image: LANDING_IMAGES.pillars.programs,
    accent: "#7ebb55",
  },
  {
    title: "Flexible, Inspiring Work Environment",
    description:
      "Indoor and outdoor workspaces with coffee bars, meeting rooms, and wellness zones. Day passes through to company plans.",
    image: LANDING_IMAGES.pillars.coworking,
    accent: "#f78a3c",
  },
  {
    title: "Driving Sustainable & Inclusive Innovation",
    description:
      "We back ventures in climate, circularity, agri-tech, gender equity, digital inclusion, and e-mobility.",
    image: LANDING_IMAGES.pillars.innovation,
    accent: "#41bed0",
  },
  {
    title: "Partnerships & Ecosystem Integration",
    description:
      "We work with corporations, foundations, and policymakers, and use action research and ecosystem mapping to strengthen local innovation.",
    image: LANDING_IMAGES.pillars.partnerships,
    accent: "#ffd546",
  },
] as const

const FAQS = [
  {
    question: "Who can join Impact Hub Nairobi?",
    answer:
      "Entrepreneurs, creatives, investors, policy shapers, and professionals who want to create positive change. If you believe business can serve people and the planet, you're welcome here.",
  },
  {
    question: "What makes Impact Hub different from other co-working spaces?",
    answer:
      "We're more than desks and wifi. You get programs, mentorship, links to investment, a global network of 100+ hubs, and a community of people building for impact. The goal is to help ventures grow in a way that lasts.",
  },
  {
    question: "How do programs and acceleration work?",
    answer:
      "Our programs cover six areas: agriculture, circularity, climate, e-mobility, digitization, and gender equity. You get structured training, 1-on-1 coaching, market access, and introductions to funding.",
  },
  {
    question: "Can I attend events without a paid membership?",
    answer:
      "Yes. Connect members can join many events, including office hours, mixers, and select workshops. Star Connect and Organisation / Company members get priority access, exclusive sessions, and closer follow-up.",
  },
  {
    question: "How do I book workspace?",
    answer:
      "Once you're a member, book through the platform. Connect is free. All workspace rates — Day Passes, packs, desks and rooms — are listed under Star Connect. The hub team confirms availability, then you’ll complete payment if a fee is due.",
  },
  {
    question: "What does the Star Connect membership include?",
    answer: STAR_CONNECT_FAQ_ANSWER,
  },
  {
    question: "How can my organization partner with Impact Hub Nairobi?",
    answer:
      "Choose Organisation / Company and complete the 3-step partnership inquiry. This track is for institutional programmes and ecosystem work — not workspace rates. Workspace prices are listed under Star Connect.",
  },
]

function LandingPillarCard({
  title,
  description,
  image,
  accent,
}: (typeof PILLARS)[number]) {
  return (
    <article className="landing-pillar-card group">
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="landing-pillar-card__image"
        unoptimized
      />
      <div className="landing-pillar-card__overlay" aria-hidden />
      <div className="landing-pillar-card__content">
        <span className="landing-pillar-card__accent" style={{ backgroundColor: accent }} />
        <h3 className="text-base font-semibold leading-snug md:text-lg">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/85">{description}</p>
      </div>
    </article>
  )
}

interface AccordionItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function AccordionItem({ question, answer, isOpen, onToggle }: AccordionItemProps) {
  const panelId = `faq-${question.slice(0, 24).replace(/\W+/g, "-").toLowerCase()}`

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40 md:px-6"
      >
        <span className="text-sm font-medium leading-snug text-foreground">{question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      <div
        id={panelId}
        role="region"
        hidden={!isOpen}
        className={cn(
          "overflow-hidden px-5 text-sm leading-relaxed text-muted-foreground transition-all md:px-6",
          isOpen ? "pb-4" : "h-0 pb-0"
        )}
      >
        {isOpen ? answer : null}
      </div>
    </div>
  )
}

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

export default function HomePage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterLoading(true)
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      if (data.status === "already_subscribed") {
        toast.success("Already subscribed", "You're already on our newsletter list.")
      } else {
        toast.success("Subscribed!", "You'll receive events, programs, and community updates.")
      }
      setNewsletterEmail("")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <div className="landing-page flex min-h-screen flex-col bg-[#faf9f6]">
      <LandingHeader />

      <main>
      <section className="hero-wash border-b border-[#edeff2]" aria-labelledby="hero-heading">
        <div className="container flex min-h-[inherit] flex-col justify-center px-4 py-16 md:py-24 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-label mb-4">Impact Hub Nairobi</p>
            <h1
              id="hero-heading"
              className="text-4xl font-semibold tracking-tight text-balance text-[#0a1f38] md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
            >
              For Impact Startups &amp; Innovators
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#1c395c]/80 md:text-base">
              Programs, workspace, events, and community in one place. Built in Nairobi, connected
              to a global network of people growing businesses that also serve people and the
              planet.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full bg-[#812926] hover:bg-[#6b2120] sm:w-auto">
                  Become a member
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-[#1c395c]/20 bg-white/80 sm:w-auto"
                >
                  Sign in
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2" aria-hidden>
                  {HERO_AVATAR_INITIALS.map((initial, index) => (
                    <span
                      key={initial}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-sm"
                      style={{ backgroundColor: HERO_AVATAR_COLORS[index] }}
                    >
                      {initial}
                    </span>
                  ))}
                </div>
                <p className="text-left text-xs text-[#1c395c]/75 sm:text-sm">
                  <span className="font-semibold text-[#812926]">Entrepreneurs</span>
                  {" · "}
                  investors · partners · creatives
                </p>
              </div>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                "300k+ impact makers globally",
                "117 hubs in 68 countries",
                "Free Connect membership",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center justify-center gap-2 rounded-md border border-[#edeff2] bg-white/90 px-3 py-2.5 text-xs text-[#1c395c]/80 sm:text-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#812926]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="landing-mission-strip" aria-label="Global network mission">
        <div className="container px-4">
          <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-[#1c395c] md:text-base">
            Part of a global network focused on{" "}
            <span className="font-semibold text-[#812926]">
              inclusive and sustainable innovation
            </span>
            . This platform brings Impact Hub Nairobi together: programs, co-working, partnerships,
            and community.
          </p>
        </div>
      </section>

      <section className="landing-stat-band" aria-label="Global network impact">
        <div className="container px-4">
          <MetricCardGrid className="mx-auto max-w-5xl md:grid-cols-4">
            {IMPACT_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-md border border-white/10 bg-white/5 px-4 py-5 text-center"
              >
                <p className="text-2xl font-semibold tracking-tight tabular-nums text-white md:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs leading-snug text-white/75 md:text-sm">{stat.label}</p>
              </div>
            ))}
          </MetricCardGrid>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-white/70">
            Part of the global Impact Hub network. Nairobi-specific outcomes are reported through
            programs and annual impact reporting.
          </p>
        </div>
      </section>

      <section id="services" className="landing-section container px-4">
        <SectionHeader
          label="What we offer"
          title="What Impact Hub Nairobi is built around"
          description="Programs, workspaces, venture support, and partnerships. The same pillars as Impact Hub Nairobi, now on your member platform."
          className="mb-14 md:mb-16"
        />
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          {PILLARS.map((pillar) => (
            <LandingPillarCard key={pillar.title} {...pillar} />
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-[#1c395c]/75">
          Explore programs, book workspace, and meet the community here, or visit{" "}
          <a
            href="https://nairobi.impacthub.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#812926] underline-offset-2 hover:underline"
          >
            nairobi.impacthub.net
          </a>{" "}
          for events, impact stories, and membership details.
        </p>
      </section>

      <LandingProgramsSection />

      <LandingEventsSection />

      <LandingCommunitySection />

      <LandingImpactStories />

      <section id="membership" className="landing-section-alt landing-section">
        <div className="container px-4">
          <SectionHeader
            label="Membership"
            title="Become a member"
            description="Connect is free. Star Connect holds the workspace rates — toggle a category to see price and coworking days. Organisation / Company is for partnerships."
            className="mb-14 md:mb-16"
          />
          <MembershipPricingCards />
        </div>
      </section>

      <section className="landing-section container px-4">
        <SectionHeader
          label="Our ecosystem"
          title="Strategic partners"
          description="We work across sectors to strengthen entrepreneurial communities in Nairobi and beyond."
          className="mb-10 md:mb-12"
        />
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {LANDING_STRATEGIC_PARTNERS.map((partner) => (
            <LandingPartnerLogo key={partner.name} partner={partner} />
          ))}
        </div>

        <SectionHeader
          label="Implementation partnerships"
          title="Building impact together"
          description="Programs, business development, mentorship, legal support, monitoring and evaluation, and day-to-day collaboration across Nairobi's impact community."
          className="mb-10 mt-16 md:mb-12 md:mt-20"
        />
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {LANDING_IMPLEMENTATION_PARTNERS.map((partner) => (
            <LandingPartnerLogo key={partner.name} partner={partner} />
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link
            href="/partners"
            className="inline-flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-muted-foreground"
          >
            View all partners
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </p>
      </section>

      <section id="faq" className="landing-section-alt landing-section">
        <div className="container px-4">
          <SectionHeader
            label="FAQ"
            title="Frequently asked questions"
            description="Answers about joining, membership, programs, and using the platform."
            className="mb-12 md:mb-14"
          />
          <div className="landing-panel mx-auto max-w-3xl overflow-hidden">
            {FAQS.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section container px-4" aria-labelledby="newsletter-heading">
        <div className="landing-newsletter-panel mx-auto max-w-2xl px-6 py-10 md:px-10 md:py-12">
          <div className="text-center">
            <p className="section-label mb-3 text-[#ffd546]">Newsletter</p>
            <h2 id="newsletter-heading" className="section-title text-white">
              Impact in your inbox!
            </h2>
            <p className="section-lead mx-auto mt-3 text-white/80">
              Stay connected with events, programs, and stories from Kenya&apos;s impact community.
            </p>
          </div>
          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            onSubmit={handleNewsletterSubmit}
          >
            <Input
              type="email"
              placeholder="Your email address"
              className="h-9 flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/50"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              disabled={newsletterLoading}
              aria-label="Email address"
            />
            <Button
              type="submit"
              className="h-9 bg-[#ffd546] text-[#0a1f38] hover:bg-[#f5c832] sm:min-w-[120px]"
              disabled={newsletterLoading}
            >
              {newsletterLoading ? "Subscribing…" : "Subscribe"}
              {!newsletterLoading ? <ArrowRight className="ml-2 h-4 w-4" aria-hidden /> : null}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-white/60">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

      <section className="border-t border-[#edeff2] py-16 md:py-20">
        <div className="container space-y-6 px-4 text-center">
          <SectionHeader
            title="Ready to join the community?"
            description="Start in Nairobi. Stay connected to a global network of people building for impact."
          />
          <p className="text-xs text-[#1c395c]/70">
            Part of the global Impact Hub network · 117 hubs · 68 countries · 5 continents
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full bg-[#812926] hover:bg-[#6b2120] sm:w-auto">
                Become a member
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </div>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Secure platform
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Free Connect membership
            </li>
            <li className="flex items-center gap-2">
              <Award className="h-3.5 w-3.5 shrink-0" aria-hidden />
              15+ years of impact
            </li>
          </ul>
        </div>
      </section>
      </main>

      <footer className="border-t border-[#edeff2] bg-[#f3f5f8] py-12 md:py-14">
        <div className="container px-4">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <Logo />
              <p className="text-sm leading-relaxed text-[#1c395c]/80">
                Kenya&apos;s home for people building businesses that matter. Ventures grow here,
                communities connect here, and ideas travel through a global Impact Hub network.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/impacthubnairobi"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://www.linkedin.com/company/impact-hub-nairobi"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="https://twitter.com/ImpactHubNBI"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="landing-footer-heading mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                {getLandingFooterPlatformLinks().map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="landing-footer-heading mb-4">Learn more</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://nairobi.impacthub.net/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Impact Hub Nairobi
                  </a>
                </li>
                <li>
                  <a href="https://impacthub.net" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    Impact Hub Global
                  </a>
                </li>
                <li><a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQs</a></li>
                <li><Link href="/news" className="text-muted-foreground hover:text-foreground transition-colors">News &amp; Updates</Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign in</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="landing-footer-heading mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Impact Hub Nairobi, Westlands, Nairobi, Kenya</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
                  <a
                    href={`mailto:${HUB_PUBLIC_EMAIL}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {HUB_PUBLIC_EMAIL}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
                  <a
                    href={HUB_PUBLIC_PHONE_HREF}
                    className="hover:text-foreground transition-colors"
                  >
                    {HUB_PUBLIC_PHONE}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden />
                  <a href="https://nairobi.impacthub.net/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                    nairobi.impacthub.net
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground md:flex-row">
              <p>&copy; {new Date().getFullYear()} Impact Hub Nairobi. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/privacy" className="transition-colors hover:text-foreground">
                  Privacy policy
                </Link>
                <Link href="/terms" className="transition-colors hover:text-foreground">
                  Terms of service
                </Link>
              </div>
            </div>
            <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
              Part of the global{" "}
              <a
                href="https://impacthub.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-2 hover:underline"
              >
                Impact Hub network
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
