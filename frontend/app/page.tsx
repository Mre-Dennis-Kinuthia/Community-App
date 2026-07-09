"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MetricCardGrid } from "@/components/design/metric-card"
import { toast } from "@/lib/toast"
import {
  ArrowRight,
  ChevronDown,
  MapPin,
  Twitter,
  Linkedin,
  Instagram,
  Globe,
  Menu,
  X,
  Mail,
  Phone,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { LandingPartnerLogo } from "@/components/landing-partner-logo"
import { LANDING_IMPLEMENTATION_PARTNERS, LANDING_STRATEGIC_PARTNERS } from "@/lib/landing-partners"
import { cn } from "@/lib/utils"
import { LANDING_IMAGES } from "@/lib/landing-assets"
import { LandingCommunitySection } from "@/components/landing/landing-community-section"
import { LandingEventsSection } from "@/components/landing/landing-events-section"
import { LandingImpactStories } from "@/components/landing/landing-impact-stories"
import { getLandingFooterPlatformLinks, LANDING_HEADER_LINKS } from "@/lib/public-nav-links"
import { HUB_PUBLIC_EMAIL, HUB_PUBLIC_PHONE, HUB_PUBLIC_PHONE_HREF } from "@/lib/hub-contact"
import {
  ORGANISATIONAL_MEMBERSHIP_PATH,
  ORGANISATIONAL_RESPONSE_SLA,
  STAR_CONNECT_RESPONSE_SLA,
} from "@/lib/membership-inquiry"

const NAV_LINKS = LANDING_HEADER_LINKS

const IMPACT_STATS = [
  { label: "People in the network", value: "300k+" },
  { label: "Hubs worldwide", value: "50+" },
  { label: "Thematic areas", value: "6" },
  { label: "Years in Nairobi", value: "15+" },
]

const PILLARS = [
  {
    title: "Programs & venture support",
    description:
      "Incubators, accelerators, and workshops for entrepreneurs — from early idea to growth stage.",
    image: LANDING_IMAGES.pillars.programs,
  },
  {
    title: "Workspace",
    description:
      "Desks, meeting rooms, and event space in Westlands — book through the platform when you're a member.",
    image: LANDING_IMAGES.pillars.coworking,
  },
  {
    title: "Thematic innovation",
    description:
      "Work across climate, circularity, agriculture, gender, mobility, and digital inclusion.",
    image: LANDING_IMAGES.pillars.innovation,
  },
  {
    title: "Partnerships",
    description:
      "Collaboration with corporates, foundations, universities, and government on programs and research.",
    image: LANDING_IMAGES.pillars.partnerships,
  },
] as const

const MEMBERSHIP_TIERS = [
  {
    name: "Community",
    price: "Free",
    period: "",
    description: "Start here. No cost, no barrier — join Nairobi's most active impact community.",
    features: [
      "Invitations to member-only events",
      "Access to co-working spaces",
      "Monthly community socials",
      "Impact newsletter & updates",
      "Community channel access",
    ],
    cta: "Create free account",
    helper: "Register on the platform · no payment required",
    href: "/register",
    external: false,
    popular: false,
  },
  {
    name: "Star Connect",
    price: "KES 13,000",
    period: "/ month",
    description: "For early and growth-stage founders ready to scale with dedicated support.",
    features: [
      "Global Passport — 120+ hubs, 60+ countries",
      "Dedicated business development services",
      "Thematic acceleration programs",
      "Grants & funding opportunities",
      "Strategic partnerships & growth advisory",
    ],
    cta: "Apply for membership",
    helper: `2-step application · we respond ${STAR_CONNECT_RESPONSE_SLA}`,
    href: "/membership/star-connect",
    external: false,
    popular: true,
  },
  {
    name: "Organisational",
    price: "Custom",
    period: "",
    description: "For institutions seeking a strategic ecosystem partner to co-create impact.",
    features: [
      "Fully bespoke engagement & co-design",
      "Program & event co-creation",
      "Network access: ventures, partners, investors",
      "Strategic visibility across platforms",
      "Dedicated partnership manager",
    ],
    cta: "Start partnership inquiry",
    helper: `3-step inquiry · we respond ${ORGANISATIONAL_RESPONSE_SLA}`,
    href: ORGANISATIONAL_MEMBERSHIP_PATH,
    external: false,
    popular: false,
  },
] as const

const FAQS = [
  {
    question: "Who can join Impact Hub Nairobi?",
    answer:
      "Anyone passionate about creating positive change — entrepreneurs, creatives, investors, policy shapers, and professionals. Our community is open to all who share the belief that business can serve people and the planet.",
  },
  {
    question: "What makes Impact Hub different from other co-working spaces?",
    answer:
      "We're much more than a workspace. We're an ecosystem — combining programs, mentorship, investment linkages, a global network of 100+ hubs, and a curated community of impact-driven innovators. Everything is designed to help ventures scale sustainably.",
  },
  {
    question: "How do programs and acceleration work?",
    answer:
      "Our programs run across six thematic areas — agriculture, circularity, climate, e-mobility, digitization, and gender equity. Each program provides structured training, 1-on-1 coaching, market access, and connections to funding opportunities.",
  },
  {
    question: "Can I attend events without a paid membership?",
    answer:
      "Yes! Community members (free tier) get access to many of our events including office hours, mixers, and select workshops. Paid members receive priority access, exclusive masterclasses, and deeper engagement opportunities.",
  },
  {
    question: "How do I book workspace?",
    answer:
      "Once you're a member, you can book workspace through our platform. Select your preferred space and time, confirm your booking, and you'll receive everything you need to show up and get to work.",
  },
  {
    question: "What does the Star Connect membership include?",
    answer:
      "Star Connect gives you a full 360° business diagnostic, dedicated business development support, access to global Impact Hub spaces via the Passport program, thematic acceleration tracks, and direct connections to grants and investors.",
  },
  {
    question: "How can my organization partner with Impact Hub Nairobi?",
    answer:
      "Choose Organisational membership and complete the 3-step partnership inquiry — institution profile, engagement design, and contact details. Create your platform account with the same email and our partnerships team will follow up to co-design programs and bespoke engagement.",
  },
]

function LandingPillarCard({
  title,
  description,
  image,
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
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <h2 className="text-xl font-semibold tracking-tight text-[#0a1f38] md:text-2xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-[#1c395c]/85 md:text-base">{description}</p>
      ) : null}
    </div>
  )
}

