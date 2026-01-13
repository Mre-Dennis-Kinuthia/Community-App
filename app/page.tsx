"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { toast } from "@/lib/toast"
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
  Globe,
  Lightbulb
} from "lucide-react"

// Accordion component for FAQ
interface AccordionItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  key?: number | string // React's special key prop
}

function AccordionItem({ 
  question, 
  answer, 
  isOpen, 
  onToggle 
}: AccordionItemProps) {
  return (
    <div className="border-b border-border/50">
      <button
        onClick={onToggle}
        className="w-full py-4 flex items-center justify-between text-left  group"
      >
        <span className="font-medium text-base">{question}</span>
        <ChevronDown className={`h-4 w-4 transition-transform text-muted-foreground ${isOpen ? 'rotate-180' : ''}`} />
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
  const router = useRouter()
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [weeklyJoiners, setWeeklyJoiners] = useState(12)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  // Animated counter effect
  useEffect(() => {
    const interval = setInterval(() => {
      setWeeklyJoiners((prev: number) => {
        const newValue = prev + Math.floor(Math.random() * 3)
        return newValue > 20 ? 12 : newValue
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

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
      {/* Header - Apple Style */}
      <header className="sticky top-0 z-50 border-b border-border/30 glass">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <div className="flex flex-col">
              <span className="font-semibold text-base leading-tight">Community Platform</span>
              <span className="text-xs text-muted-foreground leading-tight">Powered by Impact Hub Nairobi</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#how-it-works" className="text-foreground/70 ">How it Works</a>
            <a href="#testimonials" className="text-foreground/70 ">Testimonials</a>
            <a href="#features" className="text-foreground/70 ">Features</a>
            <a href="#faq" className="text-foreground/70 ">FAQs</a>
            <Link href="https://nairobi.impacthub.net/" target="_blank" rel="noopener noreferrer" className="text-foreground/70 ">About Us</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:flex text-foreground/70 hover:text-foreground">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary text-primary-foreground ">Join Now</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Apple Style Clean & Minimal */}
      <section className="relative overflow-hidden bg-background">
        {/* Background Image with Overlay - Innovation & Community Theme */}
        <div className="absolute inset-0 bg-background">
          {/* Animated base gradient - seamless and uniform */}
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
              backgroundSize: '300% 300%',
            }}
          />
          {/* Secondary gradient layer for depth - very subtle */}
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
              backgroundSize: '200% 200%',
              mixBlendMode: 'multiply',
              opacity: 0.6,
            }}
          />
          {/* Subtle network/connection pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(oklch(0.15 0 0) 1px, transparent 1px),
                linear-gradient(90deg, oklch(0.15 0 0) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          {/* Additional depth with subtle circles - animated */}
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
          <div className="max-w-5xl mx-auto bg-transparent">
            {/* Floating Startup Cards - Apple Style Subtle */}
            <div className="absolute top-10 right-10 hidden lg:block animate-in fade-in duration-700 delay-300">
              <Card className="shadow-card border border-border/50 p-4 w-52 bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">New Startup</p>
                    <p className="text-xs text-muted-foreground">Just launched</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="absolute top-40 left-10 hidden lg:block animate-in fade-in duration-700 delay-500">
              <Card className="shadow-card border border-border/50 p-4 w-52 bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Growing Venture</p>
                    <p className="text-xs text-muted-foreground">Scaling up</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Hero Content - Apple Style */}
            <div className="text-center space-y-10 pt-12 animate-in fade-in duration-700">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-tight">
                  Social Entrepreneurs.
                  <br />
                  Innovators.
                  <br />
                  Empowered.
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Impact Hub Nairobi's digital platform connecting Kenya's innovation community. 
                  Access programs, resources, and opportunities distributed through our network.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Badge variant="outline" className="px-3 py-1 text-xs">
                    <Zap className="h-3 w-3 mr-1.5" />
                    Powered by Impact Hub Nairobi
                  </Badge>
                </div>
              </div>

              {/* Trust Badges - Apple Style */}
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

              {/* Urgency Elements - Apple Style */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Badge variant="secondary" className="px-4 py-1.5">
                  <Sparkles className="h-3 w-3 mr-1.5" />
                  Limited spots in upcoming programs
                </Badge>
                <Badge variant="secondary" className="px-4 py-1.5">
                  <Users className="h-3 w-3 mr-1.5" />
                  Join {weeklyJoiners} others this week
                </Badge>
              </div>

              {/* CTA Buttons - Apple Style */}
              <div className="flex flex-col gap-4 justify-center items-center pt-8">
                <Link href="/register">
                  <Button size="lg" className="text-base px-8 py-6 bg-primary text-primary-foreground  button-press">
                    JOIN NOW <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                {/* Social Login Options */}
                <div className="flex flex-col gap-3 w-full max-w-sm">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 border-border/50 hover:bg-accent/50"
                      onClick={() => {
                        // TODO: Implement Google OAuth
                        toast.success("Google login coming soon")
                      }}
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 border-border/50 hover:bg-accent/50"
                      onClick={() => {
                        // TODO: Implement LinkedIn OAuth
                        toast.success("LinkedIn login coming soon")
                      }}
                    >
                      <Linkedin className="h-5 w-5 mr-2" />
                      LinkedIn
                    </Button>
                  </div>
                </div>
                
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-base px-8 py-6 button-press">
                    Already a member? Login
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-foreground pt-4">
                Official distribution channel for Impact Hub Nairobi programs and resources • 
                Part of the global Impact Hub network • 100+ hubs worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Feature Cards - Bottom Section */}
      <section className="bg-accent/30 py-16 md:py-24">
        <div className="container px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Card 1: Community Growth - Apple Style */}
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
                    <p className="text-sm font-medium">New Startup</p>
                    <p className="text-xs text-muted-foreground">Recently launched</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">+5 this week</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Programs & Resources - Apple Style */}
            <Card className="border border-border/50 shadow-card bg-card hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-muted rounded-lg p-2.5">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Access Programs</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  Access Impact Hub Nairobi's acceleration programs, workshops, and mentorship sessions distributed through this platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Upcoming Events</span>
                    <Badge className="bg-primary text-primary-foreground">12</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Active Programs</span>
                    <Badge className="bg-primary text-primary-foreground">5</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                    <Link href="/events">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Impact Metrics - Apple Style */}
            <Card className="border border-border/50 shadow-card bg-card hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-muted rounded-lg p-2.5">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Track Your Impact</CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  Monitor your progress and engagement with Impact Hub Nairobi's programs and community
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

      {/* Partner Logos Section */}
      <section className="container px-4 py-16 md:py-24 bg-muted/20">
        <div className="text-center space-y-4 mb-12">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Platform Partners</p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Powered by <span className="text-primary">Impact Hub Nairobi</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This platform is Impact Hub Nairobi's official distribution channel for programs, resources, and community connections.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60 hover:opacity-100 transition-opacity">
          {/* Partner Logos - Using text/placeholders for now, replace with actual logos */}
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-muted-foreground" />
            <span className="text-lg font-semibold text-muted-foreground">Ikigai</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
            <span className="text-lg font-semibold text-muted-foreground">Acumen Fund</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-8 w-8 text-muted-foreground" />
            <span className="text-lg font-semibold text-muted-foreground">Impact Hub Global</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-8 w-8 text-muted-foreground" />
            <span className="text-lg font-semibold text-muted-foreground">Partners</span>
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
      <section id="testimonials" className="container px-4 py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Loved by{" "}
            <span className="text-primary">Changemakers</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of social entrepreneurs building sustainable impact
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border border-border/50 shadow-card bg-card hover:shadow-elevated transition-all">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-muted-foreground/30 mb-4" />
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
      <section id="how-it-works" className="bg-muted/30 py-20 md:py-32">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Access Impact Hub Nairobi{" "}
              <span className="text-primary">Resources</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform distributes Impact Hub Nairobi's programs, connections, and opportunities directly to you.
            </p>
          </div>
          <div className="relative max-w-6xl mx-auto">
            {/* Premium Connecting Line (hidden on mobile) */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-px bg-border/50" />
            
            <div className="grid md:grid-cols-4 gap-8 relative">
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
                  <div key={index} className="text-center space-y-4 relative group">
                    {/* Step Number Badge */}
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
                    
                    {/* Arrow (hidden on mobile, shown between steps) */}
                    {index < 3 && (
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

      {/* Newsletter Signup Section */}
      <section className="container px-4 py-16 md:py-24">
        <Card className="border border-border/50 shadow-card bg-card max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-semibold">
              Get Weekly Impact Insights
            </CardTitle>
            <CardDescription className="text-base">
              Get updates on Impact Hub Nairobi's events, programs, and success stories distributed through our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => {
              e.preventDefault()
              toast.success("Subscribed!", "You'll receive our weekly impact insights")
            }}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                required
              />
              <Button type="submit" className="bg-primary text-primary-foreground  button-press">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-3">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Final CTA - Apple Style */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Access Impact Hub Nairobi's{" "}
            <span className="text-primary">Innovation Ecosystem</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our platform to access Impact Hub Nairobi's programs, connect with the community, 
            and leverage resources distributed through our network.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Badge variant="outline" className="px-4 py-1.5">
              <Building2 className="h-3 w-3 mr-1.5" />
              Official Impact Hub Nairobi Platform
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-base px-8 py-6 bg-primary text-primary-foreground  button-press">
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
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground ">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground ">
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground ">
                  <Instagram className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/community" className="text-muted-foreground ">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-muted-foreground ">
                    Events & Programs
                  </Link>
                </li>
                <li>
                  <Link href="/partners" className="text-muted-foreground ">
                    Partners & Network
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="text-muted-foreground ">
                    Projects & Initiatives
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="text-muted-foreground ">
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
                  <Link href="https://nairobi.impacthub.net/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground ">
                    About Impact Hub
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-muted-foreground ">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-muted-foreground ">
                    Resource Library
                  </Link>
                </li>
                <li>
                  <Link href="https://nairobi.impacthub.net/contact" target="_blank" rel="noopener noreferrer" className="text-muted-foreground ">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-muted-foreground ">
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
                  <a href="mailto:info@nairobi.impacthub.net" className="">
                    info@nairobi.impacthub.net
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <Link href="https://nairobi.impacthub.net/" target="_blank" rel="noopener noreferrer" className="">
                    nairobi.impacthub.net
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div className="flex flex-col items-center md:items-start">
                <p>© 2026 Impact Hub Nairobi. All rights reserved.</p>
                <p className="text-xs mt-1">This platform is powered by and distributed by Impact Hub Nairobi.</p>
              </div>
              <div className="flex gap-6">
                <Link href="#" className="">Privacy Policy</Link>
                <Link href="#" className="">Terms of Service</Link>
              </div>
            </div>
            <div className="text-center mt-4 text-xs text-muted-foreground">
              <p>
                Part of the global{" "}
                <Link 
                  href="https://impacthub.net" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:opacity-80 hover:underline"
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