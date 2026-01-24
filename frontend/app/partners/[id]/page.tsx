"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  Building2,
  Globe,
  Handshake,
  TrendingUp,
  Award,
  ExternalLink,
  MapPin,
  Users,
  Target,
  CheckCircle2,
  Mail,
  Calendar,
  DollarSign,
  Sparkles,
  Loader2
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

// Partners will be fetched from API
const partners: any[] = []
  {
    id: 1,
    name: "Ikigai",
    type: "Workspace Partner",
    category: "Infrastructure",
    logo: "/placeholder-user.jpg",
    description: "Premium workspace partner providing modern collaboration spaces and wellness studios.",
    website: "https://ikigai.com",
    focus: ["Workspace", "Wellness", "Collaboration"],
    impact: "Enabling flexible work environments for social entrepreneurs",
    location: "Nairobi, Kenya",
    locationType: "Local",
    benefits: ["20% discount on workspace", "Free wellness sessions", "Access to collaboration zones"],
    memberConnections: 45,
    opportunitiesCount: 2,
    successStories: ["15 members accessed workspace in 2024", "Wellness program reached 200+ entrepreneurs"],
    partnershipTier: "Strategic Partner",
    contactEmail: "partnerships@ikigai.com",
  },
  {
    id: 2,
    name: "Acumen Fund",
    type: "Investor",
    category: "Funding",
    logo: "/placeholder-user.jpg",
    description: "Patient capital investor supporting social enterprises tackling poverty.",
    website: "https://acumen.org",
    focus: ["Impact Investing", "Patient Capital", "Social Enterprise"],
    impact: "Invested $150M+ in social enterprises across Africa",
    location: "Global",
    locationType: "Global",
    benefits: ["Investment readiness workshops", "Access to patient capital", "Mentorship from investment team"],
    memberConnections: 12,
    opportunitiesCount: 1,
    successStories: ["3 Impact Hub members received funding totaling $2.5M", "Mentorship program supported 50 entrepreneurs"],
    partnershipTier: "Strategic Partner",
    contactEmail: "kenya@acumen.org",
  },
  {
    id: 3,
    name: "Kenya Climate Innovation Center",
    type: "Partner",
    category: "Ecosystem",
    logo: "/placeholder-user.jpg",
    description: "Supporting climate-focused entrepreneurs with funding, mentorship, and market access.",
    website: "https://kcic.co.ke",
    focus: ["Climate Solutions", "Green Tech", "Sustainability"],
    impact: "Accelerated 200+ climate startups in East Africa",
    location: "Nairobi, Kenya",
    locationType: "Local",
    benefits: ["Climate tech acceleration program", "Grant opportunities up to KES 5M", "Market access support"],
    memberConnections: 28,
    opportunitiesCount: 3,
    successStories: ["8 members graduated from acceleration program", "KES 15M in grants distributed"],
    partnershipTier: "Supporting Partner",
    contactEmail: "info@kcic.co.ke",
  },
  {
    id: 4,
    name: "Mastercard Foundation",
    type: "Funder",
    category: "Funding",
    logo: "/placeholder-user.jpg",
    description: "Supporting young entrepreneurs and social innovation across Africa.",
    website: "https://mastercardfdn.org",
    focus: ["Youth Entrepreneurship", "Education", "Financial Inclusion"],
    impact: "Empowering 30M+ young people across Africa",
    location: "Global",
    locationType: "Global",
    benefits: ["Youth entrepreneurship grants", "Educational resources", "Financial inclusion programs"],
    memberConnections: 35,
    opportunitiesCount: 2,
    successStories: ["20 youth entrepreneurs supported", "KES 25M in grants awarded"],
    partnershipTier: "Strategic Partner",
    contactEmail: "eafrica@mastercardfdn.org",
  },
  {
    id: 5,
    name: "Ministry of ICT, Innovation & Youth Affairs",
    type: "Government",
    category: "Public Sector",
    logo: "/placeholder-user.jpg",
    description: "Government partner supporting innovation and digital transformation initiatives.",
    website: "https://ict.go.ke",
    focus: ["Policy", "Digital Innovation", "Youth Development"],
    impact: "Shaping innovation policy and supporting tech ecosystem",
    location: "Nairobi, Kenya",
    locationType: "Local",
    benefits: ["Policy updates and insights", "Government procurement opportunities", "Regulatory guidance"],
    memberConnections: 18,
    opportunitiesCount: 1,
    successStories: ["10 members participated in government programs", "Policy input sessions with 50+ entrepreneurs"],
    partnershipTier: "Strategic Partner",
    contactEmail: "innovation@ict.go.ke",
  },
  {
    id: 6,
    name: "Impact Hub Global Network",
    type: "Network",
    category: "Ecosystem",
    logo: "/placeholder-user.jpg",
    description: "Access to 100+ Impact Hubs worldwide, connecting local innovators to global opportunities.",
    website: "https://impacthub.net",
    focus: ["Global Network", "Cross-Hub Collaboration", "International Opportunities"],
    impact: "100+ hubs, 25,000+ members, 15,000+ ventures supported",
    location: "Global",
    locationType: "Global",
    benefits: ["Access to 100+ Impact Hubs worldwide", "Global member directory", "International collaboration opportunities"],
    memberConnections: 150,
    opportunitiesCount: 5,
    successStories: ["20 members connected with international partners", "5 cross-hub collaborations initiated"],
    partnershipTier: "Network Partner",
    contactEmail: "network@impacthub.net",
  },
  {
    id: 7,
    name: "Village Capital",
    type: "Investor",
    category: "Funding",
    logo: "/placeholder-user.jpg",
    description: "Early-stage investor using peer selection to fund underrepresented entrepreneurs.",
    website: "https://vilcap.com",
    focus: ["Early-Stage", "Peer Selection", "Diversity"],
    impact: "Invested in 150+ companies across emerging markets",
    location: "Global",
    locationType: "Global",
    benefits: ["Peer selection investment opportunities", "Early-stage funding up to $250K", "Diversity-focused programs"],
    memberConnections: 8,
    opportunitiesCount: 1,
    successStories: ["2 members received investment through peer selection", "15 entrepreneurs in mentorship program"],
    partnershipTier: "Supporting Partner",
    contactEmail: "africa@vilcap.com",
  },
  {
    id: 8,
    name: "Nairobi Business Angels Network",
    type: "Investor",
    category: "Funding",
    logo: "/placeholder-user.jpg",
    description: "Angel investor network connecting startups with experienced investors.",
    website: "https://nban.co.ke",
    focus: ["Angel Investing", "Mentorship", "Startup Funding"],
    impact: "Facilitated $5M+ in startup investments",
    location: "Nairobi, Kenya",
    locationType: "Local",
    benefits: ["Angel investor connections", "Pitch opportunities", "Mentorship from experienced investors"],
    memberConnections: 22,
    opportunitiesCount: 2,
    successStories: ["5 members secured angel investment totaling $1.2M", "Monthly pitch sessions with 50+ investors"],
    partnershipTier: "Supporting Partner",
    contactEmail: "info@nban.co.ke",
  },
]

