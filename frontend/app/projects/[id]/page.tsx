"use client"

import { use, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Loader2, Lock, FileText, Shield } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Projects will be fetched from API
const projects: any[] = []

const categoryColors: Record<string, string> = {
  "Climate & Environment": "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  "Agriculture": "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "Circular Economy": "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
  "Healthcare": "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  "FinTech": "bg-muted text-muted-foreground border border-border",
  "Water & Sanitation": "bg-muted text-muted-foreground border border-border",
}

const stageColors: Record<string, string> = {
  "Early Stage": "bg-muted text-muted-foreground border border-border",
  "Growth": "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/80",
  "Scaling": "bg-muted text-muted-foreground border border-border",
}

const needsColors: Record<string, string> = {
  "Seeking Funding": "bg-muted text-muted-foreground border border-border",
  "Seeking Collaborators": "bg-muted text-muted-foreground border border-border",
  "Looking for Volunteers": "bg-muted text-muted-foreground border border-border",
  "Open to Partnerships": "bg-muted text-muted-foreground border border-border",
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
  const searchParams = useSearchParams()
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "investment">("overview")

  const [investmentData, setInvestmentData] = useState<any | null>(null)
  const [loadingInvestment, setLoadingInvestment] = useState(false)
  const [investmentError, setInvestmentError] = useState<string | null>(null)

  const [interestModalOpen, setInterestModalOpen] = useState(false)
  const [interestMessage, setInterestMessage] = useState("")
  const [submittingInterest, setSubmittingInterest] = useState(false)
  const [interestFeedback, setInterestFeedback] = useState<string | null>(null)
  const [interestFeedbackError, setInterestFeedbackError] = useState<string | null>(null)
  
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

  // Initialize tab from query param (?mode=investment)
  useEffect(() => {
    const mode = searchParams.get("mode")
    if (mode === "investment") {
      setActiveTab("investment")
    }
  }, [searchParams])

  // Fetch investment data when Investment tab is active
  useEffect(() => {
    if (activeTab !== "investment") return
    let cancelled = false

    async function fetchInvestment() {
      try {
        setLoadingInvestment(true)
        setInvestmentError(null)
        const response = await fetch(`/api/projects/${id}/investment`, {
          credentials: "include",
        })
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data?.error || "Failed to load investment details")
        }
        const data = await response.json()
        if (!cancelled) {
          setInvestmentData(data)
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Failed to fetch investment data:", err)
          setInvestmentError(err.message || "Failed to load investment details")
        }
      } finally {
        if (!cancelled) {
          setLoadingInvestment(false)
        }
      }
    }

    fetchInvestment()

    return () => {
      cancelled = true
    }
  }, [activeTab, id])

  const investment = investmentData?.investment
  const permissions = investmentData?.permissions || {
    canViewInvestorFields: false,
    canExpressInterest: false,
  }
  const interest = investmentData?.interest
  const docs = (investmentData?.docs ?? []) as Array<{
    id: string
    name: string
    size: number | null
    mimeType: string | null
    tags: string[]
    accessLevel: string
    fileType: string
    url: string | null
    createdAt: string
  }>

  const groupedDocs = useMemo(() => {
    const groups: Record<string, typeof docs> = {}
    for (const doc of docs) {
      const key = doc.fileType || "other"
      if (!groups[key]) groups[key] = []
      groups[key].push(doc)
    }
    return groups
  }, [docs])

  const interestStatus: "none" | "requested" | "approved" | "declined" =
    interest?.status || "none"

  async function handleSubmitInterest() {
    setSubmittingInterest(true)
    setInterestFeedback(null)
    setInterestFeedbackError(null)
    try {
      const response = await fetch(`/api/projects/${id}/investment-interest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: interestMessage.trim() || undefined,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || "Failed to submit investment interest")
      }
      setInterestFeedback("Your investment interest has been sent to the founder.")
      setInterestFeedbackError(null)
      setInterestMessage("")
      // Update local interest status
      setInvestmentData((prev: any) => ({
        ...(prev || {}),
        interest: data.interest || prev?.interest || null,
      }))
    } catch (err: any) {
      console.error("Failed to submit investment interest:", err)
      setInterestFeedbackError(err.message || "Failed to submit investment interest")
      setInterestFeedback(null)
    } finally {
      setSubmittingInterest(false)
    }
  }
  
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
            <Card className="border-border overflow-hidden">
              {(project.imageUrl ?? null) && (
                <div className="aspect-[21/9] w-full max-h-[320px] overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.imageUrl} alt="" className="h-full w-full object-contain object-center" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {project.featured && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      <Star className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                  {project.category && (
                    <Badge className={categoryColors[project.category] ?? ""}>
                      {project.category}
                    </Badge>
                  )}
                  {project.stage && (
                    <Badge className={stageColors[project.stage] ?? ""}>
                      {project.stage}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-3xl">{project.title}</CardTitle>
                <div className="flex items-center gap-4 mt-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={project.founderAvatar ?? undefined} alt={project.founder ?? "Founder"} />
                    <AvatarFallback>{(project.founder ?? "?")[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">by {project.founder ?? "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">Project Founder</p>
                  </div>
                  {(project.location ?? null) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                      <MapPin className="h-4 w-4" />
                      <span>{project.location}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(value === "investment" ? "investment" : "overview")
                  }
                >
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="investment">Investment</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-4 space-y-6">
                    {(project.impact ?? null) && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Impact
                        </h3>
                        <p className="text-muted-foreground text-lg">{project.impact}</p>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-3">Description</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {project.fullDescription || project.description}
                      </p>
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
                          <span className="text-sm font-medium">
                            {completedMilestones} of {totalMilestones} milestones completed
                          </span>
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
                              <div
                                className={`h-3 w-3 rounded-full ${
                                  milestone.completed ? "bg-primary" : "bg-muted"
                                }`}
                              />
                              {idx < milestones.length - 1 && (
                                <div
                                  className={`w-0.5 h-full min-h-[60px] ${
                                    milestone.completed ? "bg-primary/30" : "bg-muted"
                                  }`}
                                />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{milestone.title}</p>
                                {milestone.completed && (
                                  <CheckCircle2 className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {milestone.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(milestone.date, "MMMM d, yyyy")}
                              </p>
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
                        {(project.team ?? []).map((member: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border"
                          >
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
                                <div
                                  key={idx}
                                  className="p-4 rounded-lg border border-border"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <NeedIcon className="h-4 w-4 text-primary" />
                                    <Badge className={needsColors[need]}>
                                      {need}
                                    </Badge>
                                  </div>
                                  {need === "Seeking Funding" &&
                                    project.fundingNeeds && (
                                      <div className="mt-2 text-sm text-muted-foreground space-y-1">
                                        <p>
                                          <strong>Amount:</strong>{" "}
                                          {project.fundingNeeds.amount}
                                        </p>
                                        <p>
                                          <strong>Purpose:</strong>{" "}
                                          {project.fundingNeeds.purpose}
                                        </p>
                                        <p>
                                          <strong>Deadline:</strong>{" "}
                                          {format(
                                            project.fundingNeeds.deadline,
                                            "MMMM d, yyyy"
                                          )}
                                        </p>
                                      </div>
                                    )}
                                  {need === "Looking for Volunteers" &&
                                    (project.volunteerNeeds ?? []).length > 0 && (
                                      <div className="mt-2 space-y-2">
                                        {(project.volunteerNeeds ?? []).map(
                                          (volunteer: any, vIdx: number) => (
                                            <div
                                              key={vIdx}
                                              className="text-sm text-muted-foreground p-2 bg-muted/50 rounded"
                                            >
                                              <p className="font-medium">
                                                {volunteer.role}
                                              </p>
                                              <p>Time: {volunteer.hours}</p>
                                              <p>
                                                Skills:{" "}
                                                {volunteer.skills.join(", ")}
                                              </p>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                  {need === "Open to Partnerships" &&
                                    (project.partnershipInterests ?? []).length >
                                      0 && (
                                      <div className="mt-2">
                                        <p className="text-sm text-muted-foreground mb-1">
                                          Interested in partnerships with:
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {(project.partnershipInterests ??
                                            []).map(
                                            (interest: string, iIdx: number) => (
                                              <Badge
                                                key={iIdx}
                                                variant="outline"
                                                className="text-xs"
                                              >
                                                {interest}
                                              </Badge>
                                            )
                                          )}
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
                        {Object.entries(project.metrics ?? {}).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="p-4 rounded-lg bg-muted/50"
                            >
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </p>
                              <p className="text-2xl font-semibold">{value}</p>
                            </div>
                          )
                        )}
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

                    {(project.launchDate ?? null) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Launched {format(new Date(project.launchDate), "MMMM d, yyyy")}
                        </span>
                      </div>
                    )}

                    {relatedProjects.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="font-semibold mb-4">Related Projects</h3>
                          <div className="grid gap-4 md:grid-cols-2">
                            {relatedProjects.map((related) => (
                              <Link key={related.id} href={`/projects/${related.id}`}>
                                <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                      <Badge
                                        className={`${
                                          categoryColors[related.category]
                                        } text-xs`}
                                        variant="outline"
                                      >
                                        {related.category}
                                      </Badge>
                                      <Badge
                                        className={`${
                                          stageColors[related.stage]
                                        } text-xs`}
                                        variant="outline"
                                      >
                                        {related.stage}
                                      </Badge>
                                    </div>
                                    <CardTitle className="text-lg">
                                      {related.title}
                                    </CardTitle>
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
                  </TabsContent>

                  <TabsContent value="investment" className="mt-4 space-y-6">
                    {loadingInvestment ? (
                      <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading investment details...</span>
                      </div>
                    ) : investmentError ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                        <Shield className="h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground max-w-md">
                          {investmentError}
                        </p>
                      </div>
                    ) : !investment ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                        <Shield className="h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground max-w-md">
                          Investment details are not available for this project.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-primary" />
                              Capital Overview
                            </h3>
                            <div className="space-y-2 text-sm">
                              <p className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Capital sought
                                </span>
                                <span className="font-medium">
                                  {investment.capitalSought != null
                                    ? `KES ${investment.capitalSought.toLocaleString()}`
                                    : "TBD"}
                                </span>
                              </p>
                              {investment.ticketMin != null &&
                                investment.ticketMax != null && (
                                  <p className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Ticket range
                                    </span>
                                    <span className="font-medium">
                                      KES {investment.ticketMin.toLocaleString()} –{" "}
                                      {investment.ticketMax.toLocaleString()}
                                    </span>
                                  </p>
                                )}
                              {investment.fundingStage && (
                                <p className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Funding stage
                                  </span>
                                  <span className="font-medium">
                                    {String(investment.fundingStage)
                                      .replace(/_/g, " ")
                                      .toUpperCase()}
                                  </span>
                                </p>
                              )}
                              {typeof investment.readinessScore === "number" && (
                                <p className="flex justify-between items-center">
                                  <span className="text-muted-foreground">
                                    Readiness score
                                  </span>
                                  <span className="font-medium">
                                    {investment.readinessScore}/100
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-primary" />
                              Performance (investors only)
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs uppercase">
                                  Monthly revenue
                                </p>
                                <p className="font-medium mt-1">
                                  {investment.revenueMonthly != null
                                    ? `KES ${investment.revenueMonthly.toLocaleString()}`
                                    : "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs uppercase">
                                  Growth (m/m)
                                </p>
                                <p className="font-medium mt-1">
                                  {investment.growthRateMonthly != null
                                    ? `${investment.growthRateMonthly.toFixed(1)}%`
                                    : "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs uppercase">
                                  Runway
                                </p>
                                <p className="font-medium mt-1">
                                  {investment.runwayMonths != null
                                    ? `${investment.runwayMonths} months`
                                    : "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs uppercase">
                                  Last round
                                </p>
                                <p className="font-medium mt-1">
                                  {investment.lastRoundAmount != null
                                    ? `KES ${investment.lastRoundAmount.toLocaleString()}`
                                    : "—"}
                                </p>
                              </div>
                            </div>
                            {!permissions.canViewInvestorFields && (
                              <p className="text-xs text-muted-foreground">
                                Detailed financial metrics are available to verified
                                investors only.
                              </p>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              Diligence Documents
                            </h3>
                            {permissions.canExpressInterest && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setInterestModalOpen(true)}
                              >
                                {interestStatus === "requested"
                                  ? "Interest requested"
                                  : interestStatus === "approved"
                                  ? "Access granted"
                                  : "Express interest"}
                              </Button>
                            )}
                          </div>
                          {docs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No diligence documents are available yet.
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {Object.entries(groupedDocs).map(
                                ([fileType, group]) => (
                                  <div key={fileType} className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">
                                      {fileType.replace(/_/g, " ")}
                                    </p>
                                    <div className="space-y-1">
                                      {group.map((doc) => (
                                        <div
                                          key={doc.id}
                                          className="flex items-center justify-between text-sm rounded-md border border-border px-3 py-2"
                                        >
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="line-clamp-1">
                                              {doc.name}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge
                                              variant="outline"
                                              className="text-[10px]"
                                            >
                                              {doc.accessLevel}
                                            </Badge>
                                            {doc.url ? (
                                              <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                              >
                                                <a
                                                  href={doc.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                >
                                                  View
                                                </a>
                                              </Button>
                                            ) : (
                                              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                <Lock className="h-3 w-3" />
                                                <span>Access required</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                          {!permissions.canExpressInterest && (
                            <p className="text-xs text-muted-foreground">
                              Access to private documents may require investor
                              verification or an approved interest request.
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-border sticky top-6">
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

            <Card className="border-border sticky top-6">
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

            <Card className="border-border sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Contact & Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                                {(project.website ?? null) && (
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
                {(project.socialLinks ?? {}).linkedin && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open((project.socialLinks as any).linkedin, "_blank")}
                  >
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Button>
                )}
                {(project.socialLinks ?? {}).twitter && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open((project.socialLinks as any).twitter, "_blank")}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    X/Twitter
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-border sticky top-6">
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
      {/* Express Investment Interest modal */}
      <Dialog open={interestModalOpen} onOpenChange={setInterestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Express investment interest</DialogTitle>
            <DialogDescription>
              Share a short note with the founder about your interest, ticket size, or thesis.
              This will notify them and may unlock additional documents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              placeholder="Optional message to the founder..."
              value={interestMessage}
              onChange={(e) => setInterestMessage(e.target.value)}
              rows={4}
            />
            {interestFeedbackError && (
              <p className="text-xs text-destructive">{interestFeedbackError}</p>
            )}
            {interestFeedback && (
              <p className="text-xs text-emerald-600">{interestFeedback}</p>
            )}
          </div>
          <DialogFooter className="flex justify-between gap-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSubmitInterest}
              disabled={submittingInterest}
            >
              {submittingInterest && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Submit interest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
