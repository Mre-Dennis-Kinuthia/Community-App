"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  Users,
  Heart,
  Target,
  Calendar,
  TrendingUp,
  Globe,
  ExternalLink,
  DollarSign,
  Handshake,
  UserPlus,
  MapPin,
  CheckCircle2,
  Star,
  Mail,
  Linkedin,
  Bell,
  Clock,
  Zap
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

// Projects will be fetched from API
const projects: any[] = []
  {
    id: 1,
    title: "Green Energy Solutions for Rural Kenya",
    founder: "James Mwangi",
    founderAvatar: "/placeholder-user.jpg",
    category: "Climate & Environment",
    stage: "Scaling",
    impact: "Providing clean energy to 5,000+ rural households",
    description: "Solar-powered microgrids bringing affordable electricity to off-grid communities, reducing reliance on kerosene and improving quality of life.",
    fullDescription: "Green Energy Solutions is revolutionizing rural electrification in Kenya through innovative solar microgrid technology. Our mission is to provide affordable, reliable, and sustainable energy access to off-grid communities, enabling economic development and improving quality of life. We've successfully deployed 50 microgrids across rural Kenya, directly impacting over 5,000 households and creating 50+ local jobs. Our solution combines cutting-edge solar technology with community-centered approaches, ensuring long-term sustainability and local ownership.",
    metrics: {
      households: "5,000+",
      emissions: "200 tons CO2",
      jobs: "50+",
    },
    tags: ["Renewable Energy", "Rural Development", "Climate Action"],
    featured: true,
    launchDate: new Date(2024, 5, 15),
    location: "Nairobi, Kenya",
    needs: ["Seeking Funding", "Open to Partnerships"],
    followers: 245,
    volunteers: 12,
    collaborationRequests: 8,
    website: "https://greenenergy.co.ke",
    email: "contact@greenenergy.co.ke",
    socialLinks: {
      linkedin: "https://linkedin.com/company/greenenergy",
      twitter: "https://twitter.com/greenenergy",
    },
    team: [
      { name: "James Mwangi", role: "Founder & CEO", avatar: "/placeholder-user.jpg" },
      { name: "Susan Kamau", role: "CTO", avatar: "/placeholder-user.jpg" },
      { name: "John Otieno", role: "Operations Lead", avatar: "/placeholder-user.jpg" },
    ],
    milestones: [
      { date: new Date(2024, 5, 15), title: "Project Launch", description: "Officially launched Green Energy Solutions", completed: true },
      { date: new Date(2024, 8, 1), title: "First 10 Microgrids", description: "Successfully deployed 10 solar microgrids", completed: true },
      { date: new Date(2024, 11, 15), title: "5,000 Households Milestone", description: "Reached 5,000 households with clean energy", completed: true },
      { date: new Date(2025, 2, 1), title: "Expansion to 100 Microgrids", description: "Target: Deploy 50 additional microgrids", completed: false },
      { date: new Date(2025, 6, 1), title: "10,000 Households Goal", description: "Target: Reach 10,000 households", completed: false },
    ],
    fundingNeeds: {
      amount: "$500,000",
      purpose: "Expansion to 100 microgrids",
      deadline: new Date(2025, 1, 1),
    },
    volunteerNeeds: [
      { role: "Community Engagement Specialist", hours: "20 hours/week", skills: ["Community Outreach", "Communication"] },
      { role: "Technical Support Volunteer", hours: "10 hours/week", skills: ["Solar Technology", "Maintenance"] },
    ],
    partnershipInterests: ["Energy Companies", "NGOs", "Government Agencies"],
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
    fullDescription: "Our AgriTech platform empowers smallholder farmers by connecting them directly with buyers, eliminating middlemen and improving their income. We provide real-time market information, facilitate access to credit and agricultural inputs, and offer training programs. With over 10,000 registered farmers and 15+ buyer partnerships, we've facilitated transactions worth KES 50M+ and increased average farmer income by 40%.",
    metrics: {
      farmers: "10,000+",
      transactions: "KES 50M+",
      partnerships: "15+",
    },
    tags: ["Agriculture", "FinTech", "Rural Development"],
    featured: true,
    launchDate: new Date(2024, 2, 10),
    location: "Nairobi, Kenya",
    needs: ["Seeking Collaborators", "Looking for Volunteers"],
    followers: 189,
    volunteers: 25,
    collaborationRequests: 15,
    website: "https://agritech.co.ke",
    email: "info@agritech.co.ke",
    socialLinks: {
      linkedin: "https://linkedin.com/company/agritech",
      twitter: "https://twitter.com/agritech",
    },
    team: [
      { name: "Grace Wanjiru", role: "Founder & CEO", avatar: "/placeholder-user.jpg" },
      { name: "Michael Kimani", role: "Head of Technology", avatar: "/placeholder-user.jpg" },
    ],
    milestones: [
      { date: new Date(2024, 2, 10), title: "Platform Launch", description: "Launched mobile platform for farmers", completed: true },
      { date: new Date(2024, 5, 1), title: "1,000 Farmers", description: "Reached 1,000 registered farmers", completed: true },
      { date: new Date(2024, 8, 15), title: "10,000 Farmers Milestone", description: "Reached 10,000 registered farmers", completed: true },
      { date: new Date(2025, 3, 1), title: "25,000 Farmers Goal", description: "Target: Expand to 25,000 farmers", completed: false },
    ],
    volunteerNeeds: [
      { role: "Agricultural Advisor", hours: "15 hours/week", skills: ["Agriculture", "Consulting"] },
      { role: "Mobile App Developer", hours: "20 hours/week", skills: ["React Native", "Mobile Development"] },
    ],
    partnershipInterests: ["Agricultural Cooperatives", "Financial Institutions", "Agricultural Input Suppliers"],
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
    fullDescription: "Waste-to-Wealth is a community-driven recycling initiative that transforms plastic waste into economic opportunities. We work directly with informal settlement communities to collect, sort, and process plastic waste, creating income for 200+ collectors while diverting 100+ tons of waste monthly from landfills. Our model focuses on community ownership and sustainable livelihoods.",
    metrics: {
      waste: "100+ tons/month",
      collectors: "200+",
      income: "KES 2M+",
    },
    tags: ["Waste Management", "Circular Economy", "Livelihoods"],
    featured: false,
    launchDate: new Date(2024, 8, 1),
    location: "Nairobi, Kenya",
    needs: ["Seeking Funding", "Looking for Volunteers", "Seeking Collaborators"],
    followers: 156,
    volunteers: 35,
    collaborationRequests: 12,
    website: null,
    email: "contact@wastetowealth.co.ke",
    socialLinks: {},
    team: [
      { name: "Peter Ochieng", role: "Founder & Director", avatar: "/placeholder-user.jpg" },
    ],
    milestones: [
      { date: new Date(2024, 8, 1), title: "Program Launch", description: "Launched recycling program", completed: true },
      { date: new Date(2024, 10, 1), title: "100 Collectors", description: "Reached 100 active collectors", completed: true },
      { date: new Date(2025, 1, 1), title: "500 Collectors Goal", description: "Target: Expand to 500 collectors", completed: false },
    ],
    fundingNeeds: {
      amount: "KES 2,000,000",
      purpose: "Equipment and expansion",
      deadline: new Date(2025, 3, 1),
    },
    volunteerNeeds: [
      { role: "Community Organizer", hours: "25 hours/week", skills: ["Community Outreach", "Organization"] },
    ],
    partnershipInterests: ["Recycling Companies", "Waste Management Organizations", "Community Groups"],
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
    fullDescription: "Our digital health platform addresses the critical gap in maternal healthcare access in underserved areas. Through telemedicine, we provide prenatal and postnatal care to expectant mothers, connecting them with qualified healthcare professionals. We've served over 3,000 women with a 95% success rate in improving maternal health outcomes, conducting over 15,000 consultations since launch.",
    metrics: {
      women: "3,000+",
      consultations: "15,000+",
      outcomes: "95% success",
    },
    tags: ["Healthcare", "Telemedicine", "Women's Health"],
    featured: false,
    launchDate: new Date(2023, 11, 5),
    location: "Nairobi, Kenya",
    needs: ["Open to Partnerships"],
    followers: 312,
    volunteers: 8,
    collaborationRequests: 22,
    website: "https://maternalcare.co.ke",
    email: "info@maternalcare.co.ke",
    socialLinks: {
      linkedin: "https://linkedin.com/company/maternalcare",
    },
    team: [
      { name: "Dr. Sarah Kamau", role: "Founder & Medical Director", avatar: "/placeholder-user.jpg" },
      { name: "Dr. Mary Wanjala", role: "Clinical Lead", avatar: "/placeholder-user.jpg" },
      { name: "Tom Ochieng", role: "Technology Lead", avatar: "/placeholder-user.jpg" },
    ],
    milestones: [
      { date: new Date(2023, 11, 5), title: "Platform Launch", description: "Launched telemedicine platform", completed: true },
      { date: new Date(2024, 3, 1), title: "1,000 Women Served", description: "Reached 1,000 women with services", completed: true },
      { date: new Date(2024, 8, 1), title: "3,000 Women Milestone", description: "Reached 3,000 women milestone", completed: true },
      { date: new Date(2025, 6, 1), title: "10,000 Women Goal", description: "Target: Serve 10,000 women", completed: false },
    ],
    partnershipInterests: ["Healthcare Organizations", "NGOs", "Government Health Departments"],
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
    fullDescription: "We're revolutionizing financial access for young entrepreneurs in Kenya. Our mobile-first platform provides tailored financial services including savings accounts, microloans, and business management tools specifically designed for youth. With over 2,000 active users, we've facilitated KES 10M+ in savings and disbursed KES 5M+ in loans, enabling young entrepreneurs to start and grow their businesses.",
    metrics: {
      users: "2,000+",
      savings: "KES 10M+",
      loans: "KES 5M+",
    },
    tags: ["FinTech", "Youth", "Financial Inclusion"],
    featured: false,
    launchDate: new Date(2024, 0, 20),
    location: "Nairobi, Kenya",
    needs: ["Seeking Funding", "Seeking Collaborators"],
    followers: 178,
    volunteers: 5,
    collaborationRequests: 18,
    website: "https://youthfinance.co.ke",
    email: "contact@youthfinance.co.ke",
    socialLinks: {
      linkedin: "https://linkedin.com/company/youthfinance",
      twitter: "https://twitter.com/youthfinance",
    },
    team: [
      { name: "David Kipchoge", role: "Founder & CEO", avatar: "/placeholder-user.jpg" },
      { name: "Jane Mutua", role: "Head of Product", avatar: "/placeholder-user.jpg" },
    ],
    milestones: [
      { date: new Date(2024, 0, 20), title: "Platform Launch", description: "Launched financial platform", completed: true },
      { date: new Date(2024, 6, 1), title: "1,000 Users", description: "Reached 1,000 active users", completed: true },
      { date: new Date(2024, 10, 1), title: "2,000 Users Milestone", description: "Reached 2,000 active users", completed: true },
      { date: new Date(2025, 4, 1), title: "5,000 Users Goal", description: "Target: Reach 5,000 active users", completed: false },
    ],
    fundingNeeds: {
      amount: "$300,000",
      purpose: "Product development and expansion",
      deadline: new Date(2025, 2, 1),
    },
    partnershipInterests: ["Financial Institutions", "Youth Organizations", "Incubators"],
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
    fullDescription: "Clean Water Access Initiative addresses the critical water crisis in Kenya's underserved communities. Through low-cost water purification systems and community-managed water kiosks, we provide safe, affordable drinking water to over 8,000 people daily across 12+ communities. Our model ensures community ownership, sustainability, and accessibility, transforming lives through improved health and economic opportunities.",
    metrics: {
      people: "8,000+",
      liters: "50,000+ daily",
      communities: "12+",
    },
    tags: ["Water", "Sanitation", "Public Health"],
    featured: true,
    launchDate: new Date(2023, 8, 15),
    location: "Nairobi, Kenya",
    needs: ["Seeking Funding", "Looking for Volunteers"],
    followers: 267,
    volunteers: 42,
    collaborationRequests: 10,
    website: "https://cleanwater.co.ke",
    email: "info@cleanwater.co.ke",
    socialLinks: {
      linkedin: "https://linkedin.com/company/cleanwater",
    },
    team: [
      { name: "Mary Wanjala", role: "Founder & Director", avatar: "/placeholder-user.jpg" },
      { name: "Peter Kariuki", role: "Operations Manager", avatar: "/placeholder-user.jpg" },
      { name: "Lucy Wambui", role: "Community Engagement Lead", avatar: "/placeholder-user.jpg" },
    ],
    milestones: [
      { date: new Date(2023, 8, 15), title: "Initiative Launch", description: "Launched clean water initiative", completed: true },
      { date: new Date(2024, 2, 1), title: "First 5 Communities", description: "Served first 5 communities", completed: true },
      { date: new Date(2024, 8, 1), title: "12 Communities Milestone", description: "Expanded to 12 communities", completed: true },
      { date: new Date(2025, 6, 1), title: "25 Communities Goal", description: "Target: Expand to 25 communities", completed: false },
    ],
    fundingNeeds: {
      amount: "$750,000",
      purpose: "Expansion to 25 communities",
      deadline: new Date(2025, 4, 1),
    },
    volunteerNeeds: [
      { role: "Water Quality Technician", hours: "15 hours/week", skills: ["Water Testing", "Chemistry"] },
      { role: "Community Educator", hours: "20 hours/week", skills: ["Education", "Public Health"] },
    ],
    partnershipInterests: ["Water NGOs", "Government Water Agencies", "Community Organizations"],
  },
]

