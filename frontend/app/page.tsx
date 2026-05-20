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
} from "lucide-react"
import { Logo } from "@/components/logo"

// ─── Static data (module-level so it's never recreated on render) ─────────────

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it Works" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQs" },
  { href: "https://nairobi.impacthub.net/", label: "About Us", external: true },
] as const

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

const FAQS = [
  {
    question: "How much does it cost to join Impact Hub Nairobi?",
    answer:
      "Membership is free to join! We offer various membership tiers based on your needs. Basic community membership is free, while premium programs have flexible pricing. Contact us to learn more about our membership options.",
  },
  {
    question: "Do I need to be a member to attend events?",
    answer:
      "Many of our events are open to the public, while some exclusive programs and workshops are reserved for members. Check individual event listings for details. Members get priority access and discounted rates.",
  },
  {
    question: "What's the difference between Impact Hub and other innovation spaces?",
    answer:
      "Impact Hub Nairobi is specifically focused on social impact and innovation. We're a community of changemakers. We offer programs, mentorship, access to investors, and a global network of 100+ Impact Hubs. Our mission is to support ventures that create positive social and environmental change.",
  },
  {
    question: "How do I book workspace?",
    answer:
      "Once you're a member, you can book workspace through our platform. Simply log in, go to the 'Book Workspace' section, select your preferred space and time slot, and confirm your booking. You'll receive a confirmation with all the details.",
  },
  {
    question: "What programs and resources are available?",
    answer:
      "We offer a wide range of programs including acceleration programs, incubation support, mentorship sessions, workshops on fundraising and scaling, networking events, and access to our resource library. Check our Events & Programs page for upcoming opportunities.",
  },
  {
    question: "Can I connect with other members?",
    answer:
      "Absolutely! Our community directory allows you to browse member profiles, see their projects and expertise, and connect with them. You can also attend our networking events and join our online community forums.",
  },
  {
    question: "Is Impact Hub Nairobi part of a larger network?",
    answer:
      "Yes! Impact Hub Nairobi is part of the global Impact Hub network with 100+ locations worldwide. This gives you access to a global community of social entrepreneurs, the ability to use other Impact Hub spaces when traveling, and opportunities for international collaboration.",
  },
]

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Join the Community",
    description:
      "Create your profile and connect with 500+ social entrepreneurs, startups, and changemakers.",
    icon: Users,
  },
  {
    step: "2",
    title: "Book Workspace",
    description:
      "Reserve meeting rooms, collaboration zones, and wellness studios at our Ikigai partnership space.",
    icon: Calendar,
  },
  {
    step: "3",
    title: "Access Programs",
    description:
      "Join acceleration programs, access mentorship, and get tools to scale your social impact venture.",
    icon: BookOpen,
  },
  {
    step: "4",
    title: "Create Impact",
    description:
      "Connect with partners, investors, and the public sector to build a just and sustainable society.",
    icon: TrendingUp,
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

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

          {/* Desktop nav */}
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

        {/* Mobile nav drawer */}
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

      {/* Hero Section */}
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
                  Powered by Impact Hub Nairobi
                </Badge>
                <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-tight">
                  Kenya's Platform for
                  <br />
                  <span className="text-primary">Social Entrepreneurs</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Book workspace, access programs, and connect with Nairobi's community of
                  innovators and changemakers.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>500+ Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>200+ Ventures Supported</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Free to Join</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Secure Signup</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link href="/register">
                  <Button size="lg" className="text-base px-8 py-6 bg-primary text-primary-foreground button-press">
                    Join Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-base px-8 py-6 button-press">
                    Already a member? Login
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-foreground/60 pt-2">
                Official platform for Impact Hub Nairobi · Part of the global Impact Hub network · 100+ hubs worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Feature Cards */}
      <section id="features" className="bg-accent/30 py-16 md:py-24">
        <div className="container px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border border-border/50 shadow-card bg-card hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-muted rounded-lg p-2.5">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Grow Your Network</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  Connect with Impact Hub Nairobi's community of 500+ social entrepreneurs, investors, and changemakers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Community Directory</p>
                    <p className="text-xs text-muted-foreground">Browse &amp; connect with members</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-card bg-card hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-muted rounded-lg p-2.5">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Access Programs</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  Acceleration programs, workshops, and mentorship sessions — distributed directly through this platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Upcoming Events</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Active Programs</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                    <Link href="/events">
                      View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-card bg-card hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-muted rounded-lg p-2.5">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Track Your Impact</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  Monitor your progress and engagement with programs and the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-semibold text-foreground">200+</p>
                    <p className="text-xs text-muted-foreground mt-1">Ventures Supported</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-semibold text-foreground">KES 50M+</p>
                    <p className="text-xs text-muted-foreground mt-1">Funding Facilitated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ecosystem / Partners */}
      <section className="container px-4 py-16 md:py-24 bg-muted/20">
        <div className="text-center space-y-4 mb-12">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Our Ecosystem</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Part of a <span className="text-primary">Global Network</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connected with Kenya's leading organizations driving social innovation and entrepreneurship.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <Link
            href="https://ikigai.co.ke"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-card border border-border/40 hover:border-primary/40 hover:bg-background transition-colors"
          >
            <span className="text-base font-semibold text-muted-foreground hover:text-foreground">Ikigai</span>
          </Link>
          <Link
            href="https://acumen.org"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-card border border-border/40 hover:border-primary/40 hover:bg-background transition-colors"
          >
            <span className="text-base font-semibold text-muted-foreground hover:text-foreground">Acumen Fund</span>
          </Link>
          <Link
            href="https://impacthub.net"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-card border border-border/40 hover:border-primary/40 hover:bg-background transition-colors"
          >
            <span className="text-base font-semibold text-muted-foreground hover:text-foreground">Impact Hub Global</span>
          </Link>
          <Link
            href="/partners"
            className="px-6 py-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
          >
            <span className="text-base font-semibold text-primary">View All Partners →</span>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container px-4 py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Loved by <span className="text-primary">Changemakers</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of social entrepreneurs building sustainable impact
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
                <p className="text-muted-foreground mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
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
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-muted/30 py-20 md:py-32">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From sign-up to impact — four simple steps to get the most from the platform.
            </p>
          </div>
          <div className="relative max-w-6xl mx-auto">
            <div className="hidden md:block absolute top-20 left-0 right-0 h-px bg-border/50" />
            <div className="grid md:grid-cols-4 gap-8 relative">
              {HOW_IT_WORKS.map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="text-center space-y-4 relative group">
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="relative bg-muted rounded-full p-4 transition-all border border-border/50 shadow-card">
                          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-xs font-semibold">
                            {item.step}
                          </div>
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </div>
                    {index < HOW_IT_WORKS.length - 1 && (
                      <div className="hidden md:block absolute top-10 -right-4 z-10">
                        <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="text-center mt-12">
            <Link href="/register">
              <Button size="lg" className="shadow-sm">
                Join the Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
            Everything you need to know about Impact Hub Nairobi
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
              Weekly updates on events, programs, and success stories from the Impact Hub Nairobi community.
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
            Your Community Is <span className="text-primary">Waiting</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join Kenya's leading innovation community and start building ventures that create real
            social and environmental change.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Badge variant="outline" className="px-4 py-1.5">
              <Building2 className="h-3 w-3 mr-1.5" />
              Official Impact Hub Nairobi Platform
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
              <span>Secure Signup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Free to Join</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>No Subscription Required</span>
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
                Kenya's leading innovation community for social entrepreneurs and changemakers.
              </p>
              <div className="flex gap-4">
                {/* TODO: Replace # with Impact Hub Nairobi's actual social media profile URLs */}
                <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">Community</Link></li>
                <li><Link href="/events" className="text-muted-foreground hover:text-foreground transition-colors">Events &amp; Programs</Link></li>
                <li><Link href="/partners" className="text-muted-foreground hover:text-foreground transition-colors">Partners &amp; Network</Link></li>
                <li><Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">Projects &amp; Initiatives</Link></li>
                <li><Link href="/news" className="text-muted-foreground hover:text-foreground transition-colors">News &amp; Updates</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="https://nairobi.impacthub.net/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Impact Hub
                  </Link>
                </li>
                <li><a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQs</a></li>
                <li><Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">Resource Library</Link></li>
                <li>
                  <Link href="https://nairobi.impacthub.net/contact" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li><Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Nairobi, Kenya</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <a href="mailto:info@nairobi.impacthub.net" className="hover:text-foreground transition-colors">
                    info@nairobi.impacthub.net
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <Link href="https://nairobi.impacthub.net/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                    nairobi.impacthub.net
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© 2026 Impact Hub Nairobi. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              </div>
            </div>
            <div className="text-center mt-4 text-xs text-muted-foreground">
              <p>
                Part of the global{" "}
                <Link href="https://impacthub.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80 hover:underline">
                  Impact Hub network
                </Link>{" "}
                · 100+ hubs worldwide
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
