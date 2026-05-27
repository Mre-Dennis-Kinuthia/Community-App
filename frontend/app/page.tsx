"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { toast } from "@/lib/toast"
import { getInitials } from "@/lib/utils"
import {
  Calendar,
  Users,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Building2,
  Zap,
  TrendingUp,
  Star,
  Quote,
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
  Leaf,
  Recycle,
  CloudSun,
  BatteryCharging,
  Monitor,
  Heart,
  Briefcase,
  Lightbulb,
  Handshake,
  Target,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { LandingPartnerLogo, type LandingPartner } from "@/components/landing-partner-logo"

const NAV_LINKS = [
  { href: "#services", label: "What We Do" },
  { href: "#programs", label: "Programs" },
  { href: "#membership", label: "Membership" },
  { href: "#impact", label: "Impact" },
  { href: "https://nairobi.impacthub.net/", label: "About Us", external: true },
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

const THEMATIC_AREAS = [
  {
    title: "Agriculture",
    description: "Climate-smart practices, market access, and resilient food systems for farmers and agri-innovators.",
    icon: Leaf,
  },
  {
    title: "Circular Economy",
    description: "Designing and scaling business models that reduce waste and unlock new value chains.",
    icon: Recycle,
  },
  {
    title: "Climate Action",
    description: "Piloting solutions and convening ecosystems that accelerate measurable climate innovation.",
    icon: CloudSun,
  },
  {
    title: "E-Mobility",
    description: "Accelerating the transition to electric mobility with green jobs and sustainable transportation.",
    icon: BatteryCharging,
  },
  {
    title: "Digitization",
    description: "Equipping ventures with tools and technology to digitize operations and unlock growth.",
    icon: Monitor,
  },
  {
    title: "Gender Equity",
    description: "Championing women-led enterprises with tailored resources, networks, and mentorship.",
    icon: Heart,
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

const PROGRAMS = [
  {
    name: "Inclusive Climate Entrepreneurship",
    tag: "Climate",
    description: "Flagship climate venture support delivering training, mentorship, and market linkages to 30+ entrepreneurs per cohort.",
  },
  {
    name: "AI for Sustainable Agriculture",
    tag: "AI & AgriTech",
    description: "Nairobi's largest community-led AI initiative — connecting innovators with real-world climate and agriculture challenges.",
  },
  {
    name: "Circular Economy Program",
    tag: "Circularity",
    description: "Advancing circularity in Kenya's food ecosystem through design-thinking, piloting, and value chain innovation.",
  },
]

const TESTIMONIALS = [
  {
    name: "Sarah Kimani",
    role: "Founder, GreenTech Solutions",
    quote:
      "Impact Hub Nairobi connected me with mentors and investors who believed in my vision. The community support is incredible.",
    rating: 5,
  },
  {
    name: "David Ochieng",
    role: "Social Entrepreneur",
    quote:
      "The programs and resources here have been game-changing. I've scaled my impact from 100 to 5,000 beneficiaries.",
    rating: 4,
  },
  {
    name: "Grace Wanjiru",
    role: "Impact Investor",
    quote:
      "As an investor, I've found some of my best deals through the Impact Hub network. The quality of entrepreneurs here is outstanding.",
    rating: 5,
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
    <div className="border-b border-border/50">
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
      <header className="sticky top-0 z-50 overflow-x-hidden border-b border-border/30 glass">
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
          <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-sm">
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
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-background">
          <div
            className="absolute inset-0 motion-gradient"
            style={{
              background: `radial-gradient(
                ellipse 120% 120% at 50% 50%,
                oklch(0.38 0.18 10 / 0.08) 0%,
                oklch(0.50 0.15 200 / 0.06) 30%,
                oklch(1 0 0) 50%,
                oklch(0.55 0.15 150 / 0.06) 70%,
                oklch(0.38 0.18 10 / 0.08) 100%
              )`,
              backgroundSize: "300% 300%",
            }}
          />
          <div
            className="absolute inset-0 motion-gradient-float"
            style={{
              background: `radial-gradient(
                ellipse 100% 100% at 20% 30%,
                oklch(0.38 0.18 10 / 0.06) 0%,
                transparent 50%
              ),
              radial-gradient(
                ellipse 100% 100% at 80% 70%,
                oklch(0.50 0.15 200 / 0.05) 0%,
                transparent 50%
              ),
              radial-gradient(
                ellipse 80% 80% at 50% 50%,
                oklch(0.55 0.15 150 / 0.04) 0%,
                transparent 60%
              )`,
              backgroundSize: "200% 200%",
              mixBlendMode: "multiply",
              opacity: 0.6,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(oklch(0.15 0 0) 1px, transparent 1px),
                linear-gradient(90deg, oklch(0.15 0 0) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
          <div
            className="absolute inset-0 opacity-28 motion-gradient-pulse"
            style={{
              backgroundImage: `
                radial-gradient(circle 300px at 15% 25%, oklch(0.55 0.20 250 / 0.10) 0%, transparent 100%),
                radial-gradient(circle 250px at 85% 75%, oklch(0.60 0.18 150 / 0.10) 0%, transparent 100%),
                radial-gradient(circle 200px at 50% 50%, oklch(0.65 0.15 300 / 0.08) 0%, transparent 100%)
              `,
            }}
          />
        </div>

        <div className="container relative px-4 py-24 md:py-40 z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center space-y-10 pt-12 animate-in fade-in duration-700">
              <div className="space-y-6">
                <Badge variant="outline" className="px-3 py-1 text-xs">
                  <Zap className="h-3 w-3 mr-1.5" />
                  Part of the Global Impact Hub Network
                </Badge>
                <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-tight">
                  Scaling Sustainable
                  <br />
                  <span className="text-primary">Innovation in Kenya</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  We build thriving ecosystems for impact-driven innovators — delivering programs, advisory,
                  community, and resources that create pathways to sustainable growth.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>24,000+ Entrepreneurs Globally</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>100+ Hubs Worldwide</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Free to Join</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link href="/register">
                  <Button size="lg" className="text-base px-8 py-6 bg-primary text-primary-foreground button-press">
                    Join the Community <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-base px-8 py-6 button-press">
                    Already a member? Login
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-foreground/60 pt-2">
                Kenya&apos;s launchpad for sustainable innovation · Where ventures scale and communities thrive
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Banner */}
      <section className="bg-primary/5 border-y border-border/30 py-12">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            {IMPACT_STATS.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="container px-4 py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">What We Do</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Building Pathways to <span className="text-primary">Impact at Scale</span>
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
              <Card key={service.title} className="border border-border/50 shadow-card bg-card hover:shadow-elevated transition-all group">
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

      {/* Thematic Focus Areas */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-16">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Focus Areas</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Six Themes Driving <span className="text-primary">Change</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our programs and events are organized around the challenges that matter most to Kenya and beyond.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {THEMATIC_AREAS.map((area) => {
              const Icon = area.icon
              return (
                <div
                  key={area.title}
                  className="p-6 rounded-xl border border-border/50 bg-card hover:shadow-card transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-lg p-3 group-hover:bg-primary/15 transition-colors shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-semibold text-base">{area.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{area.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section id="membership" className="container px-4 py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Membership</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Choose Your <span className="text-primary">Path</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you&apos;re just getting started or ready to scale — there&apos;s a tier designed for you.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {MEMBERSHIP_TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={`border shadow-card bg-card relative ${
                tier.popular ? "border-primary shadow-elevated scale-[1.02]" : "border-border/50"
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
                <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                <div className="pt-2">
                  <span className="text-3xl font-bold">{tier.price}</span>
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

      {/* Programs */}
      <section id="programs" className="bg-accent/30 py-20 md:py-32">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-16">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Flagship Programs</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Where Innovation <span className="text-primary">Takes Shape</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Structured support that moves ventures from promise to proof — across climate, agriculture, AI, and circularity.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {PROGRAMS.map((program) => (
              <Card key={program.name} className="border border-border/50 shadow-card bg-card hover:shadow-elevated transition-all">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2 text-xs">{program.tag}</Badge>
                  <CardTitle className="text-lg font-semibold">{program.name}</CardTitle>
                  <CardDescription className="leading-relaxed">{program.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/events">
              <Button variant="outline" size="lg">
                Explore All Programs & Events <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Results */}
      <section id="impact" className="container px-4 py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Our Impact</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Results That <span className="text-primary">Speak</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="text-center p-6 rounded-xl border border-border/50 bg-card">
            <p className="text-3xl font-bold text-foreground">2,500+</p>
            <p className="text-sm text-muted-foreground mt-1">Participants Engaged</p>
          </div>
          <div className="text-center p-6 rounded-xl border border-border/50 bg-card">
            <p className="text-3xl font-bold text-foreground">1,460</p>
            <p className="text-sm text-muted-foreground mt-1">New Ventures Created</p>
          </div>
          <div className="text-center p-6 rounded-xl border border-border/50 bg-card">
            <p className="text-3xl font-bold text-foreground">4,000+</p>
            <p className="text-sm text-muted-foreground mt-1">Jobs Generated</p>
          </div>
          <div className="text-center p-6 rounded-xl border border-border/50 bg-card">
            <p className="text-3xl font-bold text-foreground">4.8/5</p>
            <p className="text-sm text-muted-foreground mt-1">Average Satisfaction Score</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
          <div className="text-center p-5 rounded-xl bg-muted/50">
            <p className="text-xl font-semibold">85%</p>
            <p className="text-xs text-muted-foreground mt-1">Members Collaborate with Peers</p>
          </div>
          <div className="text-center p-5 rounded-xl bg-muted/50">
            <p className="text-xl font-semibold">50%</p>
            <p className="text-xs text-muted-foreground mt-1">Achieved Double-Digit Revenue Growth</p>
          </div>
          <div className="text-center p-5 rounded-xl bg-muted/50">
            <p className="text-xl font-semibold">400K+</p>
            <p className="text-xs text-muted-foreground mt-1">Hours of Peer Support</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Voices from the <span className="text-primary">Community</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from the changemakers building impact through our ecosystem
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="border border-border/50 shadow-card bg-card hover:shadow-elevated transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating ? "fill-primary text-primary" : "text-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-6 leading-relaxed italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(testimonial.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="container px-4 py-16 md:py-24">
        <div className="text-center space-y-4 mb-12">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Our Ecosystem</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Strategic <span className="text-primary">Partners</span>
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

      {/* Collaboration CTA */}
      <section className="bg-primary/5 py-16 md:py-20">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Handshake className="h-10 w-10 text-primary mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Partner With Us
            </h2>
            <p className="text-lg text-muted-foreground">
              Co-host events, sponsor programs, co-design initiatives, or explore strategic partnerships
              that align with your mission and amplify your reach.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/partners">
                <Button size="lg" className="bg-primary text-primary-foreground">
                  Explore Partnerships <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="mailto:nairobi@impacthub.net">
                <Button size="lg" variant="outline">
                  Get In Touch
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container px-4 py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Frequently Asked <span className="text-primary">Questions</span>
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
        <Card className="border border-border/50 shadow-card bg-card max-w-2xl mx-auto">
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
                className="bg-primary text-primary-foreground button-press"
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
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Ready to Build Something <span className="text-primary">Meaningful</span>?
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
              <Button size="lg" className="text-base px-8 py-6 bg-primary text-primary-foreground button-press">
                Join the Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8 py-6 button-press">
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
      <footer className="border-t border-border/50 bg-muted/30 py-12">
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
                <li><Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">Resources</Link></li>
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

          <div className="border-t border-border/50 pt-8">
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
