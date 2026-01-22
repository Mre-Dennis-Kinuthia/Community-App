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
  Mail,
  Linkedin,
  Globe,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  Target,
  CheckCircle2,
  Star,
  UserPlus,
  Bell,
  TrendingUp,
  GraduationCap,
  Clock,
  ExternalLink
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { format } from "date-fns"

// TODO: Replace with API call to fetch member from database
const members: any[] = []

const experienceColors: Record<string, string> = {
  "Early Career": "bg-chart-2/20 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2/80",
  "Mid-Level": "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/80",
  "Senior": "bg-chart-4/20 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4/80",
  "Expert": "bg-chart-3/20 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3/80",
}

const availabilityColors: Record<string, string> = {
  "Open to Collaboration": "bg-chart-2/20 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2/80",
  "Seeking Mentorship": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  "Offering Mentorship": "bg-chart-3/20 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3/80",
  "Open to Partnerships": "bg-chart-5/20 text-chart-5 dark:bg-chart-5/20 dark:text-chart-5/80",
  "Looking for Volunteers": "bg-chart-4/20 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4/80",
}

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const memberId = parseInt(id)
  const member = members.find((m) => m.id === memberId)

  // TODO: Replace with API call to fetch user's connections
  const myConnections: number[] = []
  const isConnected = myConnections.includes(memberId)

  // TODO: Replace with API call to fetch mutual connections
  const mutualConnections: any[] = []

  if (!member) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: "Community" }, { label: "Not Found" }]} />
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Member not found</p>
              <Button onClick={() => router.push("/community")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Community
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
        <Breadcrumbs items={[{ label: "Community", href: "/community" }, { label: member.name }]} />
        
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {member.featured && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          <Star className="mr-1 h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                      <Badge className={experienceColors[member.experienceLevel]}>
                        {member.experienceLevel}
                      </Badge>
                      {isConnected && (
                        <Badge variant="default">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Connected
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-3xl">{member.name}</CardTitle>
                    <p className="text-lg font-medium text-primary">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.industry}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{member.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {format(member.joinedDate, "MMMM yyyy")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    About
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{member.fullBio || member.bio}</p>
                </div>

                <Separator />

                {member.experience && member.experience.length > 0 && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Experience
                      </h3>
                      <div className="space-y-4">
                        {member.experience.map((exp, idx) => (
                          <div key={idx} className="p-4 rounded-lg border border-border/50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium">{exp.role}</p>
                                <p className="text-sm text-muted-foreground">{exp.company}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {exp.period}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {member.education && member.education.length > 0 && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Education
                      </h3>
                      <div className="space-y-3">
                        {member.education.map((edu, idx) => (
                          <div key={idx} className="p-4 rounded-lg border border-border/50">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <p className="font-medium">{edu.degree}</p>
                                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {edu.period}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Skills & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {member.interests && member.interests.length > 0 && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        Interests
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {member.interests.map((interest, idx) => (
                          <Badge key={idx} variant="outline" className="text-sm">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {member.availability && member.availability.length > 0 && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Availability
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {member.availability.map((avail, idx) => (
                          <Badge key={idx} className={availabilityColors[avail]}>
                            {avail}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {member.achievements && member.achievements.length > 0 && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Achievements & Awards
                      </h3>
                      <div className="space-y-2">
                        {member.achievements.map((achievement, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 rounded-lg border border-border/50">
                            <Award className="h-4 w-4 text-primary" />
                            <span className="text-sm">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {member.projectsInvolved && member.projectsInvolved.length > 0 && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Projects Involved ({member.projectsInvolved.length})
                      </h3>
                      <div className="space-y-2">
                        {member.projectsInvolved.map((projectId) => {
                          // TODO: Fetch project name from API
                          return (
                            <Link key={projectId} href={`/projects/${projectId}`}>
                              <div className="flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                                <Briefcase className="h-4 w-4 text-primary" />
                                <span className="text-sm flex-1">Project {projectId}</span>
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </Link>
                          )
                        })}
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
                <CardTitle className="text-lg">Connect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isConnected ? (
                  <Button variant="outline" className="w-full" disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Connected
                  </Button>
                ) : (
                  <Button className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Request Connection
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  <Heart className="mr-2 h-4 w-4" />
                  Follow ({member.followers})
                </Button>
                <Button variant="outline" className="w-full">
                  <Bell className="mr-2 h-4 w-4" />
                  Subscribe to Updates
                </Button>
                <Button variant="outline" className="w-full">
                  <Globe className="mr-2 h-4 w-4" />
                  Share Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Network Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Connections</p>
                  <p className="text-2xl font-semibold">{member.connections}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Followers</p>
                  <p className="text-2xl font-semibold">{member.followers}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Projects</p>
                  <p className="text-2xl font-semibold">{member.projectsInvolved?.length || 0}</p>
                </div>
              </CardContent>
            </Card>

            {mutualConnections.length > 0 && (
              <Card className="border-border/50 sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Mutual Connections ({mutualConnections.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mutualConnections.map((connection) => (
                    <Link key={connection.id} href={`/community/${connection.id}`}>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={connection.avatar || "/placeholder.svg"} alt={connection.name} />
                          <AvatarFallback>{connection.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{connection.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{connection.role}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="border-border/50 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Contact & Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = `mailto:${member.email}`}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
                {member.linkedin && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`https://${member.linkedin}`, "_blank")}
                  >
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Button>
                )}
                {member.website && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(member.website!, "_blank")}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Website
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Profile Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Experience Level</p>
                  <Badge className={experienceColors[member.experienceLevel]}>
                    {member.experienceLevel}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Industry</p>
                  <p className="font-medium">{member.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <p className="font-medium">{member.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                  <p className="font-medium">{format(member.joinedDate, "MMMM yyyy")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
