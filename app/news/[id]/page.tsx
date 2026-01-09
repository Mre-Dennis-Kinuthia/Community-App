"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft,
  Calendar,
  User,
  Bell,
  Sparkles,
  TrendingUp,
  Newspaper
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { format } from "date-fns"

// This would normally come from an API or database
const newsItems = [
  {
    id: 1,
    title: "Impact Hub Nairobi Launches New Incubation Program for Climate Startups",
    type: "Announcement",
    category: "Programs",
    author: "Impact Hub Team",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2025, 0, 15),
    excerpt: "We're excited to announce our new 12-week incubation program specifically designed for early-stage climate and sustainability startups. Applications open now!",
    content: "Impact Hub Nairobi is launching a specialized incubation program focused on climate solutions and sustainable innovation. The program will provide selected startups with workspace, mentorship from industry experts, access to our partner network, and opportunities for seed funding. Applications are now open for the March 2025 cohort.",
    image: "/placeholder-user.jpg",
    featured: true,
    tags: ["Programs", "Climate", "Incubation"],
  },
  {
    id: 2,
    title: "Member Spotlight: Green Energy Solutions Reaches 5,000 Households",
    type: "Spotlight",
    category: "Member Success",
    author: "Sarah Kamau",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2025, 0, 10),
    excerpt: "Congratulations to James Mwangi and his team for reaching this incredible milestone in bringing clean energy to rural communities.",
    content: "James Mwangi's Green Energy Solutions project has successfully connected 5,000 rural households to clean, affordable solar power. This achievement represents a significant step forward in Kenya's renewable energy transition and demonstrates the power of social entrepreneurship to create lasting impact.",
    image: "/placeholder-user.jpg",
    featured: true,
    tags: ["Member Success", "Energy", "Impact"],
  },
  {
    id: 3,
    title: "Global Impact Hub Network Meetup: February 2025",
    type: "Event",
    category: "Events",
    author: "Impact Hub Team",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2025, 0, 8),
    excerpt: "Join us for our monthly global network meetup where members from Impact Hubs worldwide come together to share experiences and explore collaborations.",
    content: "This month's global network meetup will feature presentations from Impact Hub members in Lagos, Cape Town, and London. We'll explore cross-continental collaboration opportunities and share best practices for scaling social impact ventures.",
    image: "/placeholder-user.jpg",
    featured: false,
    tags: ["Events", "Networking", "Global"],
  },
  {
    id: 4,
    title: "New Partnership: Ikigai Workspace Expansion",
    type: "Announcement",
    category: "Partnerships",
    author: "Impact Hub Team",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2025, 0, 5),
    excerpt: "We're expanding our partnership with Ikigai to provide even more workspace options for our members, including new wellness studios and collaboration zones.",
    content: "Impact Hub Nairobi is thrilled to announce an expanded partnership with Ikigai, our workspace partner. This expansion includes new wellness studios, additional collaboration zones, and enhanced amenities designed to support the holistic well-being of our innovation community.",
    image: "/placeholder-user.jpg",
    featured: false,
    tags: ["Partnerships", "Workspace", "Infrastructure"],
  },
  {
    id: 5,
    title: "Workshop Recap: Fundraising Strategies for Social Entrepreneurs",
    type: "Recap",
    category: "Workshops",
    author: "David Ochieng",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2024, 11, 28),
    excerpt: "Our recent workshop on fundraising strategies brought together 30 entrepreneurs and 5 experienced investors for an intensive learning session.",
    content: "The workshop covered essential fundraising topics including pitch deck development, investor relations, and alternative funding sources. Participants left with actionable strategies and new connections to potential investors in our network.",
    image: "/placeholder-user.jpg",
    featured: false,
    tags: ["Workshops", "Fundraising", "Education"],
  },
  {
    id: 6,
    title: "Impact Story: How AgriTech Platform Transformed 10,000 Farmers' Lives",
    type: "Impact Story",
    category: "Impact",
    author: "Grace Wanjiru",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2024, 11, 20),
    excerpt: "Grace Wanjiru's AgriTech platform has successfully connected over 10,000 smallholder farmers to markets, financing, and agricultural inputs.",
    content: "Since launching in early 2024, Grace's platform has facilitated over KES 50 million in transactions, connected farmers with 15+ buyers, and enabled access to credit for agricultural inputs. The platform has transformed how smallholder farmers operate, increasing their incomes by an average of 40%.",
    image: "/placeholder-user.jpg",
    featured: true,
    tags: ["Impact", "Agriculture", "Technology"],
  },
  {
    id: 7,
    title: "Upcoming: Social Innovation Bootcamp Applications Open",
    type: "Announcement",
    category: "Programs",
    author: "Impact Hub Team",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2024, 11, 15),
    excerpt: "Applications are now open for our intensive 6-week Social Innovation Bootcamp starting in February 2025.",
    content: "The Social Innovation Bootcamp is designed for ventures ready to scale their impact. The program includes intensive workshops, one-on-one mentorship, investor connections, and access to our global network. Limited spots available - apply early!",
    image: "/placeholder-user.jpg",
    featured: false,
    tags: ["Programs", "Acceleration", "Applications"],
  },
  {
    id: 8,
    title: "Member Achievement: Digital Health Platform Wins Innovation Award",
    type: "Announcement",
    category: "Member Success",
    author: "Impact Hub Team",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2024, 11, 10),
    excerpt: "Congratulations to Dr. Sarah Kamau and her team for winning the Healthcare Innovation Award at the Kenya Tech Awards 2024.",
    content: "Dr. Sarah Kamau's digital health platform for maternal care was recognized for its innovative approach to improving healthcare access in underserved areas. The platform has served over 3,000 women with a 95% success rate in improving maternal health outcomes.",
    image: "/placeholder-user.jpg",
    featured: false,
    tags: ["Member Success", "Healthcare", "Awards"],
  },
]

