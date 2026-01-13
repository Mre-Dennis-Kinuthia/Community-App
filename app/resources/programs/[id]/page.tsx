"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft,
  CheckCircle2,
  Users,
  Calendar,
  Target,
  GraduationCap,
  Rocket,
  TrendingUp,
  DollarSign,
  ExternalLink
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Separator } from "@/components/ui/separator"

// This would normally come from an API or database
const programOpportunities = [
  {
    id: 1,
    title: "Mentorship Program",
    type: "Mentorship",
    category: "Support",
    status: "Open for Applications",
    description: "Get matched with experienced mentors in your field. Our mentorship program connects you with industry leaders, investors, and successful entrepreneurs for one-on-one guidance.",
    benefits: [
      "One-on-one mentorship sessions",
      "Access to expert network",
      "Quarterly check-ins",
      "Goal-setting support",
      "Career development guidance",
      "Industry insights and connections"
    ],
    eligibility: "Open to all Impact Hub Nairobi members",
    duration: "Ongoing - 6-month cycles",
    thumbnail: "/placeholder.svg",
    programLead: "Sarah Kamau",
    programLeadAvatar: "/placeholder-user.jpg",
    featured: true,
    tags: ["Mentorship", "Networking", "Support"],
    applicationLink: "#",
    fullDescription: "The Mentorship Program at Impact Hub Nairobi connects social entrepreneurs with experienced mentors who provide personalized guidance, industry insights, and strategic advice. Our mentors are successful entrepreneurs, investors, and industry leaders committed to supporting the next generation of social innovators. Whether you're just starting out or scaling your venture, our mentorship program provides the support and connections you need to succeed.",
    requirements: [
      "Active Impact Hub Nairobi membership",
      "Commitment to attending scheduled sessions",
      "Openness to feedback and guidance",
      "Clear goals and objectives for mentorship"
    ],
    applicationProcess: [
      "Complete application form",
      "Participate in initial assessment",
      "Get matched with suitable mentor",
      "Begin mentorship journey"
    ]
  },
  {
    id: 2,
    title: "Incubation Program",
    type: "Incubation",
    category: "Early Stage",
    status: "Open for Applications",
    description: "12-week intensive program for early-stage social impact startups. Provides workspace, mentorship, access to our partner network, and opportunities for seed funding.",
    benefits: [
      "12-week structured program",
      "Dedicated workspace",
      "Industry mentor matching",
      "Access to partner network",
      "Seed funding opportunities",
      "Demo day presentation",
      "Legal and compliance support",
      "Access to Impact Hub global network"
    ],
    eligibility: "Early-stage startups (0-2 years), social impact focus",
    duration: "12 weeks per cohort",
    thumbnail: "/placeholder.svg",
    programLead: "James Mwangi",
    programLeadAvatar: "/placeholder-user.jpg",
    featured: true,
    tags: ["Incubation", "Early Stage", "Funding"],
    applicationLink: "#",
    fullDescription: "The Incubation Program is a comprehensive 12-week journey designed for early-stage social impact startups. This intensive program provides you with the tools, resources, and connections needed to validate your idea, develop your business model, and prepare for growth. You'll work alongside a cohort of like-minded entrepreneurs, receive personalized mentorship, and have access to our extensive network of partners and investors.",
    requirements: [
      "Early-stage startup (0-2 years old)",
      "Clear social impact mission",
      "Minimum viable product or prototype",
      "Commitment to full program participation",
      "Founding team of at least 2 members"
    ],
    applicationProcess: [
      "Submit application with business plan",
      "Participate in screening interviews",
      "Pitch your venture",
      "Receive program acceptance",
      "Join cohort and begin journey"
    ]
  },
  {
    id: 3,
    title: "Acceleration Program",
    type: "Acceleration",
    category: "Growth",
    status: "Applications Closed",
    description: "Intensive 6-month program for ventures ready to scale. Includes advanced workshops, investor connections, and access to our global network of Impact Hubs.",
    benefits: [
      "6-month intensive program",
      "Advanced business workshops",
      "Direct investor introductions",
      "Global network access",
      "Strategic partnerships",
      "Impact measurement support",
      "Scaling strategies",
      "Executive coaching"
    ],
    eligibility: "Growth-stage ventures with proven traction",
    duration: "6 months per cohort",
    thumbnail: "/placeholder.svg",
    programLead: "David Ochieng",
    programLeadAvatar: "/placeholder-user.jpg",
    featured: false,
    tags: ["Acceleration", "Scaling", "Investment"],
    applicationLink: "#",
    fullDescription: "The Acceleration Program is designed for growth-stage ventures ready to scale their impact. This intensive 6-month program focuses on advanced business strategies, investor relations, and scaling operations. Participants receive personalized coaching, direct access to investors, and strategic partnerships to accelerate growth.",
    requirements: [
      "Proven business model with traction",
      "Revenue or significant user base",
      "Clear scaling plan",
      "Strong founding team",
      "Commitment to social impact"
    ],
    applicationProcess: [
      "Submit detailed application",
      "Provide business metrics and traction data",
      "Participate in selection interviews",
      "Undergo due diligence",
      "Receive acceptance notification"
    ]
  },
  {
    id: 4,
    title: "Women in Tech Fellowship",
    type: "Fellowship",
    category: "Diversity",
    status: "Open for Applications",
    description: "Annual fellowship program supporting women entrepreneurs in technology. Provides specialized mentorship, funding opportunities, and access to tech industry networks.",
    benefits: [
      "12-month fellowship",
      "Women-focused mentorship",
      "Tech industry connections",
      "Seed funding access",
      "Community of peers",
      "Professional development",
      "Leadership training",
      "Investor network access"
    ],
    eligibility: "Women-led tech ventures, early to growth stage",
    duration: "12 months",
    thumbnail: "/placeholder.svg",
    programLead: "Grace Wanjiru",
    programLeadAvatar: "/placeholder-user.jpg",
    featured: true,
    tags: ["Fellowship", "Women", "Technology"],
    applicationLink: "#",
    fullDescription: "The Women in Tech Fellowship is a comprehensive 12-month program designed to support and empower women entrepreneurs in technology. This fellowship addresses the unique challenges faced by women in tech and provides specialized support, mentorship, and funding opportunities. Join a community of trailblazing women entrepreneurs and access resources designed to help you succeed in the tech industry.",
    requirements: [
      "Women-led tech venture (CEO/Founder must be woman)",
      "Technology-focused business",
      "Early to growth stage",
      "Commitment to 12-month program",
      "Passion for technology and innovation"
    ],
    applicationProcess: [
      "Complete fellowship application",
      "Submit venture overview and tech stack",
      "Participate in selection process",
      "Attend fellowship orientation",
      "Begin fellowship journey"
    ]
  },
  {
    id: 5,
    title: "Climate Solutions Incubator",
    type: "Incubation",
    category: "Climate",
    status: "Open for Applications",
    description: "Specialized incubation program for climate and sustainability startups. Focuses on green tech, circular economy, and environmental impact solutions.",
    benefits: [
      "Climate-focused mentorship",
      "Access to climate investor network",
      "Sustainability certification support",
      "Partner connections in green sector",
      "Market validation support",
      "Impact measurement tools",
      "Regulatory guidance",
      "Access to climate innovation grants"
    ],
    eligibility: "Early-stage climate/sustainability ventures",
    duration: "16 weeks",
    thumbnail: "/placeholder.svg",
    programLead: "Mary Wanjala",
    programLeadAvatar: "/placeholder-user.jpg",
    featured: false,
    tags: ["Climate", "Sustainability", "Incubation"],
    applicationLink: "#",
    fullDescription: "The Climate Solutions Incubator is a specialized program for entrepreneurs building solutions to address climate change and environmental challenges. This 16-week program provides climate-focused mentorship, connects you with green investors and partners, and supports your journey in creating sustainable environmental impact.",
    requirements: [
      "Climate or sustainability-focused venture",
      "Early-stage startup",
      "Clear environmental impact goal",
      "Innovative solution to climate challenge",
      "Commitment to sustainability principles"
    ],
    applicationProcess: [
      "Submit climate-focused application",
      "Describe environmental impact potential",
      "Participate in climate innovation pitch",
      "Receive program acceptance",
      "Join climate solutions cohort"
    ]
  },
]

