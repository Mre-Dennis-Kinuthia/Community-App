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

// This would normally come from an API or database
const members = [
  {
    id: 1,
    name: "Sarah Kimani",
    role: "UX Designer",
    industry: "Design",
    skills: ["Figma", "Research", "User Testing", "Prototyping"],
    avatar: "/placeholder-user.jpg",
    email: "sarah@example.com",
    linkedin: "linkedin.com/in/sarah",
    twitter: "twitter.com/sarahkimani",
    website: "https://sarahkimani.design",
    bio: "Passionate UX designer with 5+ years of experience creating user-centered designs. Specializing in fintech and healthcare applications.",
    fullBio: "Sarah Kimani is a UX designer with over 5 years of experience creating intuitive and user-centered digital experiences. She has worked with leading fintech and healthcare companies in Kenya, helping them design products that make a real impact. Sarah is passionate about accessibility and inclusive design, and regularly mentors junior designers in the community.",
    location: "Nairobi, Kenya",
    experienceLevel: "Mid-Level",
    availability: ["Open to Collaboration", "Offering Mentorship"],
    interests: ["User Research", "Accessibility", "Design Systems"],
    projectsInvolved: [2, 5],
    connections: 45,
    followers: 89,
    featured: true,
    joinedDate: new Date(2023, 5, 15),
    achievements: ["Design Excellence Award 2024", "Top Contributor 2024"],
    experience: [
      { company: "FinTech Solutions Ltd", role: "Senior UX Designer", period: "2022 - Present", description: "Leading UX design for mobile banking applications" },
      { company: "HealthTech Kenya", role: "UX Designer", period: "2020 - 2022", description: "Designed telemedicine platform interfaces" },
    ],
    education: [
      { institution: "University of Nairobi", degree: "BSc Computer Science", period: "2015 - 2019" },
    ],
  },
  {
    id: 2,
    name: "David Ochieng",
    role: "Software Engineer",
    industry: "FinTech",
    skills: ["React", "Node.js", "TypeScript", "AWS", "Docker"],
    avatar: "/placeholder-user.jpg",
    email: "david@example.com",
    linkedin: "linkedin.com/in/david",
    twitter: "twitter.com/davidochieng",
    website: "https://davidochieng.dev",
    bio: "Full-stack developer specializing in fintech solutions and scalable applications.",
    fullBio: "David Ochieng is a full-stack software engineer with expertise in building scalable fintech applications. He has worked on several successful projects including payment platforms and financial management tools. David is known for writing clean, maintainable code and is always eager to share knowledge with the community.",
    location: "Nairobi, Kenya",
    experienceLevel: "Senior",
    availability: ["Open to Collaboration", "Seeking Mentorship"],
    interests: ["FinTech", "Open Source", "System Architecture"],
    projectsInvolved: [1, 5],
    connections: 78,
    followers: 156,
    featured: false,
    joinedDate: new Date(2023, 2, 10),
    achievements: ["Open Source Contributor of the Year 2024"],
    experience: [
      { company: "Payment Solutions Inc", role: "Senior Software Engineer", period: "2021 - Present", description: "Building payment gateway infrastructure" },
      { company: "FinTech Startup", role: "Full-stack Developer", period: "2019 - 2021", description: "Developed financial management platform" },
    ],
    education: [
      { institution: "JKUAT", degree: "BSc Software Engineering", period: "2014 - 2018" },
    ],
  },
  {
    id: 3,
    name: "Faith Njeri",
    role: "Founder",
    industry: "AgriTech",
    skills: ["Business Strategy", "Fundraising", "Product Management", "Market Research"],
    avatar: "/placeholder-user.jpg",
    email: "faith@example.com",
    linkedin: "linkedin.com/in/faith",
    twitter: "twitter.com/faithnjeri",
    bio: "Entrepreneur building sustainable agricultural technology solutions for smallholder farmers.",
    fullBio: "Faith Njeri is the founder of an innovative AgriTech platform that connects smallholder farmers with markets and financing. With a background in agriculture and business, she has successfully raised funding and built a team of 15+ people. Faith is passionate about food security and rural development in Kenya.",
    location: "Nairobi, Kenya",
    experienceLevel: "Expert",
    availability: ["Open to Collaboration", "Offering Mentorship", "Open to Partnerships"],
    interests: ["Agriculture", "Sustainability", "Social Impact"],
    projectsInvolved: [2],
    connections: 92,
    followers: 234,
    featured: true,
    joinedDate: new Date(2022, 11, 5),
    achievements: ["Social Entrepreneur of the Year 2023", "Innovation Award 2024"],
    experience: [
      { company: "AgriTech Platform", role: "Founder & CEO", period: "2021 - Present", description: "Building platform connecting farmers to markets" },
    ],
    education: [
      { institution: "University of Nairobi", degree: "BSc Agriculture", period: "2015 - 2019" },
      { institution: "Strathmore Business School", degree: "MBA", period: "2020 - 2022" },
    ],
  },
  {
    id: 4,
    name: "Michael Mwangi",
    role: "Marketing Lead",
    industry: "E-commerce",
    skills: ["Growth Marketing", "SEO", "Content Strategy", "Analytics", "Paid Advertising"],
    avatar: "/placeholder-user.jpg",
    email: "michael@example.com",
    linkedin: "linkedin.com/in/michael",
    website: "https://michaelmwangi.marketing",
    bio: "Growth marketing expert helping e-commerce businesses scale through data-driven strategies.",
    fullBio: "Michael Mwangi is a growth marketing expert with a proven track record of scaling e-commerce businesses. He specializes in SEO, content marketing, and paid advertising, helping companies achieve sustainable growth. Michael regularly shares insights on growth strategies through workshops and community events.",
    location: "Nairobi, Kenya",
    experienceLevel: "Mid-Level",
    availability: ["Open to Collaboration"],
    interests: ["Growth Marketing", "E-commerce", "Analytics"],
    projectsInvolved: [],
    connections: 56,
    followers: 112,
    featured: false,
    joinedDate: new Date(2024, 0, 20),
    achievements: [],
    experience: [
      { company: "E-commerce Solutions", role: "Marketing Lead", period: "2022 - Present", description: "Leading growth marketing initiatives" },
    ],
    education: [
      { institution: "University of Nairobi", degree: "BSc Marketing", period: "2017 - 2021" },
    ],
  },
  {
    id: 5,
    name: "James Mwangi",
    role: "Founder & CEO",
    industry: "Climate & Environment",
    skills: ["Renewable Energy", "Project Management", "Fundraising", "Team Leadership"],
    avatar: "/placeholder-user.jpg",
    email: "james@example.com",
    linkedin: "linkedin.com/in/jamesmwangi",
    bio: "Founder of Green Energy Solutions, bringing clean energy to rural Kenya.",
    fullBio: "James Mwangi is the founder and CEO of Green Energy Solutions, a social enterprise focused on bringing affordable solar energy to rural communities. Under his leadership, the company has provided clean energy to over 5,000 households. James is passionate about climate action and sustainable development.",
    location: "Nairobi, Kenya",
    experienceLevel: "Expert",
    availability: ["Open to Collaboration", "Open to Partnerships"],
    interests: ["Renewable Energy", "Climate Action", "Rural Development"],
    projectsInvolved: [1],
    connections: 134,
    followers: 245,
    featured: true,
    joinedDate: new Date(2022, 8, 15),
    achievements: ["Climate Innovation Award 2024", "Community Impact Award 2023"],
    experience: [
      { company: "Green Energy Solutions", role: "Founder & CEO", period: "2022 - Present", description: "Leading renewable energy company serving rural communities" },
    ],
    education: [
      { institution: "University of Nairobi", degree: "BSc Electrical Engineering", period: "2014 - 2018" },
    ],
  },
  {
    id: 6,
    name: "Grace Wanjiru",
    role: "Founder",
    industry: "Agriculture",
    skills: ["AgriTech", "Business Development", "Partnerships", "Team Building"],
    avatar: "/placeholder-user.jpg",
    email: "grace@example.com",
    linkedin: "linkedin.com/in/grace",
    bio: "Founder of AgriTech Platform connecting farmers to markets and financing.",
    fullBio: "Grace Wanjiru is the founder of an innovative AgriTech platform that connects smallholder farmers with buyers, markets, and financing. Her platform has facilitated transactions worth over KES 50M and connected over 10,000 farmers. Grace is committed to transforming agriculture in Kenya through technology.",
    location: "Nairobi, Kenya",
    experienceLevel: "Senior",
    availability: ["Open to Collaboration", "Offering Mentorship"],
    interests: ["Agriculture", "Technology", "Financial Inclusion"],
    projectsInvolved: [2],
    connections: 87,
    followers: 189,
    featured: false,
    joinedDate: new Date(2023, 2, 10),
    achievements: ["Women in Tech Award 2024"],
    experience: [
      { company: "AgriTech Platform", role: "Founder", period: "2022 - Present", description: "Building platform connecting farmers to markets" },
    ],
    education: [
      { institution: "University of Nairobi", degree: "BSc Agriculture", period: "2016 - 2020" },
    ],
  },
  {
    id: 7,
    name: "Dr. Sarah Kamau",
    role: "Founder & Medical Director",
    industry: "Healthcare",
    skills: ["Telemedicine", "Healthcare Innovation", "Clinical Practice", "Digital Health"],
    avatar: "/placeholder-user.jpg",
    email: "sarah@example.com",
    linkedin: "linkedin.com/in/sarahkamau",
    bio: "Founder of digital health platform improving maternal care outcomes.",
    fullBio: "Dr. Sarah Kamau is a medical doctor and founder of a digital health platform focused on improving maternal healthcare outcomes. Her platform has served over 3,000 women with a 95% success rate. She combines clinical expertise with technology innovation to address healthcare access challenges.",
    location: "Nairobi, Kenya",
    experienceLevel: "Expert",
    availability: ["Open to Partnerships"],
    interests: ["Healthcare", "Telemedicine", "Women's Health"],
    projectsInvolved: [4],
    connections: 156,
    followers: 312,
    featured: true,
    joinedDate: new Date(2023, 10, 5),
    achievements: ["Healthcare Innovation Award 2024", "Impact Award 2024"],
    experience: [
      { company: "Digital Health Platform", role: "Founder & Medical Director", period: "2023 - Present", description: "Leading telemedicine platform for maternal care" },
      { company: "Nairobi Hospital", role: "Medical Doctor", period: "2020 - 2023", description: "Providing clinical care and leading digital health initiatives" },
    ],
    education: [
      { institution: "University of Nairobi", degree: "MBChB Medicine", period: "2012 - 2018" },
    ],
  },
  {
    id: 8,
    name: "Peter Ochieng",
    role: "Founder & Director",
    industry: "Circular Economy",
    skills: ["Waste Management", "Community Organizing", "Social Impact", "Operations"],
    avatar: "/placeholder-user.jpg",
    email: "peter@example.com",
    linkedin: "linkedin.com/in/peter",
    bio: "Founder of waste-to-wealth recycling initiative creating income opportunities.",
    fullBio: "Peter Ochieng is the founder and director of a community-based recycling initiative that transforms plastic waste into economic opportunities. The program has created income for 200+ collectors while diverting 100+ tons of waste monthly. Peter is passionate about circular economy and community empowerment.",
    location: "Nairobi, Kenya",
    experienceLevel: "Mid-Level",
    availability: ["Open to Collaboration", "Looking for Volunteers"],
    interests: ["Circular Economy", "Waste Management", "Community Development"],
    projectsInvolved: [3],
    connections: 43,
    followers: 156,
    featured: false,
    joinedDate: new Date(2024, 7, 1),
    achievements: [],
    experience: [
      { company: "Waste-to-Wealth Initiative", role: "Founder & Director", period: "2023 - Present", description: "Leading community recycling program" },
    ],
    education: [
      { institution: "University of Nairobi", degree: "BSc Environmental Science", period: "2017 - 2021" },
    ],
  },
]

