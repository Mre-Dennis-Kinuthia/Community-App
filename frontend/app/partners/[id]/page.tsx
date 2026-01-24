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