interface NavLinkProps {
  href: string
  label: string
  external?: boolean
  className: string
  onClick?: () => void
}

function NavLink({ href, label, external, className, onClick }: NavLinkProps) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {label}
      </a>
    )
  }
  return (
    <a href={href} className={className} onClick={onClick}>
      {label}
    </a>
  )
}

export default function HomePage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
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
      <header className="landing-header sticky top-0 z-50 overflow-x-hidden">
        <div className="container flex h-14 min-w-0 items-center justify-between gap-4 px-4 md:px-6">
          <Logo href="/" variant="landing" />

          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Become a member</Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-expanded={mobileNavOpen}
              aria-controls="landing-mobile-nav"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileNavOpen ? (
          <div id="landing-mobile-nav" className="border-t border-border bg-background md:hidden">
            <nav className="container flex flex-col px-4 py-3" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  {...link}
                  className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  onClick={() => setMobileNavOpen(false)}
                />
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                <Link href="/login" onClick={() => setMobileNavOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileNavOpen(false)}>
                  <Button className="w-full">Become a member</Button>
                </Link>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main>
      <section className="hero-wash border-b border-[#edeff2]" aria-labelledby="hero-heading">
        <div className="container flex min-h-[inherit] flex-col justify-center px-4 py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-2xl">
            <h1
              id="hero-heading"
              className="text-3xl font-semibold tracking-tight text-[#0a1f38] md:text-4xl lg:text-[2.75rem] lg:leading-tight"
            >
              Impact Hub Nairobi
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#1c395c]/90 md:text-lg">
              Book workspace, register for events, and meet fellow founders — on the member
              platform or at our hub in Westlands.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/register">
                <Button size="lg" className="w-full bg-[#812926] hover:bg-[#6b2120] sm:w-auto">
                  Create free account
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-[#1c395c]/20 bg-white/90 sm:w-auto"
                >
                  Sign in
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-[#1c395c]/70">
              Part of a network of 50+ Impact Hubs · community membership is free
            </p>
          </div>
        </div>
      </section>

      <section className="landing-stat-band" aria-label="Network at a glance">
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
          <p className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-white/65">
            Figures for the global Impact Hub network. Nairobi-specific outcomes are in our annual
            reporting.
          </p>
        </div>
      </section>

      <section id="services" className="landing-section container px-4">
        <SectionHeader
          title="What we do"
          description="Programs, workspace, and partnerships — the same work we run from Westlands, with booking and community tools on the platform."
          className="mb-10 md:mb-12"
        />
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          {PILLARS.map((pillar) => (
            <LandingPillarCard key={pillar.title} {...pillar} />
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-xl text-sm text-[#1c395c]/75">
          More on{" "}
          <a
            href="https://nairobi.impacthub.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#812926] underline-offset-2 hover:underline"
          >
            nairobi.impacthub.net
          </a>
        </p>
      </section>

      <LandingEventsSection />

      <LandingCommunitySection />

      <LandingImpactStories />

      <section id="membership" className="landing-section-alt landing-section">
        <div className="container px-4">
          <SectionHeader
            title="Membership"
            description="Start free. Upgrade when you need dedicated venture support or an institutional partnership."
            className="mb-10 md:mb-12"
          />
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            {MEMBERSHIP_TIERS.map((tier) => (
              <article
                key={tier.name}
                className={cn(
                  "flex flex-col rounded-md border border-[#edeff2] bg-white p-5 md:p-6",
                  tier.popular && "border-[#812926]/30 ring-1 ring-[#812926]/10"
                )}
              >
                <div>
                  <h3 className="text-base font-semibold text-[#0a1f38]">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tabular-nums text-[#0a1f38]">
                      {tier.price}
                    </span>
                    {tier.period ? (
                      <span className="text-sm text-[#1c395c]/70">{tier.period}</span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#1c395c]/80">
                    {tier.description}
                  </p>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-[#1c395c]/75">
                  {tier.features.join(" · ")}
                </p>
                <div className="mt-6 space-y-2">
                  <p className="text-xs text-[#1c395c]/60">{tier.helper}</p>
                  {tier.external ? (
                    <a href={tier.href} className="block">
                      <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
                        {tier.cta}
                      </Button>
                    </a>
                  ) : (
                    <Link href={tier.href} className="block">
                      <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
                        {tier.cta}
                      </Button>
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section container px-4">
        <SectionHeader
          title="Partners"
          description="We work with funders, corporates, universities, and NGOs across Nairobi's impact ecosystem."
          className="mb-8"
        />
        <div className="grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {LANDING_STRATEGIC_PARTNERS.map((partner) => (
            <LandingPartnerLogo key={partner.name} partner={partner} />
          ))}
        </div>

        <h3 className="mt-14 text-sm font-medium text-[#0a1f38]">Implementation partners</h3>
        <div className="mt-4 grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {LANDING_IMPLEMENTATION_PARTNERS.map((partner) => (
            <LandingPartnerLogo key={partner.name} partner={partner} />
          ))}
        </div>
        <p className="mt-8">
          <Link
            href="/partners"
            className="inline-flex items-center gap-1.5 text-sm text-[#812926] hover:underline"
          >
            All partners
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </p>
      </section>

      <section id="faq" className="landing-section-alt landing-section">
        <div className="container px-4">
          <SectionHeader
            title="Common questions"
            className="mb-8 md:mb-10"
          />
          <div className="mx-auto max-w-2xl overflow-hidden rounded-md border border-[#edeff2] bg-white">
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
        <div className="mx-auto max-w-xl rounded-md border border-[#edeff2] bg-[#1c395c] px-6 py-8 text-white md:px-8 md:py-10">
          <h2 id="newsletter-heading" className="text-lg font-semibold md:text-xl">
            Newsletter
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            Occasional updates on events and programs. Unsubscribe anytime.
          </p>
          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
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
              className="h-9 bg-white text-[#0a1f38] hover:bg-white/90 sm:min-w-[120px]"
              disabled={newsletterLoading}
            >
              {newsletterLoading ? "Subscribing…" : "Subscribe"}
            </Button>
          </form>
        </div>
      </section>
      </main>

      <footer className="border-t border-[#edeff2] bg-[#f3f5f8] py-12 md:py-14">
        <div className="container px-4">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <Logo />
              <p className="text-sm leading-relaxed text-[#1c395c]/80">
                Kenya&apos;s Impact Hub — programs, workspace, and community for people building
                ventures and partnerships in Nairobi.
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
              <h3 className="mb-4 text-sm font-medium text-[#0a1f38]">Platform</h3>
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
              <h3 className="mb-4 text-sm font-medium text-[#0a1f38]">Learn more</h3>
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
              <h3 className="mb-4 text-sm font-medium text-[#0a1f38]">Contact</h3>
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