const experienceColors: Record<string, string> = {
  "Early Career": "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "Mid-Level": "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  "Senior": "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  "Expert": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
}

const availabilityColors: Record<string, string> = {
  "Open to Collaboration": "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "Seeking Mentorship": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  "Offering Mentorship": "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  "Open to Partnerships": "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  "Looking for Volunteers": "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
}

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const memberId = parseInt(id)
  const member = members.find((m) => m.id === memberId)

  // Mock connections (current user's connections)
  const myConnections = [2, 5, 6]
  const isConnected = myConnections.includes(memberId)

  // Mock mutual connections
  const mutualConnections = members.filter(m => m.id !== memberId && myConnections.includes(m.id) && member?.connections).slice(0, 5)

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
                          // This would normally fetch from projects data
                          const projectNames: Record<number, string> = {
                            1: "Green Energy Solutions for Rural Kenya",
                            2: "AgriTech Platform for Smallholder Farmers",
                            3: "Waste-to-Wealth Recycling Initiative",
                            4: "Digital Health Platform for Maternal Care",
                            5: "Financial Inclusion for Youth Entrepreneurs",
                          }
                          return (
                            <Link key={projectId} href={`/projects/${projectId}`}>
                              <div className="flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                                <Briefcase className="h-4 w-4 text-primary" />
                                <span className="text-sm flex-1">{projectNames[projectId] || `Project ${projectId}`}</span>
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