const typeIcons: Record<string, any> = {
  "Announcement": Bell,
  "Spotlight": Sparkles,
  "Event": Calendar,
  "Recap": Newspaper,
  "Impact Story": TrendingUp,
}

const typeColors: Record<string, string> = {
  "Announcement": "bg-blue-100 text-blue-700",
  "Spotlight": "bg-yellow-100 text-yellow-700",
  "Event": "bg-green-100 text-green-700",
  "Recap": "bg-purple-100 text-purple-700",
  "Impact Story": "bg-pink-100 text-pink-700",
}

const categoryColors: Record<string, string> = {
  "Programs": "bg-indigo-100 text-indigo-700",
  "Member Success": "bg-emerald-100 text-emerald-700",
  "Events": "bg-cyan-100 text-cyan-700",
  "Partnerships": "bg-violet-100 text-violet-700",
  "Workshops": "bg-orange-100 text-orange-700",
  "Impact": "bg-rose-100 text-rose-700",
}

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const newsId = parseInt(id)
  const newsItem = newsItems.find((n) => n.id === newsId)

  if (!newsItem) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: "News & Updates" }, { label: "Not Found" }]} />
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">News item not found</p>
              <Button onClick={() => router.push("/news")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to News
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const TypeIcon = typeIcons[newsItem.type] || Newspaper

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "News & Updates", href: "/news" }, { label: newsItem.title }]} />
        
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
                  <Badge className={typeColors[newsItem.type]}>
                    <TypeIcon className="mr-1 h-3 w-3" />
                    {newsItem.type}
                  </Badge>
                  <Badge className={categoryColors[newsItem.category]}>
                    {newsItem.category}
                  </Badge>
                  {newsItem.featured && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-3xl">{newsItem.title}</CardTitle>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={newsItem.authorAvatar} alt={newsItem.author} />
                      <AvatarFallback>{newsItem.author[0]}</AvatarFallback>
                    </Avatar>
                    <span>{newsItem.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(newsItem.date, "MMMM d, yyyy")}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-lg max-w-none">
                  <p className="text-muted-foreground leading-relaxed text-base">{newsItem.content}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {newsItem.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-border/50 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Article Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Author</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={newsItem.authorAvatar} alt={newsItem.author} />
                      <AvatarFallback>{newsItem.author[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{newsItem.author}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Published</p>
                  <p className="font-medium">{format(newsItem.date, "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Category</p>
                  <Badge className={categoryColors[newsItem.category]}>
                    {newsItem.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