const partnershipOpportunities = [
  {
    id: 1,
    partnerId: 2,
    partnerName: "Acumen Fund",
    title: "Patient Capital Investment Opportunity",
    description: "Acumen Fund is accepting applications for patient capital investment in social enterprises focused on poverty alleviation.",
    category: "Funding",
    amount: "$50K - $2M",
    deadline: new Date(2026, 3, 30),
    eligibility: ["Early to growth stage", "Social impact focus", "Sub-Saharan Africa operations"],
    applicationProcess: ["Submit expression of interest", "Initial screening", "Due diligence", "Investment decision"],
    status: "Open",
  },
  {
    id: 2,
    partnerId: 4,
    partnerName: "Mastercard Foundation",
    title: "Youth Entrepreneurship Grant Program",
    description: "Grant funding for youth-led social enterprises (ages 18-35) focused on education, financial inclusion, or employment.",
    category: "Funding",
    amount: "KES 500K - KES 5M",
    deadline: new Date(2026, 2, 15),
    eligibility: ["Youth-led (18-35)", "Social impact focus", "Kenya-based"],
    applicationProcess: ["Online application", "Review panel", "Pitch presentation", "Grant award"],
    status: "Open",
  },
  {
    id: 3,
    partnerId: 3,
    partnerName: "Kenya Climate Innovation Center",
    title: "Climate Tech Acceleration Program",
    description: "6-month acceleration program for climate-focused startups with funding, mentorship, and market access support.",
    category: "Program",
    amount: "KES 2M grant + acceleration support",
    deadline: new Date(2026, 1, 28),
    eligibility: ["Climate/Green tech focus", "Early stage", "Kenya-based"],
    applicationProcess: ["Application submission", "Selection process", "Program participation", "Graduation"],
    status: "Open",
  },
  {
    id: 4,
    partnerId: 7,
    partnerName: "Village Capital",
    title: "Peer Selection Investment Program",
    description: "Early-stage investment opportunity using peer selection methodology for underrepresented entrepreneurs.",
    category: "Funding",
    amount: "Up to $250K",
    deadline: new Date(2026, 4, 20),
    eligibility: ["Early stage", "Underrepresented founder", "Tech-enabled solution"],
    applicationProcess: ["Application", "Peer review", "Selection", "Investment"],
    status: "Open",
  },
  {
    id: 5,
    partnerId: 1,
    partnerName: "Ikigai",
    title: "Workspace Partnership Program",
    description: "Discounted workspace access for Impact Hub members with wellness and collaboration benefits.",
    category: "Resource",
    amount: "20% discount",
    deadline: null,
    eligibility: ["Active Impact Hub member", "Nairobi-based"],
    applicationProcess: ["Member verification", "Space allocation", "Onboarding"],
    status: "Ongoing",
  },
]

