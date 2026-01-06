"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Mail, Linkedin, X } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const members = [
  {
    id: 1,
    name: "Sarah Kimani",
    role: "UX Designer",
    industry: "Design",
    skills: ["Figma", "Research"],
    avatar: "/placeholder-user.jpg",
    email: "sarah@example.com",
    linkedin: "linkedin.com/in/sarah",
    bio: "Passionate UX designer with 5+ years of experience creating user-centered designs.",
  },
  {
    id: 2,
    name: "David Ochieng",
    role: "Software Engineer",
    industry: "FinTech",
    skills: ["React", "Node.js"],
    avatar: "/placeholder-user.jpg",
    email: "david@example.com",
    linkedin: "linkedin.com/in/david",
    bio: "Full-stack developer specializing in fintech solutions and scalable applications.",
  },
  {
    id: 3,
    name: "Faith Njeri",
    role: "Founder",
    industry: "AgriTech",
    skills: ["Business Strategy", "Fundraising"],
    avatar: "/placeholder-user.jpg",
    email: "faith@example.com",
    linkedin: "linkedin.com/in/faith",
    bio: "Entrepreneur building sustainable agricultural technology solutions for smallholder farmers.",
  },
  {
    id: 4,
    name: "Michael Mwangi",
    role: "Marketing lead",
    industry: "E-commerce",
    skills: ["Growth", "SEO"],
    avatar: "/placeholder-user.jpg",
    email: "michael@example.com",
    linkedin: "linkedin.com/in/michael",
    bio: "Growth marketing expert helping e-commerce businesses scale through data-driven strategies.",
  },
]

const industries = ["All", "Design", "FinTech", "AgriTech", "E-commerce"]
const roles = ["All", "UX Designer", "Software Engineer", "Founder", "Marketing lead"]

export default function CommunityPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedIndustry, setSelectedIndustry] = useState(searchParams.get("industry") || "All")
  const [selectedRole, setSelectedRole] = useState(searchParams.get("role") || "All")
  const [selectedMember, setSelectedMember] = useState<typeof members[0] | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (selectedIndustry !== "All") params.set("industry", selectedIndustry)
    if (selectedRole !== "All") params.set("role", selectedRole)
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, selectedIndustry, selectedRole, router])

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesIndustry = selectedIndustry === "All" || member.industry === selectedIndustry
      const matchesRole = selectedRole === "All" || member.role === selectedRole

      return matchesSearch && matchesIndustry && matchesRole
    })
  }, [searchQuery, selectedIndustry, selectedRole])

  const handleMemberClick = (member: typeof members[0]) => {
    setSelectedMember(member)
    setIsSheetOpen(true)
  }

  const clearFilters = () => {
    setSelectedIndustry("All")
    setSelectedRole("All")
    setSearchQuery("")
    router.replace(window.location.pathname, { scroll: false })
  }

  const activeFilterCount = [
    selectedIndustry !== "All",
    selectedRole !== "All",
    searchQuery.length > 0,
  ].filter(Boolean).length

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <Breadcrumbs items={[{ label: "Community" }]} />
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Innovation Community</h1>
            <p className="text-muted-foreground text-base">
              Connect with social entrepreneurs, innovators, and changemakers building sustainable solutions.
            </p>
          </div>
          <Button variant="outline" className="shadow-sm" asChild>
            <Link href="/community?filter=connections">
              My Connections
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10 shadow-sm"
              placeholder="Search by name, skill, or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="hidden md:flex">
              {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} applied
            </Badge>
          )}
          <div className="flex gap-2">
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(selectedIndustry !== "All" || selectedRole !== "All" || searchQuery) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedIndustry("All")
                  setSelectedRole("All")
                  setSearchQuery("")
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <p className="text-lg font-medium text-muted-foreground">No members found</p>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Try adjusting your search or filters to find community members
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
            {filteredMembers.map((member) => (
              <Card
                key={member.id}
                className="flex flex-col cursor-pointer transition-all hover:shadow-card hover:scale-[1.01] border-border/50"
                onClick={() => handleMemberClick(member)}
              >
                <CardHeader className="text-center">
                  <Avatar className="mx-auto h-20 w-20">
                    <AvatarImage 
                      src={member.avatar || "/placeholder.svg"} 
                      alt={member.name}
                      loading="lazy"
                    />
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.location.href = `mailto:${member.email}`
                    }}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`https://${member.linkedin}`, "_blank")
                    }}
                  >
                    <Linkedin className="h-4 w-4" />
                    Profile
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{selectedMember?.name}</SheetTitle>
              <SheetDescription>{selectedMember?.role} • {selectedMember?.industry}</SheetDescription>
            </SheetHeader>
            {selectedMember && (
              <div className="mt-6 space-y-6">
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedMember.avatar || "/placeholder.svg"} alt={selectedMember.name} />
                    <AvatarFallback>{selectedMember.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">{selectedMember.bio}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.location.href = `mailto:${selectedMember.email}`}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`https://${selectedMember.linkedin}`, "_blank")}
                  >
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  )
}
