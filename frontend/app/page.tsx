"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "@/lib/toast"
import {
  Calendar,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Building2,
  TrendingUp,
  ChevronDown,
  MapPin,
  Twitter,
  Linkedin,
  Instagram,
  Shield,
  Award,
  Globe,
  Menu,
  X,
  Briefcase,
  Lightbulb,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { LandingPartnerLogo, type LandingPartner } from "@/components/landing-partner-logo"
import { FEATURE_FLAGS } from "@/lib/feature-flags"
import { cn } from "@/lib/utils"
import { HUB_CONTACT_EMAIL } from "@/lib/hub-contact"
import {
  ORGANISATIONAL_MEMBERSHIP_PATH,
  ORGANISATIONAL_RESPONSE_SLA,
  STAR_CONNECT_RESPONSE_SLA,
} from "@/lib/membership-inquiry"

const NAV_LINKS = [
  { href: "#services", label: "What we do" },
  { href: "#membership", label: "Membership" },
  { href: "#faq", label: "FAQ" },
  { href: "https://nairobi.impacthub.net/", label: "About IHN", external: true },
] as const

const IMPACT_STATS = [
  { label: "Entrepreneurs Supported Globally", value: "24,000+" },
  { label: "Hubs Worldwide", value: "100+" },
  { label: "Countries", value: "60+" },
  { label: "Events Delivered Annually", value: "52+" },
]

const SERVICES = [
  {
    title: "Programs & Acceleration",
    description:
      "Multi-month structured programs that take ventures from idea to scale — with mentorship, coaching, and market linkages.",
    icon: TrendingUp,
  },
  {
    title: "Business Development",
    description:
      "Tailored advisory in strategy, fundraising, legal compliance, leadership coaching, and investor readiness.",
    icon: Briefcase,
  },
  {
    title: "Events & Community",
    description:
      "From intimate office hours to multinational conferences — fostering the connections that turn strangers into collaborators.",
    icon: Calendar,
  },
  {
    title: "Co-working & Spaces",
    description:
      "Creative workspaces designed for collaboration and well-being, with high-speed internet, meeting rooms, and wellness amenities.",
    icon: Building2,
  },
  {
    title: "Consulting & Advisory",
    description:
      "Deep expertise in ecosystem development, impact measurement, and institutional strategy for organizations seeking transformation.",
    icon: Lightbulb,
  },
  {
    title: "Research & Insights",
    description:
      "Market research and evidence-generation that powers data-driven decisions for programs, policy, and venture design.",
    icon: BookOpen,
  },
]

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
    cta: "Register on the platform",
    helper: `Create your account · partnerships follow up ${ORGANISATIONAL_RESPONSE_SLA}`,
    href: ORGANISATIONAL_MEMBERSHIP_PATH,
    external: false,
    popular: false,
  },
] as const