const programTypeColors: Record<string, string> = {
  Mentorship: "bg-chart-2/20 text-chart-2",
  Incubation: "bg-chart-3/20 text-chart-3",
  Acceleration: "bg-primary/10 text-primary",
  Fellowship: "bg-chart-5/20 text-chart-5",
}

const statusColors: Record<string, string> = {
  "Open for Applications": "bg-chart-3/20 text-chart-3",
  "Applications Closed": "bg-muted text-muted-foreground",
  "Ongoing": "bg-primary/10 text-primary",
}

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const programId = parseInt(id)
  const program = programOpportunities.find((p) => p.id === programId)

  if (!program) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: "Programs & Resources", href: "/resources" }, { label: "Not Found" }]} />
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Program not found</p>
              <Button onClick={() => router.push("/resources")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Programs
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const iconMap: Record<string, any> = {
    Mentorship: Users,
    Incubation: Rocket,
    Acceleration: TrendingUp,
    Fellowship: GraduationCap,
  }

  const ProgramIcon = iconMap[program.type] || Target

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Programs & Resources", href: "/resources" }, { label: program.title }]} />
        
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {program.featured && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          Featured
                        </Badge>
                      )}
                      <Badge className={programTypeColors[program.type]}>
                        {program.type}
                      </Badge>
                      <Badge className={statusColors[program.status]}>
                        {program.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl">{program.title}</CardTitle>
                    <div className="flex items-center gap-3 mt-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={program.programLeadAvatar} alt={program.programLead} />
                        <AvatarFallback>{program.programLead[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Led by {program.programLead}</p>
                        <p className="text-sm text-muted-foreground">Program Lead</p>
                      </div>
                    </div>
                  </div>
                  {program.thumbnail && (
                    <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl border border-border/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={program.thumbnail}
                        alt={program.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">About This Program</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {program.fullDescription || program.description}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Benefits
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {program.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Eligibility</h3>
                  <p className="text-muted-foreground leading-relaxed">{program.eligibility}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {program.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Application Process</h3>
                  <div className="space-y-3">
                    {program.applicationProcess.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-muted-foreground pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Duration</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{program.duration}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {program.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-border/50 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Apply Now</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  disabled={program.status !== "Open for Applications"}
                  size="lg"
                >
                  {program.status === "Open for Applications" 
                    ? "Apply to Program" 
                    : program.status === "Applications Closed"
                    ? "Applications Closed"
                    : "View Details"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Programs
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Program Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={statusColors[program.status]}>
                    {program.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <Badge className={programTypeColors[program.type]}>
                    {program.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-medium">{program.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Program Lead</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={program.programLeadAvatar} alt={program.programLead} />
                      <AvatarFallback>{program.programLead[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{program.programLead}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