const categoryColors: Record<string, string> = {
  "Climate & Environment": "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  "Agriculture": "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "Circular Economy": "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
  "Healthcare": "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  "FinTech": "bg-chart-2/20 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2/80",
  "Water & Sanitation": "bg-chart-2/20 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2/80",
}

const stageColors: Record<string, string> = {
  "Early Stage": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  "Growth": "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/80",
  "Scaling": "bg-chart-3/20 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3/80",
}

const needsColors: Record<string, string> = {
  "Seeking Funding": "bg-chart-5/20 text-chart-5 dark:bg-chart-5/20 dark:text-chart-5/80",
  "Seeking Collaborators": "bg-chart-2/20 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2/80",
  "Looking for Volunteers": "bg-chart-4/20 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4/80",
  "Open to Partnerships": "bg-chart-3/20 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3/80",
}

const needsIcons: Record<string, any> = {
  "Seeking Funding": DollarSign,
  "Seeking Collaborators": UserPlus,
  "Looking for Volunteers": Users,
  "Open to Partnerships": Handshake,
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchProject() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/projects/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch project")
        }
        const data = await response.json()
        setProject(data.project)
      } catch (err: any) {
        console.error("Failed to fetch project:", err)
        setError(err.message || "Failed to load project")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProject()
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
  
  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: "Projects & Initiatives" }, { label: "Not Found" }]} />
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">{error || "Project not found"}</p>
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
  
  const projectId = id
  // Related projects would need to be fetched separately or included in the API response
  const relatedProjects: any[] = []

  const completedMilestones = project.milestones.filter(m => m.completed).length
  const totalMilestones = project.milestones.length
  const progressPercentage = (completedMilestones / totalMilestones) * 100

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
                      <Star className="mr-1 h-3 w-3" />
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
                <div className="flex items-center gap-4 mt-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={project.founderAvatar} alt={project.founder} />
                    <AvatarFallback>{project.founder[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">by {project.founder}</p>
                    <p className="text-sm text-muted-foreground">Project Founder</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}</span>
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

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{project.fullDescription || project.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Project Timeline & Milestones
                  </h3>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">{completedMilestones} of {totalMilestones} milestones completed</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {project.milestones.map((milestone, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-3 w-3 rounded-full ${milestone.completed ? "bg-primary" : "bg-muted"}`} />
                          {idx < project.milestones.length - 1 && (
                            <div className={`w-0.5 h-full min-h-[60px] ${milestone.completed ? "bg-primary/30" : "bg-muted"}`} />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{milestone.title}</p>
                            {milestone.completed && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{milestone.description}</p>
                          <p className="text-xs text-muted-foreground">{format(milestone.date, "MMMM d, yyyy")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Team & Collaborators
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.team.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {project.needs && project.needs.length > 0 && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Project Needs & Opportunities
                      </h3>
                      <div className="space-y-4">
                        {project.needs.map((need, idx) => {
                          const NeedIcon = needsIcons[need] || Users
                          return (
                            <div key={idx} className="p-4 rounded-lg border border-border/50">
                              <div className="flex items-center gap-2 mb-2">
                                <NeedIcon className="h-4 w-4 text-primary" />
                                <Badge className={needsColors[need]}>
                                  {need}
                                </Badge>
                              </div>
                              {need === "Seeking Funding" && project.fundingNeeds && (
                                <div className="mt-2 text-sm text-muted-foreground space-y-1">
                                  <p><strong>Amount:</strong> {project.fundingNeeds.amount}</p>
                                  <p><strong>Purpose:</strong> {project.fundingNeeds.purpose}</p>
                                  <p><strong>Deadline:</strong> {format(project.fundingNeeds.deadline, "MMMM d, yyyy")}</p>
                                </div>
                              )}
                              {need === "Looking for Volunteers" && project.volunteerNeeds && project.volunteerNeeds.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {project.volunteerNeeds.map((volunteer, vIdx) => (
                                    <div key={vIdx} className="text-sm text-muted-foreground p-2 bg-muted/50 rounded">
                                      <p className="font-medium">{volunteer.role}</p>
                                      <p>Time: {volunteer.hours}</p>
                                      <p>Skills: {volunteer.skills.join(", ")}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {need === "Open to Partnerships" && project.partnershipInterests && project.partnershipInterests.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm text-muted-foreground mb-1">Interested in partnerships with:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {project.partnershipInterests.map((interest, iIdx) => (
                                      <Badge key={iIdx} variant="outline" className="text-xs">
                                        {interest}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

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

                <Separator />

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

                {relatedProjects.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-4">Related Projects</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {relatedProjects.map((related) => (
                          <Link key={related.id} href={`/projects/${related.id}`}>
                            <Card className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                              <CardHeader className="pb-3">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                    <Badge className={`${categoryColors[related.category]} text-xs`} variant="outline">
                                      {related.category}
                                    </Badge>
                                  <Badge className={`${stageColors[related.stage]} text-xs`} variant="outline">
                                    {related.stage}
                                  </Badge>
                                </div>
                                <CardTitle className="text-lg">{related.title}</CardTitle>
                                <CardDescription className="text-sm line-clamp-2 mt-2">
                                  {related.description}
                                </CardDescription>
                              </CardHeader>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-border/50 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Get Involved</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  <Heart className="mr-2 h-4 w-4" />
                  Follow Project ({project.followers})
                </Button>
                <Button variant="outline" className="w-full">
                  <Bell className="mr-2 h-4 w-4" />
                  Subscribe to Updates
                </Button>
                {project.needs.includes("Seeking Collaborators") && (
                  <Button variant="outline" className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Join as Collaborator
                  </Button>
                )}
                {project.needs.includes("Looking for Volunteers") && (
                  <Button variant="outline" className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Volunteer
                  </Button>
                )}
                {project.needs.includes("Seeking Funding") && (
                  <Button variant="outline" className="w-full">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Support Funding
                  </Button>
                )}
                {project.needs.includes("Open to Partnerships") && (
                  <Button variant="outline" className="w-full">
                    <Handshake className="mr-2 h-4 w-4" />
                    Explore Partnership
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  <Globe className="mr-2 h-4 w-4" />
                  Share Project
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Support Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Followers</p>
                  <p className="text-2xl font-semibold">{project.followers}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Volunteers</p>
                  <p className="text-2xl font-semibold">{project.volunteers}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Collaboration Requests</p>
                  <p className="text-2xl font-semibold">{project.collaborationRequests}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Contact & Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.website && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(project.website!, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Website
                  </Button>
                )}
                {project.email && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = `mailto:${project.email}`}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Project
                  </Button>
                )}
                {project.socialLinks.linkedin && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(project.socialLinks.linkedin!, "_blank")}
                  >
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Button>
                )}
                {project.socialLinks.twitter && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(project.socialLinks.twitter!, "_blank")}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    X/Twitter
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Stage</p>
                  <Badge className={stageColors[project.stage]}>
                    {project.stage}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <p className="font-medium">{project.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Launched</p>
                  <p className="font-medium">{format(project.launchDate, "MMMM d, yyyy")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