const typeIcons: Record<string, any> = {
  "Workspace Partner": Building2,
  "Investor": TrendingUp,
  "Partner": Handshake,
  "Funder": Award,
  "Government": Building2,
  "Network": Globe,
}

const typeColors: Record<string, string> = {
  "Workspace Partner": "bg-chart-5/20 text-chart-5 dark:bg-chart-5/20 dark:text-chart-5/80",
  "Investor": "bg-chart-3/20 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3/80",
  "Partner": "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/80",
  "Funder": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  "Government": "bg-chart-2/20 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2/80",
  "Network": "bg-chart-2/20 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2/80",
}

const categoryColors: Record<string, string> = {
  "Infrastructure": "bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400",
  "Funding": "bg-chart-3/20 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3/80",
  "Ecosystem": "bg-chart-2/20 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2/80",
  "Public Sector": "bg-chart-5/20 text-chart-5 dark:bg-chart-5/20 dark:text-chart-5/80",
}

const opportunityCategoryColors: Record<string, string> = {
  "Funding": "bg-chart-3/20 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3/80",
  "Program": "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/80",
  "Resource": "bg-chart-5/20 text-chart-5 dark:bg-chart-5/20 dark:text-chart-5/80",
}

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [partner, setPartner] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchPartner() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/partners/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch partner")
        }
        const data = await response.json()
        setPartner(data.partner)
      } catch (err: any) {
        console.error("Failed to fetch partner:", err)
        setError(err.message || "Failed to load partner")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPartner()
  }, [id])
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }
  
  if (error || !partner) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: "Partners & Network" }, { label: "Not Found" }]} />
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">{error || "Partner not found"}</p>
              <Button onClick={() => router.push("/partners")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Partners
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }
  
  const partnerOpportunities = partner.opportunities || []

  const TypeIcon = typeIcons[partner.type] || Building2

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Partners & Network", href: "/partners" }, { label: partner.name }]} />
        
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <Badge className={typeColors[partner.type]}>
                    <TypeIcon className="mr-1 h-3 w-3" />
                    {partner.type}
                  </Badge>
                  <Badge className={categoryColors[partner.category]}>
                    {partner.category}
                  </Badge>
                  <Badge variant="outline">
                    {partner.partnershipTier}
                  </Badge>
                </div>
                <CardTitle className="text-3xl">{partner.name}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {partner.description}
                </CardDescription>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{partner.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{partner.memberConnections} member connections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>{partner.opportunitiesCount} opportunities</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Impact
                  </h3>
                  <p className="text-muted-foreground text-lg">{partner.impact}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Partnership Benefits
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    As an Impact Hub member, you have access to the following benefits from this partner:
                  </p>
                  <ul className="space-y-2">
                    {partner.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Success Stories
                  </h3>
                  <ul className="space-y-2">
                    {partner.successStories.map((story, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{story}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Focus Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {partner.focus.map((area, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {partnerOpportunities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Active Opportunities ({partnerOpportunities.length})
                    </h3>
                    <div className="space-y-3">
                      {partnerOpportunities.map((opp) => (
                        <Card key={opp.id} className="border-border/50">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge className={opportunityCategoryColors[opp.category]}>
                                {opp.category}
                              </Badge>
                              <Badge variant={opp.status === "Open" ? "default" : "secondary"}>
                                {opp.status}
                              </Badge>
                              {opp.deadline && (
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  Deadline: {format(opp.deadline, "MMM d, yyyy")}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg">{opp.title}</CardTitle>
                            <CardDescription>{opp.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                <span>{opp.amount}</span>
                              </div>
                              {opp.deadline && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>{format(opp.deadline, "MMMM d, yyyy")}</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Eligibility:</p>
                              <ul className="space-y-1">
                                {opp.eligibility.map((req, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <Button className="w-full" onClick={() => {
                              // In a real app, this would navigate to application form
                              alert("Application form would open here")
                            }}>
                              Apply Now
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-border/50 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Connect with Partner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => window.open(partner.website, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Website
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    window.location.href = `mailto:${partner.contactEmail}`
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Partner
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // In a real app, this would request an introduction
                    alert("Request introduction form would open here")
                  }}
                >
                  <Handshake className="mr-2 h-4 w-4" />
                  Request Introduction
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Partner Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Partnership Tier</p>
                  <Badge variant="outline">{partner.partnershipTier}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <p className="font-medium">{partner.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <Badge className={categoryColors[partner.category]}>
                    {partner.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Member Connections</p>
                  <p className="font-medium">{partner.memberConnections} members</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
