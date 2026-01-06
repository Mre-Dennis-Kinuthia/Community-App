import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Mail, Linkedin } from "lucide-react"

const members = [
  {
    name: "Sarah Kimani",
    role: "UX Designer",
    industry: "Design",
    skills: ["Figma", "Research"],
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "David Ochieng",
    role: "Software Engineer",
    industry: "FinTech",
    skills: ["React", "Node.js"],
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Faith Njeri",
    role: "Founder",
    industry: "AgriTech",
    skills: ["Business Strategy", "Fundraising"],
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Michael Mwangi",
    role: "Marketing lead",
    industry: "E-commerce",
    skills: ["Growth", "SEO"],
    avatar: "/placeholder-user.jpg",
  },
]

export default function CommunityPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Community Directory</h1>
            <p className="text-muted-foreground">Connect with innovators and entrepreneurs at Impact Hub Nairobi.</p>
          </div>
          <Button>My Connections</Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search by name, skill, or industry..." />
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="text-center">
                <Avatar className="mx-auto h-20 w-20">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-sm font-medium text-primary">{member.role}</p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 text-center">
                <p className="mb-4 text-xs text-muted-foreground">{member.industry}</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {member.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-[10px]">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-2 border-t pt-4">
                <Button variant="ghost" size="sm" className="w-full gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button variant="ghost" size="sm" className="w-full gap-2">
                  <Linkedin className="h-4 w-4" />
                  Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
