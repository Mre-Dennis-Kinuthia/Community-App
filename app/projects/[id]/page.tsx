"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft,
  Users,
  Heart,
  Target,
  Calendar,
  TrendingUp,
  Globe
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { format } from "date-fns"

// This would normally come from an API or database
const projects = [
  {
    id: 1,
    title: "Green Energy Solutions for Rural Kenya",
    founder: "James Mwangi",
    founderAvatar: "/placeholder-user.jpg",
    category: "Climate & Environment",
    stage: "Scaling",
    impact: "Providing clean energy to 5,000+ rural households",
    description: "Solar-powered microgrids bringing affordable electricity to off-grid communities, reducing reliance on kerosene and improving quality of life.",
    metrics: {
      households: "5,000+",
      emissions: "200 tons CO2",
      jobs: "50+",
    },
    tags: ["Renewable Energy", "Rural Development", "Climate Action"],
    featured: true,
    launchDate: new Date(2024, 5, 15),
  },
  {
    id: 2,
    title: "AgriTech Platform for Smallholder Farmers",
    founder: "Grace Wanjiru",
    founderAvatar: "/placeholder-user.jpg",
    category: "Agriculture",
    stage: "Growth",
    impact: "Connecting 10,000+ farmers to markets and financing",
    description: "Mobile platform connecting smallholder farmers with buyers, providing market information, and facilitating access to credit and inputs.",
    metrics: {
      farmers: "10,000+",
      transactions: "KES 50M+",
      partnerships: "15+",
    },
    tags: ["Agriculture", "FinTech", "Rural Development"],
    featured: true,
    launchDate: new Date(2024, 2, 10),
  },
  {
    id: 3,
    title: "Waste-to-Wealth Recycling Initiative",
    founder: "Peter Ochieng",
    founderAvatar: "/placeholder-user.jpg",
    category: "Circular Economy",
    stage: "Early Stage",
    impact: "Diverting 100+ tons of waste from landfills monthly",
    description: "Community-based recycling program creating income opportunities while addressing plastic waste in Nairobi's informal settlements.",
    metrics: {
      waste: "100+ tons/month",
      collectors: "200+",
      income: "KES 2M+",
    },
    tags: ["Waste Management", "Circular Economy", "Livelihoods"],
    featured: false,
    launchDate: new Date(2024, 8, 1),
  },
  {
    id: 4,
    title: "Digital Health Platform for Maternal Care",
    founder: "Dr. Sarah Kamau",
    founderAvatar: "/placeholder-user.jpg",
    category: "Healthcare",
    stage: "Scaling",
    impact: "Improving maternal health outcomes for 3,000+ women",
    description: "Telemedicine platform providing prenatal and postnatal care to expectant mothers in underserved areas, reducing maternal mortality.",
    metrics: {
      women: "3,000+",
      consultations: "15,000+",
      outcomes: "95% success",
    },
    tags: ["Healthcare", "Telemedicine", "Women's Health"],
    featured: false,
    launchDate: new Date(2023, 11, 5),
  },
  {
    id: 5,
    title: "Financial Inclusion for Youth Entrepreneurs",
    founder: "David Kipchoge",
    founderAvatar: "/placeholder-user.jpg",
    category: "FinTech",
    stage: "Growth",
    impact: "Enabling 2,000+ youth to access financial services",
    description: "Mobile-first financial platform designed for young entrepreneurs, providing savings, credit, and business management tools.",
    metrics: {
      users: "2,000+",
      savings: "KES 10M+",
      loans: "KES 5M+",
    },
    tags: ["FinTech", "Youth", "Financial Inclusion"],
    featured: false,
    launchDate: new Date(2024, 0, 20),
  },
  {
    id: 6,
    title: "Clean Water Access Initiative",
    founder: "Mary Wanjala",
    founderAvatar: "/placeholder-user.jpg",
    category: "Water & Sanitation",
    stage: "Scaling",
    impact: "Providing clean water to 8,000+ people daily",
    description: "Low-cost water purification systems and community water kiosks bringing safe drinking water to urban slums and rural areas.",
    metrics: {
      people: "8,000+",
      liters: "50,000+ daily",
      communities: "12+",
    },
    tags: ["Water", "Sanitation", "Public Health"],
    featured: true,
    launchDate: new Date(2023, 8, 15),
  },
]

const categoryColors: Record<string, string> = {
  "Climate & Environment": "bg-green-100 text-green-700",
  "Agriculture": "bg-amber-100 text-amber-700",
  "Circular Economy": "bg-teal-100 text-teal-700",
  "Healthcare": "bg-red-100 text-red-700",
  "FinTech": "bg-blue-100 text-blue-700",
  "Water & Sanitation": "bg-cyan-100 text-cyan-700",
}

const stageColors: Record<string, string> = {
  "Early Stage": "bg-yellow-100 text-yellow-700",
  "Growth": "bg-blue-100 text-blue-700",
  "Scaling": "bg-green-100 text-green-700",
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const projectId = parseInt(id)
  const project = projects.find((p) => p.id === projectId)

  if (!project) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: "Projects & Initiatives" }, { label: "Not Found" }]} />
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Project not found</p>
              <Button onClick={() => router.push("/projects")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Projects & Initiatives", href: "/projects" }, { label: project.title }]} />
        
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
                  {project.featured && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Featured
                    </Badge>
                  )}
                  <Badge className={categoryColors[project.category]}>
                    {project.category}
                  </Badge>
                  <Badge className={stageColors[project.stage]}>
                    {project.stage}
                  </Badge>
                </div>
                <CardTitle className="text-3xl">{project.title}</CardTitle>
                <div className="flex items-center gap-3 mt-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={project.founderAvatar} alt={project.founder} />
                    <AvatarFallback>{project.founder[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">by {project.founder}</p>
                    <p className="text-sm text-muted-foreground">Project Founder</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Impact
                  </h3>
                  <p className="text-muted-foreground text-lg">{project.impact}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Key Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(project.metrics).map(([key, value]) => (
                      <div key={key} className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <p className="text-2xl font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                  <Calendar className="h-4 w-4" />
                  <span>Launched {format(project.launchDate, "MMMM d, yyyy")}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-border/50 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Connect with Founder
                </Button>
                <Button variant="outline" className="w-full">
                  <Heart className="mr-2 h-4 w-4" />
                  Support Project
                </Button>
                <Button variant="outline" className="w-full">
                  <Globe className="mr-2 h-4 w-4" />
                  Share Project
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
