import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  TrendingUp
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Impact Hub Nairobi</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="shadow-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center px-4 py-20 md:py-32 text-center space-y-8">
        <div className="space-y-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight">
            Work For{" "}
            <span className="text-primary">Yourself</span>.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Impact Hub Nairobi helps you book spaces, connect with innovators, 
            and grow your business. All in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/register">
              <Button size="lg" className="text-base px-8 py-6 shadow-sm">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8 py-6">
                Already a member? Login
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            Used by over 500+ entrepreneurs and innovators in Nairobi
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section className="container px-4 py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Impact Hub is Simple.
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            {
              step: "1",
              title: "Join the Community",
              description: "Create your profile and connect with like-minded entrepreneurs and innovators.",
              icon: Users,
            },
            {
              step: "2",
              title: "Book Your Space",
              description: "Reserve meeting rooms, workspaces, or event spaces in minutes.",
              icon: Calendar,
            },
            {
              step: "3",
              title: "Access Resources",
              description: "Get templates, guides, and tools to help your business grow.",
              icon: BookOpen,
            },
            {
              step: "4",
              title: "Make Connections",
              description: "Network with members, attend events, and build your business.",
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
              Start now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Who it's For */}
      <section className="bg-muted/30 py-20 md:py-32">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Impact Hub is for{" "}
              <span className="text-primary">Innovators</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              "Entrepreneurs",
              "Startup Founders",
              "Freelancers",
              "Designers",
              "Developers",
              "Consultants",
              "Event Organizers",
              "Community Builders",
            ].map((role, index) => (
              <Card
                key={index}
                className="text-center border-border/50 hover:shadow-card transition-all cursor-pointer"
              >
                <CardContent className="pt-6">
                  <p className="text-lg font-medium">{role}.</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground">And you.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container px-4 py-20 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Everything you need to{" "}
            <span className="text-primary">grow your business</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            {
              title: "Space Booking",
              description: "Reserve meeting rooms and workspaces instantly",
              icon: Calendar,
            },
            {
              title: "Community Directory",
              description: "Connect with innovators and entrepreneurs",
              icon: Users,
            },
            {
              title: "Resource Library",
              description: "Access guides, templates, and business tools",
              icon: BookOpen,
            },
            {
              title: "Attendance Tracking",
              description: "Log your hub visits and track your presence",
              icon: Clock,
            },
            {
              title: "Member Profiles",
              description: "Showcase your skills and connect with others",
              icon: Sparkles,
            },
            {
              title: "Event Management",
              description: "Discover and join community events",
              icon: Zap,
            },
            {
              title: "Analytics Dashboard",
              description: "Track your bookings and community engagement",
              icon: TrendingUp,
            },
            {
              title: "24/7 Access",
              description: "Check in anytime and work on your schedule",
              icon: CheckCircle2,
            },
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="border-border/50 hover:shadow-card transition-all"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary/5 py-20 md:py-32">
        <div className="container px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Life is too short to work alone.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join a community of innovators, entrepreneurs, and creators building the future in Nairobi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-base px-8 py-6 shadow-sm">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8 py-6">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-semibold">Impact Hub Nairobi</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="/login" className="hover:text-foreground transition-colors">
                Login
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 Impact Hub Nairobi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
