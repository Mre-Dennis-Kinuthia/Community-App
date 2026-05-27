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
  Users,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Building2,
  TrendingUp,
  ChevronDown,
  Mail,
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
    cta: "Join Free",
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
    cta: "Get Started",
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
    cta: "Contact Us",
    popular: false,
  },
]

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
      "We work with corporates, development organizations, and NGOs through co-hosted events, program co-design, sponsorships, and strategic partnerships. Reach out to our partnerships team to explore alignment.",
  },
]

interface AccordionItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function AccordionItem({ question, answer, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left group"
      >
        <span className="font-medium text-base">{question}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform text-muted-foreground ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-muted-foreground leading-relaxed">{answer}</div>
      )}
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
      {/* Header */}
      <header className="sticky top-0 z-50 overflow-x-hidden border-b border-border/30 surface-header">
        <div className="container flex h-16 min-w-0 items-center justify-between gap-4 px-4 md:px-6">
          <Logo href="/" />

          <nav className="hidden md:flex items-center gap-8 text-sm">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                className="text-foreground/70 hover:text-foreground transition-colors"
              />
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:flex text-foreground/70 hover:text-foreground">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary text-primary-foreground">Join Now</Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle menu"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="md:hidden border-t border-border/30 bg-background">
            <nav className="container px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  {...link}
                  className="px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  onClick={() => setMobileNavOpen(false)}
                />
              ))}
              <div className="pt-2 mt-2 border-t border-border/30">
                <Link href="/login" onClick={() => setMobileNavOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="hero-wash border-b border-border">
        <div className="container px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <p className="section-label mb-4">Impact Hub Nairobi · Member platform</p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Scaling sustainable innovation in Kenya
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Connect with changemakers, book workspace, join events, and access the programs that
              support impact-driven ventures.
            </p>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                24,000+ entrepreneurs globally
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                100+ hubs worldwide
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                Free to join
              </li>
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/register">
                <Button size="lg">
                  Join the community
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Banner */}
      <section className="border-b border-border bg-muted/30 py-10">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            {IMPACT_STATS.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-2xl font-semibold tabular-nums text-foreground md:text-3xl">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
            Network-wide figures from Impact Hub Global. Nairobi-specific metrics are shared in programs and annual reporting.
          </p>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="container px-4 py-16 md:py-24">
        <div className="text-center space-y-4 mb-16">
          <p className="section-label">What We Do</p>
          <h2 className="section-title">
            Building pathways to impact at scale
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A unique blend of services connecting and enabling changemakers to collaborate, learn,
            and build successful ventures that serve people and the planet.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <Card key={service.title} className="surface-card transition-colors hover:border-foreground/20 group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 rounded-lg p-2.5 group-hover:bg-primary/15 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{service.title}</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Membership Tiers */}
      <section id="membership" className="container px-4 py-16 md:py-24">
        <div className="text-center space-y-4 mb-16">
          <p className="section-label">Membership</p>
          <h2 className="section-title">
            Choose your membership
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you&apos;re just getting started or ready to scale — there&apos;s a tier designed for you.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {MEMBERSHIP_TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={`border  bg-card relative ${
                tier.popular ? "border-primary ring-1 ring-primary/20" : "border-border"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-semibold">{tier.name}</CardTitle>
                <div className="pt-2">
                  <span className="text-3xl font-semibold">{tier.price}</span>
                  {tier.period && <span className="text-muted-foreground text-sm">{tier.period}</span>}
                </div>
                <CardDescription className="pt-2">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block pt-2">
                  <Button
                    className={`w-full ${tier.popular ? "bg-primary text-primary-foreground" : ""}`}
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="container px-4 py-16 md:py-24">
        <div className="text-center space-y-4 mb-12">
          <p className="section-label">Our Ecosystem</p>
          <h2 className="section-title">
            Strategic partners
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Collaborating with organizations across sectors to build entrepreneurial communities for impact at scale.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {PARTNERS.map((partner) => (
            <LandingPartnerLogo key={partner.name} partner={partner} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/partners"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
          >
            View all partners <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container px-4 py-16 md:py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="section-title">
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about joining and engaging with Impact Hub Nairobi
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-2">
          {FAQS.map((faq, index) => (
            <AccordionItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFAQ === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container px-4 py-16 md:py-24">
        <Card className="border border-border  bg-card max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-semibold">Stay in the Loop</CardTitle>
            <CardDescription className="text-base">
              Weekly updates on events, programs, and stories from Kenya&apos;s most active impact community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleNewsletterSubmit}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                disabled={newsletterLoading}
              />
              <Button
                type="submit"
                className="bg-primary text-primary-foreground "
                disabled={newsletterLoading}
              >
                {newsletterLoading ? "Subscribing…" : "Subscribe"}
                {!newsletterLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-3">No spam. Unsubscribe anytime.</p>
          </CardContent>
        </Card>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 text-center space-y-8">
          <h2 className="section-title">
            Ready to get started?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join a community where business and profit are used to serve people and the planet —
            and where locally rooted solutions shape global change.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Badge variant="outline" className="px-4 py-1.5">
              <Globe className="h-3 w-3 mr-1.5" />
              Part of the Global Impact Hub Network
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-base px-8 py-6 bg-primary text-primary-foreground ">
                Join the Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8 py-6 ">
                Login
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Free Community Tier</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>15+ Years of Impact</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
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
              <h3 className="font-semibold mb-4">Platform</h3>
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
              <h3 className="font-semibold mb-4">Learn More</h3>
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
                <li><Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Ikigai Nairobi, Westlands, Nairobi, Kenya</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <a href="mailto:nairobi@impacthub.net" className="hover:text-foreground transition-colors">
                    nairobi@impacthub.net
                  </a>
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

          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>&copy; 2026 Impact Hub Nairobi. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              </div>
            </div>
            <div className="text-center mt-4 text-xs text-muted-foreground">
              <p>
                Part of the global{" "}
                <a href="https://impacthub.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80 hover:underline">
                  Impact Hub network
                </a>{" "}
                &middot; 100+ hubs &middot; 60+ countries &middot; 15+ years of impact
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