const PARTNERS: LandingPartner[] = [
  { name: "Digital Africa", logo: "/partners/digital-africa.svg", href: "https://digitalafrica.co" },
  { name: "Ikigai", logo: "/partners/ikigai.svg", href: "https://ikigai.co.ke" },
  { name: "Stichting DOEN", logo: "/partners/doen.svg", href: "https://www.doen.nl" },
  { name: "ILRI", logo: "/partners/ilri.svg", href: "https://www.ilri.org" },
  { name: "CGIAR", logo: "/partners/cgiar.svg", href: "https://www.cgiar.org" },
  { name: "Amani Institute", logo: "/partners/amani-institute.svg", href: "https://www.amaninstitute.org" },
  { name: "SNDBX Capital", logo: "/partners/sndbx-capital.svg", href: "https://sndbx.capital" },
  { name: "Circular Innovation Hub", logo: "/partners/circular-innovation-hub.svg" },
]

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
      "Choose Organisational membership on this page and register on the platform — no lengthy application. Complete your profile with your institution details and our partnerships team will follow up to co-design programs, events, and bespoke engagement.",
  },
]

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
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-foreground"
      >
        <span className="text-[15px] font-medium leading-snug text-foreground">{question}</span>
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
          "overflow-hidden text-[15px] leading-relaxed text-muted-foreground transition-all",
          isOpen ? "pb-5" : "h-0 pb-0"
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
      if (!res.ok) throw new Error("Failed")
      toast.success("Subscribed!", "You'll receive our weekly impact insights")
      setNewsletterEmail("")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="landing-header sticky top-0 z-50 overflow-x-hidden">
        <div className="container flex h-[4.25rem] min-w-0 items-center justify-between gap-4 px-4 md:px-6">
          <Logo href="/" />

          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Primary"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              />
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="px-4">
                Join the community
              </Button>
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
          <div
            id="landing-mobile-nav"
            className="border-t border-border/70 bg-background md:hidden"
          >
            <nav className="container flex flex-col gap-0.5 px-4 py-4" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  {...link}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  onClick={() => setMobileNavOpen(false)}
                />
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-border/70 pt-4">
                <Link href="/login" onClick={() => setMobileNavOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileNavOpen(false)}>
                  <Button className="w-full">Join the community</Button>
                </Link>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main>
      <section className="hero-wash border-b border-border" aria-labelledby="hero-heading">
        <div className="container px-4 py-20 md:py-28 lg:py-32">
          <div className="landing-hero-accent mx-auto max-w-3xl">
            <p className="section-label mb-5">Impact Hub Nairobi</p>
            <h1
              id="hero-heading"
              className="text-4xl font-semibold tracking-tight text-balance text-foreground md:text-5xl lg:text-[3.25rem] lg:leading-[1.12]"
            >
              Scaling sustainable innovation in Kenya
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl md:leading-relaxed">
              The member platform for programs, workspace, events, and community — built for
              ventures and partners driving measurable impact.
            </p>
            <ul className="mt-10 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {[
                "24,000+ entrepreneurs globally",
                "100+ hubs worldwide",
                "Free community membership",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 rounded-md border border-border/80 bg-background/60 px-3 py-2.5 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Create your account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/20 py-12 md:py-14" aria-label="Global network impact">
        <div className="container px-4">
          <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
            {IMPACT_STATS.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "text-center md:text-left",
                  index > 0 && "md:border-l md:border-border/80 md:pl-6"
                )}
              >
                <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground md:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
            Network-wide figures from Impact Hub Global. Nairobi-specific outcomes are reported
            through programs and annual impact reporting.
          </p>
        </div>
      </section>

      <section id="services" className="landing-section container px-4">
        <SectionHeader
          label="What we do"
          title="Building pathways to impact at scale"
          description="Programs, advisory, spaces, and research — connecting changemakers to collaborate, learn, and build ventures that serve people and the planet."
          className="mb-14 md:mb-16"
        />
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <Card
                key={service.title}
                className="surface-card group border-border/90 transition-colors hover:border-foreground/25"
              >
                <CardHeader className="space-y-4 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-base font-semibold leading-snug">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-[15px] leading-relaxed text-muted-foreground">
                      {service.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      <section id="membership" className="landing-section-alt landing-section">
        <div className="container px-4">
          <SectionHeader
            label="Membership"
            title="Membership options"
            description="From free community access to dedicated venture support and institutional partnerships."
            className="mb-14 md:mb-16"
          />
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3 md:gap-8">
            {MEMBERSHIP_TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  "relative flex flex-col border bg-card shadow-sm",
                  tier.popular
                    ? "border-primary shadow-md shadow-primary/5 ring-1 ring-primary/15"
                    : "border-border"
                )}
              >
                {tier.popular ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                      Recommended
                    </Badge>
                  </div>
                ) : null}
                <CardHeader className="border-b border-border/60 pb-6 text-center">
                  <CardTitle className="text-lg font-semibold">{tier.name}</CardTitle>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-semibold tracking-tight tabular-nums">
                      {tier.price}
                    </span>
                    {tier.period ? (
                      <span className="text-sm text-muted-foreground">{tier.period}</span>
                    ) : null}
                  </div>
                  <CardDescription className="mt-3 text-sm leading-relaxed">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-6 pt-6">
                  <ul className="space-y-3 text-sm leading-relaxed">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                          aria-hidden
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto space-y-2">
                    <p className="text-center text-xs text-muted-foreground leading-relaxed">
                      {tier.helper}
                    </p>
                    {tier.external ? (
                      <a href={tier.href} className="block">
                        <Button
                          className="w-full"
                          variant={tier.popular ? "default" : "outline"}
                        >
                          {tier.cta}
                        </Button>
                      </a>
                    ) : (
                      <Link href={tier.href} className="block">
                        <Button
                          className="w-full"
                          variant={tier.popular ? "default" : "outline"}
                        >
                          {tier.cta}
                          {tier.popular ? (
                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                          ) : null}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section container px-4">
        <SectionHeader
          label="Our ecosystem"
          title="Strategic partners"
          description="Collaborating across sectors to strengthen entrepreneurial communities for impact at scale."
          className="mb-12 md:mb-14"
        />
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PARTNERS.map((partner) => (
            <LandingPartnerLogo key={partner.name} partner={partner} />
          ))}
        </div>
        <p className="mt-10 text-center">
          <Link
            href="/partners"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-opacity hover:opacity-80"
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
            description="Guidance on joining, membership, programs, and using the platform."
            className="mb-12 md:mb-14"
          />
          <div className="mx-auto max-w-3xl rounded-md border border-border bg-card px-5 shadow-sm md:px-6">
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
        <div className="mx-auto max-w-2xl rounded-md border border-border bg-muted/30 px-6 py-10 md:px-10 md:py-12">
          <div className="text-center">
            <p className="section-label mb-3">Newsletter</p>
            <h2 id="newsletter-heading" className="section-title text-2xl md:text-3xl">
              Impact insights
            </h2>
            <p className="section-lead mx-auto mt-3">
              Periodic updates on events, programs, and stories from Kenya&apos;s impact community.
            </p>
          </div>
          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            onSubmit={handleNewsletterSubmit}
          >
            <Input
              type="email"
              placeholder="Work email"
              className="h-11 flex-1 bg-background"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              disabled={newsletterLoading}
              aria-label="Email address"
            />
            <Button type="submit" className="h-11 sm:min-w-[140px]" disabled={newsletterLoading}>
              {newsletterLoading ? "Subscribing…" : "Subscribe"}
              {!newsletterLoading ? <ArrowRight className="ml-2 h-4 w-4" aria-hidden /> : null}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-primary/[0.04] py-20 md:py-24">
        <div className="container space-y-8 px-4 text-center">
          <SectionHeader
            title="Ready to get started?"
            description="Join a global network where locally rooted solutions advance people, planet, and profit — starting in Nairobi."
          />
          <p className="text-sm font-medium text-muted-foreground">
            Part of the global Impact Hub network · 100+ hubs · 60+ countries
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Create your account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </div>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Shield className="h-4 w-4 shrink-0" aria-hidden />
              Secure platform
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
              Free community tier
            </li>
            <li className="flex items-center gap-2">
              <Award className="h-4 w-4 shrink-0" aria-hidden />
              15+ years of impact
            </li>
          </ul>
        </div>
      </section>
      </main>

      <footer className="border-t border-border bg-muted/40 py-14 md:py-16">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <Logo />
              <p className="text-sm text-muted-foreground">
                Kenya&apos;s leading ecosystem for impact-driven innovators — where ventures scale, communities thrive, and solutions shape global change.
              </p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/impacthubnairobi" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://www.linkedin.com/company/impact-hub-nairobi" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="https://twitter.com/ImpactHubNBI" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="landing-footer-heading mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">Community</Link></li>
                <li><Link href="/events" className="text-muted-foreground hover:text-foreground transition-colors">Events &amp; Programs</Link></li>
                <li><Link href="/booking" className="text-muted-foreground hover:text-foreground transition-colors">Book Workspace</Link></li>
                {FEATURE_FLAGS.programsAndResources && (
                  <li><Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">Resources</Link></li>
                )}
                <li><Link href="/partners" className="text-muted-foreground hover:text-foreground transition-colors">Partners</Link></li>
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
                  <span>Ikigai Nairobi, Westlands, Nairobi, Kenya</span>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <a href="https://nairobi.impacthub.net/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                    nairobi.impacthub.net
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/80 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
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
            <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
              Part of the global{" "}
              <a
                href="https://impacthub.net"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-2 hover:underline"
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
