"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Building2,
  Sparkles,
  Zap,
  TrendingUp,
  Star,
  Quote,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Instagram,
  Shield,
  Award,
  Globe
} from "lucide-react"
import { useState } from "react"

// Accordion component for FAQ
function AccordionItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border/50">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left hover:text-primary transition-colors"
      >
        <span className="font-semibold text-lg">{question}</span>
        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-4 text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const testimonials = [
    {
      name: "Sarah Kimani",
      role: "Founder, GreenTech Solutions",
      avatar: "/placeholder-user.jpg",
      quote: "Impact Hub Nairobi connected me with mentors and investors who believed in my vision. The community support is incredible.",
      rating: 5,
    },
    {
      name: "David Ochieng",
      role: "Social Entrepreneur",
      avatar: "/placeholder-user.jpg",
      quote: "The programs and resources here have been game-changing. I've scaled my impact from 100 to 5,000 beneficiaries.",
      rating: 5,
    },
    {
      name: "Grace Wanjiru",
      role: "Impact Investor",
      avatar: "/placeholder-user.jpg",
      quote: "As an investor, I've found some of my best deals through the Impact Hub network. The quality of entrepreneurs here is outstanding.",
      rating: 5,
    },
  ]

  const faqs = [
    {
      question: "How much does it cost to join Impact Hub Nairobi?",
      answer: "Membership is free to join! We offer various membership tiers based on your needs. Basic community membership is free, while workspace access and premium programs have flexible pricing. Contact us to learn more about our membership options.",
    },
    {
      question: "Do I need to be a member to attend events?",
      answer: "Many of our events are open to the public, while some exclusive programs and workshops are reserved for members. Check individual event listings for details. Members get priority access and discounted rates.",
    },
    {
      question: "What's the difference between Impact Hub and other coworking spaces?",
      answer: "Impact Hub Nairobi is specifically focused on social impact and innovation. We're not just a workspace—we're a community of changemakers. We offer programs, mentorship, access to investors, and a global network of 100+ Impact Hubs. Our mission is to support ventures that create positive social and environmental change.",
    },
    {
      question: "How do I book workspace?",
      answer: "Once you're a member, you can book workspace through our platform. Simply log in, go to the 'Book Workspace' section, select your preferred space and time slot, and confirm your booking. You'll receive a confirmation email with all the details.",
    },
    {
      question: "What programs and resources are available?",
      answer: "We offer a wide range of programs including acceleration programs, incubation support, mentorship sessions, workshops on fundraising and scaling, networking events, and access to our resource library. Check our Events & Programs page for upcoming opportunities.",
    },
    {
      question: "Can I connect with other members?",
      answer: "Absolutely! Our community directory allows you to browse member profiles, see their projects and expertise, and connect with them. You can also attend our networking events and join our online community forums.",
    },
    {
      question: "Is Impact Hub Nairobi part of a larger network?",
      answer: "Yes! Impact Hub Nairobi is part of the global Impact Hub network with 100+ locations worldwide. This gives you access to a global community of social entrepreneurs, the ability to use other Impact Hub spaces when traveling, and opportunities for international collaboration.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Impact Hub Nairobi</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/community" className="hover:text-primary transition-colors">Members</Link>
            <Link href="/events" className="hover:text-primary transition-colors">Programs</Link>
            <Link href="/partners" className="hover:text-primary transition-colors">Partners</Link>
            <Link href="#faq" className="hover:text-primary transition-colors">FAQs</Link>
            <Link href="https://nairobi.impacthub.net/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">About Us</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:flex">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="shadow-sm">Join Now</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Dark with Grid Pattern */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="container relative px-4 py-20 md:py-32">
          <div className="max-w-5xl mx-auto">
            {/* Floating Member Cards */}
            <div className="absolute top-10 right-10 hidden lg:block">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 w-48">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/50">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>SK</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">Sarah Kimani</p>
                    <p className="text-xs text-white/70">245 connections</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="absolute top-40 left-10 hidden lg:block">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 w-48">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/50">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>DO</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">David Ochieng</p>
                    <p className="text-xs text-white/70">12 projects</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Hero Content */}
            <div className="text-center space-y-8 pt-20">
              <div className="space-y-6">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight">
                  <span className="text-primary">#</span>Social Entrepreneurs.
                  <br />
                  <span className="relative inline-block">
                    Innovators.
                    <span className="absolute -top-2 -right-8 text-primary text-4xl">↑</span>
                  </span>
                  <br />
                  <span className="relative inline-block">
                    Empowered
                    <span className="text-primary">$</span>
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                  Join Kenya's leading innovation community. Connect with changemakers, 
                  access resources, and build sustainable solutions for local and global challenges.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
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

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                <Link href="/register">
                  <Button size="lg" className="text-base px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary shadow-lg">
                    JOIN NOW <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-base px-8 py-6 border-2 border-white/30 bg-white/5 hover:bg-white/10 text-white">
                    Already a member? Login
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-white/60 pt-4">
                Part of the global Impact Hub network • 100+ hubs worldwide • Supporting social innovation since 2022
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Feature Cards - Bottom Section */}
      <section className="bg-accent/30 py-16 md:py-24">
        <div className="container px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Card 1: Community Growth */}
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Grow Your Network</CardTitle>
                </div>
                <CardDescription>
                  Connect with 500+ social entrepreneurs, investors, and changemakers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>SK</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sarah Kimani</p>
                    <p className="text-xs text-muted-foreground">245 connections</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary">+12 this week</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Programs & Resources */}
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Access Programs</CardTitle>
                </div>
                <CardDescription>
                  Join acceleration programs, workshops, and mentorship sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-primary/5 rounded">
                    <span className="text-sm font-medium">Upcoming Events</span>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-primary/5 rounded">
                    <span className="text-sm font-medium">Active Programs</span>
                    <Badge variant="secondary">5</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                    <Link href="/events">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Impact Metrics */}
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Track Your Impact</CardTitle>
                </div>
                <CardDescription>
                  Monitor your progress and community engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-2xl font-bold text-primary">200+</p>
                    <p className="text-xs text-muted-foreground">Ventures Supported</p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-2xl font-bold text-primary">KES 50M+</p>
                    <p className="text-xs text-muted-foreground">Funding Facilitated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
      <section className="container px-4 py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Loved by{" "}
            <span className="text-primary">Changemakers</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of social entrepreneurs building sustainable impact
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border/50 hover:shadow-card transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Impact Hub is{" "}
              <span className="text-primary">Simple</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                title: "Join the Community",
                description: "Create your profile and connect with 500+ social entrepreneurs, startups, and changemakers.",
                icon: Users,
              },
              {
                step: "2",
                title: "Book Workspace",
                description: "Reserve meeting rooms, collaboration zones, and wellness studios at our Ikigai partnership space.",
                icon: Calendar,
              },
              {
                step: "3",
                title: "Access Programs",
                description: "Join acceleration programs, access mentorship, and get tools to scale your social impact venture.",
                icon: BookOpen,
              },
              {
                step: "4",
                title: "Create Impact",
                description: "Connect with partners, investors, and the public sector to build a just and sustainable society.",
                icon: TrendingUp,
              },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
                      <div className="relative bg-primary/10 rounded-full p-4">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-primary">Step {item.step}</div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
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

      {/* FAQ Section */}
      <section id="faq" className="container px-4 py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Frequently Asked{" "}
            <span className="text-primary">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Impact Hub Nairobi
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-2">
          {faqs.map((faq, index) => (
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

      {/* Final CTA */}
      <section className="bg-primary/5 py-20 md:py-32">
        <div className="container px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Ready to build a{" "}
            <span className="text-primary">just and sustainable</span>{" "}
            future?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join Impact Hub Nairobi and connect with entrepreneurs, partners, investors, 
            and the public sector to create lasting social impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-base px-8 py-6 shadow-sm">
                Join the Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8 py-6">
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
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-12">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg">Impact Hub Nairobi</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Kenya's leading innovation community for social entrepreneurs and changemakers.
              </p>
              <div className="flex gap-4">
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-muted-foreground hover:text-foreground transition-colors">
                    Events & Programs
                  </Link>
                </li>
                <li>
                  <Link href="/partners" className="text-muted-foreground hover:text-foreground transition-colors">
                    Partners & Network
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
                    Projects & Initiatives
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="text-muted-foreground hover:text-foreground transition-colors">
                    News & Updates
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="https://nairobi.impacthub.net/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Impact Hub
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                    Resource Library
                  </Link>
                </li>
                <li>
                  <Link href="https://nairobi.impacthub.net/contact" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
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
                <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
              </div>
            </div>
            <div className="text-center mt-4 text-xs text-muted-foreground">
              <p>
                Part of the global{" "}
                <Link 
                  href="https://impacthub.net" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Impact Hub network
                </Link>
                {" "}• 100+ hubs worldwide
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
