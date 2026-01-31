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

  const milestones = project.milestones ?? []
  const completedMilestones = milestones.filter((m: any) => m.completed).length
  const totalMilestones = milestones.length
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0

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
                    <AvatarFallback>{(project.founder ?? "?")[0]}</AvatarFallback>
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
                    {milestones.map((milestone: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-3 w-3 rounded-full ${milestone.completed ? "bg-primary" : "bg-muted"}`} />
                          {idx < milestones.length - 1 && (
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
                          <AvatarFallback>{(member.name ?? "?")[0]}</AvatarFallback>
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
                        {(project.needs ?? []).map((need: string, idx: number) => {
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
                                    {(project.partnershipInterests ?? []).map((interest: string, iIdx: number) => (
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
                    {(project.tags ?? []).map((tag: string, idx: number) => (
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
                {(project.needs ?? []).includes("Seeking Collaborators") && (
                  <Button variant="outline" className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Join as Collaborator
                  </Button>
                )}
                {(project.needs ?? []).includes("Looking for Volunteers") && (
                  <Button variant="outline" className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Volunteer
                  </Button>
                )}
                {(project.needs ?? []).includes("Seeking Funding") && (
                  <Button variant="outline" className="w-full">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Support Funding
                  </Button>
                )}
                {(project.needs ?? []).includes("Open to Partnerships") && (
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
